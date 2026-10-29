import { prototypeAssessmentInstructions, prototypeAssessmentSchema } from "../prototype-assessment";
import { createResponsesCall } from "./responses.server.ts";
import { getLovableAiGatewayResponseHeaders } from "./run-id.server.ts";
import { isAssessmentAbort } from "./cancellation";

const model = "openai/gpt-6-astra";
const jsonError = (message: string, status: number) => Response.json({ message }, { status, headers: { "Cache-Control": "no-store" } });

export async function assessPrototype(request: Request) {
  const stopped = () => new Response(null, { status: 499 });
  if (request.signal.aborted) return stopped();
  if (request.headers.get("origin") !== new URL(request.url).origin) return jsonError("Open the assessment from the Riloyd website.", 403);
  if (!request.headers.get("content-type")?.includes("application/json")) return jsonError("Expected an idea assessment form.", 400);
  if (Number(request.headers.get("content-length") ?? 0) > 16000) return jsonError("Please shorten your description.", 413);
  let input;
  try {
    const raw = await request.text();
    if (raw.length > 14000) return jsonError("Please shorten your description.", 413);
    input = prototypeAssessmentSchema.parse(JSON.parse(raw));
  } catch (error) { return isAssessmentAbort(error, request.signal) ? stopped() : jsonError("Complete the idea, prototype and eligibility fields, and confirm consent.", 400); }
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) return jsonError("AI assessment is not configured yet. Please contact the Riloyd team.", 401);
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: blocked, error: stateError } = await supabaseAdmin.from("prototype_ai_access_state").select("status_code,message").eq("model_id", model).maybeSingle();
  if (stateError) return jsonError("AI availability could not be checked. Please contact the team.", 503);
  if (blocked) return jsonError(blocked.message, blocked.status_code);
  if (request.signal.aborted) return stopped();
  let upstreamError: { status: number; message: string } | undefined;
  const { result, gateway } = createResponsesCall(request, {
    apiKey: key, baseURL: "https://ai.gateway.lovable.dev/v1", model,
    onResponse: async response => {
      if (response.ok) return;
      let payload: { message?: string; error?: { message?: string } } = {};
      try { payload = await response.clone().json(); } catch { /* non-JSON provider error */ }
      const message = payload.message ?? payload.error?.message ?? `AI assessment is unavailable (status ${response.status}).`;
      upstreamError = { status: response.status, message };
      if (response.status === 403 || response.status === 402) {
        await supabaseAdmin.from("prototype_ai_access_state").upsert({ model_id: model, status_code: response.status, message });
      }
    },
  }, [{ role: "user", content: JSON.stringify({ idea: input.idea, prototype: input.prototype, eligibilityContext: input.context }) }], prototypeAssessmentInstructions());

  const iterator = result.fullStream[Symbol.asyncIterator]();
  let first;
  try { first = await iterator.next(); } catch (error) { return isAssessmentAbort(error, request.signal) ? stopped() : jsonError(upstreamError?.message ?? "The AI connection failed. Please contact the team.", upstreamError?.status ?? 503); }
  // The first SDK event may be 'start'; wait for gateway headers while continuing consumption.
  // Attach rejection handling immediately: Stop may reject this read before
  // gateway headers settle, otherwise causing an unhandled AbortError.
  const next = iterator.next().then(part => ({ part, error: undefined as unknown }), error => ({ part: undefined, error }));
  await gateway.waitForRunId();
  if (request.signal.aborted) { await next; return stopped(); }
  if (upstreamError) { await next.catch(() => undefined); return jsonError(upstreamError.message, upstreamError.status); }
  const encoder = new TextEncoder();
  let cancelled = false;
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let hasText = false;
      let failed = false;
      const emit = (event: object) => { if (!cancelled && !request.signal.aborted) controller.enqueue(encoder.encode(JSON.stringify(event) + "\n")); };
      const consume = (part: Awaited<ReturnType<typeof iterator.next>>) => {
        if (part.done) return;
        const chunk = part.value;
        if (chunk.type === "text-delta") { hasText = true; emit({ type: "text", text: chunk.text }); }
        if (chunk.type === "error") { failed = true; emit({ type: "error", message: upstreamError?.message ?? "The AI assessment could not finish. No application was submitted." }); }
        if (chunk.type === "finish" && chunk.finishReason === "content-filter") { failed = true; emit({ type: "error", message: "The AI declined this assessment. No application was submitted." }); }
      };
      try {
        emit({ type: "started" });
        consume(first);
        const pending = await next;
        if (pending.error) throw pending.error;
        if (pending.part) consume(pending.part);
        while (true) { const part = await iterator.next(); if (part.done) break; consume(part); }
        if (!hasText && !failed) emit({ type: "error", message: "The AI returned no assessment. Please contact the Riloyd team." });
        else if (!failed) emit({ type: "done" });
      } catch { if (!request.signal.aborted) emit({ type: "error", message: "The assessment was interrupted. No application was submitted." }); }
      finally { if (!cancelled) controller.close(); }
    },
    cancel: async () => { cancelled = true; try { await iterator.return?.(); } catch (error) { if (!isAssessmentAbort(error, request.signal)) throw error; } },
  });
  const headers = getLovableAiGatewayResponseHeaders(undefined, { "Content-Type": "application/x-ndjson", "Cache-Control": "no-cache, no-store, no-transform" });
  const runId = gateway.getRunId();
  if (runId) headers.set("X-Lovable-AIG-Run-ID", runId);
  return new Response(stream, { headers });
}
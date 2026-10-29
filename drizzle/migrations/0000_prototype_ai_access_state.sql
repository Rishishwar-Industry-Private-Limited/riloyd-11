CREATE TABLE public.prototype_ai_access_state (
  model_id text PRIMARY KEY,
  status_code integer NOT NULL,
  message text NOT NULL,
  blocked_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.prototype_ai_access_state TO service_role;
REVOKE ALL ON public.prototype_ai_access_state FROM anon, authenticated;
ALTER TABLE public.prototype_ai_access_state ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.prototype_ai_access_state IS 'Server-only durable circuit breaker for terminal AI access denials; contains no applicant data. Clear only after owner confirms restored access.';
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Copy, Landmark, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CountryLogo } from "@/components/country-logo";
import { accountHolder, paymentAccounts } from "@/lib/payment-accounts";
import { marketConfigs, marketOrder } from "@/lib/market-config";

export const Route = createFileRoute("/payment")({
  validateSearch: (search: Record<string, unknown>) => ({ country: marketOrder.find(key => key === search.country) ?? "usa" }),
  head: () => ({ meta: [{ title: "Payment Account Details | Riloyd" }, { name: "description", content: "Verified Rishishwar Industry Private Limited payment account details for international Riloyd applicants." }, { property: "og:title", content: "Payment Account Details | Riloyd" }, { property: "og:description", content: "Country-specific bank details and payment methods for Riloyd programme registration." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }], links: [{ rel: "canonical", href: "https://riloyd-global-atlas.lovable.app/payment" }] }),
  component: PaymentPage,
});

function PaymentPage() {
  const search = Route.useSearch();
  const [country, setCountry] = useState(search.country);
  const [methodIndex, setMethodIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const account = paymentAccounts.find(row => row.country === country);
  const method = account?.methods[methodIndex];
  async function copy() {
    if (!account || !method) return;
    try { await navigator.clipboard.writeText([accountHolder, `Currency: ${account.currency} only`, `Payment method: ${method.name}`, ...method.fields.map(([label, value]) => `${label}: ${value}`), `Bank: ${account.bank}`, `${account.addressLabel ?? "Bank address"}: ${account.address}`].join("\n")); setCopied(true); setCopyError(false); }
    catch { setCopyError(true); }
  }
  return <main className="bg-background px-5 py-12 text-foreground sm:px-6 lg:px-12"><div className="mx-auto max-w-[1100px]">
    <p className="eyebrow text-xs font-bold uppercase">Payments</p><h1 className="mt-4 text-4xl font-black sm:text-5xl">Payment account details</h1><p className="mt-4 text-sm text-muted-foreground">{accountHolder}</p>
    <div className="mt-8"><label htmlFor="payment-country" className="text-sm font-bold">Payer country / market</label><select id="payment-country" value={country} onChange={e => { const next = marketOrder.find(key => key === e.target.value); if (next) { setCountry(next); setMethodIndex(0); setCopied(false); setCopyError(false); } }} className="mt-2 block h-11 w-full max-w-md rounded-md border border-input bg-background px-3 text-sm">{marketOrder.map(key => <option key={key} value={key}>{marketConfigs[key].name}</option>)}</select></div>
    <section className="mt-8 border-t border-border py-8"><CountryLogo market={marketConfigs[country]} className="h-14 w-auto max-w-full object-contain object-left" /><h2 className="mt-5 text-2xl font-bold">{marketConfigs[country].name} account details</h2>
      {!method || !account ? <div className="mt-5"><p className="text-sm text-muted-foreground">{country === "singapore" ? "SGD account details are not available yet." : "India account details are not listed on the supplied payment page."} Please confirm payment instructions with Riloyd before transferring funds.</p><Button asChild variant="outline" className="mt-5"><Link to="/contact">Confirm payment details <ArrowRight size={16} /></Link></Button></div> : <>
        <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Payment method">{account.methods.map((m, i) => <Button key={m.name} variant={i === methodIndex ? "default" : "outline"} aria-pressed={i === methodIndex} onClick={() => { setMethodIndex(i); setCopied(false); }}>{m.name}</Button>)}</div>
        <p className="mt-5 flex items-center gap-2 text-sm font-bold"><Landmark size={18} className="text-primary" />{account.currency} only</p>
        <dl className="mt-4 grid sm:grid-cols-2">{[["Account holder", accountHolder], ...method.fields, ["Bank name", account.bank ?? ""], [account.addressLabel ?? "Bank address", account.address ?? ""]].map(([label, value]) => <div key={label} className="min-w-0 border-b border-border py-4 sm:pr-8"><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-2 break-words text-base font-semibold">{value}</dd></div>)}</dl>
        <Button onClick={copy} className="mt-6">{copied ? <Check size={16} /> : <Copy size={16} />}{copied ? "Account details copied" : "Copy account details"}</Button>{copyError && <p role="alert" className="mt-3 text-sm">Copy is unavailable. Please select the account details directly.</p>}
      </>}
    </section>
    <p className="border-t border-border pt-5 text-xs leading-relaxed text-muted-foreground">Source: <a href="https://www.rishishwarindustry.in/payment" target="_blank" rel="noopener noreferrer" className="underline">Rishishwar Industry payment page</a> · Verified 29 October 2026. Confirm the beneficiary, currency, current fee and payment method before transferring. This page does not process payments or confirm registration.</p>
  </div></main>;
}
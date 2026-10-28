import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, CheckCircle2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { findMarket } from "@/lib/market-config";

export const Route = createFileRoute("/global-presence/$slug")({
  head: ({ params }) => {
    const market = findMarket(params.slug);
    const title = market ? `${market.name} | Riloyd Global Presence` : "Market Not Found | Riloyd";
    const description = market?.description ?? "Explore Riloyd's global market presence.";
    return { meta: [{ title }, { name: "description", content: description }, { property: "og:title", content: title }, { property: "og:description", content: description }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }, { name: "robots", content: "noindex" }] };
  },
  component: MarketPage,
});

function MarketPage() {
  const { slug } = Route.useParams();
  const market = findMarket(slug);
  if (!market) return <main className="flex min-h-[65vh] items-center bg-background px-5 text-foreground"><div className="mx-auto w-full max-w-3xl"><p className="eyebrow text-xs font-bold uppercase text-soft">Global presence</p><h1 className="mt-5 text-4xl font-black uppercase">Market not found.</h1><Button asChild className="mt-7 rounded-full"><Link to="/global-presence"><ArrowLeft size={16} /> View all markets</Link></Button></div></main>;

  return <main className="overflow-hidden bg-background text-foreground">
    <section className="relative min-h-[570px] overflow-hidden border-b border-border"><img src={market.image} width={1600} height={912} alt={market.landmark} className="absolute inset-0 h-full w-full object-cover object-center" decoding="async" fetchPriority="high" /><div className="hero-shade absolute inset-0" /><div className="relative z-10 mx-auto flex min-h-[570px] max-w-[1380px] items-center px-5 py-14 sm:px-6 lg:px-12"><div className="max-w-2xl"><Link to="/global-presence" className="mb-8 inline-flex items-center gap-2 text-xs font-bold text-soft"><ArrowLeft size={14} /> Global Presence</Link><p className="eyebrow text-xs font-bold uppercase text-soft">{market.region}</p><h1 className="headline mt-5 text-[clamp(3rem,6vw,6rem)] font-black uppercase leading-[.9]">Riloyd <span className="text-primary">{market.name}</span></h1><p className="mt-5 text-2xl font-bold">{market.headline}</p><p className="mt-4 max-w-xl text-sm leading-relaxed text-soft sm:text-base">{market.description}</p></div></div></section>
    <section className="border-b border-border bg-surface py-14 text-foreground sm:py-20"><div className="mx-auto grid max-w-[1380px] gap-10 px-5 sm:px-6 lg:grid-cols-[.8fr_1.2fr] lg:items-center lg:px-12"><div><img src={market.logo} alt={`Riloyd ${market.name}`} className={`h-20 w-auto max-w-full object-contain object-left ${market.logoTone === "light" ? "logo-show-dark" : "logo-show-light"}`} decoding="async" /><img src={market.logoAlt} alt="" aria-hidden="true" className={`h-20 w-auto max-w-full object-contain object-left ${market.logoTone === "light" ? "logo-show-light" : "logo-show-dark"}`} decoding="async" /><h2 className="mt-7 text-3xl font-black uppercase leading-tight sm:text-4xl">Local context.<br /><span className="text-primary">Global perspective.</span></h2></div><p className="max-w-2xl text-base leading-8 text-muted-foreground">{market.introduction}</p></div></section>
    <section className="border-b border-border py-14 sm:py-20"><div className="mx-auto max-w-[1380px] px-5 sm:px-6 lg:px-12"><p className="eyebrow text-[10px] font-bold uppercase text-soft">Where we add value</p><h2 className="mt-4 text-3xl font-black uppercase sm:text-5xl">Opportunity, approached <span className="text-primary">with clarity.</span></h2><div className="mt-10 grid gap-px bg-border md:grid-cols-3">{market.opportunities.map(([title, copy]) => <article key={title} className="bg-background p-6 sm:p-8"><CheckCircle2 className="text-primary" size={28} /><h3 className="mt-6 text-lg font-extrabold">{title}</h3><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{copy}</p></article>)}</div></div></section>
    <section className="bg-surface py-14"><div className="mx-auto flex max-w-[1380px] flex-col items-start justify-between gap-7 px-5 sm:px-6 lg:flex-row lg:items-center lg:px-12"><div><p className="flex items-center gap-2 text-xs font-bold uppercase text-soft"><MapPin size={16} className="text-primary" /> {market.name}</p><h2 className="mt-3 text-3xl font-black uppercase">Explore the opportunity with Riloyd.</h2></div><Button asChild size="lg" className="rounded-full px-7 font-bold"><Link to="/contact">Start a Conversation <ArrowRight size={16} /></Link></Button></div></section>
  </main>;
}
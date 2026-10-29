import { CountryLogo } from "@/components/country-logo";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, CheckCircle2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { findMarket } from "@/lib/market-config";
import { useSuspenseQuery } from "@tanstack/react-query";
import { programmeFeesQuery } from "@/lib/programme-fees-query";
import { InternationalEnrolment } from "@/components/international-enrolment";
import { internationalServices, marketContext, type ProgrammeCountry } from "@/lib/international-programme";
import mentorship from "@/assets/international-mentorship.jpg";

export const Route = createFileRoute("/global-presence/$slug")({
  loader: ({ context }) => context.queryClient.ensureQueryData(programmeFeesQuery),
  head: ({ params }) => {
    const market = findMarket(params.slug);
    const title = market ? `${market.name} | Riloyd Global Presence` : "Market Not Found | Riloyd";
    const description = market?.description ?? "Explore Riloyd's global market presence.";
    return { meta: [{ title }, { name: "description", content: description }, { property: "og:title", content: title }, { property: "og:description", content: description }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }, { name: "robots", content: "noindex" }] };
  },
  component: MarketPage,
});

function MarketPage() {
  useSuspenseQuery(programmeFeesQuery);
  const { slug } = Route.useParams();
  const market = findMarket(slug);
  if (!market) return <main className="flex min-h-[65vh] items-center bg-background px-5 text-foreground"><div className="mx-auto w-full max-w-3xl"><p className="eyebrow text-xs font-bold uppercase text-soft">Global presence</p><h1 className="mt-5 text-4xl font-black uppercase">Market not found.</h1><Button asChild className="mt-7 rounded-full"><Link to="/global-presence"><ArrowLeft size={16} /> View all markets</Link></Button></div></main>;

  return <main className="overflow-hidden bg-background text-foreground">
    <section className="relative min-h-[570px] overflow-hidden border-b border-border"><img src={market.image} width={1600} height={912} alt={market.landmark} className="absolute inset-0 h-full w-full object-cover object-center" decoding="async" fetchPriority="high" /><div className="hero-shade absolute inset-0" /><div className="relative z-10 mx-auto flex min-h-[570px] max-w-[1380px] items-center px-5 py-14 sm:px-6 lg:px-12"><div className="max-w-2xl"><Link to="/global-presence" className="mb-8 inline-flex items-center gap-2 text-xs font-bold text-soft"><ArrowLeft size={14} /> Global Presence</Link><p className="eyebrow text-xs font-bold uppercase text-soft">{market.region}</p><h1 className="headline mt-5 text-[clamp(3rem,6vw,6rem)] font-black uppercase leading-[.9]">Riloyd <span className="text-primary">{market.name}</span></h1><p className="mt-5 text-2xl font-bold">{market.headline}</p><p className="mt-4 max-w-xl text-sm leading-relaxed text-soft sm:text-base">{market.description}</p></div></div></section>
    <section className="border-b border-border bg-surface py-14 text-foreground sm:py-20"><div className="mx-auto grid max-w-[1380px] gap-10 px-5 sm:px-6 lg:grid-cols-[.8fr_1.2fr] lg:items-center lg:px-12"><div><CountryLogo market={market} className="h-20 w-auto max-w-full object-contain object-left" /><h2 className="mt-7 text-3xl font-black uppercase leading-tight sm:text-4xl">Local context.<br /><span className="text-primary">Global perspective.</span></h2></div><p className="max-w-2xl text-base leading-8 text-muted-foreground">{market.introduction}</p></div></section>
    <section id="services" className="border-b border-border py-12 sm:py-16"><div className="mx-auto max-w-[1380px] px-5 sm:px-6 lg:px-12"><p className="eyebrow text-[10px] font-bold uppercase text-soft">{market.name} · Our focus</p><h2 className="mt-4 max-w-3xl text-3xl font-black sm:text-4xl">{marketContext[slug as ProgrammeCountry].focus}</h2><p className="mt-5 max-w-3xl text-sm leading-7 text-muted-foreground">{marketContext[slug as ProgrammeCountry].bridge}</p><div className="mt-8 grid gap-px bg-border sm:grid-cols-2">{internationalServices.map((service, index) => <article id={service.id} key={service.id} className="scroll-mt-8 bg-background p-6 sm:p-8"><div className="flex items-center justify-between"><span className="text-3xl font-black text-primary">0{index + 1}</span><CheckCircle2 className="text-primary" size={24} /></div><h3 className="mt-6 text-xl font-extrabold">{service.title}</h3><p className="mt-3 text-sm leading-7 text-muted-foreground">{service.copy}</p><Button asChild variant="outline" className="mt-5"><Link to="/contact">Discuss your requirements <ArrowRight size={15} /></Link></Button></article>)}</div>{slug === "india" && <Button asChild variant="outline" className="mt-6"><Link to="/services">Explore our full India services <ArrowRight size={16} /></Link></Button>}</div></section>
    <section className="border-b border-border bg-surface py-12 sm:py-16"><div className="mx-auto grid max-w-[1380px] gap-8 px-5 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-12"><img src={mentorship} alt="An Indian mentor guiding international startup founders" width={1440} height={960} loading="lazy" className="aspect-[3/2] w-full rounded-md object-cover" /><div><p className="eyebrow text-xs font-bold uppercase">Rooted in India</p><h2 className="mt-4 text-3xl font-black">Built for {market.name}.<br /><span className="text-primary">Connected with Bharat.</span></h2><p className="mt-5 text-sm leading-7 text-muted-foreground">Local market context comes first. Our India-connected approach brings entrepreneurial resourcefulness, founder mentorship and cross-border research to your business decisions. Service availability and any local regulatory requirements are confirmed for each engagement.</p></div></div></section>
    <InternationalEnrolment country={slug as ProgrammeCountry} />
    <section className="bg-surface py-14"><div className="mx-auto flex max-w-[1380px] flex-col items-start justify-between gap-7 px-5 sm:px-6 lg:flex-row lg:items-center lg:px-12"><div><p className="flex items-center gap-2 text-xs font-bold uppercase text-soft"><MapPin size={16} className="text-primary" /> {market.name}</p><h2 className="mt-3 text-3xl font-black uppercase">Explore the opportunity with Riloyd.</h2></div><Button asChild size="lg" className="rounded-full px-7 font-bold"><Link to="/contact">Start a Conversation <ArrowRight size={16} /></Link></Button></div></section>
  </main>;
}
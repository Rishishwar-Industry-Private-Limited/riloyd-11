import { createFileRoute, Link } from "@tanstack/react-router";
import { BarChart3, Building2, Download, Lightbulb, Rocket, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/research")({
  head: () => ({ meta: [
    { title: "Our Research & Analysis | Riloyd" },
    { name: "description", content: "Riloyd's research and analysis of startups, businesses and ideas — market studies, sector insights and downloadable research reports." },
    { property: "og:title", content: "Our Research & Analysis | Riloyd" },
    { property: "og:description", content: "In-depth research and analysis of startups, businesses and ideas, with downloadable Riloyd research reports." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ], links: [{ rel: "canonical", href: "/research" }] }), component: ResearchPage,
});

const focusAreas = [
  { icon: Rocket, title: "Startups", text: "How early-stage ventures find product–market fit, raise capital and survive their first three years — studied across funding stages, sectors and cities." },
  { icon: Building2, title: "Businesses", text: "Operational, financial and strategic analysis of running businesses — growth levers, margin structure, expansion readiness and turnaround signals." },
  { icon: Lightbulb, title: "Ideas", text: "Screening and scoring of raw ideas before they become startups — market size, timing, competition and execution feasibility." },
];

const researchThemes = [
  { icon: TrendingUp, title: "Sector & market studies", text: "Demand, pricing and competition across the industries we advise." },
  { icon: BarChart3, title: "Funding & valuation trends", text: "How rounds are priced, what investors pay for, and where valuations are heading." },
  { icon: Rocket, title: "Startup success patterns", text: "What separates startups that scale from those that stall." },
  { icon: Lightbulb, title: "Idea validation frameworks", text: "The checkpoints our analysts apply before an idea is backed." },
];

function ResearchPage() {
  return <main className="bg-background text-foreground">
    <section className="border-b border-border px-5 py-16 sm:px-6 sm:py-20 lg:px-12">
      <div className="mx-auto max-w-[1100px]">
        <p className="eyebrow text-xs font-bold uppercase">Riloyd insights</p>
        <h1 className="mt-4 max-w-[900px] text-4xl font-black uppercase leading-[1.05] sm:text-5xl lg:text-6xl">
          Research &amp; analysis of startups, businesses and ideas
        </h1>
        <p className="mt-6 max-w-[720px] text-base leading-relaxed text-muted-foreground sm:text-lg">
          Every Riloyd engagement feeds a growing body of research. We study what makes startups fundable, businesses valuable and ideas worth building — and publish our findings as reports you can download.
        </p>
        <Button asChild className="mt-8"><Link to="/downloads"><Download size={16} /> Download research reports</Link></Button>
      </div>
    </section>

    <section className="border-b border-border px-5 py-14 sm:px-6 lg:px-12">
      <div className="mx-auto max-w-[1100px]">
        <h2 className="text-2xl font-black uppercase sm:text-3xl">What we study</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {focusAreas.map(area => <article key={area.title} className="border border-border bg-card p-6">
            <area.icon size={28} className="text-primary" />
            <h3 className="mt-4 text-lg font-bold uppercase text-card-foreground">{area.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-card-foreground">{area.text}</p>
          </article>)}
        </div>
      </div>
    </section>

    <section className="border-b border-border px-5 py-14 sm:px-6 lg:px-12">
      <div className="mx-auto max-w-[1100px]">
        <h2 className="text-2xl font-black uppercase sm:text-3xl">Research themes</h2>
        <div className="mt-8 grid gap-x-10 gap-y-6 sm:grid-cols-2">
          {researchThemes.map(theme => <div key={theme.title} className="flex gap-4 border-t border-border pt-5">
            <theme.icon size={22} className="mt-0.5 shrink-0 text-primary" />
            <div><h3 className="font-bold">{theme.title}</h3><p className="mt-1 text-sm leading-relaxed text-muted-foreground">{theme.text}</p></div>
          </div>)}
        </div>
      </div>
    </section>

    <section className="px-5 py-14 sm:px-6 lg:px-12">
      <div className="mx-auto max-w-[1100px] border border-border bg-card p-8 sm:p-10">
        <h2 className="text-2xl font-black uppercase text-card-foreground sm:text-3xl">Download our research reports</h2>
        <p className="mt-4 max-w-[680px] text-sm leading-relaxed text-card-foreground sm:text-base">
          Our published research reports, business studies and analysis papers are available in the Downloads centre. Enter the report number and publish date shared with you to download your copy.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild><Link to="/downloads"><Download size={16} /> Go to Downloads</Link></Button>
          <Button asChild variant="outline"><Link to="/contact">Request a custom study</Link></Button>
        </div>
      </div>
    </section>
  </main>;
}

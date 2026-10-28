import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { ArrowLeft, ArrowRight, Lock, LogOut, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { AuthForm } from "@/components/auth-form";
import { initials, peopleGroups, type PersonGroup, type PersonProfile } from "@/lib/people-config";

const profileRoutes = { investors: "/investors/$slug", mentors: "/mentors/$slug", team: "/team/$slug", startups: "/startups/$slug", businesses: "/businesses/$slug" } as const;
const listRoutes = { investors: "/investors", mentors: "/mentors", team: "/team", startups: "/startups", businesses: "/businesses" } as const;

function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setReady(true); });
    return () => sub.subscription.unsubscribe();
  }, []);
  return { session, ready };
}

function Avatar({ p, big }: { p: PersonProfile; big?: boolean }) {
  const cls = big ? "aspect-square w-full max-w-[220px] rounded-md text-6xl" : "h-14 w-14 shrink-0 rounded-full text-lg";
  return p.photo_url
    ? <img src={p.photo_url} alt={p.name} loading="lazy" decoding="async" className={`${cls} object-cover`} />
    : <span className={`${cls} flex items-center justify-center bg-primary font-black text-primary-foreground`}>{initials(p.name)}</span>;
}

function Locked({ group }: { group: PersonGroup }) {
  return <div className="mt-9 border border-border bg-surface p-6 sm:p-8">
    <div className="flex items-center gap-3"><Lock className="text-primary" size={22} /><p className="font-extrabold">Sign in to view {peopleGroups[group].label.toLowerCase()}</p></div>
    <p className="mt-2 text-sm text-muted-foreground">Profiles are available to registered members only.</p>
    <AuthForm redirectPath={listRoutes[group]} />
  </div>;
}

export function ProfileGrid({ group }: { group: PersonGroup }) {
  const config = peopleGroups[group];
  const { session, ready } = useSession();
  const [rows, setRows] = useState<PersonProfile[] | null>(null);

  useEffect(() => {
    if (!session) { setRows(null); return; }
    supabase.from("people_profiles").select("*").eq("person_group", group).order("sort_order").order("name")
      .then(({ data }) => setRows((data as PersonProfile[]) ?? []));
  }, [session, group]);

  return <section className="border-b border-border py-14 sm:py-20">
    <div className="mx-auto max-w-[1380px] px-5 sm:px-6 lg:px-12">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><p className="eyebrow text-[10px] font-bold uppercase text-soft">Profiles</p><h2 className="mt-4 text-3xl font-black uppercase sm:text-5xl">{config.label}</h2></div>
        {session && <button type="button" onClick={() => supabase.auth.signOut()} className="flex items-center gap-1 text-xs text-muted-foreground"><LogOut size={13} /> Sign out</button>}
      </div>
      {!ready ? null : !session ? <Locked group={group} /> : rows === null ? <p className="mt-9 text-sm text-muted-foreground">Loading…</p> : rows.length === 0
        ? <p className="mt-9 text-sm text-muted-foreground">Profiles will be published here soon.</p>
        : <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((p) => <Link key={p.id} to={profileRoutes[group]} params={{ slug: p.slug }} className="group border border-border bg-surface p-6 transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            <div className="flex items-center gap-4"><Avatar p={p} /><div><h3 className="font-extrabold">{p.name}</h3><p className="text-xs text-muted-foreground">{p.role}</p></div></div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{p.summary}</p>
            <span className="mt-5 inline-flex items-center gap-1 text-xs font-bold text-primary">View profile <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" /></span>
          </Link>)}
        </div>}
    </div>
  </section>;
}

export function ProfileDetail({ group, slug }: { group: PersonGroup; slug: string }) {
  const config = peopleGroups[group];
  const { session, ready } = useSession();
  const [profile, setProfile] = useState<PersonProfile | null | undefined>(undefined);

  useEffect(() => {
    if (!session) return;
    supabase.from("people_profiles").select("*").eq("person_group", group).eq("slug", slug).maybeSingle()
      .then(({ data }) => setProfile((data as PersonProfile | null) ?? null));
  }, [session, group, slug]);

  return <main className="bg-background text-foreground">
    <section className="border-b border-border py-14 sm:py-20">
      <div className="mx-auto max-w-[1100px] px-5 sm:px-6">
        <Link to={listRoutes[group]} className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-primary"><ArrowLeft size={14} /> Back to {config.label}</Link>
        {!ready ? null : !session ? <Locked group={group} /> : profile === undefined ? <p className="mt-8 text-sm text-muted-foreground">Loading…</p> : profile === null ? <p className="mt-8 text-sm">Profile not found.</p> :
          <div className="mt-8 grid gap-8 md:grid-cols-[220px_1fr]">
            <Avatar p={profile} big />
            <div>
              <p className="eyebrow text-[10px] font-bold uppercase text-soft">{config.singular}</p>
              <h1 className="mt-3 text-4xl font-black uppercase leading-[.95] sm:text-5xl">{profile.name}</h1>
              <p className="mt-3 font-bold text-primary">{profile.role}</p>
              {profile.location && <p className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground"><MapPin size={13} /> {profile.location}</p>}
              <p className="mt-6 max-w-2xl whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{profile.bio}</p>
              <div className="mt-6 flex flex-wrap gap-2">{profile.focus.map((f) => <span key={f} className="border border-border px-3 py-1.5 text-xs font-bold">{f}</span>)}</div>
              <Button asChild className="mt-8 rounded-full px-6 font-bold"><Link to="/contact">Get in touch <ArrowRight size={15} /></Link></Button>
            </div>
          </div>}
      </div>
    </section>
  </main>;
}

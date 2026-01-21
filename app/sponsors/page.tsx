"use client";

import { useMemo } from "react";
import BackgroundGlow from "@/components/background-glow";
import PageHeader from '@/components/page-header';

type Sponsor = {
  name: string;
  href?: string;
  logoSrc?: string;
};

type Tier = {
  id: "gold" | "silver" | "bronze";
  label: string;
  sponsors: Sponsor[];
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function TierHeader({ tier }: { tier: Tier }) {
  const pill =
    tier.id === "gold"
      ? "border-primary/35 bg-primary/10 text-primary"
      : tier.id === "silver"
      ? "border-foreground/20 bg-foreground/5 text-foreground"
      : "border-[#CD7F32]/35 bg-[#CD7F32]/15 text-[#CD7F32]";

  return (
    <div className="flex flex-col gap-2">
      <div className={cn("inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium", pill)}>
        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
        {tier.label}
      </div>
      <div className="flex items-end justify-between gap-4">
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
          {tier.id === "gold" ? "Gold Sponsors" : tier.id === "silver" ? "Silver Sponsors" : "Bronze Sponsors"}
        </h2>
        <div className="text-xs text-muted-foreground">{tier.sponsors.length} sponsor(s)</div>
      </div>
    </div>
  );
}

function LogoCard({ s, tier }: { s: Sponsor; tier: Tier["id"] }) {
  const glow =
    tier === "gold"
      ? "hover:shadow-[0_0_0_1px_color-mix(in_oklab,var(--ring)_35%,transparent),0_0_36px_color-mix(in_oklab,var(--ring)_16%,transparent)]"
      : tier === "silver"
      ? "hover:shadow-[0_0_0_1px_rgba(255,255,255,0.10),0_0_28px_rgba(255,255,255,0.06)]"
      : "hover:shadow-[0_0_0_1px_rgba(205,127,50,0.16),0_0_28px_rgba(205,127,50,0.08)]";

  const inner = (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border bg-white/20 backdrop-blur",
        "transition-transform duration-300 will-change-transform hover:-translate-y-1",
        glow
      )}
    >
        {/* shine sweep */}
        <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <div className="absolute -left-1/3 top-0 h-full w-1/2 rotate-12 bg-linear-to-r from-transparent via-foreground/10 to-transparent blur-md" />
        </div>

        {/* subtle blobs */}
        <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl opacity-70" />
            <div className="absolute -bottom-24 right-10 h-72 w-72 rounded-full bg-secondary/10 blur-3xl opacity-70" />
        </div>

        <div className="relative flex items-center justify-center p-6">
            <img
                src={s.logoSrc}
                alt={`${s.name} logo`}
                className="h-auto w-full object-contain opacity-90 transition duration-300 group-hover:opacity-100"
            />
        </div>
    </div>
  );

  if (s.href) {
    return (
      <a href={s.href} target="_blank" rel="noreferrer" aria-label={s.name} className="block h-full">
        {inner}
      </a>
    );
  }
  return inner;
}

export default function SponsorsShowcasePage() {
  const tiers: Tier[] = useMemo(
    () => [
      {
        id: "gold",
        label: "Gold Tier",
        sponsors: [
          { name: "IMC Trading", href: "https://www.imc.com", logoSrc: "/imc-logo.png"},
        ],
      },
      {
        id: "silver",
        label: "Silver Tier",
        sponsors: [
          { name: "Old Mission", href: "https://www.oldmissioncapital.com", logoSrc: "/oldmission-logo.png"},
          { name: "Jane Street", href: "https://www.janestreet.com", logoSrc: "/janestreet-logo.png"},
          { name: "Citadel Securities", href: "https://www.citadelsecurities.com", logoSrc: "/citadel-logo.png"},
          { name: "Optiver", href: "https://www.optiver.com", logoSrc: "/optiver-logo.png"},

        ],
      },
      {
        id: "bronze",
        label: "Bronze Tier",
        description: "Community partners backing student-led quantitative finance.",
        sponsors: [
          { name: "Kalshi", href: "https://www.kalshi.com", logoSrc: "/kalshi-logo.png"},
          { name: "Coinbase", href: "https://www.coinbase.com", logoSrc: "/coinbase-logo.png"},
          { name: "Peak6", href: "https://www.peak6.com", logoSrc: "/peak6-logo.png"},
          { name: "Headlands", href: "https://www.headlandstech.com", logoSrc: "/headlands-logo.png"},
        ],
      },
    ],
    []
  );

  const totalSponsors = tiers.reduce((acc, t) => acc + t.sponsors.length, 0);

  return (
    <main className="relative min-h-screen overflow-hidden pt-32 pb-8">
        
        <BackgroundGlow />

        <div className="relative mx-auto max-w-6xl px-6">
            <PageHeader 
                page="Sponsors" 
                title="Built with support from" 
                titleSecondary="world-class firms" 
                subtitle="A huge thank you to our sponsors for supporting student-led quantitative finance at Michigan." 
            />
           
            <header className="animate-fade-in-up opacity-0">
                <div className="mt-8 grid gap-4 rounded-2xl border border-border bg-card/40 p-5 backdrop-blur md:grid-cols-3">
                    {[
                    { k: `${totalSponsors}`, v: "sponsoring firms" },
                    { k: "3", v: "tiers" },
                    { k: "120+", v: "students attending" },
                    ].map((s) => (
                    <div key={s.v} className="rounded-xl border border-border bg-background/30 p-4">
                        <div className="text-2xl font-semibold tracking-tight">{s.k}</div>
                        <div className="text-sm text-muted-foreground">{s.v}</div>
                    </div>
                    ))}
                </div>
            </header>

        {/* tiers */}
        <div className="mt-14 space-y-12">
          {tiers.map((tier, idx) => (
            <section
              key={tier.id}
              className="animate-fade-in-up opacity-0"
              style={{ animationDelay: `${140 + idx * 120}ms` }}
            >
              <TierHeader tier={tier} />

              <div
                className={cn(
                  "mt-6 grid gap-4",
                  tier.id === "gold"
                    ? "sm:grid-cols-2 lg:grid-cols-3"
                    : "sm:grid-cols-2 lg:grid-cols-4"
                )}
              >
                {tier.sponsors.map((s) => (
                  <LogoCard key={s.name} s={s} tier={tier.id} />
                ))}
              </div>
            </section>
          ))}
        </div>

        <footer
          className="mt-16 animate-fade-in-up opacity-0"
          style={{ animationDelay: "560ms" }}
        >
          <div className="rounded-3xl border border-border bg-card/45 p-8 text-center backdrop-blur">
            <div className="mx-auto max-w-2xl">
              <h3 className="text-xl font-semibold tracking-tight">Thank you for making this possible.</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Your support helps us create a high-impact, high-signal conference for students exploring
                quant trading, research, and engineering.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
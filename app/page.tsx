"use client"

import HeroCarousel from "@/components/home-components/hero-carousel"
import CountdownTimer from "@/components/home-components/Timer"
import { Button } from "@/components/ui/button"
import { Calendar, Users, Award } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession } from "@/hooks/useSession"

const infoCards = [
  {
    icon: <Calendar className="h-8 w-8 text-primary" />,
    title: "A day of games",
    description: "Play in quant games designed by MIG members to compete for prizes totaling over $6,000.",
  },
  {
    icon: <Users className="h-8 w-8 text-primary" />,
    title: "Network with sponsors",
    description: "Network with sponsors and learn about their companies and the quant trading industry.",
  },
  {
    icon: <Award className="h-8 w-8 text-primary" />,
    title: "Build Algorithmic Trading Skills",
    description: "Participate in our algorithmic building competition and participate in our algorithmic building workshops.",
  },
]

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ")
}

export default function Home() {
  const router = useRouter()
  const { user, loading } = useSession()
  const ctaHref = user ? "/dashboard" : "/signup"

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Sponsor-page style background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_55%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:60px_60px] opacity-[0.08]" />
        <div className="absolute -top-44 left-1/2 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-primary/14 blur-3xl animate-[pulse_6s_ease-in-out_infinite]" />
        <div className="absolute -bottom-44 right-[-120px] h-[560px] w-[560px] rounded-full bg-secondary/14 blur-3xl animate-[pulse_7s_ease-in-out_infinite]" />
      </div>

      <div className="relative">
        <HeroCarousel />

        {/* Countdown / Apply */}
        <section className="py-12 text-foreground">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-5xl rounded-3xl border border-border bg-card/40 p-8 backdrop-blur">
              <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/30 px-4 py-2 text-xs text-muted-foreground backdrop-blur">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Application Deadline • March 5st, 2026
                  </div>
                  <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight md:text-4xl">
                    Countdown to applications closing
                  </h2>
                </div>

                <div className="w-full md:w-auto">
                  <CountdownTimer targetDate="2026-03-05T00:00:00Z" />
                  <div className="mt-6 flex justify-center md:justify-end">
                    <Button
                      size="xl"
                      variant="default"
                      disabled={loading}
                      onClick={() => {
                        if (loading) return
                        router.push(ctaHref)
                      }}
                    >
                      Apply Now
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* About */}
        <section className="pb-16 pt-6">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/40 px-4 py-2 text-xs text-muted-foreground backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                What to expect
              </div>
              <h2 className="mt-5 text-balance text-4xl font-bold tracking-tight text-foreground">
                Welcome to the MIG Quant Conference
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-pretty text-muted-foreground">
                A high-signal day built by MIG members — games, learning, and recruiting-grade networking.
              </p>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {infoCards.map((card, idx) => (
                <div
                  key={card.title}
                  className={cn(
                    "group relative overflow-hidden rounded-2xl border border-border bg-card/55 p-8 text-center backdrop-blur",
                    "transition-transform duration-300 will-change-transform hover:-translate-y-1",
                    "animate-fade-in-up opacity-0"
                  )}
                  style={{ animationDelay: `${idx * 120}ms` }}
                >
                  {/* shine sweep */}
                  <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <div className="absolute -left-1/3 top-0 h-full w-1/2 rotate-12 bg-gradient-to-r from-transparent via-foreground/10 to-transparent blur-md" />
                  </div>

                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-background/35">
                    {card.icon}
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-card-foreground">{card.title}</h3>
                  <p className="mt-2 text-pretty leading-relaxed text-muted-foreground">{card.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA (attendee) */}
        <section className="py-14">
          <div className="container mx-auto px-4">
            <div className="rounded-3xl border border-border bg-card/40 p-10 text-center backdrop-blur">
              <div className="mx-auto max-w-2xl">
                <h2 className="text-balance text-4xl font-bold tracking-tight">Ready to Join Us?</h2>
                <p className="mx-auto mt-4 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
                  Apply by <strong className="text-foreground">March 1st, 2026</strong>.
                </p>
                <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <Button
                    size="xxl"
                    variant="default"
                    disabled={loading}
                    onClick={() => {
                      if (loading) return
                      router.push(ctaHref)
                    }}
                  >
                    Register Now
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sponsor info (still ok to keep) */}
        <section className="pb-16 pt-2 text-foreground">
          <div className="container mx-auto px-4 text-center">
            <div className="mx-auto max-w-4xl rounded-3xl border border-border bg-card/35 p-10 backdrop-blur">
              <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">
                Looking to sponsor the conference?
              </h2>
              <p className="mx-auto mt-4 max-w-3xl text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
                Email us at{" "}
                <span className="font-semibold text-foreground">mig.board@umich.edu</span> and visit{" "}
                <Link className="text-primary underline underline-offset-4" href="https://michiganinvestmentgroup.com/" target="_blank">
                  michiganinvestmentgroup.com
                </Link>
                .
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
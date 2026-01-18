"use client"

import HeroCarousel from "@/components/home-components/hero-carousel"
import CountdownTimer from "@/components/home-components/Timer"

import { Button } from "@/components/ui/button"
import { Calendar, Users, Award } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen">
      <HeroCarousel />

      {/* Countdown and Apply Section */}
      <section className="bg-muted py-10 text-foreground">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl rounded-2xl border border-border bg-card/30 p-8 backdrop-blur">
            <div className="mb-6 text-center text-sm text-muted-foreground">Application Deadline: February 14, 2026</div>
            <CountdownTimer targetDate="2026-02-14T00:00:00Z" />
            <div className="mt-8 text-center">
              <Button size="xxl" className="bg-primary px-8 text-primary-foreground hover:bg-primary/90">
                Apply Now
              </Button>
            </div>
          </div>
        </div>
      </section>
      
       {/* About Section */}
       <section className="pt-10 pb-14">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-balance text-4xl font-bold text-foreground">Welcome to Quant Conference 2026</h2>
            <p className="mt-6 text-pretty text-lg leading-relaxed text-muted-foreground">
              The premier gathering for quantitative finance professionals, researchers, and students. Explore the
              latest developments in algorithmic trading, risk management, machine learning in finance, and much more.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            <div className="rounded-lg border border-border bg-card p-8 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Calendar className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mt-4 text-xl font-semibold text-card-foreground">3 Days of Content</h3>
              <p className="mt-2 text-pretty leading-relaxed text-muted-foreground">
                Keynotes, workshops, and panel discussions covering the latest in quantitative finance
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-8 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mt-4 text-xl font-semibold text-card-foreground">500+ Attendees</h3>
              <p className="mt-2 text-pretty leading-relaxed text-muted-foreground">
                Network with industry leaders, academics, and fellow practitioners
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-8 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Award className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mt-4 text-xl font-semibold text-card-foreground">World-Class Speakers</h3>
              <p className="mt-2 text-pretty leading-relaxed text-muted-foreground">
                Learn from leading experts in quantitative research and trading
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-14 text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-balance text-4xl font-bold">Ready to Join Us?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-lg leading-relaxed opacity-90">
            Apply for the conference by <strong>February 14th, 2026.</strong>
          </p>
          <div className="mt-4 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="xxl" variant="secondary" className="bg-background text-foreground hover:bg-background/90">
              Register Now
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-14 text-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-balance text-4xl font-bold">Looking to sponsor the conference?</h2>
          <p className="mx-auto mt-4 max-w-4xl text-pretty text-lg leading-relaxed opacity-90">
           email us at mig.board@umich.edu for more information and visit https://michiganinvestmentgroup.com/
          </p>
        </div>
      </section>
    </div>
  );
}

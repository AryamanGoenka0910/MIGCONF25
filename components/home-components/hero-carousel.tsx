"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, DollarSign, MapPin, Plane } from "lucide-react"
import { Button } from "@/components/ui/button"

const slides = [
  {
    title: "MIG Quant Conference",
    description: "A high-signal day of quant games, workshops, and networking — built by MIG.",
    image: "/hero.jpg",
    pill: "March 15, 2026",
  },
  {
    title: "World-Class Speakers",
    description: "Keynotes + panels with leaders across quant finance.",
    image: "/IMG_6198.jpg",
    pill: "Speakers + Panels",
  },
  {
    title: "Sponsor Networking",
    description: "Meet firms shaping markets — and learn what it takes to break into quant.",
    image: "/hero.jpg",
    pill: "Networking",
  },
]

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ")
}

const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide((prev) => (prev + 1) % slides.length), 5500)
    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length)
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)

  return (
    <section className="relative h-[650px] w-full overflow-hidden">
      {slides.map((slide, index) => (
        <div key={index} className="absolute inset-0 transition-opacity duration-700">
          {/* Background image */}
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${slide.image})` }} />

          {/* Dark glass overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/45" />

          <div className="relative flex h-full items-center">
            <div className="container mx-auto px-4">
              <div className="grid items-center gap-10 md:grid-cols-[1.3fr_0.7fr]">
                {/* Left content */}
                <div className="animate-fade-in-up opacity-0" style={{ animationDelay: "40ms" }}>
                  <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/40 px-4 py-2 text-xs text-muted-foreground backdrop-blur">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    {slide.pill}
                  </div>

                  <h1 className="mt-5 text-balance text-4xl font-bold leading-tight tracking-tight md:text-6xl">
                    {slide.title}
                  </h1>
                  <p className="mt-4 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
                    {slide.description}
                  </p>

                  <div className="mt-7 flex flex-wrap gap-3">
                    <Button size="xl" variant="outline">
                      Register Now
                    </Button>
                  </div>
                </div>

                {/* Right glass details card */}
                <div className="group relative overflow-hidden rounded-3xl border border-border bg-card/40 p-6 backdrop-blur animate-fade-in-up opacity-0"
                     style={{ animationDelay: "120ms" }}>
                  {/* shine sweep */}
                  <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <div className="absolute -left-1/3 top-0 h-full w-1/2 rotate-12 bg-gradient-to-r from-transparent via-foreground/10 to-transparent blur-md" />
                  </div>

                  <div className="relative space-y-5 text-md">
                    <div className="font-semibold text-foreground">Conference Details</div>

                    <div className="flex items-start gap-3">
                      <MapPin className="mt-0.5 h-5 w-5 text-primary" />
                      <div>
                        <div className="font-medium text-foreground">Location</div>
                        <div className="text-muted-foreground">Ann Arbor, MI</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <DollarSign className="mt-0.5 h-5 w-5 text-primary" />
                      <div>
                        <div className="font-medium text-foreground">Prize Pool</div>
                        <div className="text-muted-foreground">$6,000</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Plane className="mt-0.5 h-5 w-5 text-primary" />
                      <div>
                        <div className="font-medium text-foreground">Reimbursements</div>
                        <div className="text-muted-foreground">Travel reimbursements available</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Nav buttons */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full border border-border bg-background/55 p-2 backdrop-blur transition-colors hover:bg-accent/10"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full border border-border bg-background/55 p-2 backdrop-blur transition-colors hover:bg-accent/10"
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={cn(
              "h-2 w-2 rounded-full transition-all",
              index === currentSlide ? "w-8 bg-primary" : "bg-primary/30 hover:bg-primary/50"
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  )
}

export default HeroCarousel
"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, DollarSign, MapPin, Plane } from "lucide-react"
import { Button } from "@/components/ui/button"

const slides = [
  {
    title: "MIG Quant Conference",
    description:
      "Join industry experts, academics, and practitioners for three days of cutting-edge research and networking.",
    image: "/hero.jpg",
  },
  {
    title: "World-Class Speakers",
    description: "Featuring keynotes from top quantitative researchers, hedge fund managers, and fintech innovators.",
    image: "/IMG_6198.jpg",
  },
  {
    title: "Sponsor Networking",
    description: "Build relationships with peers, potential employers, and industry leaders in quantitative finance.",
    image: "/hero.jpg",
  },
]

const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  return (
    <div className="relative md:h-[550px] h-[610px] w-full overflow-hidden bg-muted">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-700 ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${slide.image})` }}>
            <div className="absolute inset-0 bg-linear-to-r from-background/95 to-background/50" />
          </div>
          <div className="relative flex h-full items-center">
            <div className="container mx-auto flex h-full items-center px-4">
              <div className="flex w-full flex-col items-stretch gap-6 md:flex-row md:gap-10">
                <div className="min-w-0 w-full max-w-3xl space-y-4 md:flex-1">
                <div className="inline-block rounded-full bg-primary/10 px-4 py-1 text-sm font-medium text-primary">
                  March 15-17, 2026
                </div>
                <h1 className="text-balance lg:text-6xl text-3xl font-bold leading-tight text-foreground">
                  {slide.title}
                </h1>
                <p className="text-pretty text-lg leading-relaxed text-muted-foreground">{slide.description}</p>
                <div className="flex gap-4 pt-4">
                  <Button size="lg">Register Now</Button>
                  <Button size="lg" variant="outline">
                    View Agenda
                  </Button>
                </div>
              </div>
              <div className="flex min-w-0 w-full justify-center items-stretch md:w-[340px] lg:w-1/3">
                <div className="h-full w-full rounded-2xl border border-border bg-background/70 p-4 shadow-lg backdrop-blur-md md:max-w-xs md:p-5">
                  <div className="space-y-4">
                    <div className="text-sm font-semibold text-foreground">Conference Details</div>

                    <div className="flex items-start gap-3">
                      <MapPin className="mt-0.5 h-5 w-5 text-primary" />
                      <div className="space-y-0.5">
                        <div className="text-sm font-medium text-foreground">Location</div>
                        <div className="text-sm text-muted-foreground">Ann Arbor, MI</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <DollarSign className="mt-0.5 h-5 w-5 text-primary" />
                      <div className="space-y-0.5">
                        <div className="text-sm font-medium text-foreground">Prize Pool</div>
                        <div className="text-sm text-muted-foreground">$6000</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Plane className="mt-0.5 h-5 w-5 text-primary" />
                      <div className="space-y-0.5">
                        <div className="text-sm font-medium text-foreground">Reimbursements</div>
                        <div className="text-sm text-muted-foreground">Travel reimbursements will be provided</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Buttons */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 backdrop-blur-sm transition-colors hover:bg-background"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 backdrop-blur-sm transition-colors hover:bg-background"
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
            className={`h-2 w-2 rounded-full transition-all ${
              index === currentSlide ? "w-8 bg-primary" : "bg-primary/30 hover:bg-primary/50"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

export default HeroCarousel;
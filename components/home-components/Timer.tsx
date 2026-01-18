"use client"

import { useState, useEffect } from "react"

const CountdownTimer = ({ targetDate }: { targetDate: string }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(targetDate) - +new Date()

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        })
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [targetDate])

  return (
    <div className="flex items-center justify-center gap-4 md:gap-8">
      <div className="text-center">
        <div className="text-4xl font-bold text-foreground md:text-6xl">{String(timeLeft.days).padStart(2, "0")}</div>
        <div className="mt-2 text-sm text-muted-foreground">Days</div>
      </div>
      <div className="text-4xl font-bold text-muted-foreground">:</div>
      <div className="text-center">
        <div className="text-4xl font-bold text-foreground md:text-6xl">{String(timeLeft.hours).padStart(2, "0")}</div>
        <div className="mt-2 text-sm text-muted-foreground">Hours</div>
      </div>
      <div className="text-4xl font-bold text-muted-foreground">:</div>
      <div className="text-center">
        <div className="text-4xl font-bold text-foreground md:text-6xl">
          {String(timeLeft.minutes).padStart(2, "0")}
        </div>
        <div className="mt-2 text-sm text-muted-foreground">Minutes</div>
      </div>
      <div className="text-4xl font-bold text-muted-foreground">:</div>
      <div className="text-center">
        <div className="text-4xl font-bold text-foreground md:text-6xl">
          {String(timeLeft.seconds).padStart(2, "0")}
        </div>
        <div className="mt-2 text-sm text-muted-foreground">Seconds</div>
      </div>
    </div>
  )
}

export default CountdownTimer;
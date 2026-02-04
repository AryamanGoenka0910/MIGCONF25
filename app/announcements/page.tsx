"use client"

import { Bell, Clock, MapPin, Info } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Announcement {
  id: number
  title: string
  time: string
  location?: string
  type: "update" | "reminder" | "alert" | "info"
  message: string
}

const announcements: Announcement[] = [
]

function getAnnouncementColor(type: string) {
  switch (type) {
    case "alert":
      return "destructive"
    case "reminder":
      return "default"
    case "update":
      return "secondary"
    default:
      return "outline-solid"
  }
}

export default function AnnouncementsPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="border-b border-border bg-muted pb-16 pt-24">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-4 flex items-center justify-center gap-3">
            <Bell className="h-12 w-12 text-primary" />
            <h1 className="text-5xl font-bold text-foreground">Live Announcements</h1>
          </div>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Stay updated with real-time conference announcements, schedule changes, and important information
          </p>
          <div className="mx-auto mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <div className="h-2 w-2 animate-pulse rounded-full bg-primary"></div>
            <span>Last updated: Just now</span>
          </div>
        </div>
      </section>

      {/* Announcements Feed */}
      <section className="py-16">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="space-y-6">
            {announcements.map((announcement, index) => (
              <Card
                key={announcement.id}
                className="animate-fade-in-up border-l-4 border-l-primary transition-all hover:shadow-lg"
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                <CardHeader>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        {/* <Badge variant={getAnnouncementColor(announcement.type)}>
                          {announcement.type.toUpperCase()}
                        </Badge> */}
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{announcement.time}</span>
                        </div>
                      </div>
                      <CardTitle className="text-xl">{announcement.title}</CardTitle>
                      {announcement.location && (
                        <CardDescription className="mt-2 flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {announcement.location}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="leading-relaxed text-foreground">{announcement.message}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Info Box */}
          <Card className="mt-12 border-2 border-primary/50 bg-card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                <CardTitle>Important Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm leading-relaxed text-muted-foreground">
              <p>• Announcements are posted throughout the day. Check back regularly for updates.</p>
              <p>• For urgent matters, please visit the registration desk or contact conference staff.</p>
              <p>• Download the conference app for push notifications of new announcements.</p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}

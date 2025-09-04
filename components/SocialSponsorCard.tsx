"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ExternalLink, Play, Pause, Megaphone } from "lucide-react"
import { getSponsorsBySection } from "@/lib/sponsors"
import { db } from "@/lib/db"
import type { Sponsor } from "@/lib/sponsors"
import { cn } from "@/lib/utils"

interface SocialSponsorCardProps {
  variant?: "desktop" | "mobile"
  className?: string
}

export function SocialSponsorCard({ variant = "desktop", className }: SocialSponsorCardProps) {
  const [sponsors, setSponsors] = useState<Sponsor[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [playingVideo, setPlayingVideo] = useState<string | null>(null)

  useEffect(() => {
    const loadSponsors = () => {
      const allSponsors = db.get("sponsors") || []
      const socialSponsors = getSponsorsBySection(allSponsors, "social")
      setSponsors(socialSponsors)
    }

    loadSponsors()
    const interval = setInterval(loadSponsors, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Auto-rotate sponsors if multiple exist
    if (sponsors.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % sponsors.length)
      }, 30000) // 30 seconds
      return () => clearInterval(interval)
    }
  }, [sponsors.length])

  const handleSponsorClick = (sponsor: Sponsor) => {
    if (sponsor.linkUrl) {
      // Update click count
      const allSponsors = db.get("sponsors") || []
      const updatedSponsors = allSponsors.map((s: Sponsor) =>
        s.id === sponsor.id ? { ...s, clickCount: s.clickCount + 1 } : s,
      )
      db.set("sponsors", updatedSponsors)
      window.open(sponsor.linkUrl, "_blank")
    }
  }

  const toggleVideo = (sponsorId: string) => {
    setPlayingVideo(playingVideo === sponsorId ? null : sponsorId)
  }

  // Track impressions
  useEffect(() => {
    if (sponsors.length > 0) {
      const currentSponsor = sponsors[currentIndex]
      if (currentSponsor) {
        const allSponsors = db.get("sponsors") || []
        const updatedSponsors = allSponsors.map((s: Sponsor) =>
          s.id === currentSponsor.id ? { ...s, impressions: s.impressions + 1 } : s,
        )
        db.set("sponsors", updatedSponsors)
      }
    }
  }, [sponsors, currentIndex])

  if (sponsors.length === 0) {
    return null
  }

  const currentSponsor = sponsors[currentIndex]

  const renderSponsorContent = (sponsor: Sponsor) => {
    switch (sponsor.type) {
      case "image":
        return (
          <div
            className="relative bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-800 p-2 rounded-lg cursor-pointer group transition-all duration-200 hover:shadow-lg"
            onClick={() => handleSponsorClick(sponsor)}
          >
            <img
              src={sponsor.imageUrl || "/placeholder.svg?height=120&width=200&text=Sponsor"}
              alt={sponsor.title}
              className="w-full h-34 object-cover rounded-lg mb-3 transition-transform group-hover:scale-105"
            />
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-green-800 dark:text-green-200">{sponsor.title}</h3>
              {sponsor.description && (
                <p className="text-xs text-green-600 dark:text-green-300 line-clamp-2">{sponsor.description}</p>
              )}
              {sponsor.linkText && (
                <Button size="sm" className="w-full bg-green-600 hover:bg-green-700 text-white">
                  {sponsor.linkText}
                </Button>
              )}
            </div>
          </div>
        )

      case "video":
        return (
          <div className="relative bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-800 p-4 rounded-lg">
            <video
              src={sponsor.videoUrl}
              className="w-full h-24 object-cover rounded-lg mb-3"
              muted
              loop
              playsInline
              ref={(video) => {
                if (video) {
                  if (playingVideo === sponsor.id) {
                    video.play()
                  } else {
                    video.pause()
                  }
                }
              }}
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-6 right-6 bg-black/50 hover:bg-black/70 text-white h-6 w-6"
              onClick={() => toggleVideo(sponsor.id)}
            >
              {playingVideo === sponsor.id ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            </Button>
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-green-800 dark:text-green-200">{sponsor.title}</h3>
              {sponsor.description && (
                <p className="text-xs text-green-600 dark:text-green-300 line-clamp-2">{sponsor.description}</p>
              )}
              {sponsor.linkUrl && (
                <Button
                  size="sm"
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => handleSponsorClick(sponsor)}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  {sponsor.linkText || "Learn More"}
                </Button>
              )}
            </div>
          </div>
        )

      case "poster":
      case "link":
        return (
          <div
            className="relative bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-800 p-4 rounded-lg cursor-pointer group transition-all duration-200 hover:shadow-lg"
            onClick={() => handleSponsorClick(sponsor)}
          >
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-green-800 dark:text-green-200">{sponsor.title}</h3>
              {sponsor.description && (
                <p className="text-xs text-green-600 dark:text-green-300 line-clamp-3">{sponsor.description}</p>
              )}
              {sponsor.linkUrl && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-green-500">{sponsor.linkText || "Learn More"}</span>
                  <ExternalLink className="h-4 w-4 text-green-500 group-hover:text-green-600 transition-colors" />
                </div>
              )}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  if (variant === "mobile") {
    // Mobile version - appears in social feed like a post
    return (
      <Card className={cn("shadow-lg animate-fade-in mb-4", className)}>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-orange-500">
              <AvatarImage src="/placeholder.svg?height=40&width=40&text=S" />
              <AvatarFallback className="bg-orange-100 text-orange-600">S</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">Sponsored Content</span>
                <Badge variant="outline" className="text-xs bg-orange-50 text-orange-600 border-orange-200">
                  <Megaphone className="h-3 w-3 mr-1" />
                  Ad
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">Promoted</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {renderSponsorContent(currentSponsor)}
          {sponsors.length > 1 && (
            <div className="flex justify-center gap-2 mt-3">
              {sponsors.map((_, index) => (
                <button
                  key={index}
                  className={cn(
                    "h-1.5 w-1.5 rounded-full transition-all",
                    index === currentIndex ? "bg-green-500 w-4" : "bg-muted-foreground/30 hover:bg-muted-foreground/50",
                  )}
                  onClick={() => setCurrentIndex(index)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // Desktop version - replaces top contributors box
  return (
    <Card
      className={cn(
        "shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-800 animate-fade-in",
        className,
      )}
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center dark:text-green-300 text-sm text-orange-500 font-normal">
          <Megaphone className="h-5 w-5 mr-2" />
          Sponsored
        </CardTitle>
      </CardHeader>
      <CardContent>
        {renderSponsorContent(currentSponsor)}

        {/* Additional sponsors stacked below */}
        {sponsors.length > 1 && (
          <div className="space-y-3 mt-4">
            {sponsors.slice(1).map((sponsor) => (
              <div key={sponsor.id} className="border-t border-green-200 dark:border-green-800 pt-3">
                {renderSponsorContent(sponsor)}
              </div>
            ))}
          </div>
        )}

        {sponsors.length > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            {sponsors.map((_, index) => (
              <button
                key={index}
                className={cn(
                  "h-2 w-2 rounded-full transition-all",
                  index === currentIndex ? "bg-green-500 w-6" : "bg-green-300 hover:bg-green-400",
                )}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

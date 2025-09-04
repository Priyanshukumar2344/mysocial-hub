"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, Play, Pause } from "lucide-react"
import { getSponsorsBySection } from "@/lib/sponsors"
import { db } from "@/lib/db"
import type { Sponsor } from "@/lib/sponsors"

interface SponsorSectionProps {
  section: "home" | "marketplace" | "library"
  className?: string
}

export default function SponsorSection({ section, className = "" }: SponsorSectionProps) {
  const [sponsors, setSponsors] = useState<Sponsor[]>([])
  const [playingVideo, setPlayingVideo] = useState<string | null>(null)

  useEffect(() => {
    const loadSponsors = () => {
      const allSponsors = db.get("sponsors") || []
      const sectionSponsors = getSponsorsBySection(allSponsors, section)
      setSponsors(sectionSponsors)
    }

    // Initial load
    loadSponsors()

    const interval = setInterval(loadSponsors, 1000)

    return () => clearInterval(interval)
  }, [section])

  const handleSponsorClick = (sponsor: Sponsor) => {
    if (sponsor.linkUrl) {
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

  useEffect(() => {
    if (sponsors.length > 0) {
      const allSponsors = db.get("sponsors") || []
      const updatedSponsors = allSponsors.map((s: Sponsor) => {
        const isViewed = sponsors.some((viewedSponsor) => viewedSponsor.id === s.id)
        return isViewed ? { ...s, impressions: s.impressions + 1 } : s
      })
      db.set("sponsors", updatedSponsors)
    }
  }, [sponsors])

  if (sponsors.length === 0) {
    return null
  }

  const renderSponsorContent = (sponsor: Sponsor) => {
    switch (sponsor.type) {
      case "image":
        return (
          <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg cursor-pointer group" 
          onClick={() => handleSponsorClick(sponsor)}>
            <img
              src={sponsor.imageUrl || "/placeholder.svg"}
              alt={sponsor.title}
              className="w-full h-full object-cover rounded-lg transition-transform group-hover:scale-105"
            />
            {sponsor.linkUrl && (
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center">
                <ExternalLink className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            )}
          </div>
        )

      case "video":
        return (
          <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg cursor-pointer group">
            <video
              src={sponsor.videoUrl}
              className="w-full h-full object-cover rounded-lg"
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
              className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white"
              onClick={() => toggleVideo(sponsor.id)}
            >
              {playingVideo === sponsor.id ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            {sponsor.linkUrl && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute bottom-2 right-2 bg-black/50 hover:bg-black/70 text-white"
                onClick={() => handleSponsorClick(sponsor)}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
          </div>
        )

      case "poster":
        return (
          <div
            className="relative bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg cursor-pointer group"
            onClick={() => handleSponsorClick(sponsor)}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">{sponsor.title}</h3>
                <p className="text-sm opacity-90">{sponsor.description}</p>
              </div>
              {sponsor.linkUrl && (
                <ExternalLink className="h-6 w-6 opacity-70 group-hover:opacity-100 transition-opacity" />
              )}
            </div>
          </div>
        )

      case "link":
        return (
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleSponsorClick(sponsor)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-sm mb-1">{sponsor.title}</h3>
                  {sponsor.description && <p className="text-xs text-muted-foreground">{sponsor.description}</p>}
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        )

      default:
        return null
    }
  }

  const renderAdditionalContent = (sponsor: Sponsor) => {
    const hasAdditionalContent = sponsor.imageUrl || sponsor.videoUrl || sponsor.linkUrl

    if (!hasAdditionalContent) return null

    return (
      <div className="space-y-3 mt-4">
        {/* Additional Image */}
        {sponsor.imageUrl && sponsor.type !== "image" && (
          <div className="relative group cursor-pointer" onClick={() => handleSponsorClick(sponsor)}>
            <img
              src={sponsor.imageUrl || "/placeholder.svg"}
              alt={`${sponsor.title} - Additional Image`}
              className="w-full h-34 object-cover rounded-lg transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center">
              <ExternalLink className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        )}

        {/* Additional Video */}
        {sponsor.videoUrl && sponsor.type !== "video" && (
          <div className="relative">
            <video
              src={sponsor.videoUrl}
              className="w-full h-34 object-cover rounded-lg"
              muted
              loop
              playsInline
              ref={(video) => {
                if (video) {
                  if (playingVideo === `${sponsor.id}-additional`) {
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
              className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white"
              onClick={() =>
                setPlayingVideo(playingVideo === `${sponsor.id}-additional` ? null : `${sponsor.id}-additional`)
              }
            >
              {playingVideo === `${sponsor.id}-additional` ? (
                <Pause className="h-3 w-3" />
              ) : (
                <Play className="h-3 w-3" />
              )}
            </Button>
          </div>
        )}

        {/* Additional Link */}
        {sponsor.linkUrl && sponsor.linkText && (
          <Button
            variant="outline"
            size="sm"
            className="w-full bg-transparent"
            onClick={() => handleSponsorClick(sponsor)}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            {sponsor.linkText}
          </Button>
        )}
      </div>
    )
  }

  const getSectionLayout = () => {
    switch (section) {
      case "home":
        return (
          <div className={`mb-6 ${className}`}>
            <Card>
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold mb-4 text-center">Sponsored</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sponsors.map((sponsor) => (
                    <div key={sponsor.id} className="h-32">
                      {renderSponsorContent(sponsor)}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case "marketplace":
        return (
          <div className={`mb-6 ${className}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sponsors.map((sponsor) => (
                <Card key={sponsor.id} className="overflow-hidden">
                  {/* Main sponsor content with preserved gradient box layout */}
                  <div className="h-35">{renderSponsorContent(sponsor)}</div>

                  <CardContent className="p-4">
                    {/* Sponsor label and title */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs bg-muted px-2 py-1 rounded text-orange-500 font-normal">Sponsored</span>
                    </div>

                    {/* Additional content below the main content */}
                    {renderAdditionalContent(sponsor)}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )

      case "library":
        return (
          <div className={`mb-6 ${className}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {sponsors.map((sponsor) => (
                <Card key={sponsor.id} className="overflow-hidden">
                  <div className="h-40">{renderSponsorContent(sponsor)}</div>
                  <CardContent className="p-3">
                    <div className="text-center">
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">Sponsored</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return getSectionLayout()
}

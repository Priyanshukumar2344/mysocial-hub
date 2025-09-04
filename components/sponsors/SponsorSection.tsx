"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SponsorCard } from "./SponsorCard"
import {
  type Sponsor,
  type SponsorSection as SponsorSectionType,
  getSponsorsBySection,
  defaultSponsorSettings,
} from "@/lib/sponsors"
import { db } from "@/lib/db"
import { Megaphone } from "lucide-react"
import { cn } from "@/lib/utils"

interface SponsorSectionProps {
  section: SponsorSectionType
  title?: string
  maxSponsors?: number
  variant?: "compact" | "full" | "stacked"
  size?: "default" | "large"
  className?: string
}

export function SponsorSection({
  section,
  title = "Sponsored",
  maxSponsors,
  variant = "full",
  size = "default",
  className,
}: SponsorSectionProps) {
  const [sponsors, setSponsors] = useState<Sponsor[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    // Load sponsors from database
    const allSponsors = db.get("sponsors") || []
    const sectionSponsors = getSponsorsBySection(allSponsors, section)
    const limit = maxSponsors || defaultSponsorSettings.maxSponsorsPerSection[section]

    setSponsors(sectionSponsors.slice(0, limit))
  }, [section, maxSponsors])

  useEffect(() => {
    // Auto-rotate sponsors if enabled and multiple sponsors exist
    if (sponsors.length > 1 && defaultSponsorSettings.autoRotate) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % sponsors.length)
      }, defaultSponsorSettings.rotationInterval * 1000)

      return () => clearInterval(interval)
    }
  }, [sponsors.length])

  const handleSponsorImpression = (sponsorId: string) => {
    // Update impression count in database
    const allSponsors = db.get("sponsors") || []
    const updatedSponsors = allSponsors.map((sponsor: Sponsor) =>
      sponsor.id === sponsorId ? { ...sponsor, impressions: sponsor.impressions + 1 } : sponsor,
    )
    db.set("sponsors", updatedSponsors)
  }

  const handleSponsorClick = (sponsorId: string) => {
    // Update click count in database
    const allSponsors = db.get("sponsors") || []
    const updatedSponsors = allSponsors.map((sponsor: Sponsor) =>
      sponsor.id === sponsorId ? { ...sponsor, clickCount: sponsor.clickCount + 1 } : sponsor,
    )
    db.set("sponsors", updatedSponsors)
  }

  if (sponsors.length === 0) {
    return null
  }

  if (variant === "compact") {
    // Compact version for inline display
    return (
      <div className={cn("space-y-3", className)}>
        {sponsors.map((sponsor) => (
          <SponsorCard
            key={sponsor.id}
            sponsor={sponsor}
            variant={section}
            size={size}
            onImpression={handleSponsorImpression}
            onClick={handleSponsorClick}
          />
        ))}
      </div>
    )
  }

  if (variant === "stacked") {
    const posterSponsors = sponsors.filter((sponsor) => sponsor.type === "poster")
    const imageVideoSponsors = sponsors.filter((sponsor) => sponsor.type === "image" || sponsor.type === "video")
    const otherSponsors = sponsors.filter(
      (sponsor) => sponsor.type !== "poster" && sponsor.type !== "image" && sponsor.type !== "video",
    )

    return (
      <div className={cn("w-full space-y-6", className)}>
        {sponsors.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <p>No sponsors available</p>
          </div>
        ) : (
          <div className="w-full space-y-6">
            {/* Poster banners - one per row with full width */}
            {posterSponsors.map((sponsor) => (
              <div key={sponsor.id} className="w-full">
                <SponsorCard
                  sponsor={sponsor}
                  variant={section}
                  size={size}
                  onImpression={handleSponsorImpression}
                  onClick={handleSponsorClick}
                  className="w-full"
                />
              </div>
            ))}

            {imageVideoSponsors.length > 0 && (
              <div className="w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                  {imageVideoSponsors.map((sponsor) => (
                    <SponsorCard
                      key={sponsor.id}
                      sponsor={sponsor}
                      variant={section}
                      size={size}
                      onImpression={handleSponsorImpression}
                      onClick={handleSponsorClick}
                      className="w-full"
                    />
                  ))}
                </div>
              </div>
            )}

            {otherSponsors.length > 0 && (
              <div className="w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                  {otherSponsors.map((sponsor) => (
                    <SponsorCard
                      key={sponsor.id}
                      sponsor={sponsor}
                      variant={section}
                      size={size}
                      onImpression={handleSponsorImpression}
                      onClick={handleSponsorClick}
                      className="w-full"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  // Full card version
  return (
    <Card className={cn("bg-white/80 backdrop-blur-sm border-0 shadow-xl text-orange-500 mx-0 leading-3", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Megaphone className="h-5 w-5 text-orange-500" />
          {title}
          <Badge variant="outline" className="ml-auto text-xs">
            {sponsors.length} active
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {sponsors.length === 1 ? (
          <SponsorCard
            sponsor={sponsors[0]}
            variant={section}
            size={size}
            onImpression={handleSponsorImpression}
            onClick={handleSponsorClick}
          />
        ) : (
          <>
            <SponsorCard
              sponsor={sponsors[currentIndex]}
              variant={section}
              size={size}
              onImpression={handleSponsorImpression}
              onClick={handleSponsorClick}
            />
            {sponsors.length > 1 && (
              <div className="flex justify-center gap-2 mt-3">
                {sponsors.map((_, index) => (
                  <button
                    key={index}
                    className={cn(
                      "h-2 w-2 rounded-full transition-all",
                      index === currentIndex ? "bg-primary w-6" : "bg-muted-foreground/30 hover:bg-muted-foreground/50",
                    )}
                    onClick={() => setCurrentIndex(index)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

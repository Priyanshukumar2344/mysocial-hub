"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Play, Eye, MousePointer } from "lucide-react"
import { type Sponsor, incrementSponsorClicks, incrementSponsorImpressions } from "@/lib/sponsors"
import { cn } from "@/lib/utils"

interface SponsorCardProps {
  sponsor: Sponsor
  variant?: "home" | "marketplace" | "library"
  size?: "default" | "large"
  className?: string
  onImpression?: (sponsorId: string) => void
  onClick?: (sponsorId: string) => void
}

export function SponsorCard({
  sponsor,
  variant = "home",
  size = "default",
  className,
  onImpression,
  onClick,
}: SponsorCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const handleClick = () => {
    onClick?.(sponsor.id)
    incrementSponsorClicks(sponsor.id)

    if (sponsor.linkUrl) {
      window.open(sponsor.linkUrl, "_blank", "noopener,noreferrer")
    }
  }

  const handleImpression = () => {
    onImpression?.(sponsor.id)
    incrementSponsorImpressions(sponsor.id)
  }

  // Different styles based on section
  const getVariantStyles = () => {
    switch (variant) {
      case "home":
        return "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800"
      case "marketplace":
        return "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-800"
      case "library":
        return "bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30 border-purple-200 dark:border-purple-800"
      default:
        return "bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-950/30 dark:to-slate-950/30"
    }
  }

  const getSizeStyles = () => {
    if (size === "large") {
      if (sponsor.type === "poster") {
        return {
          card: "min-h-[280px]",
          image: "h-64",
          video: "h-64",
          poster: "h-64",
          text: "text-base",
          title: "text-xl",
          description: "text-base",
          padding: "p-2", // padding 2 from featured sponsor box
        }
      }
      if (sponsor.type === "image" || sponsor.type === "video") {
        return {
          card: "min-h-[200px]",
          image: "h-48",
          video: "h-48",
          poster: "h-48",
          text: "text-base",
          title: "text-lg",
          description: "text-sm",
          padding: "p-4",
        }
      }
      return {
        card: "min-h-[180px]",
        image: "h-40",
        video: "h-40",
        poster: "h-40",
        text: "text-base",
        title: "text-lg",
        description: "text-sm",
        padding: "p-6",
      }
    }
    if (sponsor.type === "image" || sponsor.type === "video") {
      return {
        card: "min-h-[160px]",
        image: "h-36",
        video: "h-36",
        poster: "h-36",
        text: "text-sm",
        title: "text-base",
        description: "text-xs",
        padding: "p-3",
      }
    }
    return {
      card: "min-h-[120px]",
      image: "h-32",
      video: "h-32",
      poster: "h-32",
      text: "text-sm",
      title: "text-base",
      description: "text-xs",
      padding: "p-4",
    }
  }

  const sizeStyles = getSizeStyles()

  const renderContent = () => {
    switch (sponsor.type) {
      case "image":
      case "poster":
        return (
          <div className="relative overflow-hidden rounded-lg">
            {sponsor.imageUrl && (
              <img
                src={sponsor.imageUrl || "/placeholder.svg"}
                alt={sponsor.title}
                className={cn(
                  "w-full object-cover transition-all duration-300",
                  sponsor.type === "poster" ? sizeStyles.poster : sizeStyles.image,
                  isHovered ? "scale-105" : "scale-100",
                  !imageLoaded && "animate-pulse bg-muted",
                )}
                onLoad={() => setImageLoaded(true)}
                onError={handleImpression}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div
              className={cn(
                sponsor.type === "poster" ? "absolute bottom-2 left-2 right-2" : "absolute bottom-2 left-2 right-2",
                sizeStyles.padding,
              )}
            >
              <h3 className={cn("font-semibold text-white mb-1", sizeStyles.title)}>{sponsor.title}</h3>
              {sponsor.description && (
                <p className={cn("text-white/90 line-clamp-2", sizeStyles.description)}>{sponsor.description}</p>
              )}
            </div>
          </div>
        )

      case "video":
        return (
          <div className={cn("relative overflow-hidden rounded-lg bg-black", sizeStyles.video)}>
            {sponsor.videoUrl ? (
              <video src={sponsor.videoUrl} className="w-full h-full object-cover" muted loop autoPlay playsInline />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Play className={cn("text-white", size === "large" ? "h-12 w-12" : "h-8 w-8")} />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className={cn("absolute bottom-2 left-2 right-2", sizeStyles.padding)}>
              <h3 className={cn("font-semibold text-white mb-1", sizeStyles.title)}>{sponsor.title}</h3>
              {sponsor.description && (
                <p className={cn("text-white/90 line-clamp-2", sizeStyles.description)}>{sponsor.description}</p>
              )}
            </div>
          </div>
        )

      case "link":
        return (
          <div className={cn("text-center", sizeStyles.padding)}>
            <h3 className={cn("font-semibold mb-2", sizeStyles.title)}>{sponsor.title}</h3>
            {sponsor.description && (
              <p className={cn("text-muted-foreground mb-3 line-clamp-3", sizeStyles.description)}>
                {sponsor.description}
              </p>
            )}
            <Button size={size === "large" ? "default" : "sm"} className="w-full">
              <ExternalLink className={cn("mr-2", size === "large" ? "h-5 w-5" : "h-4 w-4")} />
              {sponsor.linkText || "Learn More"}
            </Button>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-300 hover:shadow-lg",
        getVariantStyles(),
        sizeStyles.card,
        isHovered && "transform -translate-y-1",
        className,
      )}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-0 w-full h-full">
        {renderContent()}

        <div className="absolute top-2 right-2">
          <Badge
            variant="secondary"
            className={cn("bg-white/90 text-gray-700", size === "large" ? "text-sm" : "text-xs")}
          >
            Sponsored
          </Badge>
        </div>

        {/* Stats overlay for admin (optional) */}
        {process.env.NODE_ENV === "development" && (
          <div className="absolute top-2 left-2 flex gap-1">
            <Badge variant="outline" className={cn("bg-white/90", size === "large" ? "text-sm" : "text-xs")}>
              <Eye className={cn("mr-1", size === "large" ? "h-4 w-4" : "h-3 w-3")} />
              {sponsor.impressions}
            </Badge>
            <Badge variant="outline" className={cn("bg-white/90", size === "large" ? "text-sm" : "text-xs")}>
              <MousePointer className={cn("mr-1", size === "large" ? "h-4 w-4" : "h-3 w-3")} />
              {sponsor.clickCount}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

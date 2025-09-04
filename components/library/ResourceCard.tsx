"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Star, Share2, BookmarkPlus, Eye, ChevronLeft, ChevronRight } from "lucide-react"
import { VerificationBadge } from "@/components/VerificationBadge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useAuth } from "@/contexts/AuthContext"
import type { Resource } from "@/lib/types"
import { Rating } from "@/components/Rating"

interface ResourceCardProps {
  resource: Resource
  onRead: (resource: Resource) => void
  onRate: (resource: Resource, rating: number) => void
  onShare: (resourceId: string) => void
  onBookmark: (resource: Resource) => void
  currentImageIndex: number
  navigateImage: (direction: "next" | "prev") => void
  hasUserPurchased: boolean
}

export function ResourceCard({
  resource,
  onRead,
  onRate,
  onShare,
  onBookmark,
  currentImageIndex,
  navigateImage,
  hasUserPurchased,
}: ResourceCardProps) {
  const [showPdfViewer, setShowPdfViewer] = useState(false)
  const { user } = useAuth()

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={resource.uploadedBy.avatar || "/placeholder.svg?height=40&width=40"} />
              <AvatarFallback>{resource.uploadedBy.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{resource.title}</h3>
              <div className="flex items-center gap-1">
                <span className="text-sm text-muted-foreground">{resource.uploadedBy.name}</span>
                <VerificationBadge type={resource.uploadedBy.verification} className="h-3 w-3" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => onRate(resource, 5)}>
                    <Star className={`h-4 w-4 ${resource.rating > 0 ? "fill-yellow-500 text-yellow-500" : ""}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Rate this resource</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Resource Image */}
        <div className="relative aspect-video w-full overflow-hidden rounded-md bg-muted">
          <img
            src={resource.images[currentImageIndex] || resource.thumbnailUrl || "/placeholder.svg?height=200&width=300"}
            alt={resource.title}
            className="h-full w-full object-cover"
          />
          {resource.images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-1 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90"
                onClick={() => navigateImage("prev")}
                aria-label="Previous image"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90"
                onClick={() => navigateImage("next")}
                aria-label="Next image"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
          {resource.isPremium && (
            <Badge className="absolute right-2 top-2" variant="secondary">
              Premium
            </Badge>
          )}
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2">{resource.description}</p>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{resource.type}</Badge>
          <Badge variant="outline">{resource.subject}</Badge>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <span>{resource.downloads}</span>
          </div>
          <div className="flex items-center gap-1">
            <Rating resource={resource} onRate={onRate} />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <Button variant="outline" onClick={() => onRead(resource)}>
          Read
        </Button>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => onShare(resource.id)}>
                  <Share2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Share</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => onBookmark(resource)}>
                  <BookmarkPlus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Bookmark</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardFooter>
    </Card>
  )
}

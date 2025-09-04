"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Users } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { useState } from "react"
import { db } from "@/lib/db"
import { toast } from "@/components/ui/use-toast"
import type { Page } from "@/lib/types"

interface PageCardProps {
  page: Page
  showFollow?: boolean
}

export function PageCard({ page, showFollow = true }: PageCardProps) {
  const { user } = useAuth()
  const [isFollowing, setIsFollowing] = useState(user ? page.followers.includes(user.id) : false)
  const [followerCount, setFollowerCount] = useState(page.followers.length)

  const handleFollow = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to follow this page",
        variant: "destructive",
      })
      return
    }

    try {
      const pages = db.get("pages") || []
      const updatedPages = pages.map((p: Page) => {
        if (p.id === page.id) {
          const followers = isFollowing ? p.followers.filter((id) => id !== user.id) : [...p.followers, user.id]

          return {
            ...p,
            followers,
          }
        }
        return p
      })

      db.set("pages", updatedPages)

      setIsFollowing(!isFollowing)
      setFollowerCount(isFollowing ? followerCount - 1 : followerCount + 1)

      toast({
        title: isFollowing ? "Unfollowed" : "Following",
        description: isFollowing ? `You have unfollowed ${page.name}` : `You are now following ${page.name}`,
      })
    } catch (error) {
      console.error("Error following page:", error)
      toast({
        title: "Error",
        description: "Failed to follow page. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start gap-4 space-y-0">
        <Avatar className="h-12 w-12">
          <AvatarImage src={page.profilePhoto || "/placeholder.svg"} />
          <AvatarFallback>{page.name[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Link href={`/pages/${page.handle}`} className="font-semibold hover:underline">
              {page.name}
            </Link>
            {page.verified && <CheckCircle2 className="h-4 w-4 text-blue-500" />}
          </div>
          <p className="text-sm text-muted-foreground">@{page.handle}</p>
          <Badge variant="secondary" className="mt-1">
            {page.category}
          </Badge>
        </div>
        {showFollow && (
          <Button variant={isFollowing ? "default" : "outline"} size="sm" onClick={handleFollow}>
            <Users className="h-4 w-4 mr-2" />
            {isFollowing ? "Following" : "Follow"}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <p className="text-sm line-clamp-2">{page.description}</p>
        <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
          <div>
            <span className="font-semibold text-foreground">{followerCount}</span> followers
          </div>
          <div>
            <span className="font-semibold text-foreground">{page.likes.length}</span> likes
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

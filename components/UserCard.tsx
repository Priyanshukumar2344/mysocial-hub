"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { BadgeCheck, Heart, Users, MessageCircle, UserCheck, Crown } from "lucide-react"
import { FollowButton } from "@/components/FollowButton"
import Link from "next/link"
import type { UserData } from "@/lib/db"
import { useAuth } from "@/contexts/AuthContext"
import { useState, useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"

interface UserCardProps {
  user: UserData
  showFollow?: boolean
  onFollowStatusChange?: () => void
  className?: string
  variant?: "default" | "compact" | "detailed"
}

export function UserCard({
  user,
  showFollow = true,
  onFollowStatusChange,
  className = "",
  variant = "default",
}: UserCardProps) {
  const { user: currentUser } = useAuth()
  const [isFollowing, setIsFollowing] = useState(false)
  const [isFollower, setIsFollower] = useState(false)
  const [isMutualFollow, setIsMutualFollow] = useState(false)
  const [followerCount, setFollowerCount] = useState(user.followers?.length || 0)
  const [followingCount, setFollowingCount] = useState(user.following?.length || 0)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (currentUser) {
      const following = currentUser.following?.includes(user.id) || false
      const follower = user.following?.includes(currentUser.id) || false

      setIsFollowing(following)
      setIsFollower(follower)
      setIsMutualFollow(following && follower)
      setFollowerCount(user.followers?.length || 0)
      setFollowingCount(user.following?.length || 0)
      setIsLoaded(true)
    }
  }, [currentUser, user.id, user.followers?.length, user.following])

  // Listen for follow status changes
  useEffect(() => {
    const handleFollowStatusChange = (event: CustomEvent) => {
      const { targetUserId, isFollowing: newIsFollowing, followerCount: newFollowerCount } = event.detail

      if (targetUserId === user.id) {
        setIsFollowing(newIsFollowing)
        setFollowerCount(newFollowerCount)

        // Check if it's now a mutual follow
        if (newIsFollowing && isFollower) {
          setIsMutualFollow(true)
        } else {
          setIsMutualFollow(false)
        }

        onFollowStatusChange?.()
      }
    }

    window.addEventListener("followStatusChanged", handleFollowStatusChange as EventListener)
    return () => {
      window.removeEventListener("followStatusChanged", handleFollowStatusChange as EventListener)
    }
  }, [user.id, isFollower, onFollowStatusChange])

  const handleFollowChange = (newIsFollowing: boolean, newFollowerCount: number) => {
    setIsFollowing(newIsFollowing)
    setFollowerCount(newFollowerCount)
    setIsMutualFollow(newIsFollowing && isFollower)
    onFollowStatusChange?.()
  }

  if (!isLoaded) {
    return <UserCardSkeleton variant={variant} />
  }

  if (variant === "compact") {
    return (
      <div className={`flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors ${className}`}>
        <Avatar className="h-10 w-10">
          <AvatarImage src={user.avatar || "/placeholder.svg"} alt={`${user.name}'s profile picture`} />
          <AvatarFallback>{user.name[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Link href={`/profile/${user.id}`} className="font-medium hover:underline truncate">
              {user.name}
            </Link>
            {user.isVerified && <BadgeCheck className="h-4 w-4 text-blue-500 flex-shrink-0" />}
            {user.role === "admin" && <Crown className="h-4 w-4 text-amber-500 flex-shrink-0" />}
            {isMutualFollow && <UserCheck className="h-4 w-4 text-green-500 flex-shrink-0" title="Friends" />}
          </div>
          <p className="text-sm text-muted-foreground truncate">
            {user.role === "teacher" ? user.designation : `${user.year} • ${user.branch}`}
          </p>
        </div>
        {showFollow && currentUser && currentUser.id !== user.id && (
          <FollowButton targetUser={user} onFollowChange={handleFollowChange} variant="compact" />
        )}
      </div>
    )
  }

  if (variant === "detailed") {
    return (
      <Card className={`hover:shadow-lg transition-all duration-300 ${className}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start gap-4">
            <div className="relative">
              <Avatar className="h-16 w-16 border-2 border-muted">
                <AvatarImage src={user.avatar || "/placeholder.svg"} alt={`${user.name}'s profile picture`} />
                <AvatarFallback className="text-lg font-bold">{user.name[0]}</AvatarFallback>
              </Avatar>
              {isMutualFollow && (
                <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                  <UserCheck className="h-3 w-3 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Link href={`/profile/${user.id}`} className="font-semibold text-lg hover:underline truncate">
                  {user.name}
                </Link>
                {user.isVerified && <BadgeCheck className="h-5 w-5 text-blue-500 flex-shrink-0" />}
                {user.role === "admin" && <Crown className="h-5 w-5 text-amber-500 flex-shrink-0" />}
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                {user.role === "teacher" ? user.designation : `${user.year} • ${user.branch}`}
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span className="font-medium text-foreground">{followerCount}</span>
                  <span>followers</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  <span className="font-medium text-foreground">{user.totalLikes || 0}</span>
                  <span>likes</span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{user.bio || "No bio available"}</p>

          {user.role === "teacher" && user.department && (
            <Badge variant="secondary" className="mb-4">
              {user.department}
            </Badge>
          )}

          {showFollow && currentUser && currentUser.id !== user.id && (
            <div className="flex gap-2">
              <FollowButton
                targetUser={user}
                onFollowChange={handleFollowChange}
                variant="default"
                showNotificationToggle={isFollowing}
              />
              <Button variant="outline" size="default" asChild>
                <Link href={`/profile/${user.id}`}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Message
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // Default variant
  return (
    <Card className={`hover:shadow-md transition-all duration-200 ${className}`}>
      <CardHeader className="flex flex-row items-start gap-4 space-y-0">
        <div className="relative">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.avatar || "/placeholder.svg"} alt={`${user.name}'s profile picture`} />
            <AvatarFallback>{user.name[0]}</AvatarFallback>
          </Avatar>
          {isMutualFollow && (
            <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-0.5">
              <UserCheck className="h-3 w-3 text-white" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Link
              href={`/profile/${user.id}`}
              className="font-semibold hover:underline truncate"
              aria-label={`View ${user.name}'s profile`}
            >
              {user.name}
            </Link>
            {user.isVerified && <BadgeCheck className="h-4 w-4 text-blue-500 flex-shrink-0" />}
            {user.role === "admin" && <Crown className="h-4 w-4 text-amber-500 flex-shrink-0" />}
          </div>
          <p className="text-sm text-muted-foreground">
            {user.role === "teacher" ? user.designation : `${user.year} • ${user.branch}`}
          </p>
          {user.role === "teacher" && user.department && (
            <Badge variant="secondary" className="mt-1 text-xs">
              {user.department}
            </Badge>
          )}
          {isMutualFollow && (
            <div className="flex items-center gap-1 mt-1">
              <UserCheck className="h-3 w-3 text-green-500" />
              <span className="text-xs text-green-600 font-medium">Friends</span>
            </div>
          )}
        </div>
        {showFollow && currentUser && currentUser.id !== user.id && (
          <FollowButton targetUser={user} onFollowChange={handleFollowChange} variant="compact" />
        )}
      </CardHeader>
      <CardContent>
        <p className="text-sm mb-3 line-clamp-2">{user.bio || "No bio available"}</p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span className="font-semibold text-foreground">{followerCount}</span>
            <span>followers</span>
          </div>
          <div className="flex items-center gap-1">
            <Heart className="h-4 w-4" />
            <span className="font-semibold text-foreground">{user.totalLikes || 0}</span>
            <span>likes</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function UserCardSkeleton({ variant = "default" }: { variant?: "default" | "compact" | "detailed" }) {
  if (variant === "compact") {
    return (
      <div className="flex items-center gap-3 p-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-4 w-32 mb-1" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-8 w-20" />
      </div>
    )
  }

  if (variant === "detailed") {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-start gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-6 w-40 mb-2" />
              <Skeleton className="h-4 w-32 mb-2" />
              <div className="flex gap-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4 mb-4" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start gap-4 space-y-0">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-5 w-32 mb-2" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-9 w-20" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4 mb-4" />
        <div className="flex gap-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
        </div>
      </CardContent>
    </Card>
  )
}

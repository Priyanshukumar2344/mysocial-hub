"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { UserPlus, UserMinus, Loader2, UserCheck, Bell, BellOff } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { db } from "@/lib/db"
import type { UserData } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { UnfollowConfirmationDialog } from "@/components/UnfollowConfirmationDialog"

interface FollowButtonProps {
  targetUser: UserData
  onFollowChange?: (isFollowing: boolean, newFollowerCount: number) => void
  variant?: "default" | "compact" | "icon"
  showNotificationToggle?: boolean
}

export function FollowButton({
  targetUser,
  onFollowChange,
  variant = "default",
  showNotificationToggle = false,
}: FollowButtonProps) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const [isFollowing, setIsFollowing] = useState(false)
  const [isFollower, setIsFollower] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showUnfollowDialog, setShowUnfollowDialog] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [followerCount, setFollowerCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)
  const { toast } = useToast()

  useEffect(() => {
    if (!user?.id || !targetUser?.id) return

    const users = db.get("users") || []
    const currentUser = users.find((u: UserData) => u.id === user.id)
    const target = users.find((u: UserData) => u.id === targetUser.id)

    if (currentUser && target) {
      // Check if current user is following target
      setIsFollowing(currentUser.following?.includes(targetUser.id) || false)

      // Check if target user is following current user (mutual follow)
      setIsFollower(target.following?.includes(user.id) || false)

      // Set follower and following counts
      setFollowerCount(target.followers?.length || 0)
      setFollowingCount(target.following?.length || 0)

      // Check notification preferences
      const notificationPrefs = db.get(`notificationPrefs_${user.id}`) || {}
      setNotificationsEnabled(notificationPrefs[targetUser.id] !== false)
    }
  }, [user?.id, targetUser?.id])

  // Early return if still loading auth or missing required data
  if (isLoading || !user || !user.id || !targetUser || !targetUser.id) {
    return (
      <Button variant="outline" size={variant === "compact" ? "sm" : "default"} disabled>
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    )
  }

  // Don't show follow button for self
  if (user.id === targetUser.id) {
    return null
  }

  // Don't show if not authenticated
  if (!isAuthenticated) {
    return null
  }

  const handleFollow = async () => {
    if (!user?.id || !targetUser?.id || loading) return

    // Prevent repeated follows
    if (isFollowing) {
      setShowUnfollowDialog(true)
      return
    }

    setLoading(true)
    try {
      const users = db.get("users") || []
      const currentUserIndex = users.findIndex((u: UserData) => u.id === user.id)
      const targetUserIndex = users.findIndex((u: UserData) => u.id === targetUser.id)

      if (currentUserIndex === -1 || targetUserIndex === -1) {
        throw new Error("User not found")
      }

      const currentUserData = users[currentUserIndex]
      const targetUserData = users[targetUserIndex]

      // Initialize arrays if they don't exist
      if (!currentUserData.following) currentUserData.following = []
      if (!targetUserData.followers) targetUserData.followers = []
      if (!currentUserData.connections) currentUserData.connections = []
      if (!targetUserData.connections) targetUserData.connections = []

      // Check if already following to prevent duplicates
      if (currentUserData.following.includes(targetUser.id)) {
        toast({
          title: "Already Following",
          description: `You are already following ${targetUser.name}`,
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      // Add to following/followers lists
      currentUserData.following.push(targetUser.id)
      targetUserData.followers.push(user.id)

      // Add to connections (mutual connection)
      if (!currentUserData.connections.includes(targetUser.id)) {
        currentUserData.connections.push(targetUser.id)
      }
      if (!targetUserData.connections.includes(user.id)) {
        targetUserData.connections.push(user.id)
      }

      // Update users in storage
      users[currentUserIndex] = currentUserData
      users[targetUserIndex] = targetUserData
      db.set("users", users)

      // Create follow notification for target user
      const notifications = db.get("notifications") || []
      const followNotification = {
        id: `follow_${user.id}_${targetUser.id}_${Date.now()}`,
        userId: targetUser.id,
        type: "follow",
        title: "New Follower",
        message: `${user.name} started following you`,
        timestamp: new Date().toISOString(),
        read: false,
        sender: {
          id: user.id,
          name: user.name,
          avatar: user.avatar,
        },
        actionUrl: `/profile/${user.id}`,
        priority: "medium",
        deliveryStatus: "delivered",
      }
      notifications.push(followNotification)
      db.set("notifications", notifications)

      // Create connection notification for target user
      const connectionNotifications = db.get(`connectionNotifications_${targetUser.id}`) || []
      const connectionNotification = {
        id: `connection_${user.id}_${targetUser.id}_${Date.now()}`,
        fromUserId: user.id,
        fromUserName: user.name,
        fromUserAvatar: user.avatar,
        timestamp: new Date().toISOString(),
        type: "follow",
      }
      connectionNotifications.push(connectionNotification)
      db.set(`connectionNotifications_${targetUser.id}`, connectionNotifications)

      // Update local state
      setIsFollowing(true)
      const newFollowerCount = targetUserData.followers.length
      setFollowerCount(newFollowerCount)

      // Trigger follow change callback
      onFollowChange?.(true, newFollowerCount)

      toast({
        title: "Following",
        description: `${isFollower ? "You are now friends!" : "Following successfully!"} You are now following ${targetUser.name}`,
      })

      // Dispatch custom event for real-time updates
      window.dispatchEvent(
        new CustomEvent("followStatusChanged", {
          detail: {
            userId: user.id,
            targetUserId: targetUser.id,
            isFollowing: true,
            followerCount: newFollowerCount,
          },
        }),
      )

      // Update user activity streak
      updateUserActivity(user.id, "social_interaction")
    } catch (error) {
      console.error("Error following user:", error)
      toast({
        title: "Error",
        description: "Failed to follow user. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUnfollow = async () => {
    if (!user?.id || !targetUser?.id || loading) return

    setLoading(true)
    try {
      const users = db.get("users") || []
      const currentUserIndex = users.findIndex((u: UserData) => u.id === user.id)
      const targetUserIndex = users.findIndex((u: UserData) => u.id === targetUser.id)

      if (currentUserIndex === -1 || targetUserIndex === -1) {
        throw new Error("User not found")
      }

      const currentUserData = users[currentUserIndex]
      const targetUserData = users[targetUserIndex]

      // Remove from following/followers lists
      currentUserData.following = currentUserData.following?.filter((id: string) => id !== targetUser.id) || []
      targetUserData.followers = targetUserData.followers?.filter((id: string) => id !== user.id) || []

      // Remove from connections if not mutual followers
      if (!targetUserData.following?.includes(user.id)) {
        currentUserData.connections = currentUserData.connections?.filter((id: string) => id !== targetUser.id) || []
        targetUserData.connections = targetUserData.connections?.filter((id: string) => id !== user.id) || []
      }

      // Update users in storage
      users[currentUserIndex] = currentUserData
      users[targetUserIndex] = targetUserData
      db.set("users", users)

      // Update local state
      setIsFollowing(false)
      const newFollowerCount = targetUserData.followers.length
      setFollowerCount(newFollowerCount)

      // Trigger follow change callback
      onFollowChange?.(false, newFollowerCount)

      toast({
        title: "Unfollowed",
        description: `You unfollowed ${targetUser.name}`,
      })

      // Dispatch custom event for real-time updates
      window.dispatchEvent(
        new CustomEvent("followStatusChanged", {
          detail: {
            userId: user.id,
            targetUserId: targetUser.id,
            isFollowing: false,
            followerCount: newFollowerCount,
          },
        }),
      )
    } catch (error) {
      console.error("Error unfollowing user:", error)
      toast({
        title: "Error",
        description: "Failed to unfollow user. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setShowUnfollowDialog(false)
    }
  }

  const updateUserActivity = (userId: string, activityType: string) => {
    const users = db.get("users") || []
    const userIndex = users.findIndex((u: UserData) => u.id === userId)

    if (userIndex === -1) return

    const user = users[userIndex]
    const now = new Date()
    const today = now.toISOString().split("T")[0]

    // Initialize streak if it doesn't exist
    if (!user.streak) {
      user.streak = {
        currentStreak: 1,
        longestStreak: 1,
        lastActive: today,
        photoUploads: 0,
        resourceContributions: 0,
        activeTimeMinutes: 0,
        totalBadges: user.badges?.length || 0,
      }
    }

    // Update last active if different day
    if (user.streak.lastActive !== today) {
      const yesterday = new Date(now)
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split("T")[0]

      if (user.streak.lastActive === yesterdayStr) {
        user.streak.currentStreak += 1
        if (user.streak.currentStreak > user.streak.longestStreak) {
          user.streak.longestStreak = user.streak.currentStreak
        }
      } else {
        user.streak.currentStreak = 1
      }

      user.streak.lastActive = today
    }

    // Update activity time
    user.streak.activeTimeMinutes += 5

    // Update user in database
    users[userIndex] = user
    db.set("users", users)
  }

  const toggleNotifications = () => {
    const notificationPrefs = db.get(`notificationPrefs_${user.id}`) || {}
    notificationPrefs[targetUser.id] = !notificationsEnabled
    db.set(`notificationPrefs_${user.id}`, notificationPrefs)
    setNotificationsEnabled(!notificationsEnabled)

    toast({
      title: notificationsEnabled ? "Notifications Disabled" : "Notifications Enabled",
      description: `You will ${notificationsEnabled ? "no longer" : "now"} receive notifications from ${targetUser.name}`,
    })
  }

  // Render different variants
  if (variant === "icon") {
    return (
      <>
        <Button
          variant={isFollowing ? "outline" : "default"}
          size="sm"
          onClick={handleFollow}
          disabled={loading}
          className="w-10 h-10 p-0"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isFollowing ? (
            <UserCheck className="h-4 w-4" />
          ) : (
            <UserPlus className="h-4 w-4" />
          )}
        </Button>
        <UnfollowConfirmationDialog
          isOpen={showUnfollowDialog}
          onClose={() => setShowUnfollowDialog(false)}
          onConfirm={handleUnfollow}
          userName={targetUser.name}
          isLoading={loading}
        />
      </>
    )
  }

  if (variant === "compact") {
    return (
      <>
        <div className="flex items-center gap-2">
          <Button
            variant={isFollowing ? "outline" : "default"}
            size="sm"
            onClick={handleFollow}
            disabled={loading}
            className={isFollowing ? "border-red-200 hover:border-red-300 hover:bg-red-50" : ""}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isFollowing ? (
              <>
                <UserMinus className="h-4 w-4 mr-1" />
                Unfollow
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-1" />
                {isFollower ? "Follow Back" : "Follow"}
              </>
            )}
          </Button>

          {showNotificationToggle && isFollowing && (
            <Button variant="ghost" size="sm" onClick={toggleNotifications} className="w-8 h-8 p-0">
              {notificationsEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
            </Button>
          )}
        </div>

        <UnfollowConfirmationDialog
          isOpen={showUnfollowDialog}
          onClose={() => setShowUnfollowDialog(false)}
          onConfirm={handleUnfollow}
          userName={targetUser.name}
          isLoading={loading}
        />
      </>
    )
  }

  // Default variant
  return (
    <>
      <div className="flex flex-col gap-2">
        <Button
          variant={isFollowing ? "outline" : "default"}
          size="default"
          onClick={handleFollow}
          disabled={loading}
          className={`transition-all duration-200 ${
            isFollowing
              ? "border-red-200 hover:border-red-300 hover:bg-red-50 hover:text-red-600"
              : "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
          }`}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : isFollowing ? (
            <>
              <UserMinus className="h-4 w-4 mr-2" />
              Unfollow
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4 mr-2" />
              {isFollower ? "Follow Back" : "Follow"}
            </>
          )}
        </Button>

        {/* Show relationship status */}
        {isFollowing && isFollower && (
          <div className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
            <UserCheck className="h-3 w-3" />
            Friends
          </div>
        )}

        {/* Show follower count */}
        <div className="text-xs text-center text-muted-foreground">
          {followerCount} {followerCount === 1 ? "follower" : "followers"}
        </div>

        {/* Notification toggle for followed users */}
        {showNotificationToggle && isFollowing && (
          <Button variant="ghost" size="sm" onClick={toggleNotifications} className="text-xs">
            {notificationsEnabled ? (
              <>
                <Bell className="h-3 w-3 mr-1" />
                Notifications On
              </>
            ) : (
              <>
                <BellOff className="h-3 w-3 mr-1" />
                Notifications Off
              </>
            )}
          </Button>
        )}
      </div>

      <UnfollowConfirmationDialog
        isOpen={showUnfollowDialog}
        onClose={() => setShowUnfollowDialog(false)}
        onConfirm={handleUnfollow}
        userName={targetUser.name}
        isLoading={loading}
      />
    </>
  )
}

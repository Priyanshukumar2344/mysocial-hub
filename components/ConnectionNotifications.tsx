"use client"

import { useState, useEffect } from "react"
import { Bell, UserPlus, X, Users, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { db } from "@/lib/db"
import { toast } from "sonner"
import Link from "next/link"

interface ConnectionNotification {
  id: string
  type: "follow" | "follow_back"
  fromUserId: string
  fromUserName?: string
  fromUserAvatar?: string
  timestamp: string
  read: boolean
}

export function ConnectionNotifications() {
  const [notifications, setNotifications] = useState<ConnectionNotification[]>([])
  const [loading, setLoading] = useState(true)

  // Safe function to get user initials
  const getUserInitials = (name: string | undefined) => {
    if (!name || typeof name !== "string") return "?"
    return name
      .split(" ")
      .map((n) => n.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2) // Limit to 2 characters
  }

  // Load notifications from localStorage
  const loadNotifications = () => {
    try {
      const stored = db.get("connectionNotifications") || []
      setNotifications(stored)
    } catch (error) {
      console.error("Error loading notifications:", error)
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }

  // Save notifications to localStorage
  const saveNotifications = (newNotifications: ConnectionNotification[]) => {
    try {
      db.set("connectionNotifications", newNotifications)
      setNotifications(newNotifications)
    } catch (error) {
      console.error("Error saving notifications:", error)
    }
  }

  // Handle follow back action
  const handleFollowBack = async (notification: ConnectionNotification) => {
    try {
      // Get current user data
      const currentUser = db.get("currentUser")
      if (!currentUser) {
        toast.error("Please login to follow users")
        return
      }

      // Get current following list
      const following = db.get("following") || []

      // Check if already following
      if (following.includes(notification.fromUserId)) {
        toast.info(`You're already following ${notification.fromUserName || "this user"}`)
        return
      }

      // Add to following list
      const updatedFollowing = [...following, notification.fromUserId]
      db.set("following", updatedFollowing)

      // Update followers for the other user
      const otherUserFollowers = db.get(`followers_${notification.fromUserId}`) || []
      if (!otherUserFollowers.includes(currentUser.id)) {
        db.set(`followers_${notification.fromUserId}`, [...otherUserFollowers, currentUser.id])
      }

      // Mark notification as read and update type
      const updatedNotifications = notifications.map((n) =>
        n.id === notification.id ? { ...n, read: true, type: "follow_back" as const } : n,
      )
      saveNotifications(updatedNotifications)

      // Create a follow back notification for the other user
      const followBackNotification: ConnectionNotification = {
        id: `follow_back_${Date.now()}`,
        type: "follow_back",
        fromUserId: currentUser.id,
        fromUserName: currentUser.name,
        fromUserAvatar: currentUser.avatar,
        timestamp: new Date().toISOString(),
        read: false,
      }

      // Add to other user's notifications
      const otherUserNotifications = db.get(`connectionNotifications_${notification.fromUserId}`) || []
      db.set(`connectionNotifications_${notification.fromUserId}`, [followBackNotification, ...otherUserNotifications])

      toast.success(`You're now following ${notification.fromUserName || "this user"} back!`)

      // Broadcast follow event
      window.dispatchEvent(
        new CustomEvent("userFollowed", {
          detail: {
            userId: notification.fromUserId,
            userName: notification.fromUserName || "Unknown User",
            isFollowBack: true,
          },
        }),
      )
    } catch (error) {
      console.error("Error following back:", error)
      toast.error("Failed to follow back. Please try again.")
    }
  }

  // Dismiss notification
  const dismissNotification = (notificationId: string) => {
    const updatedNotifications = notifications.filter((n) => n.id !== notificationId)
    saveNotifications(updatedNotifications)
    toast.success("Notification dismissed")
  }

  // Clear all notifications
  const clearAllNotifications = () => {
    saveNotifications([])
    toast.success("All notifications cleared")
  }

  // Mark notification as read
  const markAsRead = (notificationId: string) => {
    const updatedNotifications = notifications.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    saveNotifications(updatedNotifications)
  }

  // Load notifications on component mount
  useEffect(() => {
    loadNotifications()

    // Set up polling for new notifications
    const interval = setInterval(() => {
      loadNotifications()
    }, 5000) // Poll every 5 seconds

    return () => clearInterval(interval)
  }, [])

  // Get unread count
  const unreadCount = notifications.filter((n) => !n.read).length

  if (loading) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Connection Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-blue-500" />
            Connection Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          {notifications.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearAllNotifications}>
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {notifications.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No connection notifications</p>
            <p className="text-sm text-muted-foreground mt-1">You'll see follow notifications here</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg border transition-all ${
                  notification.read ? "bg-white/50 border-gray-200" : "bg-white border-blue-200 shadow-sm"
                }`}
                onClick={() => !notification.read && markAsRead(notification.id)}
              >
                <div className="flex items-start gap-3">
                  <Link href={`/profile/${notification.fromUserId}`}>
                    <Avatar className="h-10 w-10 cursor-pointer hover:scale-105 transition-transform">
                      <AvatarImage src={notification.fromUserAvatar || "/placeholder.svg"} />
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {getUserInitials(notification.fromUserName)}
                      </AvatarFallback>
                    </Avatar>
                  </Link>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {notification.type === "follow" && <UserPlus className="h-4 w-4 text-blue-500 flex-shrink-0" />}
                      {notification.type === "follow_back" && (
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      )}
                      <p className="text-sm font-medium truncate">
                        <Link
                          href={`/profile/${notification.fromUserId}`}
                          className="hover:text-blue-600 transition-colors"
                        >
                          {notification.fromUserName || "Unknown User"}
                        </Link>
                      </p>
                    </div>

                    <p className="text-xs text-muted-foreground mb-2">
                      {notification.type === "follow" && "started following you"}
                      {notification.type === "follow_back" && "followed you back"}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {new Date(notification.timestamp).toLocaleDateString()}
                      </span>

                      <div className="flex gap-2">
                        {notification.type === "follow" && (
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleFollowBack(notification)
                            }}
                            className="h-7 px-3 text-xs bg-blue-600 hover:bg-blue-700"
                          >
                            Follow Back
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            dismissNotification(notification.id)
                          }}
                          className="h-7 w-7 p-0 hover:bg-red-100 hover:text-red-600"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

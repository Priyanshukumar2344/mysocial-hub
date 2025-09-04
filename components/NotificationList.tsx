"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Bell,
  UserPlus,
  MessageSquare,
  Megaphone,
  UserCheck,
  Settings,
  AlertCircle,
  ThumbsUp,
  Share2,
  BookOpen,
  Calendar,
  Tag,
  ArrowUpCircle,
  MinusCircle,
  ArrowDownCircle,
  Pin,
  Search,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import type { Notification, NotificationPriority } from "@/lib/types"
import { getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "@/lib/notifications"

function getTimeAgo(timestamp: string): string {
  const now = new Date()
  const time = new Date(timestamp)
  const diff = Math.floor((now.getTime() - time.getTime()) / 1000)

  if (diff < 60) return "Just now"
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`
  return `${Math.floor(diff / 86400)} day${Math.floor(diff / 86400) > 1 ? "s" : ""} ago`
}

const NotificationIcon = ({ type }: { type: Notification["type"] }) => {
  switch (type) {
    case "follow":
      return <UserPlus className="h-4 w-4 text-blue-500" />
    case "mention":
      return <MessageSquare className="h-4 w-4 text-green-500" />
    case "announcement":
      return <Megaphone className="h-4 w-4 text-purple-500" />
    case "welcome":
      return <Bell className="h-4 w-4 text-yellow-500" />
    case "profile_update":
      return <Settings className="h-4 w-4 text-gray-500" />
    case "admin_message":
      return <AlertCircle className="h-4 w-4 text-red-500" />
    case "verification":
      return <UserCheck className="h-4 w-4 text-teal-500" />
    case "like":
      return <ThumbsUp className="h-4 w-4 text-pink-500" />
    case "share":
      return <Share2 className="h-4 w-4 text-indigo-500" />
    case "page":
      return <BookOpen className="h-4 w-4 text-amber-500" />
    case "event":
      return <Calendar className="h-4 w-4 text-orange-500" />
    case "marketplace":
      return <Tag className="h-4 w-4 text-cyan-500" />
    default:
      return <Bell className="h-4 w-4 text-gray-500" />
  }
}

const PriorityIcon = ({ priority }: { priority: NotificationPriority }) => {
  switch (priority) {
    case "high":
      return <ArrowUpCircle className="h-4 w-4 text-red-500" />
    case "medium":
      return <MinusCircle className="h-4 w-4 text-amber-500" />
    case "low":
      return <ArrowDownCircle className="h-4 w-4 text-green-500" />
    default:
      return null
  }
}

interface NotificationListProps {
  userId: string
  onNotificationClick?: () => void
}

export function NotificationList({ userId, onNotificationClick }: NotificationListProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filter, setFilter] = useState<"all" | "unread" | "high" | "medium" | "low">("all")
  const [search, setSearch] = useState("")
  const router = useRouter()

  useEffect(() => {
    if (!userId) return
    const userNotifications = getUserNotifications(userId)
    setNotifications(userNotifications || [])
  }, [userId])

  const handleNotificationClick = (notification: Notification) => {
    if (!notification || !notification.id) return
    markNotificationAsRead(notification.id)
    setNotifications((prev) => prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n)))
    if (notification.link) router.push(notification.link)
    if (onNotificationClick) onNotificationClick()
  }

  const handleMarkAllAsRead = () => {
    if (!userId) return
    markAllNotificationsAsRead(userId)
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const filteredNotifications = notifications
    .filter((n) => {
      if (filter === "unread") return !n.read
      if (filter === "high" || filter === "medium" || filter === "low") return n.priority === filter
      return true
    })
    .filter((n) => {
      const searchLower = search.toLowerCase()
      return n.title.toLowerCase().includes(searchLower) || n.message.toLowerCase().includes(searchLower)
    })
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1
      if (!a.pinned && b.pinned) return 1
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    })

  return (
    <div className="divide-y">
      <div className="p-2 flex justify-between items-center">
        <div className="flex gap-1">
          <Button
            variant={filter === "all" ? "default" : "ghost"}
            size="sm"
            className="text-xs h-7"
            onClick={() => setFilter("all")}
          >
            All
          </Button>
          <Button
            variant={filter === "unread" ? "default" : "ghost"}
            size="sm"
            className="text-xs h-7"
            onClick={() => setFilter("unread")}
          >
            Unread
          </Button>
          <Button
            variant={filter === "high" ? "default" : "ghost"}
            size="sm"
            className="text-xs h-7"
            onClick={() => setFilter("high")}
          >
            <ArrowUpCircle className="h-3 w-3 mr-1 text-red-500" />
            High
          </Button>
        </div>
        <Button variant="ghost" size="sm" className="text-xs h-7" onClick={handleMarkAllAsRead}>
          Mark all as read
        </Button>
      </div>

      <div className="p-2">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-8 text-xs h-8"
            placeholder="Search notifications..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {filteredNotifications.length === 0 ? (
        <div className="p-4 text-center text-sm text-muted-foreground">
          No {filter !== "all" ? filter : ""} notifications found
        </div>
      ) : (
        filteredNotifications.map((notification) => (
          <div
            key={notification.id}
            onClick={() => handleNotificationClick(notification)}
            className={`p-3 cursor-pointer transition-all border-b border-muted hover:bg-muted/30 ${
              !notification.read ? "bg-muted/20" : ""
            } ${notification.priority === "high" ? "border-l-2 border-red-500" : ""}`}
          >
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 flex items-center justify-center rounded-full bg-muted">
                <NotificationIcon type={notification.type} />
              </div>
              <div className="flex-1 text-sm space-y-0.5">
                <div className="flex items-center gap-1">
                  <p className="font-medium text-sm truncate">{notification.title}</p>
                  {notification.pinned && <Pin className="h-4 w-4 text-yellow-500" />}
                  {notification.priority && <PriorityIcon priority={notification.priority} />}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{notification.message}</p>
                <span className="text-[10px] text-gray-400">{getTimeAgo(notification.timestamp)}</span>
              </div>
              {notification.from && notification.type !== "admin_message" && (
                <Avatar className="h-7 w-7">
                  <AvatarImage src={notification.from.avatar || ""} />
                  <AvatarFallback>{notification.from.name?.[0] || "?"}</AvatarFallback>
                </Avatar>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  )
}

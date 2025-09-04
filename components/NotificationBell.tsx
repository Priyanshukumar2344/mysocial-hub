"use client"

import { useState, useEffect } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useAuth } from "@/contexts/AuthContext"
import { getUserNotifications, markAllAsRead } from "@/lib/notifications"
import { NotificationList } from "@/components/NotificationList"

export function NotificationBell() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [highPriorityCount, setHighPriorityCount] = useState(0)
  const [open, setOpen] = useState(false)

  const loadNotifications = () => {
    if (user) {
      const userNotifications = getUserNotifications(user.id)
      setNotifications(userNotifications)

      const unread = userNotifications.filter((n: { read: any }) => !n.read).length
      setUnreadCount(unread)

      const highPriority = userNotifications.filter((n: { read: any; priority: string }) => !n.read && n.priority === "high").length
      setHighPriorityCount(highPriority)
    }
  }

  useEffect(() => {
    loadNotifications()
  }, [user])

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)

    if (isOpen && user) {
      // Mark all notifications as read
      markAllAsRead(user.id)
      // Update UI accordingly
      setUnreadCount(0)
      setHighPriorityCount(0)
      const updated = notifications.map((n) => ({ ...n, read: true }))
      setNotifications(updated)
    }
  }

  if (!user) return null

  const userId = user.id
  const displayCount = unreadCount > 99 ? "99+" : unreadCount

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label={`${unreadCount} unread notifications`}>
          <Bell className={`h-5 w-5 ${highPriorityCount > 0 ? "text-red-500" : ""}`} />
          {unreadCount > 0 && (
            <span
              className={`absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] text-white ${
                highPriorityCount > 0 ? "bg-red-500 animate-pulse" : "bg-blue-500"
              }`}
            >
              {displayCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 max-h-[80vh] overflow-y-auto" align="end">
        <div className="p-2 border-b">
          <h4 className="font-medium text-sm">Notifications</h4>
        </div>
        <NotificationList userId={userId} onNotificationClick={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  )
}

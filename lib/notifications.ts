import { db } from "@/lib/db"
import type { Notification, NotificationType, NotificationPriority } from "@/lib/types"

// Marks all notifications as read for a specific user
export function markAllAsRead(userId: string) {
  const allNotifications = db.get("notifications") || []

  const updated = allNotifications.map((n: any) => {
    if (n.userId === userId) {
      return { ...n, read: true }
    }
    return n
  })

  db.set("notifications", updated)
}

export const createNotification = (
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  priority: NotificationPriority = "medium",
  from?: { id: string; name: string; avatar?: string },
  link?: string,
  scheduledFor?: string,
  targetGroup?: string,
) => {
  const notification: Notification = {
    id: Date.now().toString(),
    type,
    title,
    message,
    timestamp: new Date().toISOString(),
    read: false,
    userId,
    from,
    link,
    priority,
    scheduledFor,
    targetGroup,
    deliveryStatus: scheduledFor ? "pending" : "delivered",
  }

  const notifications = db.get("notifications") || []
  db.set("notifications", [...notifications, notification])

  return notification
}

export const broadcastNotification = (
  type: NotificationType,
  title: string,
  message: string,
  priority: NotificationPriority = "medium",
  from?: { id: string; name: string; avatar?: string },
  targetGroup?: string,
  scheduledFor?: string,
) => {
  const users = db.get("users") || []
  let targetUsers = users

  // Filter users based on target group if specified
  if (targetGroup) {
    if (targetGroup === "students") {
      targetUsers = users.filter((user: { role: string }) => user.role === "student")
    } else if (targetGroup === "teachers") {
      targetUsers = users.filter((user: { role: string }) => user.role === "teacher")
    } else if (targetGroup === "verified") {
      targetUsers = users.filter((user: { isVerified: any }) => user.isVerified)
    } else if (targetGroup === "new") {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      targetUsers = users.filter((user: { createdAt: string | number | Date }) => new Date(user.createdAt) >= thirtyDaysAgo)
    }
  }

  const notifications = targetUsers.map((user: { id: string }) =>
    createNotification(user.id, type, title, message, priority, from, undefined, scheduledFor, targetGroup),
  )

  return notifications
}

export const updateNotification = (notificationId: string, updates: Partial<Notification>) => {
  const notifications = db.get("notifications") || []
  const updatedNotifications = notifications.map((n: Notification) =>
    n.id === notificationId ? { ...n, ...updates } : n,
  )
  db.set("notifications", updatedNotifications)
  return updatedNotifications.find((n: Notification) => n.id === notificationId)
}

export const deleteNotification = (notificationId: string) => {
  const notifications = db.get("notifications") || []
  const updatedNotifications = notifications.filter((n: Notification) => n.id !== notificationId)
  db.set("notifications", updatedNotifications)
  return true
}

export const markNotificationAsRead = (notificationId: string) => {
  return updateNotification(notificationId, { read: true })
}

export const markAllNotificationsAsRead = (userId: string) => {
  const notifications = db.get("notifications") || []
  const updatedNotifications = notifications.map((n: Notification) => (n.userId === userId ? { ...n, read: true } : n))
  db.set("notifications", updatedNotifications)
  return updatedNotifications
}

export const getUserNotifications = (userId: string) => {
  const notifications = db.get("notifications") || []
  return notifications
    .filter((n: Notification) => n.userId === userId)
    .sort((a: Notification, b: Notification) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

export const getUnreadCount = (userId: string) => {
  const notifications = getUserNotifications(userId)
  return notifications.filter((n: Notification) => !n.read).length
}

export const getAdminNotifications = (
  filters: {
    type?: NotificationType
    priority?: NotificationPriority
    targetGroup?: string
    status?: "pending" | "delivered" | "failed" | "read" | "unread"
  } = {},
) => {
  let notifications = db.get("notifications") || []

  // Apply filters
  if (filters.type) {
    notifications = notifications.filter((n: Notification) => n.type === filters.type)
  }

  if (filters.priority) {
    notifications = notifications.filter((n: Notification) => n.priority === filters.priority)
  }

  if (filters.targetGroup) {
    notifications = notifications.filter((n: Notification) => n.targetGroup === filters.targetGroup)
  }

  if (filters.status) {
    if (filters.status === "read") {
      notifications = notifications.filter((n: Notification) => n.read)
    } else if (filters.status === "unread") {
      notifications = notifications.filter((n: Notification) => !n.read)
    } else {
      notifications = notifications.filter((n: Notification) => n.deliveryStatus === filters.status)
    }
  }

  return notifications.sort(
    (a: Notification, b: Notification) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  )
}

// Process scheduled notifications (would be called by a cron job in a real app)
export const processScheduledNotifications = () => {
  const notifications = db.get("notifications") || []
  const now = new Date()

  const updatedNotifications = notifications.map((n: Notification) => {
    if (n.scheduledFor && n.deliveryStatus === "pending") {
      const scheduledTime = new Date(n.scheduledFor)
      if (scheduledTime <= now) {
        return { ...n, deliveryStatus: "delivered" }
      }
    }
    return n
  })

  db.set("notifications", updatedNotifications)
  return updatedNotifications.filter(
    (n: Notification) => n.scheduledFor && new Date(n.scheduledFor) <= now && n.deliveryStatus === "delivered",
  )
}

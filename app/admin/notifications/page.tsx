"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import {
  broadcastNotification,
  getAdminNotifications,
  deleteNotification,
  updateNotification,
  processScheduledNotifications,
} from "@/lib/notifications"
import { toast } from "@/components/ui/use-toast"
import {
  AlertCircle,
  Bell,
  Megaphone,
  Trash2,
  Edit,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  ArrowUpCircle,
  MinusCircle,
  ArrowDownCircle,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Notification, NotificationType, NotificationPriority } from "@/lib/types"

// Priority icon mapping
const PriorityIcon = ({ priority }: { priority: NotificationPriority }) => {
  switch (priority) {
    case "high":
      return <ArrowUpCircle className="h-4 w-4 text-red-500" />
    case "medium":
      return <MinusCircle className="h-4 w-4 text-amber-500" />
    case "low":
      return <ArrowDownCircle className="h-4 w-4 text-green-500" />
    default:
      return <MinusCircle className="h-4 w-4 text-amber-500" />
  }
}

// Notification type icon mapping
const NotificationTypeIcon = ({ type }: { type: NotificationType }) => {
  switch (type) {
    case "admin_message":
      return <AlertCircle className="h-4 w-4 text-blue-500" />
    case "announcement":
      return <Megaphone className="h-4 w-4 text-purple-500" />
    case "welcome":
      return <Bell className="h-4 w-4 text-green-500" />
    default:
      return <Bell className="h-4 w-4 text-gray-500" />
  }
}

// Status icon mapping
const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case "delivered":
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case "pending":
      return <Clock className="h-4 w-4 text-amber-500" />
    case "failed":
      return <XCircle className="h-4 w-4 text-red-500" />
    case "read":
      return <CheckCircle className="h-4 w-4 text-blue-500" />
    case "unread":
      return <AlertCircle className="h-4 w-4 text-gray-500" />
    default:
      return <AlertCircle className="h-4 w-4 text-gray-500" />
  }
}

// Template interface
interface NotificationTemplate {
  id: string
  name: string
  type: NotificationType
  title: string
  message: string
  priority: NotificationPriority
}

export default function AdminNotificationsPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("compose")
  const [notificationType, setNotificationType] = useState<NotificationType>("admin_message")
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [priority, setPriority] = useState<NotificationPriority>("medium")
  const [targetAudience, setTargetAudience] = useState("all")
  const [hideAdminProfile, setHideAdminProfile] = useState(false)
  const [isUrgent, setIsUrgent] = useState(false)
  const [link, setLink] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [scheduleTime, setScheduleTime] = useState("")
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [templates, setTemplates] = useState<NotificationTemplate[]>([])
  const [editingNotification, setEditingNotification] = useState<Notification | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false)
  const [templateName, setTemplateName] = useState("")
  const [filters, setFilters] = useState({
    type: undefined as NotificationType | undefined,
    priority: undefined as NotificationPriority | undefined,
    targetGroup: undefined as string | undefined,
    status: undefined as "pending" | "delivered" | "failed" | "read" | "unread" | undefined,
  })

  // Load notifications and templates
  useEffect(() => {
    // Load notifications
    const loadedNotifications = getAdminNotifications(filters)
    setNotifications(loadedNotifications)

    // Load templates
    const loadedTemplates = JSON.parse(localStorage.getItem("notification_templates") || "[]")
    setTemplates(loadedTemplates)

    // Process any scheduled notifications
    processScheduledNotifications()
  }, [filters])

  // Handle notification submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !message) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const scheduledForDate = scheduleTime ? new Date(scheduleTime).toISOString() : undefined

      broadcastNotification(
        notificationType,
        title,
        message,
        priority,
        hideAdminProfile ? undefined : user ? { id: user.id, name: user.name, avatar: user.avatar } : undefined,
        targetAudience !== "all" ? targetAudience : undefined,
        scheduledForDate,
      )

      toast({
        title: "Success",
        description: scheduledForDate ? "Notification scheduled successfully" : "Notification sent to all users",
      })

      // Reset form
      setTitle("")
      setMessage("")
      setLink("")
      setScheduleTime("")
      setPriority("medium")
      setTargetAudience("all")
      setHideAdminProfile(false)
      setIsUrgent(false)

      // Refresh notifications list
      setNotifications(getAdminNotifications(filters))
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send notification",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle notification update
  const handleUpdateNotification = () => {
    if (!editingNotification) return

    try {
      updateNotification(editingNotification.id, {
        title: editingNotification.title,
        message: editingNotification.message,
        priority: editingNotification.priority,
        type: editingNotification.type,
        link: editingNotification.link,
      })

      toast({
        title: "Success",
        description: "Notification updated successfully",
      })

      // Refresh notifications list
      setNotifications(getAdminNotifications(filters))
      setEditDialogOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update notification",
        variant: "destructive",
      })
    }
  }

  // Handle notification deletion
  const handleDeleteNotification = (id: string) => {
    try {
      deleteNotification(id)

      toast({
        title: "Success",
        description: "Notification deleted successfully",
      })

      // Refresh notifications list
      setNotifications(getAdminNotifications(filters))
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive",
      })
    }
  }

  // Handle template save
  const handleSaveTemplate = () => {
    if (!templateName || !title || !message) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const newTemplate: NotificationTemplate = {
      id: Date.now().toString(),
      name: templateName,
      type: notificationType,
      title,
      message,
      priority,
    }

    const updatedTemplates = [...templates, newTemplate]
    localStorage.setItem("notification_templates", JSON.stringify(updatedTemplates))
    setTemplates(updatedTemplates)
    setTemplateDialogOpen(false)

    toast({
      title: "Success",
      description: "Template saved successfully",
    })
  }

  // Handle template load
  const handleLoadTemplate = (template: NotificationTemplate) => {
    setNotificationType(template.type)
    setTitle(template.title)
    setMessage(template.message)
    setPriority(template.priority)
    setActiveTab("compose")

    toast({
      title: "Template Loaded",
      description: `Template "${template.name}" loaded successfully`,
    })
  }

  // Handle template deletion
  const handleDeleteTemplate = (id: string) => {
    const updatedTemplates = templates.filter((t) => t.id !== id)
    localStorage.setItem("notification_templates", JSON.stringify(updatedTemplates))
    setTemplates(updatedTemplates)

    toast({
      title: "Success",
      description: "Template deleted successfully",
    })
  }

  // Notification type options
  const notificationTypeOptions = [
    { value: "admin_message", label: "Admin Message", icon: <AlertCircle className="h-4 w-4 mr-2" /> },
    { value: "announcement", label: "Announcement", icon: <Megaphone className="h-4 w-4 mr-2" /> },
    { value: "welcome", label: "Welcome", icon: <Bell className="h-4 w-4 mr-2" /> },
  ]

  // Target audience options
  const targetAudienceOptions = [
    { value: "all", label: "All Users" },
    { value: "students", label: "Students Only" },
    { value: "teachers", label: "Teachers Only" },
    { value: "verified", label: "Verified Users" },
    { value: "new", label: "New Users (< 30 days)" },
  ]

  // Priority options
  const priorityOptions = [
    { value: "high", label: "High", icon: <ArrowUpCircle className="h-4 w-4 mr-2 text-red-500" /> },
    { value: "medium", label: "Medium", icon: <MinusCircle className="h-4 w-4 mr-2 text-amber-500" /> },
    { value: "low", label: "Low", icon: <ArrowDownCircle className="h-4 w-4 mr-2 text-green-500" /> },
  ]

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Notification Management</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="compose" className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Compose
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>

        {/* Compose tab content */}
        <TabsContent value="compose">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Create Notification</CardTitle>
                <CardDescription>Compose a new notification to send to users</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="notificationType">Notification Type</Label>
                  <Select
                    value={notificationType}
                    onValueChange={(value) => setNotificationType(value as NotificationType)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select notification type" />
                    </SelectTrigger>
                    <SelectContent>
                      {notificationTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center">
                            {option.icon}
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={priority} onValueChange={(value) => setPriority(value as NotificationPriority)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {priorityOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center">
                            {option.icon}
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Notification title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Notification message"
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetAudience">Target Audience</Label>
                  <Select value={targetAudience} onValueChange={setTargetAudience}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select target audience" />
                    </SelectTrigger>
                    <SelectContent>
                      {targetAudienceOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="link">Link (Optional)</Label>
                  <Input
                    id="link"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="e.g., /settings"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scheduleTime">Schedule (Optional)</Label>
                  <Input
                    id="scheduleTime"
                    type="datetime-local"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="hideAdminProfile" checked={hideAdminProfile} onCheckedChange={setHideAdminProfile} />
                  <Label htmlFor="hideAdminProfile">Hide Admin Profile</Label>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">Save as Template</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Save as Template</DialogTitle>
                      <DialogDescription>Save this notification as a template for future use</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="templateName">Template Name</Label>
                        <Input
                          id="templateName"
                          value={templateName}
                          onChange={(e) => setTemplateName(e.target.value)}
                          placeholder="e.g., Welcome Message"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setTemplateDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSaveTemplate}>Save Template</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Button onClick={handleSubmit} disabled={isLoading}>
                  {isLoading ? "Sending..." : scheduleTime ? "Schedule" : "Send Notification"}
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription>Preview how your notification will appear to users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      <NotificationTypeIcon type={notificationType} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{title || "Notification Title"}</p>
                        <Badge
                          variant="outline"
                          className={`
                            ${
                              priority === "high"
                                ? "bg-red-50 text-red-500 border-red-200"
                                : priority === "medium"
                                  ? "bg-amber-50 text-amber-500 border-amber-200"
                                  : "bg-green-50 text-green-500 border-green-200"
                            }
                          `}
                        >
                          <PriorityIcon priority={priority} />
                          <span className="ml-1">{priority}</span>
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {message || "Notification message will appear here."}
                      </p>
                      {link && (
                        <Button variant="link" className="p-0 h-auto text-xs mt-1">
                          View Details
                        </Button>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        {scheduleTime ? `Scheduled for ${new Date(scheduleTime).toLocaleString()}` : "Just now"}
                      </p>
                    </div>
                    {!hideAdminProfile && user && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>{user.name[0]}</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Templates tab content */}
        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Saved Templates</CardTitle>
              <CardDescription>Manage your saved notification templates</CardDescription>
            </CardHeader>
            <CardContent>
              {templates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No templates saved yet</p>
                  <p className="text-sm mt-2">Save a notification as a template to see it here</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {templates.map((template) => (
                    <Card key={template.id} className="overflow-hidden">
                      <CardHeader className="p-4">
                        <CardTitle className="text-base flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <NotificationTypeIcon type={template.type} />
                            {template.name}
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleDeleteTemplate(template.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={`
                                ${
                                  template.priority === "high"
                                    ? "bg-red-50 text-red-500 border-red-200"
                                    : template.priority === "medium"
                                      ? "bg-amber-50 text-amber-500 border-amber-200"
                                      : "bg-green-50 text-green-500 border-green-200"
                                }
                              `}
                            >
                              <PriorityIcon priority={template.priority} />
                              <span className="ml-1">{template.priority}</span>
                            </Badge>
                          </div>
                          <p className="font-medium text-sm">{template.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2">{template.message}</p>
                        </div>
                      </CardContent>
                      <CardFooter className="p-4 pt-0">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => handleLoadTemplate(template)}
                        >
                          Use Template
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* History tab content */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Notification History</CardTitle>
              <CardDescription>View and manage all sent and scheduled notifications</CardDescription>
              <div className="flex flex-wrap gap-2 mt-4">
                <Select
                  value={filters.type || ""}
                  onValueChange={(value) => setFilters({ ...filters, type: (value as NotificationType) || undefined })}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {notificationTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center">
                          {option.icon}
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={filters.priority || ""}
                  onValueChange={(value) =>
                    setFilters({ ...filters, priority: (value as NotificationPriority) || undefined })
                  }
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Filter by priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    {priorityOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center">
                          {option.icon}
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={filters.targetGroup || ""}
                  onValueChange={(value) => setFilters({ ...filters, targetGroup: value || undefined })}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Filter by audience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Audiences</SelectItem>
                    {targetAudienceOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={filters.status || ""}
                  onValueChange={(value) => setFilters({ ...filters, status: (value as any) || undefined })}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="read">Read</SelectItem>
                    <SelectItem value="unread">Unread</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setFilters({
                      type: undefined,
                      priority: undefined,
                      targetGroup: undefined,
                      status: undefined,
                    })
                  }
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No notifications found</p>
                  <p className="text-sm mt-2">Try adjusting your filters or create a new notification</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Audience</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {notifications.map((notification) => (
                      <TableRow key={notification.id}>
                        <TableCell>
                          {new Date(notification.timestamp).toLocaleDateString()}
                          <div className="text-xs text-muted-foreground">
                            {new Date(notification.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <NotificationTypeIcon type={notification.type} />
                            <span className="capitalize">{notification.type.replace("_", " ")}</span>
                          </div>
                        </TableCell>
                        <TableCell>{notification.title}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`
                              ${
                                notification.priority === "high"
                                  ? "bg-red-50 text-red-500 border-red-200"
                                  : notification.priority === "medium"
                                    ? "bg-amber-50 text-amber-500 border-amber-200"
                                    : "bg-green-50 text-green-500 border-green-200"
                              }
                            `}
                          >
                            <PriorityIcon priority={notification.priority} />
                            <span className="ml-1 capitalize">{notification.priority}</span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {notification.targetGroup ? (
                            <span className="capitalize">{notification.targetGroup}</span>
                          ) : (
                            "All Users"
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <StatusIcon
                              status={notification.deliveryStatus || (notification.read ? "read" : "unread")}
                            />
                            <span className="capitalize">
                              {notification.deliveryStatus || (notification.read ? "Read" : "Unread")}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => setEditingNotification(notification)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Edit Notification</DialogTitle>
                                  <DialogDescription>Make changes to the notification</DialogDescription>
                                </DialogHeader>
                                {editingNotification && (
                                  <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-title">Title</Label>
                                      <Input
                                        id="edit-title"
                                        value={editingNotification.title}
                                        onChange={(e) =>
                                          setEditingNotification({
                                            ...editingNotification,
                                            title: e.target.value,
                                          })
                                        }
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-message">Message</Label>
                                      <Textarea
                                        id="edit-message"
                                        value={editingNotification.message}
                                        onChange={(e) =>
                                          setEditingNotification({
                                            ...editingNotification,
                                            message: e.target.value,
                                          })
                                        }
                                        rows={4}
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-priority">Priority</Label>
                                      <Select
                                        value={editingNotification.priority}
                                        onValueChange={(value) =>
                                          setEditingNotification({
                                            ...editingNotification,
                                            priority: value as NotificationPriority,
                                          })
                                        }
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select priority" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {priorityOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                              <div className="flex items-center">
                                                {option.icon}
                                                {option.label}
                                              </div>
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-link">Link (Optional)</Label>
                                      <Input
                                        id="edit-link"
                                        value={editingNotification.link || ""}
                                        onChange={(e) =>
                                          setEditingNotification({
                                            ...editingNotification,
                                            link: e.target.value,
                                          })
                                        }
                                      />
                                    </div>
                                  </div>
                                )}
                                <DialogFooter>
                                  <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                                    Cancel
                                  </Button>
                                  <Button onClick={handleUpdateNotification}>Save Changes</Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleDeleteNotification(notification.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

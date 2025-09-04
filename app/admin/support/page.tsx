"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { db } from "@/lib/db"
import { markNotificationAsRead } from "@/lib/notifications"
import { Mail, CheckCircle, Clock } from "lucide-react"
import type { Notification } from "@/lib/types"

export default function AdminSupportPage() {
  const [supportRequests, setSupportRequests] = useState<Notification[]>([])
  const [activeTab, setActiveTab] = useState<"unread" | "all">("unread")

  useEffect(() => {
    // Load support requests
    const notifications = db.get("notifications") || []
    const supportNotifications = notifications.filter((n: Notification) => n.type === "support")
    setSupportRequests(supportNotifications)
  }, [])

  const handleMarkAsRead = (notificationId: string) => {
    markNotificationAsRead(notificationId)

    // Update local state
    setSupportRequests((prev) => prev.map((req) => (req.id === notificationId ? { ...req, read: true } : req)))

    toast({
      title: "Marked as Read",
      description: "Support request has been marked as read",
    })
  }

  const filteredRequests = supportRequests.filter((req) => (activeTab === "unread" ? !req.read : true))

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Support Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value: "unread" | "all") => setActiveTab(value)}>
            <TabsList className="mb-4">
              <TabsTrigger value="unread" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Unread
                {supportRequests.filter((req) => !req.read).length > 0 && (
                  <Badge variant="destructive">{supportRequests.filter((req) => !req.read).length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="all">All Requests</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              {filteredRequests.length > 0 ? (
                <div className="space-y-4">
                  {filteredRequests.map((request) => (
                    <Card key={request.id} className={!request.read ? "border-primary" : ""}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <h3 className="font-semibold">{request.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              Received: {new Date(request.timestamp).toLocaleString()}
                            </p>
                            <div className="mt-4 whitespace-pre-wrap">{request.message}</div>
                          </div>
                          {!request.read && (
                            <Button variant="outline" size="sm" onClick={() => handleMarkAsRead(request.id)}>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Mark as Read
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No {activeTab === "unread" ? "unread " : ""}support requests found
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

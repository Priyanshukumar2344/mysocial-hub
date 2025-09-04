"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CheckCircle, XCircle, FileText, Clock, CheckCheck, Download } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

type Resource = {
  id: string
  title: string
  type: "notes" | "assignment" | "project" | "paper"
  subject: string
  uploadedBy: {
    name: string
    avatar?: string
    year: string
    branch: string
  }
  uploadDate: string
  status: "pending" | "approved" | "rejected"
  fileUrl: string
  preview?: string
}

export default function TeacherVerifyPage() {
  const [resources, setResources] = useState<Resource[]>([
    {
      id: "1",
      title: "Data Structures Notes - Binary Trees",
      type: "notes",
      subject: "Data Structures",
      uploadedBy: {
        name: "Rahul Kumar",
        year: "2nd Year",
        branch: "CSE",
      },
      uploadDate: "2024-02-24",
      status: "pending",
      fileUrl: "#",
      preview: "/placeholder.svg",
    },
    {
      id: "2",
      title: "Digital Electronics Assignment 3",
      type: "assignment",
      subject: "Digital Electronics",
      uploadedBy: {
        name: "Priya Singh",
        year: "1st Year",
        branch: "ECE",
      },
      uploadDate: "2024-02-23",
      status: "pending",
      fileUrl: "#",
    },
  ])

  const [feedback, setFeedback] = useState("")
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null)

  const handleApprove = (resource: Resource) => {
    setResources((prev) => prev.map((r) => (r.id === resource.id ? { ...r, status: "approved" } : r)))
    toast({
      title: "Resource Approved",
      description: "The resource has been approved and is now available to students.",
    })
  }

  const handleReject = (resource: Resource) => {
    if (!feedback) {
      toast({
        title: "Feedback Required",
        description: "Please provide feedback before rejecting the resource.",
        variant: "destructive",
      })
      return
    }

    setResources((prev) => prev.map((r) => (r.id === resource.id ? { ...r, status: "rejected" } : r)))
    toast({
      title: "Resource Rejected",
      description: "Feedback has been sent to the student.",
    })
    setFeedback("")
    setSelectedResource(null)
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Resource Verification Dashboard</CardTitle>
          <CardDescription>Review and verify student-uploaded resources</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pending" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Pending
              </TabsTrigger>
              <TabsTrigger value="approved" className="flex items-center gap-2">
                <CheckCheck className="h-4 w-4" />
                Approved
              </TabsTrigger>
              <TabsTrigger value="rejected" className="flex items-center gap-2">
                <XCircle className="h-4 w-4" />
                Rejected
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="mt-4">
              <div className="space-y-4">
                {resources
                  .filter((r) => r.status === "pending")
                  .map((resource) => (
                    <Card key={resource.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                              <FileText className="h-6 w-6" />
                            </div>
                            <div>
                              <h3 className="font-semibold">{resource.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                {resource.subject} • {resource.type}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={resource.uploadedBy.avatar} />
                                  <AvatarFallback>{resource.uploadedBy.name[0]}</AvatarFallback>
                                </Avatar>
                                <p className="text-sm">
                                  {resource.uploadedBy.name} • {resource.uploadedBy.year}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex items-center gap-2"
                              onClick={() => window.open(resource.fileUrl)}
                            >
                              <Download className="h-4 w-4" />
                              Download
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600"
                                  onClick={() => setSelectedResource(resource)}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Reject Resource</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <p className="text-sm text-muted-foreground">
                                    Please provide feedback for the student
                                  </p>
                                  <Textarea
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    placeholder="Enter your feedback..."
                                    className="min-h-[100px]"
                                  />
                                  <Button
                                    variant="destructive"
                                    onClick={() => selectedResource && handleReject(selectedResource)}
                                  >
                                    Reject Resource
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600"
                              onClick={() => handleApprove(resource)}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        {resource.preview && (
                          <div className="mt-4">
                            <img
                              src={resource.preview || "/placeholder.svg"}
                              alt="Resource Preview"
                              className="w-full h-[200px] object-cover rounded-lg"
                            />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="approved" className="mt-4">
              {/* Similar layout for approved resources */}
            </TabsContent>

            <TabsContent value="rejected" className="mt-4">
              {/* Similar layout for rejected resources */}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

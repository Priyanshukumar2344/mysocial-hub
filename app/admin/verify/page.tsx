"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/AuthContext"
import { db } from "@/lib/db"
import { toast } from "@/components/ui/use-toast"
import { CheckCircle, XCircle, AlertTriangle, Eye, Download, MessageSquare } from "lucide-react"
import { VerificationBadge } from "@/components/VerificationBadge"

type VerificationStatus = "pending" | "approved" | "rejected"

type ResourceVerification = {
  id: string
  resourceId: string
  status: VerificationStatus
  submittedBy: {
    id: string
    name: string
    verification: "none" | "blue" | "golden"
  }
  submittedAt: string
  reviewedBy?: {
    id: string
    name: string
    verification: "none" | "blue" | "golden"
  }
  reviewedAt?: string
  feedback?: string
}

export default function AdminVerifyPage() {
  const { user } = useAuth()
  const [verifications, setVerifications] = useState<ResourceVerification[]>(() => {
    return db.get("verifications") || []
  })
  const [activeTab, setActiveTab] = useState<VerificationStatus>("pending")
  const [selectedVerification, setSelectedVerification] = useState<ResourceVerification | null>(null)
  const [feedback, setFeedback] = useState("")
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false)

  const handleApprove = (verification: ResourceVerification) => {
    const updatedVerifications = verifications.map((v) =>
      v.id === verification.id
        ? {
            ...v,
            status: "approved",
            reviewedBy: {
              id: user!.id,
              name: user!.name,
              verification: user!.verification,
            },
            reviewedAt: new Date().toISOString(),
          }
        : v,
    )
    db.set("verifications", updatedVerifications)
    setVerifications(updatedVerifications)

    // Update the resource's verification status
    const resources = db.get("resources") || []
    const updatedResources = resources.map((r: any) =>
      r.id === verification.resourceId
        ? {
            ...r,
            verifiedBy: {
              id: user!.id,
              name: user!.name,
              verification: user!.verification,
            },
          }
        : r,
    )
    db.set("resources", updatedResources)

    toast({
      title: "Success",
      description: "Resource has been approved",
    })
  }

  const handleReject = (verification: ResourceVerification) => {
    if (!feedback) {
      toast({
        title: "Error",
        description: "Please provide feedback for rejection",
        variant: "destructive",
      })
      return
    }

    const updatedVerifications = verifications.map((v) =>
      v.id === verification.id
        ? {
            ...v,
            status: "rejected",
            reviewedBy: {
              id: user!.id,
              name: user!.name,
              verification: user!.verification,
            },
            reviewedAt: new Date().toISOString(),
            feedback,
          }
        : v,
    )
    db.set("verifications", updatedVerifications)
    setVerifications(updatedVerifications)

    setFeedback("")
    setShowFeedbackDialog(false)
    setSelectedVerification(null)

    toast({
      title: "Success",
      description: "Resource has been rejected with feedback",
    })
  }

  const filteredVerifications = verifications.filter((v) => v.status === activeTab)

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Resource Verification</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value: VerificationStatus) => setActiveTab(value)}>
            <TabsList>
              <TabsTrigger value="pending" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Pending
                {verifications.filter((v) => v.status === "pending").length > 0 && (
                  <Badge variant="destructive">{verifications.filter((v) => v.status === "pending").length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="approved" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Approved
              </TabsTrigger>
              <TabsTrigger value="rejected" className="flex items-center gap-2">
                <XCircle className="h-4 w-4" />
                Rejected
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              <div className="space-y-4">
                {filteredVerifications.map((verification) => (
                  <Card key={verification.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{verification.submittedBy.name}</h3>
                            <VerificationBadge type={verification.submittedBy.verification} className="h-4 w-4" />
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Submitted {new Date(verification.submittedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                          {verification.status === "pending" && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600"
                                onClick={() => {
                                  setSelectedVerification(verification)
                                  setShowFeedbackDialog(true)
                                }}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-green-600"
                                onClick={() => handleApprove(verification)}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                      {verification.reviewedBy && (
                        <div className="mt-4 pt-4 border-t">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Reviewed by</span>
                            <span className="text-sm">{verification.reviewedBy.name}</span>
                            <VerificationBadge type={verification.reviewedBy.verification} className="h-3 w-3" />
                          </div>
                          {verification.feedback && (
                            <p className="mt-2 text-sm text-muted-foreground">{verification.feedback}</p>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Provide Feedback</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="feedback">Feedback</Label>
              <Textarea
                id="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Explain why this resource is being rejected..."
                className="min-h-[100px]"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowFeedbackDialog(false)
                  setSelectedVerification(null)
                  setFeedback("")
                }}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={() => selectedVerification && handleReject(selectedVerification)}>
                Reject Resource
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/AuthContext"
import { db } from "@/lib/db"
import { toast } from "@/components/ui/use-toast"
import {
  type Sponsor,
  type SponsorType,
  type SponsorSection,
  type SponsorStatus,
  sampleSponsors,
  getSponsorsBySection,
} from "@/lib/sponsors"
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  MousePointer,
  ImageIcon,
  Video,
  Link,
  FileImage,
  BarChart3,
  Settings,
} from "lucide-react"

export default function SponsorManagementPage() {
  const { user, isSuperAdmin } = useAuth()
  const [sponsors, setSponsors] = useState<Sponsor[]>([])
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [selectedSponsor, setSelectedSponsor] = useState<Sponsor | null>(null)
  const [activeTab, setActiveTab] = useState<SponsorSection>("home")
  const [newSponsor, setNewSponsor] = useState<Partial<Sponsor>>({
    type: "image",
    section: "home",
    status: "active",
    priority: 5,
  })

  useEffect(() => {
    // Load sponsors from database, initialize with sample data if empty
    const existingSponsors = db.get("sponsors") || []
    if (existingSponsors.length === 0) {
      db.set("sponsors", sampleSponsors)
      setSponsors(sampleSponsors)
    } else {
      setSponsors(existingSponsors)
    }
  }, [])

  const handleCreateSponsor = () => {
    if (!newSponsor.title || !newSponsor.section || !newSponsor.type) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    // Validate content based on type
    if (newSponsor.type === "image" || newSponsor.type === "poster") {
      if (!newSponsor.imageUrl) {
        toast({
          title: "Error",
          description: "Please provide an image URL",
          variant: "destructive",
        })
        return
      }
    }

    if (newSponsor.type === "video" && !newSponsor.videoUrl) {
      toast({
        title: "Error",
        description: "Please provide a video URL",
        variant: "destructive",
      })
      return
    }

    if (newSponsor.type === "link" && !newSponsor.linkUrl) {
      toast({
        title: "Error",
        description: "Please provide a link URL",
        variant: "destructive",
      })
      return
    }

    const sponsor: Sponsor = {
      id: Date.now().toString(),
      title: newSponsor.title!,
      description: newSponsor.description,
      type: newSponsor.type!,
      section: newSponsor.section!,
      status: newSponsor.status as SponsorStatus,
      imageUrl: newSponsor.imageUrl,
      videoUrl: newSponsor.videoUrl,
      linkUrl: newSponsor.linkUrl,
      linkText: newSponsor.linkText,
      startDate: newSponsor.startDate,
      endDate: newSponsor.endDate,
      priority: newSponsor.priority || 5,
      clickCount: 0,
      impressions: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: user!.id,
    }

    const updatedSponsors = [...sponsors, sponsor]
    db.set("sponsors", updatedSponsors)
    setSponsors(updatedSponsors)
    setShowCreateDialog(false)
    setNewSponsor({
      type: "image",
      section: "home",
      status: "active",
      priority: 5,
    })

    toast({
      title: "Success",
      description: "Sponsor created successfully",
    })
  }

  const handleEditSponsor = () => {
    if (!selectedSponsor || !selectedSponsor.title) {
      return
    }

    const updatedSponsor: Sponsor = {
      ...selectedSponsor,
      updatedAt: new Date().toISOString(),
    }

    const updatedSponsors = sponsors.map((s) => (s.id === selectedSponsor.id ? updatedSponsor : s))
    db.set("sponsors", updatedSponsors)
    setSponsors(updatedSponsors)
    setShowEditDialog(false)
    setSelectedSponsor(null)

    toast({
      title: "Success",
      description: "Sponsor updated successfully",
    })
  }

  const handleDeleteSponsor = (sponsorId: string) => {
    const updatedSponsors = sponsors.filter((s) => s.id !== sponsorId)
    db.set("sponsors", updatedSponsors)
    setSponsors(updatedSponsors)

    toast({
      title: "Success",
      description: "Sponsor deleted successfully",
    })
  }

  const handleToggleStatus = (sponsorId: string) => {
    const updatedSponsors = sponsors.map((s) =>
      s.id === sponsorId
        ? {
            ...s,
            status: (s.status === "active" ? "inactive" : "active") as SponsorStatus,
            updatedAt: new Date().toISOString(),
          }
        : s,
    )
    db.set("sponsors", updatedSponsors)
    setSponsors(updatedSponsors)
  }

  const getTypeIcon = (type: SponsorType) => {
    switch (type) {
      case "image":
        return <ImageIcon className="h-4 w-4" />
      case "video":
        return <Video className="h-4 w-4" />
      case "link":
        return <Link className="h-4 w-4" />
      case "poster":
        return <FileImage className="h-4 w-4" />
      default:
        return <ImageIcon className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: SponsorStatus) => {
    switch (status) {
      case "active":
        return "bg-green-500"
      case "inactive":
        return "bg-gray-500"
      case "scheduled":
        return "bg-blue-500"
      case "expired":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const filteredSponsors = getSponsorsBySection(sponsors, activeTab)
  const allSponsors = sponsors.filter((s) => s.section === activeTab)

  const stats = {
    total: sponsors.length,
    active: sponsors.filter((s) => s.status === "active").length,
    totalClicks: sponsors.reduce((sum, s) => sum + s.clickCount, 0),
    totalImpressions: sponsors.reduce((sum, s) => sum + s.impressions, 0),
  }

  const renderSponsorForm = (sponsor: Partial<Sponsor>, setSponsor: (s: Partial<Sponsor>) => void) => (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={sponsor.title || ""}
            onChange={(e) => setSponsor({ ...sponsor, title: e.target.value })}
            placeholder="Sponsor title"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Type *</Label>
          <Select value={sponsor.type} onValueChange={(value: SponsorType) => setSponsor({ ...sponsor, type: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="image">Image</SelectItem>
              <SelectItem value="video">Video</SelectItem>
              <SelectItem value="link">Link</SelectItem>
              <SelectItem value="poster">Poster Banner</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="section">Section *</Label>
          <Select
            value={sponsor.section}
            onValueChange={(value: SponsorSection) => setSponsor({ ...sponsor, section: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="home">Home</SelectItem>
              <SelectItem value="marketplace">SellꨄBuy</SelectItem>
              <SelectItem value="library">Library</SelectItem>
              <SelectItem value="social">Social</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="priority">Priority (1-10)</Label>
          <Input
            id="priority"
            type="number"
            min="1"
            max="10"
            value={sponsor.priority || 5}
            onChange={(e) => setSponsor({ ...sponsor, priority: Number(e.target.value) })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={sponsor.description || ""}
          onChange={(e) => setSponsor({ ...sponsor, description: e.target.value })}
          placeholder="Brief description of the sponsor"
          rows={3}
        />
      </div>

      {/* Content fields based on type */}
      {(sponsor.type === "image" || sponsor.type === "poster") && (
        <div className="space-y-2">
          <Label htmlFor="imageUrl">Image URL *</Label>
          <Input
            id="imageUrl"
            value={sponsor.imageUrl || ""}
            onChange={(e) => setSponsor({ ...sponsor, imageUrl: e.target.value })}
            placeholder="https://example.com/image.jpg"
          />
        </div>
      )}

      {sponsor.type === "video" && (
        <div className="space-y-2">
          <Label htmlFor="videoUrl">Video URL *</Label>
          <Input
            id="videoUrl"
            value={sponsor.videoUrl || ""}
            onChange={(e) => setSponsor({ ...sponsor, videoUrl: e.target.value })}
            placeholder="https://example.com/video.mp4"
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="linkUrl">Link URL</Label>
          <Input
            id="linkUrl"
            value={sponsor.linkUrl || ""}
            onChange={(e) => setSponsor({ ...sponsor, linkUrl: e.target.value })}
            placeholder="https://example.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="linkText">Link Text</Label>
          <Input
            id="linkText"
            value={sponsor.linkText || ""}
            onChange={(e) => setSponsor({ ...sponsor, linkText: e.target.value })}
            placeholder="Learn More"
          />
        </div>
      </div>

      {/* Scheduling */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date (Optional)</Label>
          <Input
            id="startDate"
            type="datetime-local"
            value={sponsor.startDate || ""}
            onChange={(e) => setSponsor({ ...sponsor, startDate: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">End Date (Optional)</Label>
          <Input
            id="endDate"
            type="datetime-local"
            value={sponsor.endDate || ""}
            onChange={(e) => setSponsor({ ...sponsor, endDate: e.target.value })}
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="active"
          checked={sponsor.status === "active"}
          onCheckedChange={(checked) => setSponsor({ ...sponsor, status: checked ? "active" : "inactive" })}
        />
        <Label htmlFor="active">Active</Label>
      </div>
    </div>
  )

  if (!isSuperAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Access denied. Super admin privileges required.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Sponsor Management</h2>
          <p className="text-muted-foreground">Manage advertisements across all sections</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Sponsor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Sponsor</DialogTitle>
            </DialogHeader>
            {renderSponsorForm(newSponsor, setNewSponsor)}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateSponsor}>Create Sponsor</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sponsors</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">{stats.active} active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClicks}</div>
            <p className="text-xs text-muted-foreground">Across all sponsors</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Impressions</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalImpressions}</div>
            <p className="text-xs text-muted-foreground">Views across all sponsors</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalImpressions > 0 ? ((stats.totalClicks / stats.totalImpressions) * 100).toFixed(1) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Average CTR</p>
          </CardContent>
        </Card>
      </div>

      {/* Sponsors by Section */}
      <Card>
        <CardHeader>
          <CardTitle>Sponsors by Section</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value: SponsorSection) => setActiveTab(value)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="home">Home ({sponsors.filter((s) => s.section === "home").length})</TabsTrigger>
              <TabsTrigger value="marketplace">
                SellꨄBuy ({sponsors.filter((s) => s.section === "marketplace").length})
              </TabsTrigger>
              <TabsTrigger value="library">
                Library ({sponsors.filter((s) => s.section === "library").length})
              </TabsTrigger>
              <TabsTrigger value="social">Social ({sponsors.filter((s) => s.section === "social").length})</TabsTrigger>
            </TabsList>

            {(["home", "marketplace", "library", "social"] as SponsorSection[]).map((section) => (
              <TabsContent key={section} value={section} className="space-y-4">
                <div className="grid gap-4">
                  {allSponsors.length > 0 ? (
                    allSponsors.map((sponsor) => (
                      <Card key={sponsor.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                {getTypeIcon(sponsor.type)}
                                <div>
                                  <h3 className="font-semibold">{sponsor.title}</h3>
                                  <p className="text-sm text-muted-foreground line-clamp-1">{sponsor.description}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="flex items-center gap-1">
                                  <div className={`h-2 w-2 rounded-full ${getStatusColor(sponsor.status)}`} />
                                  {sponsor.status}
                                </Badge>
                                <Badge variant="secondary">Priority: {sponsor.priority}</Badge>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-right text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Eye className="h-3 w-3" />
                                  {sponsor.impressions}
                                </div>
                                <div className="flex items-center gap-1">
                                  <MousePointer className="h-3 w-3" />
                                  {sponsor.clickCount}
                                </div>
                              </div>
                              <Switch
                                checked={sponsor.status === "active"}
                                onCheckedChange={() => handleToggleStatus(sponsor.id)}
                              />
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                  setSelectedSponsor(sponsor)
                                  setShowEditDialog(true)
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="icon" onClick={() => handleDeleteSponsor(sponsor.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No sponsors found for this section</p>
                      <Button
                        variant="outline"
                        className="mt-4 bg-transparent"
                        onClick={() => {
                          setNewSponsor({ ...newSponsor, section })
                          setShowCreateDialog(true)
                        }}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add First Sponsor
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Sponsor</DialogTitle>
          </DialogHeader>
          {selectedSponsor && renderSponsorForm(selectedSponsor, setSelectedSponsor)}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSponsor}>Update Sponsor</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

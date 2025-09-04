"use client"

import { Badge } from "@/components/ui/badge"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import { db } from "@/lib/db"
import {
  Award,
  Search,
  Plus,
  Trash2,
  Users,
  CheckCircle,
  Clock,
  BarChart3,
  ArrowUpDown,
  BookOpen,
  Gift,
  Trophy,
  Star,
} from "lucide-react"
import type { Badge, BadgeCategory, BadgeLevel, UserData } from "@/lib/types"

export default function BadgeManagementPage() {
  const { user, isAdmin, isTeacher } = useAuth()
  const [badges, setBadges] = useState<Badge[]>([])
  const [filteredBadges, setFilteredBadges] = useState<Badge[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<BadgeCategory | "all">("all")
  const [levelFilter, setLevelFilter] = useState<BadgeLevel | "all">("all")
  const [sortBy, setSortBy] = useState<"name" | "level" | "category" | "createdAt">("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showAssignDialog, setShowAssignDialog] = useState(false)
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null)
  const [users, setUsers] = useState<UserData[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([])
  const [userSearchQuery, setUserSearchQuery] = useState("")
  const [selectedUserId, setSelectedUserId] = useState("")
  const [newBadge, setNewBadge] = useState<{
    name: string
    description: string
    icon: string
    category: BadgeCategory
    level: BadgeLevel
    criteria: string
    pointsRequired: string
    isAutomatic: boolean
  }>({
    name: "",
    description: "",
    icon: "award",
    category: "Achievement",
    level: "Bronze",
    criteria: "",
    pointsRequired: "0",
    isAutomatic: false,
  })

  useEffect(() => {
    // Load badges
    const loadedBadges = db.get("badges") || []
    setBadges(loadedBadges)
    setFilteredBadges(loadedBadges)

    // Load users
    const loadedUsers = db.get("users") || []
    setUsers(loadedUsers)
    setFilteredUsers(loadedUsers)
  }, [])

  useEffect(() => {
    // Apply filters and search to badges
    let result = [...badges]

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (badge) =>
          badge.name.toLowerCase().includes(query) ||
          badge.description.toLowerCase().includes(query) ||
          badge.category.toLowerCase().includes(query),
      )
    }

    // Apply category filter
    if (categoryFilter !== "all") {
      result = result.filter((badge) => badge.category === categoryFilter)
    }

    // Apply level filter
    if (levelFilter !== "all") {
      result = result.filter((badge) => badge.level === levelFilter)
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0
      if (sortBy === "name") {
        comparison = a.name.localeCompare(b.name)
      } else if (sortBy === "level") {
        const levelOrder = { Platinum: 4, Gold: 3, Silver: 2, Bronze: 1 }
        comparison = levelOrder[a.level as keyof typeof levelOrder] - levelOrder[b.level as keyof typeof levelOrder]
      } else if (sortBy === "category") {
        comparison = a.category.localeCompare(b.category)
      } else if (sortBy === "createdAt") {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      }

      return sortOrder === "asc" ? comparison : -comparison
    })

    setFilteredBadges(result)
  }, [badges, searchQuery, categoryFilter, levelFilter, sortBy, sortOrder])

  useEffect(() => {
    // Apply search to users
    if (userSearchQuery) {
      const query = userSearchQuery.toLowerCase()
      const filtered = users.filter(
        (user) =>
          user.name.toLowerCase().includes(query) ||
          user.collegeId.includes(query) ||
          (user.email && user.email.toLowerCase().includes(query)),
      )
      setFilteredUsers(filtered)
    } else {
      setFilteredUsers(users)
    }
  }, [users, userSearchQuery])

  const handleCreateBadge = () => {
    if (!user) return

    if (!newBadge.name || !newBadge.description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const badgeId = `badge-${Date.now()}`
    const badgeData: Badge = {
      id: badgeId,
      name: newBadge.name,
      description: newBadge.description,
      icon: newBadge.icon,
      category: newBadge.category,
      level: newBadge.level,
      criteria: newBadge.criteria,
      pointsRequired: Number.parseInt(newBadge.pointsRequired),
      createdBy: user.id,
      createdAt: new Date().toISOString(),
      isAutomatic: newBadge.isAutomatic,
    }

    // Save to database
    const existingBadges = db.get("badges") || []
    db.set("badges", [...existingBadges, badgeData])

    // Update state
    setBadges((prev) => [...prev, badgeData])

    // Reset form
    setNewBadge({
      name: "",
      description: "",
      icon: "award",
      category: "Achievement",
      level: "Bronze",
      criteria: "",
      pointsRequired: "0",
      isAutomatic: false,
    })

    setShowCreateDialog(false)

    toast({
      title: "Badge Created",
      description: `The ${badgeData.name} badge has been created successfully.`,
    })
  }

  const handleDeleteBadge = (badgeId: string) => {
    if (!isAdmin) return

    // Remove badge from database
    const existingBadges = db.get("badges") || []
    const updatedBadges = existingBadges.filter((badge: { id: string }) => badge.id !== badgeId)
    db.set("badges", updatedBadges)

    // Update state
    setBadges(updatedBadges)

    toast({
      title: "Badge Deleted",
      description: "The badge has been deleted successfully.",
    })
  }

  const handleAssignBadge = () => {
    if (!selectedBadge || !selectedUserId) {
      toast({
        title: "Error",
        description: "Please select both a badge and a user",
        variant: "destructive",
      })
      return
    }

    // Get user
    const allUsers = db.get("users") || []
    const userIndex = allUsers.findIndex((u: { id: string }) => u.id === selectedUserId)

    if (userIndex === -1) {
      toast({
        title: "Error",
        description: "User not found",
        variant: "destructive",
      })
      return
    }

    const targetUser = allUsers[userIndex]

    // Check if user already has this badge
    if (targetUser.badges?.some((badge: { badgeId: any }) => badge.badgeId === selectedBadge.id)) {
      toast({
        title: "Error",
        description: "User already has this badge",
        variant: "destructive",
      })
      return
    }

    // Add badge to user
    if (!targetUser.badges) {
      targetUser.badges = []
    }

    targetUser.badges.push({
      badgeId: selectedBadge.id,
      earnedAt: new Date().toISOString(),
      awardedBy: user?.id || "system",
    })

    // Update streak total badges count
    if (targetUser.streak) {
      targetUser.streak.totalBadges = targetUser.badges.length
    }

    // Update user in database
    allUsers[userIndex] = targetUser
    db.set("users", allUsers)

    // Create notification
    const notifications = db.get("notifications") || []
    const newNotification = {
      id: Date.now().toString(),
      type: "badge",
      title: "New Badge Awarded!",
      message: `You've been awarded the ${selectedBadge.name} badge: ${selectedBadge.description}`,
      timestamp: new Date().toISOString(),
      read: false,
      userId: selectedUserId,
      badgeId: selectedBadge.id,
      from: {
        id: user?.id || "system",
        name: user?.name || "System",
        avatar: user?.avatar,
      },
      priority: "high",
      deliveryStatus: "delivered",
    }

    notifications.push(newNotification)
    db.set("notifications", notifications)

    setShowAssignDialog(false)
    setSelectedBadge(null)
    setSelectedUserId("")

    toast({
      title: "Badge Assigned",
      description: `The ${selectedBadge.name} badge has been assigned to the user.`,
    })
  }

  const getLevelColor = (level: BadgeLevel) => {
    switch (level) {
      case "Bronze":
        return "text-amber-600"
      case "Silver":
        return "text-gray-400"
      case "Gold":
        return "text-amber-500"
      case "Platinum":
        return "text-blue-400"
      default:
        return "text-gray-500"
    }
  }

  const getCategoryIcon = (category: BadgeCategory) => {
    switch (category) {
      case "Engagement":
        return <Users className="h-4 w-4" />
      case "Academic":
        return <BookOpen className="h-4 w-4" />
      case "Contribution":
        return <Gift className="h-4 w-4" />
      case "Achievement":
        return <Trophy className="h-4 w-4" />
      case "Special":
        return <Star className="h-4 w-4" />
      default:
        return <Award className="h-4 w-4" />
    }
  }

  if (!user || (!isAdmin && !isTeacher)) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="flex items-center justify-center h-40">
            <p className="text-muted-foreground">You don't have permission to access this page.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Badge Management</h2>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create New Badge
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Badge</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Badge Name</Label>
                  <Input
                    id="name"
                    value={newBadge.name}
                    onChange={(e) => setNewBadge({ ...newBadge, name: e.target.value })}
                    placeholder="e.g., Resource Contributor"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="level">Badge Level</Label>
                  <Select
                    value={newBadge.level}
                    onValueChange={(value) => setNewBadge({ ...newBadge, level: value as BadgeLevel })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bronze">Bronze</SelectItem>
                      <SelectItem value="Silver">Silver</SelectItem>
                      <SelectItem value="Gold">Gold</SelectItem>
                      <SelectItem value="Platinum">Platinum</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={newBadge.category}
                    onValueChange={(value) => setNewBadge({ ...newBadge, category: value as BadgeCategory })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Engagement">Engagement</SelectItem>
                      <SelectItem value="Academic">Academic</SelectItem>
                      <SelectItem value="Contribution">Contribution</SelectItem>
                      <SelectItem value="Achievement">Achievement</SelectItem>
                      <SelectItem value="Special">Special</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pointsRequired">Points Required (0 for manual)</Label>
                  <Input
                    id="pointsRequired"
                    type="number"
                    min="0"
                    value={newBadge.pointsRequired}
                    onChange={(e) => setNewBadge({ ...newBadge, pointsRequired: e.target.value })}
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newBadge.description}
                    onChange={(e) => setNewBadge({ ...newBadge, description: e.target.value })}
                    placeholder="Describe what this badge represents and how it's earned"
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="criteria">Criteria (How to Earn)</Label>
                  <Textarea
                    id="criteria"
                    value={newBadge.criteria}
                    onChange={(e) => setNewBadge({ ...newBadge, criteria: e.target.value })}
                    placeholder="Explain the specific requirements to earn this badge"
                  />
                </div>
                <div className="col-span-2 flex items-center space-x-2">
                  <Switch
                    id="isAutomatic"
                    checked={newBadge.isAutomatic}
                    onCheckedChange={(checked) => setNewBadge({ ...newBadge, isAutomatic: checked })}
                  />
                  <Label htmlFor="isAutomatic">Automatically award this badge when criteria are met</Label>
                </div>
              </div>
              <Button onClick={handleCreateBadge}>Create Badge</Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <CheckCircle className="mr-2 h-4 w-4" />
              Assign Badge
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Assign Badge to User</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Select Badge</Label>
                <Select
                  value={selectedBadge?.id || ""}
                  onValueChange={(value) => setSelectedBadge(badges.find((b) => b.id === value) || null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a badge" />
                  </SelectTrigger>
                  <SelectContent>
                    {badges.map((badge) => (
                      <SelectItem key={badge.id} value={badge.id}>
                        <div className="flex items-center gap-2">
                          <Award className={`h-4 w-4 ${getLevelColor(badge.level)}`} />
                          <span>
                            {badge.name} ({badge.level})
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Search User</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, ID, or email"
                    className="pl-8"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="border rounded-md h-60 overflow-y-auto">
                {filteredUsers.length > 0 ? (
                  <div className="divide-y">
                    {filteredUsers.map((user) => (
                      <div
                        key={user.id}
                        className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-muted ${
                          selectedUserId === user.id ? "bg-muted" : ""
                        }`}
                        onClick={() => setSelectedUserId(user.id)}
                      >
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          {user.avatar ? (
                            <img
                              src={user.avatar || "/placeholder.svg"}
                              alt={user.name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-sm font-medium">{user.name[0]}</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {user.collegeId} • {user.role}
                          </p>
                        </div>
                        {selectedUserId === user.id && <CheckCircle className="h-4 w-4 text-primary" />}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">No users found</p>
                  </div>
                )}
              </div>

              <Button onClick={handleAssignBadge} disabled={!selectedBadge || !selectedUserId}>
                Assign Badge
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Badges</CardTitle>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search badges..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select
                value={categoryFilter}
                onValueChange={(value) => setCategoryFilter(value as BadgeCategory | "all")}
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Engagement">Engagement</SelectItem>
                  <SelectItem value="Academic">Academic</SelectItem>
                  <SelectItem value="Contribution">Contribution</SelectItem>
                  <SelectItem value="Achievement">Achievement</SelectItem>
                  <SelectItem value="Special">Special</SelectItem>
                </SelectContent>
              </Select>
              <Select value={levelFilter} onValueChange={(value) => setLevelFilter(value as BadgeLevel | "all")}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="Bronze">Bronze</SelectItem>
                  <SelectItem value="Silver">Silver</SelectItem>
                  <SelectItem value="Gold">Gold</SelectItem>
                  <SelectItem value="Platinum">Platinum</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBadges.length > 0 ? (
              filteredBadges.map((badge) => (
                <Card key={badge.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-full bg-primary/10 ${getLevelColor(badge.level)}`}>
                          <Award className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-base">{badge.name}</CardTitle>
                      </div>
                      {isAdmin && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleDeleteBadge(badge.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        {badge.level}
                      </Badge>
                      <Badge variant="secondary" className="text-xs flex items-center gap-1">
                        {getCategoryIcon(badge.category)}
                        {badge.category}
                      </Badge>
                      {badge.isAutomatic && (
                        <Badge variant="outline" className="text-xs bg-amber-100 text-amber-800 border-amber-200">
                          Automatic
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{badge.description}</p>
                    {badge.criteria && (
                      <div className="text-xs text-muted-foreground mt-2">
                        <span className="font-medium">How to earn:</span> {badge.criteria}
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(badge.createdAt).toLocaleDateString()}
                      </div>
                      {badge.pointsRequired > 0 && (
                        <div className="flex items-center gap-1">
                          <BarChart3 className="h-3 w-3" />
                          {badge.pointsRequired} points
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full flex items-center justify-center h-40">
                <p className="text-muted-foreground">No badges found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

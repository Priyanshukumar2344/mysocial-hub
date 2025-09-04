"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { db } from "@/lib/db"
import { Search, Filter, Star, CheckCircle, Flag, Trash2, Eye, AlertTriangle, Globe, Users, Heart } from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type Page = {
  id: string
  name: string
  handle: string
  description: string
  category: string
  createdBy: string
  createdAt: string
  followers: string[]
  likes: string[]
  featured: boolean
  verified: boolean
  reported?: boolean
  reportReason?: string
  totalViews: number
  profilePhoto?: string
  coverPhoto?: string
}

type User = {
  id: string
  name: string
  avatar?: string
}

export default function AdminPagesPage() {
  const { user, isSuperAdmin } = useAuth()
  const [pages, setPages] = useState<Page[]>([])
  const [filteredPages, setFilteredPages] = useState<Page[]>([])
  const [users, setUsers] = useState<Record<string, User>>({})
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedPage, setSelectedPage] = useState<Page | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user || !user.permissions?.canManageUsers) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive",
      })
      return
    }

    const fetchData = () => {
      setIsLoading(true)
      try {
        // Fetch pages
        const pagesData = db.get("pages") || []
        setPages(pagesData)
        setFilteredPages(pagesData)

        // Fetch users for creator info
        const usersData = db.get("users") || []
        const usersMap: Record<string, User> = {}
        usersData.forEach((user: any) => {
          usersMap[user.id] = {
            id: user.id,
            name: user.name,
            avatar: user.avatar,
          }
        })
        setUsers(usersMap)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load pages data.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [user])

  useEffect(() => {
    // Apply filters
    let result = [...pages]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (page) =>
          page.name.toLowerCase().includes(query) ||
          page.handle.toLowerCase().includes(query) ||
          page.description.toLowerCase().includes(query),
      )
    }

    // Category filter
    if (categoryFilter !== "all") {
      result = result.filter((page) => page.category === categoryFilter)
    }

    // Status filter
    if (statusFilter === "featured") {
      result = result.filter((page) => page.featured)
    } else if (statusFilter === "verified") {
      result = result.filter((page) => page.verified)
    } else if (statusFilter === "reported") {
      result = result.filter((page) => page.reported)
    } else if (statusFilter === "unverified") {
      result = result.filter((page) => !page.verified)
    }

    setFilteredPages(result)
  }, [pages, searchQuery, categoryFilter, statusFilter])

  const handleToggleFeature = (pageId: string) => {
    try {
      const updatedPages = pages.map((page) => (page.id === pageId ? { ...page, featured: !page.featured } : page))
      setPages(updatedPages)
      db.set("pages", updatedPages)

      toast({
        title: "Success",
        description: `Page ${updatedPages.find((p) => p.id === pageId)?.featured ? "featured" : "unfeatured"} successfully.`,
      })
    } catch (error) {
      console.error("Error updating page:", error)
      toast({
        title: "Error",
        description: "Failed to update page status.",
        variant: "destructive",
      })
    }
  }

  const handleToggleVerify = (pageId: string) => {
    try {
      const updatedPages = pages.map((page) => (page.id === pageId ? { ...page, verified: !page.verified } : page))
      setPages(updatedPages)
      db.set("pages", updatedPages)

      toast({
        title: "Success",
        description: `Page ${updatedPages.find((p) => p.id === pageId)?.verified ? "verified" : "unverified"} successfully.`,
      })
    } catch (error) {
      console.error("Error updating page:", error)
      toast({
        title: "Error",
        description: "Failed to update page verification status.",
        variant: "destructive",
      })
    }
  }

  const handleDeletePage = (pageId: string) => {
    try {
      const updatedPages = pages.filter((page) => page.id !== pageId)
      setPages(updatedPages)
      db.set("pages", updatedPages)

      // Update user's pages list
      const usersData = db.get("users") || []
      const updatedUsers = usersData.map((u: any) => {
        if (u.pages && u.pages.includes(pageId)) {
          return {
            ...u,
            pages: u.pages.filter((id: string) => id !== pageId),
          }
        }
        return u
      })
      db.set("users", updatedUsers)

      setShowDeleteDialog(false)
      setSelectedPage(null)

      toast({
        title: "Success",
        description: "Page deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting page:", error)
      toast({
        title: "Error",
        description: "Failed to delete page.",
        variant: "destructive",
      })
    }
  }

  const handleClearReport = (pageId: string) => {
    try {
      const updatedPages = pages.map((page) =>
        page.id === pageId ? { ...page, reported: false, reportReason: undefined } : page,
      )
      setPages(updatedPages)
      db.set("pages", updatedPages)

      toast({
        title: "Success",
        description: "Report cleared successfully.",
      })
    } catch (error) {
      console.error("Error clearing report:", error)
      toast({
        title: "Error",
        description: "Failed to clear report.",
        variant: "destructive",
      })
    }
  }

  if (!user || !user.permissions?.canManageUsers) {
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Page Management</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pages Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search pages..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Education">Education</SelectItem>
                    <SelectItem value="Technology">Technology</SelectItem>
                    <SelectItem value="Arts">Arts</SelectItem>
                    <SelectItem value="Science">Science</SelectItem>
                    <SelectItem value="Sports">Sports</SelectItem>
                    <SelectItem value="Entertainment">Entertainment</SelectItem>
                    <SelectItem value="Business">Business</SelectItem>
                    <SelectItem value="Health">Health</SelectItem>
                    <SelectItem value="Community">Community</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Pages</SelectItem>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="unverified">Unverified</SelectItem>
                    <SelectItem value="reported">Reported</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Pages Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Page</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Creator</TableHead>
                    <TableHead>Stats</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="flex justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredPages.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        No pages found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPages.map((page) => (
                      <TableRow key={page.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={page.profilePhoto || "/placeholder.svg"} />
                              <AvatarFallback>{page.name[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{page.name}</div>
                              <div className="text-sm text-muted-foreground">@{page.handle}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{page.category}</Badge>
                        </TableCell>
                        <TableCell>
                          {users[page.createdBy] ? (
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={users[page.createdBy].avatar || "/placeholder.svg"} />
                                <AvatarFallback>{users[page.createdBy].name[0]}</AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{users[page.createdBy].name}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">Unknown</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3 text-sm">
                            <div className="flex items-center">
                              <Eye className="h-4 w-4 mr-1" />
                              {page.totalViews}
                            </div>
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-1" />
                              {page.followers.length}
                            </div>
                            <div className="flex items-center">
                              <Heart className="h-4 w-4 mr-1" />
                              {page.likes.length}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {page.featured && (
                              <Badge className="bg-amber-500">
                                <Star className="h-3 w-3 mr-1" />
                                Featured
                              </Badge>
                            )}
                            {page.verified ? (
                              <Badge className="bg-green-500">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Verified
                              </Badge>
                            ) : (
                              <Badge variant="outline">Unverified</Badge>
                            )}
                            {page.reported && (
                              <Badge variant="destructive">
                                <Flag className="h-3 w-3 mr-1" />
                                Reported
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleToggleFeature(page.id)}
                              title={page.featured ? "Remove from featured" : "Add to featured"}
                            >
                              <Star className={`h-4 w-4 ${page.featured ? "fill-amber-500 text-amber-500" : ""}`} />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleToggleVerify(page.id)}
                              title={page.verified ? "Remove verification" : "Verify page"}
                            >
                              <CheckCircle
                                className={`h-4 w-4 ${page.verified ? "fill-green-500 text-green-500" : ""}`}
                              />
                            </Button>
                            {page.reported && (
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleClearReport(page.id)}
                                title="Clear report"
                              >
                                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                              </Button>
                            )}
                            <Button variant="outline" size="icon" asChild title="View page">
                              <Link href={`/pages/${page.handle}`} target="_blank">
                                <Globe className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => {
                                setSelectedPage(page)
                                setShowDeleteDialog(true)
                              }}
                              title="Delete page"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Page</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>
              Are you sure you want to delete the page <strong>{selectedPage?.name}</strong>? This action cannot be
              undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={() => selectedPage && handleDeletePage(selectedPage.id)}>
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

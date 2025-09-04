"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { UserCard } from "@/components/UserCard"
import { PageCard } from "@/components/PageCard"
import { db, type UserData } from "@/lib/db"
import { Users, UserPlus, UserCheck, BookOpen, School, Briefcase, Search, RefreshCw } from "lucide-react"
import type { ConnectionType, Page } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ConnectionNotifications } from "@/components/ConnectionNotifications"

export default function ConnectionsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const [users, setUsers] = useState<UserData[]>([])
  const [pages, setPages] = useState<Page[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"discover" | "followers" | "following">("discover")
  const [connectionType, setConnectionType] = useState<ConnectionType>("all")
  const [teacherDepartment, setTeacherDepartment] = useState<string>("all")
  const [studentBranch, setStudentBranch] = useState<string>("all")
  const [pageCategory, setPageCategory] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  // Function to fetch data
  const fetchData = useCallback(async () => {
    try {
      setError(null)
      const allUsers = db.get("users") || []
      const allPages = db.get("pages") || []

      // Filter out users who haven't completed their profile setup
      const completedUsers = allUsers.filter((u: { password: any; status: string; id: string | undefined }) => u.password && u.status === "active" && u.id !== user?.id)

      setUsers(completedUsers)
      setPages(allPages)
    } catch (err) {
      console.error("Error fetching data:", err)
      setError("Failed to load connections. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }, [user?.id])

  // Initial data load
  useEffect(() => {
    if (!authLoading && user) {
      fetchData()
    }
  }, [authLoading, user, fetchData])

  // Refresh data function
  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchData()
    setRefreshing(false)
    toast({
      title: "Refreshed",
      description: "Your connections have been updated",
    })
  }

  // Handle follow status change
  const handleFollowStatusChange = useCallback(() => {
    fetchData()
  }, [fetchData])

  // Get unique departments from teachers
  const departments = [...new Set(users.filter((u) => u.role === "teacher" && u.department).map((u) => u.department))]

  // Get unique branches from students
  const branches = [...new Set(users.filter((u) => u.role === "student" && u.branch).map((u) => u.branch))]

  // Get unique page categories
  const categories = [...new Set(pages.map((p) => p.category))]

  const filteredUsers = users.filter((u) => {
    // Don't show current user in the list
    if (u.id === user?.id) return false

    // In discover tab, don't show users the current user is already following
    if (activeTab === "discover" && user?.following?.includes(u.id)) return false

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const matchesSearch =
        u.name.toLowerCase().includes(query) ||
        u.collegeId.toLowerCase().includes(query) ||
        u.branch?.toLowerCase().includes(query) ||
        false ||
        u.department?.toLowerCase().includes(query) ||
        false

      if (!matchesSearch) return false
    }

    // Filter based on active tab
    switch (activeTab) {
      case "followers":
        if (!user?.followers?.includes(u.id)) return false
        break
      case "following":
        if (!user?.following?.includes(u.id)) return false
        break
    }

    // Filter by connection type
    if (connectionType === "students" && u.role !== "student") return false
    if (connectionType === "teachers" && u.role !== "teacher") return false
    if (connectionType === "pages") return false

    // Filter teachers by department
    if (u.role === "teacher" && teacherDepartment !== "all" && u.department !== teacherDepartment) {
      return false
    }

    // Filter students by branch
    if (u.role === "student" && studentBranch !== "all" && u.branch !== studentBranch) {
      return false
    }

    return true
  })

  const filteredPages = pages.filter((p) => {
    // Only show pages when connection type is "pages"
    if (connectionType !== "pages" && connectionType !== "all") return false

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const matchesSearch =
        p.name.toLowerCase().includes(query) ||
        p.handle.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.tags.some((tag) => tag.toLowerCase().includes(query))

      if (!matchesSearch) return false
    }

    // Filter based on active tab
    switch (activeTab) {
      case "followers":
        // Pages don't follow users
        return false
      case "following":
        if (!user?.following?.includes(p.id)) return false
        break
      case "discover":
        if (user?.following?.includes(p.id)) return false
        break
    }

    // Filter by page category
    if (pageCategory !== "all" && p.category !== pageCategory) {
      return false
    }

    return true
  })

  // If user is not logged in, show a message
  if (!authLoading && !user) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Connections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-muted-foreground">Please log in to view and manage your connections.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Connections</CardTitle>
          <div className="flex items-center gap-2">
            {user && <ConnectionNotifications />}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing || isLoading}
              aria-label="Refresh connections"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Tabs
            value={activeTab}
            onValueChange={(value: "discover" | "followers" | "following") => setActiveTab(value)}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <TabsList>
                <TabsTrigger value="discover" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Discover
                </TabsTrigger>
                <TabsTrigger value="followers" className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Followers
                </TabsTrigger>
                <TabsTrigger value="following" className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4" />
                  Following
                </TabsTrigger>
              </TabsList>
              <div className="relative max-w-xs">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search connections..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                  aria-label="Search connections"
                />
              </div>
            </div>

            {/* Connection Type Filters */}
            <div className="flex flex-wrap gap-2 mb-4">
              <Button
                variant={connectionType === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setConnectionType("all")}
                aria-pressed={connectionType === "all"}
              >
                <Users className="h-4 w-4 mr-2" />
                All
              </Button>
              <Button
                variant={connectionType === "students" ? "default" : "outline"}
                size="sm"
                onClick={() => setConnectionType("students")}
                aria-pressed={connectionType === "students"}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Students
              </Button>
              <Button
                variant={connectionType === "teachers" ? "default" : "outline"}
                size="sm"
                onClick={() => setConnectionType("teachers")}
                aria-pressed={connectionType === "teachers"}
              >
                <School className="h-4 w-4 mr-2" />
                Teachers
              </Button>
              <Button
                variant={connectionType === "pages" ? "default" : "outline"}
                size="sm"
                onClick={() => setConnectionType("pages")}
                aria-pressed={connectionType === "pages"}
              >
                <Briefcase className="h-4 w-4 mr-2" />
                Pages
              </Button>
            </div>

            {/* Category Filters - Show based on connection type */}
            {connectionType === "teachers" && departments.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4" role="radiogroup" aria-label="Filter by department">
                <Button
                  variant={teacherDepartment === "all" ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => setTeacherDepartment("all")}
                  aria-pressed={teacherDepartment === "all"}
                >
                  All Departments
                </Button>
                {departments.map((dept) => (
                  <Button
                    key={dept}
                    variant={teacherDepartment === dept ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => setTeacherDepartment(dept || "")}
                    aria-pressed={teacherDepartment === dept}
                  >
                    {dept}
                  </Button>
                ))}
              </div>
            )}

            {connectionType === "students" && branches.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4" role="radiogroup" aria-label="Filter by branch">
                <Button
                  variant={studentBranch === "all" ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => setStudentBranch("all")}
                  aria-pressed={studentBranch === "all"}
                >
                  All Branches
                </Button>
                {branches.map((branch) => (
                  <Button
                    key={branch}
                    variant={studentBranch === branch ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => setStudentBranch(branch || "")}
                    aria-pressed={studentBranch === branch}
                  >
                    {branch}
                  </Button>
                ))}
              </div>
            )}

            {(connectionType === "pages" || connectionType === "all") && categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4" role="radiogroup" aria-label="Filter by category">
                <Button
                  variant={pageCategory === "all" ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => setPageCategory("all")}
                  aria-pressed={pageCategory === "all"}
                >
                  All Categories
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={pageCategory === category ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => setPageCategory(category)}
                    aria-pressed={pageCategory === category}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            )}

            {isLoading ? (
              <div className="grid gap-6 md:grid-cols-2">
                {Array(4)
                  .fill(0)
                  .map((_, i) => (
                    <Card key={i}>
                      <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="flex-1">
                          <Skeleton className="h-5 w-32 mb-2" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                        <Skeleton className="h-9 w-20" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-3/4 mb-4" />
                        <div className="flex gap-4">
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-4 w-20" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            ) : (
              <>
                <TabsContent value="discover" className="mt-0">
                  <div className="grid gap-6 md:grid-cols-2">
                    {connectionType !== "pages" &&
                      filteredUsers.map((user) => (
                        <UserCard key={user.id} user={user} onFollowStatusChange={handleFollowStatusChange} />
                      ))}
                    {(connectionType === "pages" || connectionType === "all") &&
                      filteredPages.map((page) => <PageCard key={page.id} page={page} />)}
                    {filteredUsers.length === 0 && filteredPages.length === 0 && (
                      <p className="text-muted-foreground col-span-2 text-center py-8">
                        No results found. Try adjusting your filters or search query.
                      </p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="followers" className="mt-0">
                  <div className="grid gap-6 md:grid-cols-2">
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <UserCard key={user.id} user={user} onFollowStatusChange={handleFollowStatusChange} />
                      ))
                    ) : (
                      <p className="text-muted-foreground col-span-2 text-center py-8">
                        No followers yet. As you engage with the community, people will start following you.
                      </p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="following" className="mt-0">
                  <div className="grid gap-6 md:grid-cols-2">
                    {connectionType !== "pages" &&
                      filteredUsers.map((user) => (
                        <UserCard key={user.id} user={user} onFollowStatusChange={handleFollowStatusChange} />
                      ))}
                    {(connectionType === "pages" || connectionType === "all") &&
                      filteredPages.map((page) => <PageCard key={page.id} page={page} />)}
                    {filteredUsers.length === 0 && filteredPages.length === 0 && (
                      <p className="text-muted-foreground col-span-2 text-center py-8">
                        You're not following anyone yet. Discover and connect with others in the community.
                      </p>
                    )}
                  </div>
                </TabsContent>
              </>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { db } from "@/lib/db"
import type { Page, PageCategory } from "@/lib/types"
import { Plus, Search, CheckCircle2, Users, Heart, Eye } from "lucide-react"
import Link from "next/link"

export default function PagesDirectory() {
  const router = useRouter()
  const { user } = useAuth()
  const [pages, setPages] = useState<Page[]>([])
  const [filteredPages, setFilteredPages] = useState<Page[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<PageCategory | "All">("All")
  const [sortBy, setSortBy] = useState<"newest" | "popular" | "trending">("newest")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPages = () => {
      try {
        const allPages = db.get("pages") || []
        setPages(allPages)
        setFilteredPages(allPages)
      } catch (error) {
        console.error("Error fetching pages:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPages()
  }, [])

  useEffect(() => {
    // Apply filters and sorting
    let result = [...pages]

    // Apply category filter
    if (categoryFilter !== "All") {
      result = result.filter((page) => page.category === categoryFilter)
    }

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (page) =>
          page.name.toLowerCase().includes(query) ||
          page.description.toLowerCase().includes(query) ||
          page.handle.toLowerCase().includes(query) ||
          page.tags.some((tag) => tag.toLowerCase().includes(query)),
      )
    }

    // Apply sorting
    switch (sortBy) {
      case "newest":
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case "popular":
        result.sort((a, b) => b.followers.length - a.followers.length)
        break
      case "trending":
        result.sort((a, b) => b.totalViews - a.totalViews)
        break
    }

    setFilteredPages(result)
  }, [pages, categoryFilter, searchQuery, sortBy])

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Pages Directory</h1>
          <p className="text-muted-foreground">Discover and follow pages created by the community</p>
        </div>

        {user && user.permissions?.canCreatePages && (
          <Button onClick={() => router.push("/pages/create")}>
            <Plus className="h-4 w-4 mr-2" />
            Create Page
          </Button>
        )}
      </div>

      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search pages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as PageCategory | "All")}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Categories</SelectItem>
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

            <Select value={sortBy} onValueChange={(value) => setSortBy(value as "newest" | "popular" | "trending")}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="popular">Most Followers</SelectItem>
                <SelectItem value="trending">Trending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-pulse">Loading pages...</div>
        </div>
      ) : filteredPages.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPages.map((page) => (
            <Card key={page.id} className="overflow-hidden">
              <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-500">
                {page.coverPhoto && (
                  <img
                    src={page.coverPhoto || "/placeholder.svg"}
                    alt={`${page.name} cover`}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <CardContent className="pt-4 pb-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16 border-4 border-background -mt-12">
                    <AvatarImage src={page.profilePhoto || "/placeholder.svg"} />
                    <AvatarFallback>{page.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 mt-1">
                    <div className="flex items-center gap-1">
                      <Link href={`/pages/${page.handle}`} className="font-semibold hover:underline">
                        {page.name}
                      </Link>
                      {page.verified && <CheckCircle2 className="h-4 w-4 text-blue-500" />}
                    </div>
                    <p className="text-sm text-muted-foreground">@{page.handle}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <Badge variant="outline">{page.category}</Badge>
                  {page.featured && (
                    <Badge variant="secondary" className="ml-2">
                      Featured
                    </Badge>
                  )}
                </div>

                <p className="mt-3 text-sm line-clamp-3">{page.description}</p>

                <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{page.followers.length}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      <span>{page.likes.length}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span>{page.totalViews}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <Button variant="outline" className="w-full" onClick={() => router.push(`/pages/${page.handle}`)}>
                    View Page
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <h2 className="text-xl font-semibold">No Pages Found</h2>
              <p className="text-muted-foreground mt-2">
                {searchQuery || categoryFilter !== "All"
                  ? "Try adjusting your search or filters"
                  : "Be the first to create a page!"}
              </p>

              {user && user.permissions?.canCreatePages && (
                <Button className="mt-4" onClick={() => router.push("/pages/create")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Page
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

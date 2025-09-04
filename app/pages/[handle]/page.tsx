"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { db } from "@/lib/db"
import type { Page, PageMedia } from "@/lib/types"
import {
  Heart,
  Users,
  Share2,
  Edit,
  ImageIcon,
  Video,
  MapPin,
  Mail,
  Phone,
  Globe,
  MessageCircle,
  Calendar,
  CheckCircle2,
  Upload,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"

export default function PageView() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [page, setPage] = useState<Page | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isOwner, setIsOwner] = useState(false)
  const [hasLiked, setHasLiked] = useState(false)
  const [hasFollowed, setHasFollowed] = useState(false)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [uploadType, setUploadType] = useState<"image" | "video">("image")
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadCaption, setUploadCaption] = useState("")
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    const fetchPage = () => {
      try {
        const pages = db.get("pages") || []
        const foundPage = pages.find((p: Page) => p.handle === params.handle)

        if (foundPage) {
          setPage(foundPage)

          // Update view count
          const updatedPages = pages.map((p: Page) => {
            if (p.id === foundPage.id) {
              return {
                ...p,
                totalViews: p.totalViews + 1,
              }
            }
            return p
          })
          db.set("pages", updatedPages)

          // Check if user is owner
          if (user && foundPage.createdBy === user.id) {
            setIsOwner(true)
          }

          // Check if user has liked or followed
          if (user) {
            setHasLiked(foundPage.likes.includes(user.id))
            setHasFollowed(foundPage.followers.includes(user.id))
          }
        } else {
          toast({
            title: "Page not found",
            description: "The page you're looking for doesn't exist",
            variant: "destructive",
          })
          router.push("/")
        }
      } catch (error) {
        console.error("Error fetching page:", error)
        toast({
          title: "Error",
          description: "Failed to load page. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchPage()
  }, [params.handle, router, user])

  const handleLike = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to like this page",
        variant: "destructive",
      })
      return
    }

    try {
      const pages = db.get("pages") || []
      const updatedPages = pages.map((p: Page) => {
        if (p.id === page?.id) {
          const likes = hasLiked ? p.likes.filter((id) => id !== user.id) : [...p.likes, user.id]

          return {
            ...p,
            likes,
          }
        }
        return p
      })

      db.set("pages", updatedPages)
      setPage((prev) =>
        prev
          ? {
              ...prev,
              likes: hasLiked ? prev.likes.filter((id) => id !== user.id) : [...prev.likes, user.id],
            }
          : null,
      )

      setHasLiked(!hasLiked)

      toast({
        title: hasLiked ? "Page Unliked" : "Page Liked",
        description: hasLiked ? "You have unliked this page" : "You have liked this page",
      })
    } catch (error) {
      console.error("Error liking page:", error)
      toast({
        title: "Error",
        description: "Failed to like page. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleFollow = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to follow this page",
        variant: "destructive",
      })
      return
    }

    try {
      const pages = db.get("pages") || []
      const updatedPages = pages.map((p: Page) => {
        if (p.id === page?.id) {
          const followers = hasFollowed ? p.followers.filter((id) => id !== user.id) : [...p.followers, user.id]

          return {
            ...p,
            followers,
          }
        }
        return p
      })

      db.set("pages", updatedPages)
      setPage((prev) =>
        prev
          ? {
              ...prev,
              followers: hasFollowed ? prev.followers.filter((id) => id !== user.id) : [...prev.followers, user.id],
            }
          : null,
      )

      setHasFollowed(!hasFollowed)

      toast({
        title: hasFollowed ? "Page Unfollowed" : "Page Followed",
        description: hasFollowed ? "You have unfollowed this page" : "You are now following this page",
      })
    } catch (error) {
      console.error("Error following page:", error)
      toast({
        title: "Error",
        description: "Failed to follow page. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: page?.name || "Check out this page",
          text: page?.description || "I found this interesting page",
          url: window.location.href,
        })
        .catch((err) => console.error("Error sharing:", err))
    } else {
      // Fallback for browsers that don't support navigator.share
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: "Link Copied",
        description: "Page link copied to clipboard",
      })
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (uploadType === "image" && !file.type.startsWith("image/")) {
        toast({
          title: "Invalid File",
          description: "Please select an image file",
          variant: "destructive",
        })
        return
      }

      if (uploadType === "video" && !file.type.startsWith("video/")) {
        toast({
          title: "Invalid File",
          description: "Please select a video file",
          variant: "destructive",
        })
        return
      }

      setUploadFile(file)
    }
  }

  const handleUpload = () => {
    if (!uploadFile) {
      toast({
        title: "No File Selected",
        description: "Please select a file to upload",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      // In a real app, you would upload to a storage service
      // For this demo, we'll use URL.createObjectURL
      const fileUrl = URL.createObjectURL(uploadFile)

      const newMedia: PageMedia = {
        id: Date.now().toString(),
        type: uploadType,
        url: fileUrl,
        caption: uploadCaption,
        uploadDate: new Date().toISOString(),
        likes: 0,
        comments: [],
      }

      const pages = db.get("pages") || []
      const updatedPages = pages.map((p: Page) => {
        if (p.id === page?.id) {
          return {
            ...p,
            media: [newMedia, ...p.media],
            updatedAt: new Date().toISOString(),
          }
        }
        return p
      })

      db.set("pages", updatedPages)

      setPage((prev) =>
        prev
          ? {
              ...prev,
              media: [newMedia, ...prev.media],
              updatedAt: new Date().toISOString(),
            }
          : null,
      )

      setUploadFile(null)
      setUploadCaption("")
      setShowUploadDialog(false)

      toast({
        title: "Upload Successful",
        description: `Your ${uploadType} has been uploaded successfully`,
      })
    } catch (error) {
      console.error("Error uploading file:", error)
      toast({
        title: "Upload Failed",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center">
        <div className="animate-pulse">Loading page...</div>
      </div>
    )
  }

  if (!page) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold">Page Not Found</h2>
              <p className="text-muted-foreground mt-2">The page you're looking for doesn't exist</p>
              <Button className="mt-4" onClick={() => router.push("/")}>
                Go Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      {/* Cover Photo and Profile Section */}
      <div className="relative mb-6">
        <div className="h-48 md:h-64 bg-gradient-to-r from-blue-500 to-purple-500 rounded-t-lg">
          {page.coverPhoto && (
            <img
              src={page.coverPhoto || "/placeholder.svg"}
              alt={`${page.name} cover`}
              className="w-full h-full object-cover rounded-t-lg"
            />
          )}
        </div>

        <div className="absolute -bottom-16 left-8">
          <Avatar className="h-32 w-32 border-4 border-background">
            <AvatarImage src={page.profilePhoto || "/placeholder.svg"} />
            <AvatarFallback className="text-4xl">{page.name[0]}</AvatarFallback>
          </Avatar>
        </div>
      </div>

      <Card className="mt-16">
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{page.name}</h1>
              {page.verified && <CheckCircle2 className="h-5 w-5 text-blue-500" />}
            </div>
            <p className="text-muted-foreground">@{page.handle}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline">{page.category}</Badge>
              {page.featured && <Badge variant="secondary">Featured</Badge>}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isOwner ? (
              <Button onClick={() => router.push(`/pages/${page.handle}/edit`)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Page
              </Button>
            ) : (
              <>
                <Button variant={hasLiked ? "default" : "outline"} onClick={handleLike}>
                  <Heart className={`h-4 w-4 mr-2 ${hasLiked ? "fill-current" : ""}`} />
                  {hasLiked ? "Liked" : "Like"}
                </Button>
                <Button variant={hasFollowed ? "default" : "outline"} onClick={handleFollow}>
                  <Users className="h-4 w-4 mr-2" />
                  {hasFollowed ? "Following" : "Follow"}
                </Button>
                <Button variant="outline" onClick={handleShare}>
                  <Share2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Stats */}
          <div className="flex flex-wrap gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{page.followers.length}</div>
              <div className="text-sm text-muted-foreground">Followers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{page.likes.length}</div>
              <div className="text-sm text-muted-foreground">Likes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{page.media.length}</div>
              <div className="text-sm text-muted-foreground">Posts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{page.totalViews}</div>
              <div className="text-sm text-muted-foreground">Views</div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h2 className="text-lg font-semibold mb-2">About</h2>
            <p className="whitespace-pre-wrap">{page.description}</p>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {page.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{page.location}</span>
              </div>
            )}
            {page.contactEmail && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${page.contactEmail}`} className="text-blue-500 hover:underline">
                  {page.contactEmail}
                </a>
              </div>
            )}
            {page.contactPhone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a href={`tel:${page.contactPhone}`} className="text-blue-500 hover:underline">
                  {page.contactPhone}
                </a>
              </div>
            )}
            {page.websiteUrl && (
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <a
                  href={page.websiteUrl.startsWith("http") ? page.websiteUrl : `https://${page.websiteUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  {page.websiteUrl}
                </a>
              </div>
            )}
          </div>

          {/* Created Info */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Created {formatDistanceToNow(new Date(page.createdAt))} ago</span>
          </div>

          {/* Content Tabs */}
          <Tabs defaultValue="media" className="mt-6">
            <div className="flex justify-between items-center">
              <TabsList>
                <TabsTrigger value="media">Media</TabsTrigger>
                <TabsTrigger value="about">Details</TabsTrigger>
              </TabsList>

              {isOwner && (
                <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Upload Media</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <Button
                          variant={uploadType === "image" ? "default" : "outline"}
                          onClick={() => setUploadType("image")}
                          className="flex-1"
                        >
                          <ImageIcon className="h-4 w-4 mr-2" />
                          Image
                        </Button>
                        <Button
                          variant={uploadType === "video" ? "default" : "outline"}
                          onClick={() => setUploadType("video")}
                          className="flex-1"
                        >
                          <Video className="h-4 w-4 mr-2" />
                          Video
                        </Button>
                      </div>

                      <Input
                        type="file"
                        accept={uploadType === "image" ? "image/*" : "video/*"}
                        onChange={handleFileChange}
                      />

                      <Textarea
                        placeholder="Add a caption..."
                        value={uploadCaption}
                        onChange={(e) => setUploadCaption(e.target.value)}
                      />

                      <Button onClick={handleUpload} disabled={!uploadFile || isUploading} className="w-full">
                        {isUploading ? "Uploading..." : "Upload"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            <TabsContent value="media" className="mt-4">
              {page.media.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {page.media.map((media) => (
                    <Card key={media.id} className="overflow-hidden">
                      <div className="aspect-square relative">
                        {media.type === "image" ? (
                          <img
                            src={media.url || "/placeholder.svg"}
                            alt={media.caption || "Page media"}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <video src={media.url} controls className="w-full h-full object-cover" />
                        )}
                      </div>
                      <CardContent className="p-3">
                        {media.caption && <p className="text-sm">{media.caption}</p>}
                        <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Heart className="h-4 w-4" />
                            <span>{media.likes}</span>
                            <MessageCircle className="h-4 w-4 ml-2" />
                            <span>{media.comments.length}</span>
                          </div>
                          <span>{formatDistanceToNow(new Date(media.uploadDate))} ago</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No media posts yet</p>
                  {isOwner && (
                    <Button variant="outline" className="mt-4" onClick={() => setShowUploadDialog(true)}>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Your First Post
                    </Button>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="about" className="mt-4">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">Description</h3>
                  <p className="mt-1">{page.description}</p>
                </div>

                {page.tags.length > 0 && (
                  <div>
                    <h3 className="font-semibold">Tags</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {page.tags.map((tag, index) => (
                        <Badge key={index} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold">Page Statistics</h3>
                  <ul className="mt-1 space-y-1">
                    <li>Created: {new Date(page.createdAt).toLocaleDateString()}</li>
                    <li>Last Updated: {new Date(page.updatedAt).toLocaleDateString()}</li>
                    <li>Total Views: {page.totalViews}</li>
                    <li>Total Followers: {page.followers.length}</li>
                    <li>Total Likes: {page.likes.length}</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

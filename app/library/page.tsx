"use client"

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { TooltipProvider } from "@/components/ui/tooltip"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { useAuth } from "@/contexts/AuthContext"
import { db } from "@/lib/db"
import { useToast } from "@/components/ui/use-toast"
import { useMobileDetection } from "@/hooks/use-mobile-detection"
import { ShareButtons } from "@/components/ShareButtons"
import {
  BookOpen,
  Upload,
  Search,
  BookmarkPlus,
  Grid,
  List,
  SlidersHorizontal,
  Crown,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Book,
  FileText,
  Atom,
  GraduationCap,
  Lightbulb,
  MoreHorizontal,
  Eye,
  ChevronLeft,
  ChevronRight,
  X,
  ImageIcon,
  Bookmark,
  Lock,
  Shield,
  Loader2,
  Users,
  Copy,
  Trash,
  Globe,
  Plus,
} from "lucide-react"
import { PaymentDialog } from "@/components/PaymentDialog"
import { Textarea } from "@/components/ui/textarea"
import { PDFViewer } from "@/components/PDFViewer"
import { Checkbox } from "@/components/ui/checkbox"
import { ResourceRating } from "@/components/library/ResourceRating"
import { ResourceCard } from "@/components/library/ResourceCard"
import { SponsorSection } from "@/components/sponsors/SponsorSection"

// Import the useSectionUpdate hook
import { useSectionUpdate } from "@/hooks/use-section-update"

// Version tracking
const LIBRARY_VERSION = "3.0.0"

type Resource = {
  id: string
  title: string
  description: string
  type: "notes" | "book" | "paper" | "assignment" | "project" | "quantum" | "skill"
  subject: string
  branch: string
  semester: number
  uploadedBy: {
    id: string
    name: string
    verification: "none" | "blue" | "golden"
  }
  verifiedBy?: {
    id: string
    name: string
    verification: "none" | "blue" | "golden"
  }
  uploadDate: string
  downloads: number
  rating: number
  totalRatings: number
  fileUrl: string
  thumbnailUrl?: string
  images: string[]
  tags: string[]
  isPremium: boolean
  price: number
  highlights?: string[]
  isVerified?: boolean
  verificationDate?: string
  verificationStatus?: "pending" | "verified" | "rejected"
  visibility?: "public" | "private" | "connections"
  bookmarks?: string[]
  ratings?: {
    userId: string
    rating: number
    comment?: string
    date: string
  }[]
  previewPages?: number
  totalPages?: number
  relatedResources?: string[]
  views?: number
}

type UserBookmark = {
  id: string
  userId: string
  resourceId: string
  dateAdded: string
  notes?: string
  collections?: string[]
}

type Collection = {
  id: string
  userId: string
  name: string
  description?: string
  resources: string[]
  isPublic: boolean
  createdAt: string
  updatedAt: string
}

const resourceCategories = [
  { id: "notes", name: "Notes", icon: FileText },
  { id: "quantum", name: "Quantum", icon: Atom },
  { id: "assignment", name: "Assignment", icon: Book },
  { id: "project", name: "Projects", icon: Lightbulb },
  { id: "book", name: "Course Books", icon: BookOpen },
  { id: "skill", name: "Skill Books", icon: GraduationCap },
  { id: "other", name: "Others", icon: MoreHorizontal },
]

export default function LibraryPage() {
  const { user, isAdmin, isSuperAdmin } = useAuth()
  const { isMobile, isAndroid } = useMobileDetection()
  const { toast } = useToast()
  const [resources, setResources] = useState<Resource[]>(() => {
    return (
      db.get("resources") || [
        {
          id: "1",
          title: "Data Structures and Algorithms",
          description: "Comprehensive notes covering all major data structures and algorithms",
          type: "notes",
          subject: "Computer Science",
          branch: "cse",
          semester: 3,
          uploadedBy: {
            id: "1",
            name: "Prof. Sharma",
            verification: "blue",
          },
          verifiedBy: {
            id: "admin1",
            name: "Dr. Patel",
            verification: "golden",
          },
          uploadDate: "2023-12-15",
          downloads: 245,
          rating: 4.7,
          totalRatings: 56,
          fileUrl: "/placeholder.pdf",
          thumbnailUrl: "/placeholder.svg?height=200&width=300&text=DSA+Notes",
          images: [
            "/placeholder.svg?height=200&width=300&text=DSA+Notes",
            "/placeholder.svg?height=200&width=300&text=DSA+Sample+Page",
          ],
          tags: ["algorithms", "data structures", "programming"],
          isPremium: true,
          price: 299,
          highlights: [
            "Complete coverage of all important algorithms",
            "Includes practice problems and solutions",
            "Exam preparation guide included",
          ],
          isVerified: true,
          verificationDate: "2023-12-20",
          verificationStatus: "verified",
          visibility: "public",
          bookmarks: ["user1", "user2"],
          ratings: [
            { userId: "user1", rating: 5, comment: "Excellent resource!", date: "2023-12-25" },
            { userId: "user2", rating: 4, comment: "Very helpful", date: "2023-12-28" },
          ],
          previewPages: 3,
          totalPages: 45,
          views: 1250,
        },
        {
          id: "2",
          title: "Introduction to Machine Learning",
          description: "Basic concepts and algorithms in machine learning",
          type: "book",
          subject: "Artificial Intelligence",
          branch: "cse",
          semester: 5,
          uploadedBy: {
            id: "2",
            name: "Dr. Gupta",
            verification: "golden",
          },
          uploadDate: "2024-01-10",
          downloads: 189,
          rating: 4.5,
          totalRatings: 42,
          fileUrl: "/placeholder.pdf",
          thumbnailUrl: "/placeholder.svg?height=200&width=300&text=ML+Book",
          images: [
            "/placeholder.svg?height=200&width=300&text=ML+Book",
            "/placeholder.svg?height=200&width=300&text=ML+Book+TOC",
            "/placeholder.svg?height=200&width=300&text=ML+Book+Chapter",
          ],
          tags: ["machine learning", "AI", "neural networks"],
          isPremium: false,
          price: 0,
          isVerified: true,
          verificationDate: "2024-01-15",
          verificationStatus: "verified",
          visibility: "public",
          bookmarks: [],
          ratings: [
            { userId: "user3", rating: 5, comment: "Great introduction!", date: "2024-01-20" },
            { userId: "user4", rating: 4, comment: "Well explained", date: "2024-01-22" },
          ],
          previewPages: 5,
          totalPages: 120,
          views: 890,
        },
        {
          id: "3",
          title: "Digital Electronics Fundamentals",
          description: "Complete guide to digital electronics with practical examples",
          type: "book",
          subject: "Electronics",
          branch: "ece",
          semester: 2,
          uploadedBy: {
            id: "3",
            name: "Prof. Kumar",
            verification: "blue",
          },
          uploadDate: "2023-11-05",
          downloads: 312,
          rating: 4.8,
          totalRatings: 78,
          fileUrl: "/placeholder.pdf",
          thumbnailUrl: "/placeholder.svg?height=200&width=300&text=Digital+Electronics",
          images: [
            "/placeholder.svg?height=200&width=300&text=Digital+Electronics",
            "/placeholder.svg?height=200&width=300&text=Digital+Electronics+Circuits",
          ],
          tags: ["electronics", "digital", "circuits"],
          isPremium: true,
          price: 499,
          highlights: [
            "Detailed circuit diagrams and explanations",
            "Includes simulation exercises",
            "Industry-standard practices covered",
          ],
          isVerified: true,
          verificationDate: "2023-11-15",
          verificationStatus: "verified",
          visibility: "public",
          bookmarks: ["user5"],
          ratings: [
            { userId: "user5", rating: 5, comment: "Best electronics book!", date: "2023-11-20" },
            { userId: "user6", rating: 5, comment: "Extremely detailed", date: "2023-11-25" },
          ],
          previewPages: 4,
          totalPages: 250,
          views: 1560,
        },
        {
          id: "4",
          title: "Quantum Computing Basics",
          description: "Introduction to quantum computing principles and algorithms",
          type: "quantum",
          subject: "Quantum Physics",
          branch: "cse",
          semester: 6,
          uploadedBy: {
            id: "4",
            name: "Dr. Agarwal",
            verification: "golden",
          },
          uploadDate: "2024-01-20",
          downloads: 156,
          rating: 4.9,
          totalRatings: 32,
          fileUrl: "/placeholder.pdf",
          thumbnailUrl: "/placeholder.svg?height=200&width=300&text=Quantum+Computing",
          images: [
            "/placeholder.svg?height=200&width=300&text=Quantum+Computing",
            "/placeholder.svg?height=200&width=300&text=Quantum+Computing+Algorithms",
            "/placeholder.svg?height=200&width=300&text=Quantum+Computing+Examples",
          ],
          tags: ["quantum", "computing", "physics"],
          isPremium: true,
          price: 599,
          highlights: [
            "Quantum gates and circuits explained",
            "Shor's and Grover's algorithms covered",
            "Quantum programming examples included",
          ],
          isVerified: false,
          verificationStatus: "pending",
          visibility: "public",
          bookmarks: ["user7", "user8"],
          ratings: [
            { userId: "user7", rating: 5, comment: "Mind-blowing content!", date: "2024-01-25" },
            { userId: "user8", rating: 5, comment: "Excellent explanations", date: "2024-01-28" },
          ],
          previewPages: 3,
          totalPages: 180,
          views: 720,
        },
      ]
    )
  })

  // Inside the component, after the resources state is defined
  // Add this line to use the hook
  useSectionUpdate("library", [resources.length])

  const [activeTab, setActiveTab] = useState("browse")
  const [filters, setFilters] = useState({
    branch: "",
    semester: "",
    type: "",
    subject: "",
    resourceType: "all", // all, free, premium
    verificationStatus: "all", // all, verified, unverified
    rating: 0, // minimum rating filter
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [showPremiumDialog, setShowPremiumDialog] = useState(false)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showFilters, setShowFilters] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [newResource, setNewResource] = useState<Partial<Resource>>({
    type: "notes",
    branch: "",
    semester: 1,
    subject: "",
    tags: [],
    isPremium: false,
    price: 0,
    images: [],
    visibility: "public",
    previewPages: 2,
  })
  const [activeCategory, setActiveCategory] = useState("all")
  const [showPdfViewer, setShowPdfViewer] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState<Record<string, number>>({})
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bookmarks, setBookmarks] = useState<UserBookmark[]>(() => db.get("bookmarks") || [])
  const [collections, setCollections] = useState<Collection[]>(() => db.get("collections") || [])
  const [showBookmarkDialog, setShowBookmarkDialog] = useState(false)
  const [bookmarkNote, setBookmarkNote] = useState("")
  const [selectedCollections, setSelectedCollections] = useState<string[]>([])
  const [showCollectionDialog, setShowCollectionDialog] = useState(false)
  const [newCollection, setNewCollection] = useState<Partial<Collection>>({
    name: "",
    description: "",
    isPublic: false,
    resources: [],
  })
  const [showRatingDialog, setShowRatingDialog] = useState(false)
  const [userRating, setUserRating] = useState(0)
  const [ratingComment, setRatingComment] = useState("")
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showVisibilityDialog, setShowVisibilityDialog] = useState(false)
  const [newVisibility, setNewVisibility] = useState<"public" | "private" | "connections">("public")
  const [showVerificationDialog, setShowVerificationDialog] = useState(false)
  const [verificationReason, setVerificationReason] = useState("")
  const [showPreviewDialog, setShowPreviewDialog] = useState(false)
  const [previewPage, setPreviewPage] = useState(1)
  const [isPreviewLoading, setIsPreviewLoading] = useState(false)
  const [sortOption, setSortOption] = useState<"newest" | "popular" | "rating" | "downloads">("newest")
  const [showRelatedResources, setShowRelatedResources] = useState(false)
  const [relatedResources, setRelatedResources] = useState<Resource[]>([])
  const [isImageLoading, setIsImageLoading] = useState<Record<string, boolean>>({})
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [shareUrl, setShareUrl] = useState("")
  const [shareTitle, setShareTitle] = useState("")
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMoreResources, setHasMoreResources] = useState(true)
  const [page, setPage] = useState(1)
  const resourcesPerPage = 12

  // Refs for file inputs and infinite scrolling
  const fileInputRef = useRef<HTMLInputElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  // Initialize intersection observer for infinite scrolling
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting && hasMoreResources && !isLoadingMore) {
          loadMoreResources()
        }
      },
      { threshold: 0.1 },
    )

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current)
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [hasMoreResources, isLoadingMore])

  // Function to load more resources (simulated pagination)
  const loadMoreResources = () => {
    setIsLoadingMore(true)

    // Simulate API call delay
    setTimeout(() => {
      setPage((prevPage) => prevPage + 1)

      // Check if we've reached the end of available resources
      if (page >= 3) {
        // Assuming we have 3 pages total
        setHasMoreResources(false)
      }

      setIsLoadingMore(false)
    }, 1000)
  }

  // Handle image loading state
  const handleImageLoad = (resourceId: string) => {
    setIsImageLoading((prev) => ({
      ...prev,
      [resourceId]: false,
    }))
  }

  const handleImageError = (resourceId: string) => {
    setIsImageLoading((prev) => ({
      ...prev,
      [resourceId]: false,
    }))
  }

  // Initialize image loading state for each resource
  useEffect(() => {
    const loadingState: Record<string, boolean> = {}
    resources.forEach((resource) => {
      loadingState[resource.id] = true
    })
    setIsImageLoading(loadingState)
  }, [resources])

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newResource.title || !newResource.branch || !newResource.subject) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    if (uploadedImages.length === 0) {
      toast({
        title: "Error",
        description: "Please upload at least one image",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    // Simulate upload delay
    setTimeout(() => {
      const resource: Resource = {
        id: Date.now().toString(),
        ...(newResource as any),
        uploadedBy: {
          id: user!.id,
          name: user!.name,
          verification: user!.verification,
        },
        uploadDate: new Date().toISOString(),
        downloads: 0,
        rating: 0,
        totalRatings: 0,
        fileUrl: "/placeholder.pdf", // In real app, upload file and get URL
        thumbnailUrl: uploadedImages[0],
        images: uploadedImages,
        tags: newResource.tags || [],
        isPremium: newResource.isPremium || false,
        price: newResource.isPremium ? newResource.price || 0 : 0,
        highlights: newResource.highlights || [],
        isVerified: false,
        verificationStatus: "pending",
        visibility: newResource.visibility || "public",
        bookmarks: [],
        ratings: [],
        views: 0,
        totalPages: Math.floor(Math.random() * 100) + 20, // Random page count for demo
      }

      const updatedResources = [...resources, resource]
      db.set("resources", updatedResources)
      setResources(updatedResources)
      setShowUploadDialog(false)
      setNewResource({
        type: "notes",
        branch: "",
        semester: 1,
        subject: "",
        tags: [],
        isPremium: false,
        price: 0,
        images: [],
        visibility: "public",
        previewPages: 2,
      })
      setUploadedImages([])
      setIsSubmitting(false)

      toast({
        title: "Success",
        description: "Resource uploaded successfully",
      })
    }, 1000)
  }

  const handleRead = (resource: Resource) => {
    // Increment view count
    const updatedResources = resources.map((r) => {
      if (r.id === resource.id) {
        return {
          ...r,
          views: (r.views || 0) + 1,
        }
      }
      return r
    })
    setResources(updatedResources)
    db.set("resources", updatedResources)

    if (resource.isPremium && !hasUserPurchased(resource.id)) {
      // For premium resources, show preview dialog first
      setSelectedResource(resource)
      setShowPreviewDialog(true)
      return
    }

    // Open the PDF viewer
    setSelectedResource(resource)
    setShowPdfViewer(true)
  }

  const handleRate = (resourceId: string, rating: number, comment = "") => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to rate this resource",
        variant: "destructive",
      })
      return
    }

    const updatedResources = resources.map((r) => {
      if (r.id === resourceId) {
        // Check if user has already rated
        const existingRatingIndex = r.ratings?.findIndex((rating) => rating.userId === user.id) ?? -1
        let newRatings = r.ratings || []

        if (existingRatingIndex >= 0) {
          // Update existing rating
          newRatings[existingRatingIndex] = {
            userId: user.id,
            rating,
            comment,
            date: new Date().toISOString(),
          }
        } else {
          // Add new rating
          newRatings = [
            ...(r.ratings || []),
            {
              userId: user.id,
              rating,
              comment,
              date: new Date().toISOString(),
            },
          ]
        }

        // Calculate new average rating
        const totalRating = newRatings.reduce((sum, r) => sum + r.rating, 0)
        const newAvgRating = totalRating / newRatings.length

        return {
          ...r,
          ratings: newRatings,
          rating: Number.parseFloat(newAvgRating.toFixed(1)),
          totalRatings: newRatings.length,
        }
      }
      return r
    })

    db.set("resources", updatedResources)
    setResources(updatedResources)
    setShowRatingDialog(false)
    setUserRating(0)
    setRatingComment("")

    toast({
      title: "Thank You",
      description: "Your rating has been recorded",
    })
  }

  const handleTogglePremium = (resource: Resource) => {
    if (!isAdmin && !isSuperAdmin) return

    setSelectedResource(resource)
    setShowPremiumDialog(true)
  }

  const handleUpdatePremiumStatus = (isPremium: boolean, price: number, highlights: string[]) => {
    if (!selectedResource) return

    const updatedResources = resources.map((r) => {
      if (r.id === selectedResource.id) {
        return {
          ...r,
          isPremium,
          price: isPremium ? price : 0,
          highlights: isPremium ? highlights : [],
        }
      }
      return r
    })

    db.set("resources", updatedResources)
    setResources(updatedResources)
    setShowPremiumDialog(false)
    setSelectedResource(null)

    toast({
      title: "Success",
      description: `Resource updated to ${isPremium ? "premium" : "free"}`,
    })
  }

  const handlePaymentComplete = (resourceId: string) => {
    // In a real app, record the purchase in the database
    const purchases = db.get("purchases") || []
    db.set("purchases", [
      ...purchases,
      {
        id: Date.now().toString(),
        userId: user?.id,
        resourceId,
        date: new Date().toISOString(),
        amount: selectedResource?.price || 0,
      },
    ])

    setShowPaymentDialog(false)

    // Open the PDF viewer after successful payment
    setShowPdfViewer(true)

    toast({
      title: "Purchase Successful",
      description: "You can now read this resource",
    })
  }

  const handleShare = (resource: Resource) => {
    setShareUrl(`${window.location.origin}/library/resource/${resource.id}`)
    setShareTitle(resource.title)
    setShowShareDialog(true)
  }

  const handleImageUpload = () => {
    // Simulate file upload with placeholder images
    if (uploadedImages.length >= 4) {
      toast({
        title: "Error",
        description: "You can upload a maximum of 4 images",
        variant: "destructive",
      })
      return
    }

    // Generate a random placeholder image
    const placeholderText = `Resource+${uploadedImages.length + 1}`
    const newImage = `/placeholder.svg?height=300&width=300&text=${placeholderText}`
    setUploadedImages([...uploadedImages, newImage])
  }

  const removeUploadedImage = (index: number) => {
    const newImages = [...uploadedImages]
    newImages.splice(index, 1)
    setUploadedImages(newImages)
  }

  const navigateImage = (resourceId: string, direction: "next" | "prev") => {
    const resource = resources.find((r) => r.id === resourceId)
    if (!resource) return

    const currentIndex = currentImageIndex[resourceId] || 0
    const totalImages = resource.images.length

    let newIndex
    if (direction === "next") {
      newIndex = (currentIndex + 1) % totalImages
    } else {
      newIndex = (currentIndex - 1 + totalImages) % totalImages
    }

    setCurrentImageIndex({
      ...currentImageIndex,
      [resourceId]: newIndex,
    })
  }

  const hasUserPurchased = (resourceId: string): boolean => {
    if (!user) return false

    // Check if the user is admin or super admin (they get access to all resources)
    if (isAdmin || isSuperAdmin) return true

    // Check if the user is the uploader
    const resource = resources.find((r) => r.id === resourceId)
    if (resource && resource.uploadedBy.id === user.id) return true

    // Check if the user has purchased this resource
    const purchases = db.get("purchases") || []
    return purchases.some((p: any) => p.userId === user.id && p.resourceId === resourceId)
  }

  const handleBookmark = (resource: Resource) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to bookmark resources",
        variant: "destructive",
      })
      return
    }

    // Check if already bookmarked
    const existingBookmark = bookmarks.find((b) => b.resourceId === resource.id && b.userId === user.id)

    if (existingBookmark) {
      // Remove bookmark
      const updatedBookmarks = bookmarks.filter((b) => !(b.resourceId === resource.id && b.userId === user.id))
      setBookmarks(updatedBookmarks)
      db.set("bookmarks", updatedBookmarks)

      // Update resource bookmarks array
      const updatedResources = resources.map((r) => {
        if (r.id === resource.id) {
          return {
            ...r,
            bookmarks: (r.bookmarks || []).filter((id) => id !== user.id),
          }
        }
        return r
      })
      setResources(updatedResources)
      db.set("resources", updatedResources)

      toast({
        title: "Bookmark Removed",
        description: "Resource removed from your bookmarks",
      })
    } else {
      // Show bookmark dialog to add notes and collections
      setSelectedResource(resource)
      setBookmarkNote("")
      setSelectedCollections([])
      setShowBookmarkDialog(true)
    }
  }

  const handleAddBookmark = () => {
    if (!user || !selectedResource) return

    // Create new bookmark
    const newBookmark: UserBookmark = {
      id: Date.now().toString(),
      userId: user.id,
      resourceId: selectedResource.id,
      dateAdded: new Date().toISOString(),
      notes: bookmarkNote || undefined,
      collections: selectedCollections.length > 0 ? selectedCollections : undefined,
    }

    // Add to bookmarks
    const updatedBookmarks = [...bookmarks, newBookmark]
    setBookmarks(updatedBookmarks)
    db.set("bookmarks", updatedBookmarks)

    // Update collections if selected
    if (selectedCollections.length > 0) {
      const updatedCollections = collections.map((collection) => {
        if (selectedCollections.includes(collection.id)) {
          return {
            ...collection,
            resources: [...collection.resources, selectedResource.id],
            updatedAt: new Date().toISOString(),
          }
        }
        return collection
      })
      setCollections(updatedCollections)
      db.set("collections", updatedCollections)
    }

    // Update resource bookmarks array
    const updatedResources = resources.map((r) => {
      if (r.id === selectedResource.id) {
        return {
          ...r,
          bookmarks: [...(r.bookmarks || []), user.id],
        }
      }
      return r
    })
    setResources(updatedResources)
    db.set("resources", updatedResources)

    setShowBookmarkDialog(false)

    toast({
      title: "Bookmarked",
      description: "Resource added to your bookmarks",
    })
  }

  const handleCreateCollection = () => {
    if (!user || !newCollection.name) return

    const collection: Collection = {
      id: Date.now().toString(),
      userId: user.id,
      name: newCollection.name,
      description: newCollection.description || "",
      resources: selectedResource ? [selectedResource.id] : [],
      isPublic: newCollection.isPublic || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const updatedCollections = [...collections, collection]
    setCollections(updatedCollections)
    db.set("collections", updatedCollections)

    // If creating from bookmark dialog, add to selected collections
    if (selectedResource) {
      setSelectedCollections([...selectedCollections, collection.id])
    }

    setShowCollectionDialog(false)
    setNewCollection({
      name: "",
      description: "",
      isPublic: false,
      resources: [],
    })

    toast({
      title: "Collection Created",
      description: "New collection created successfully",
    })
  }

  const handleDeleteResource = () => {
    if (!selectedResource || !user) return

    // Check if user is authorized (admin, superadmin, or resource owner)
    if (!isAdmin && !isSuperAdmin && selectedResource.uploadedBy.id !== user.id) {
      toast({
        title: "Unauthorized",
        description: "You don't have permission to delete this resource",
        variant: "destructive",
      })
      return
    }

    // Remove resource
    const updatedResources = resources.filter((r) => r.id !== selectedResource.id)
    setResources(updatedResources)
    db.set("resources", updatedResources)

    // Remove from bookmarks
    const updatedBookmarks = bookmarks.filter((b) => b.resourceId !== selectedResource.id)
    setBookmarks(updatedBookmarks)
    db.set("bookmarks", updatedBookmarks)

    // Remove from collections
    const updatedCollections = collections.map((collection) => ({
      ...collection,
      resources: collection.resources.filter((id) => id !== selectedResource.id),
    }))
    setCollections(updatedCollections)
    db.set("collections", updatedCollections)

    setShowDeleteDialog(false)
    setSelectedResource(null)

    toast({
      title: "Resource Deleted",
      description: "The resource has been permanently deleted",
    })
  }

  const handleUpdateVisibility = () => {
    if (!selectedResource || !user) return

    // Check if user is authorized (admin, superadmin, or resource owner)
    if (!isAdmin && !isSuperAdmin && selectedResource.uploadedBy.id !== user.id) {
      toast({
        title: "Unauthorized",
        description: "You don't have permission to modify this resource",
        variant: "destructive",
      })
      return
    }

    // Update visibility
    const updatedResources = resources.map((r) => {
      if (r.id === selectedResource.id) {
        return {
          ...r,
          visibility: newVisibility,
        }
      }
      return r
    })

    setResources(updatedResources)
    db.set("resources", updatedResources)
    setShowVisibilityDialog(false)

    toast({
      title: "Visibility Updated",
      description: `Resource is now ${newVisibility}`,
    })
  }

  const handleRequestVerification = () => {
    if (!selectedResource || !user) return

    // Update verification status
    const updatedResources = resources.map((r) => {
      if (r.id === selectedResource.id) {
        return {
          ...r,
          verificationStatus: "pending",
        }
      }
      return r
    })

    setResources(updatedResources)
    db.set("resources", updatedResources)
    setShowVerificationDialog(false)

    toast({
      title: "Verification Requested",
      description: "Your resource will be reviewed by our team",
    })
  }

  const handleVerifyResource = (resourceId: string, isVerified: boolean) => {
    if (!isAdmin && !isSuperAdmin) return

    const updatedResources = resources.map((r) => {
      if (r.id === resourceId) {
        return {
          ...r,
          isVerified,
          verificationStatus: isVerified ? "verified" : "rejected",
          verificationDate: new Date().toISOString(),
          verifiedBy: isVerified
            ? {
                id: user!.id,
                name: user!.name,
                verification: user!.verification,
              }
            : undefined,
        }
      }
      return r
    })

    setResources(updatedResources)
    db.set("resources", updatedResources)

    toast({
      title: isVerified ? "Resource Verified" : "Verification Rejected",
      description: isVerified ? "Resource has been verified" : "Resource verification has been rejected",
    })
  }

  const handlePreviewResource = () => {
    if (!selectedResource) return

    // If user has purchased, show full PDF
    if (hasUserPurchased(selectedResource.id)) {
      setShowPreviewDialog(false)
      setShowPdfViewer(true)
      return
    }

    // Otherwise, show payment dialog
    setShowPreviewDialog(false)
    setShowPaymentDialog(true)
  }

  const handleLoadPreviewPage = (page: number) => {
    if (!selectedResource) return

    setIsPreviewLoading(true)
    setPreviewPage(page)

    // Simulate loading delay
    setTimeout(() => {
      setIsPreviewLoading(false)
    }, 500)
  }

  const findRelatedResources = (resource: Resource) => {
    if (!resource) return []

    // Find resources with similar tags, subject, or type
    return resources
      .filter(
        (r) =>
          r.id !== resource.id &&
          (r.subject === resource.subject ||
            r.type === resource.type ||
            r.tags.some((tag) => resource.tags.includes(tag))),
      )
      .slice(0, 3) // Limit to 3 related resources
  }

  const isResourceBookmarked = (resourceId: string): boolean => {
    if (!user) return false
    return bookmarks.some((b) => b.resourceId === resourceId && b.userId === user.id)
  }

  const getUserRatingForResource = (resourceId: string): number => {
    if (!user) return 0

    const resource = resources.find((r) => r.id === resourceId)
    if (!resource || !resource.ratings) return 0

    const userRating = resource.ratings.find((r) => r.userId === user.id)
    return userRating ? userRating.rating : 0
  }

  const canManageResource = (resource: Resource): boolean => {
    if (!user) return false
    return isAdmin || isSuperAdmin || resource.uploadedBy.id === user.id
  }

  const sortResources = (resources: Resource[]): Resource[] => {
    switch (sortOption) {
      case "newest":
        return [...resources].sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())
      case "popular":
        return [...resources].sort((a, b) => (b.views || 0) - (a.views || 0))
      case "rating":
        return [...resources].sort((a, b) => b.rating - a.rating)
      case "downloads":
        return [...resources].sort((a, b) => b.downloads - a.downloads)
      default:
        return resources
    }
  }

  const filteredResources = resources.filter((resource) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      if (
        !resource.title.toLowerCase().includes(query) &&
        !resource.description?.toLowerCase().includes(query) &&
        !resource.subject.toLowerCase().includes(query) &&
        !resource.tags.some((tag) => tag.toLowerCase().includes(query))
      ) {
        return false
      }
    }

    if (activeCategory !== "all" && resource.type !== activeCategory) return false
    if (filters.branch && filters.branch !== "all" && resource.branch !== filters.branch) return false
    if (filters.semester && filters.semester !== "all" && resource.semester !== Number.parseInt(filters.semester))
      return false
    if (filters.type && resource.type !== filters.type) return false
    if (filters.subject && filters.subject !== "all" && resource.subject !== filters.subject) return false
    if (filters.resourceType === "free" && resource.isPremium) return false
    if (filters.resourceType === "premium" && !resource.isPremium) return false
    if (filters.verificationStatus === "verified" && !resource.isVerified) return false
    if (filters.verificationStatus === "unverified" && resource.isVerified) return false
    if (filters.rating > 0 && resource.rating < filters.rating) return false

    // For "my-uploads" tab, only show user's uploads
    if (activeTab === "my-uploads" && (!user || resource.uploadedBy.id !== user.id)) return false

    // For "bookmarks" tab, only show bookmarked resources
    if (activeTab === "bookmarks" && (!user || !isResourceBookmarked(resource.id))) return false

    return true
  })

  // Sort filtered resources
  const sortedResources = sortResources(filteredResources)

  // Get user's bookmarked resources
  const userBookmarks = user ? bookmarks.filter((bookmark) => bookmark.userId === user.id) : []

  // Get user's collections
  const userCollections = user ? collections.filter((collection) => collection.userId === user.id) : []

  return (
    <TooltipProvider>
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Library
                <span className="text-xs text-muted-foreground ml-2">v{LIBRARY_VERSION}</span>
              </CardTitle>
              <div className="flex gap-2">
                {showFilters && (
                  <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)} aria-label="Hide filters">
                    <X className="h-5 w-5" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowFilters(!showFilters)}
                  aria-label={showFilters ? "Hide filters" : "Show filters"}
                >
                  <SlidersHorizontal className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSearch(!showSearch)}
                  aria-label="Search resources"
                >
                  <Search className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowUploadDialog(true)}
                  aria-label="Upload resource"
                >
                  <Upload className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Search Bar (Conditional) */}
            {showSearch && (
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search resources..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            )}

            <SponsorSection section="library" className="mb-6" />

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="browse">Browse</TabsTrigger>
                <TabsTrigger value="bookmarks">Bookmarks</TabsTrigger>
                <TabsTrigger value="collections">Collections</TabsTrigger>
              </TabsList>

              <div className="mt-4 space-y-4">
                <div className="container mx-auto py-4 pb-20 md:pb-6">
                  {/* Resource Categories */}
                  <div className="mb-6">
                    <Card className="w-full">
                      <CardContent className="p-3">
                        <ScrollArea className="w-full whitespace-nowrap">
                          <div className="flex space-x-4 pb-2 ">
                            <Button
                              variant={activeCategory === "all" ? "default" : "outline"}
                              className="flex items-center gap-2"
                              onClick={() => setActiveCategory("all")}
                            >
                              All Resources
                            </Button>
                            {resourceCategories.map((category) => (
                              <Button
                                key={category.id}
                                variant={activeCategory === category.id ? "default" : "outline"}
                                size={isAndroid ? "sm" : "default"}
                                className={`flex items-center ${isAndroid ? "px-3" : ""}`}
                                onClick={() => setActiveCategory(category.id)}
                              >
                                <category.icon className="h-4 w-4 mr-2" />
                                {category.name}
                              </Button>
                            ))}
                          </div>
                          <ScrollBar orientation="horizontal" />
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="flex-1">
                    {/* Filters Panel */}
                    {showFilters && (
                      <Card className="mb-6">
                        <CardContent className="p-4">
                          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <div>
                              <Label htmlFor="branch-filter">Branch</Label>
                              <Select
                                value={filters.branch}
                                onValueChange={(value) => setFilters({ ...filters, branch: value })}
                              >
                                <SelectTrigger id="branch-filter">
                                  <SelectValue placeholder="Select Branch" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="all">All Branches</SelectItem>
                                  <SelectItem value="cse">Computer Science</SelectItem>
                                  <SelectItem value="ece">Electronics</SelectItem>
                                  <SelectItem value="me">Mechanical</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="semester-filter">Semester</Label>
                              <Select
                                value={filters.semester}
                                onValueChange={(value) => setFilters({ ...filters, semester: value })}
                              >
                                <SelectTrigger id="semester-filter">
                                  <SelectValue placeholder="Select Semester" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="all">All Semesters</SelectItem>
                                  {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                                    <SelectItem key={sem} value={sem.toString()}>
                                      Semester {sem}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="subject-filter">Subject</Label>
                              <Select
                                value={filters.subject}
                                onValueChange={(value) => setFilters({ ...filters, subject: value })}
                              >
                                <SelectTrigger id="subject-filter">
                                  <SelectValue placeholder="Select Subject" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="all">All Subjects</SelectItem>
                                  <SelectItem value="Computer Science">Computer Science</SelectItem>
                                  <SelectItem value="Artificial Intelligence">Artificial Intelligence</SelectItem>
                                  <SelectItem value="Electronics">Electronics</SelectItem>
                                  <SelectItem value="Mathematics">Mathematics</SelectItem>
                                  <SelectItem value="Physics">Physics</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="resource-type-filter">Resource Type</Label>
                              <Select
                                value={filters.resourceType}
                                onValueChange={(value) => setFilters({ ...filters, resourceType: value })}
                              >
                                <SelectTrigger id="resource-type-filter">
                                  <SelectValue placeholder="Resource Type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="all">All Resources</SelectItem>
                                  <SelectItem value="free">Free Only</SelectItem>
                                  <SelectItem value="premium">Premium Only</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="verification-filter">Verification</Label>
                              <Select
                                value={filters.verificationStatus}
                                onValueChange={(value) => setFilters({ ...filters, verificationStatus: value })}
                              >
                                <SelectTrigger id="verification-filter">
                                  <SelectValue placeholder="Verification Status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="all">All Resources</SelectItem>
                                  <SelectItem value="verified">Verified Only</SelectItem>
                                  <SelectItem value="unverified">Unverified Only</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="rating-filter">Minimum Rating</Label>
                              <Select
                                value={filters.rating.toString()}
                                onValueChange={(value) => setFilters({ ...filters, rating: Number.parseInt(value) })}
                              >
                                <SelectTrigger id="rating-filter">
                                  <SelectValue placeholder="Minimum Rating" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="0">Any Rating</SelectItem>
                                  <SelectItem value="3">3+ Stars</SelectItem>
                                  <SelectItem value="4">4+ Stars</SelectItem>
                                  <SelectItem value="5">5 Stars</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="sort-option">Sort By</Label>
                              <Select
                                value={sortOption}
                                onValueChange={(value: "newest" | "popular" | "rating" | "downloads") =>
                                  setSortOption(value)
                                }
                              >
                                <SelectTrigger id="sort-option">
                                  <SelectValue placeholder="Sort By" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="newest">Newest First</SelectItem>
                                  <SelectItem value="popular">Most Popular</SelectItem>
                                  <SelectItem value="rating">Highest Rated</SelectItem>
                                  <SelectItem value="downloads">Most Downloads</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>View</Label>
                              <div className="flex gap-2 mt-2">
                                <Button
                                  variant={viewMode === "grid" ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => setViewMode("grid")}
                                  className="flex-1"
                                  aria-label="Grid view"
                                  aria-pressed={viewMode === "grid"}
                                >
                                  <Grid className="h-4 w-4 mr-2" />
                                  Grid
                                </Button>
                                <Button
                                  variant={viewMode === "list" ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => setViewMode("list")}
                                  className="flex-1"
                                  aria-label="List view"
                                  aria-pressed={viewMode === "list"}
                                >
                                  <List className="h-4 w-4 mr-2" />
                                  List
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Tab Content */}
                    <TabsContent value="browse" className="mt-0">
                      {/* Resources Grid/List */}
                      <div
                        className={
                          viewMode === "grid"
                            ? `grid gap-4 ${isMobile ? "grid-cols-1" : "md:grid-cols-2 lg:grid-cols-3"}`
                            : "space-y-4"
                        }
                      >
                        {sortedResources.length > 0 ? (
                          sortedResources.map((resource) => (
                            <ResourceCard
                              key={resource.id}
                              resource={resource}
                              viewMode={viewMode}
                              isMobile={isMobile}
                              currentImageIndex={currentImageIndex[resource.id] || 0}
                              isImageLoading={isImageLoading[resource.id] || false}
                              isBookmarked={isResourceBookmarked(resource.id)}
                              userRating={getUserRatingForResource(resource.id)}
                              canManage={canManageResource(resource)}
                              hasUserPurchased={hasUserPurchased(resource.id)}
                              onImageLoad={() => handleImageLoad(resource.id)}
                              onImageError={() => handleImageError(resource.id)}
                              onNavigateImage={(direction: string) => navigateImage(resource.id, direction)}
                              onRead={() => handleRead(resource)}
                              onBookmark={() => handleBookmark(resource)}
                              onShare={() => handleShare(resource)}
                              onRate={() => {
                                setSelectedResource(resource)
                                setUserRating(getUserRatingForResource(resource.id))
                                setRatingComment("")
                                setShowRatingDialog(true)
                              }}
                              onDelete={() => {
                                setSelectedResource(resource)
                                setShowDeleteDialog(true)
                              }}
                              onToggleVisibility={() => {
                                setSelectedResource(resource)
                                setNewVisibility(resource.visibility || "public")
                                setShowVisibilityDialog(true)
                              }}
                              onRequestVerification={() => {
                                setSelectedResource(resource)
                                setVerificationReason("")
                                setShowVerificationDialog(true)
                              }}
                              onVerify={(isVerified: boolean) => handleVerifyResource(resource.id, isVerified)}
                              onTogglePremium={() => handleTogglePremium(resource)}
                            />
                          ))
                        ) : (
                          <div className="col-span-full text-center py-12">
                            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium">No resources found</h3>
                            <p className="text-muted-foreground mt-2">Try adjusting your filters or search query</p>
                          </div>
                        )}

                        {/* Load more indicator */}
                        {hasMoreResources && (
                          <div ref={loadMoreRef} className="col-span-full flex justify-center py-4">
                            {isLoadingMore ? (
                              <div className="flex items-center">
                                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                                <span>Loading more resources...</span>
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">Scroll for more</span>
                            )}
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="bookmarks" className="mt-0">
                      {user ? (
                        <>
                          {/* Collections Section */}
                          {userCollections.length > 0 && (
                            <div className="mb-8">
                              <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold">Your Collections</h3>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedResource(null)
                                    setShowCollectionDialog(true)
                                  }}
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  New Collection
                                </Button>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                {userCollections.map((collection) => (
                                  <Card key={collection.id}>
                                    <CardHeader className="pb-2">
                                      <CardTitle className="text-base">{collection.name}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="pb-2">
                                      <p className="text-sm text-muted-foreground line-clamp-2">
                                        {collection.description || "No description"}
                                      </p>
                                      <p className="text-sm mt-2">
                                        {collection.resources.length}{" "}
                                        {collection.resources.length === 1 ? "resource" : "resources"}
                                      </p>
                                    </CardContent>
                                    <CardFooter>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full bg-transparent"
                                        onClick={() => {
                                          // Filter resources to show only those in this collection
                                          setActiveTab("browse")
                                          // In a real app, you would implement a proper collection view
                                          toast({
                                            title: "Collection View",
                                            description: "This would show resources in this collection",
                                          })
                                        }}
                                      >
                                        View Collection
                                      </Button>
                                    </CardFooter>
                                  </Card>
                                ))}
                              </div>
                            </div>
                          )}
                          {/* Bookmarked Resources */}
                          <div className="mb-4">
                            <h3 className="text-lg font-semibold mb-4">Your Bookmarks</h3>

                            {userBookmarks.length > 0 ? (
                              <div
                                className={
                                  viewMode === "grid"
                                    ? `grid gap-4 ${isMobile ? "grid-cols-1" : "md:grid-cols-2 lg:grid-cols-3"}`
                                    : "space-y-4"
                                }
                              >
                                {userBookmarks.map((bookmark) => {
                                  const resource = resources.find((r) => r.id === bookmark.resourceId)
                                  if (!resource) return null

                                  return (
                                    <ResourceCard
                                      key={bookmark.id}
                                      resource={resource}
                                      viewMode={viewMode}
                                      isMobile={isMobile}
                                      currentImageIndex={currentImageIndex[resource.id] || 0}
                                      isImageLoading={isImageLoading[resource.id] || false}
                                      isBookmarked={true}
                                      userRating={getUserRatingForResource(resource.id)}
                                      canManage={canManageResource(resource)}
                                      hasUserPurchased={hasUserPurchased(resource.id)}
                                      bookmarkNote={bookmark.notes}
                                      onImageLoad={() => handleImageLoad(resource.id)}
                                      onImageError={() => handleImageError(resource.id)}
                                      onNavigateImage={(direction: string) => navigateImage(resource.id, direction)}
                                      onRead={() => handleRead(resource)}
                                      onBookmark={() => handleBookmark(resource)}
                                      onShare={() => handleShare(resource)}
                                      onRate={() => {
                                        setSelectedResource(resource)
                                        setUserRating(getUserRatingForResource(resource.id))
                                        setRatingComment("")
                                        setShowRatingDialog(true)
                                      }}
                                      onDelete={() => {
                                        setSelectedResource(resource)
                                        setShowDeleteDialog(true)
                                      }}
                                      onToggleVisibility={() => {
                                        setSelectedResource(resource)
                                        setNewVisibility(resource.visibility || "public")
                                        setShowVisibilityDialog(true)
                                      }}
                                      onRequestVerification={() => {
                                        setSelectedResource(resource)
                                        setVerificationReason("")
                                        setShowVerificationDialog(true)
                                      }}
                                      onVerify={(isVerified: boolean) => handleVerifyResource(resource.id, isVerified)}
                                      onTogglePremium={() => handleTogglePremium(resource)}
                                    />
                                  )
                                })}
                              </div>
                            ) : (
                              <div className="text-center py-12">
                                <Bookmark className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                <h3 className="text-lg font-medium">No bookmarks yet</h3>
                                <p className="text-muted-foreground mt-2">
                                  Bookmark resources to access them quickly later
                                </p>
                                <Button
                                  variant="outline"
                                  className="mt-4 bg-transparent"
                                  onClick={() => setActiveTab("browse")}
                                >
                                  Browse Resources
                                </Button>
                              </div>
                            )}
                          </div>

                          {/* Related Resources Suggestions */}
                          {userBookmarks.length > 0 && (
                            <div className="mt-8">
                              <h3 className="text-lg font-semibold mb-4">Recommended For You</h3>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {resources
                                  .filter((r) => !isResourceBookmarked(r.id))
                                  .filter((r) => {
                                    // Find resources similar to user's bookmarks
                                    return userBookmarks.some((bookmark) => {
                                      const bookmarkedResource = resources.find((res) => res.id === bookmark.resourceId)
                                      if (!bookmarkedResource) return false

                                      return (
                                        r.subject === bookmarkedResource.subject ||
                                        r.type === bookmarkedResource.type ||
                                        r.tags.some((tag) => bookmarkedResource.tags.includes(tag))
                                      )
                                    })
                                  })
                                  .slice(0, 3)
                                  .map((resource) => (
                                    <ResourceCard
                                      key={resource.id}
                                      resource={resource}
                                      viewMode="grid"
                                      isMobile={isMobile}
                                      currentImageIndex={currentImageIndex[resource.id] || 0}
                                      isImageLoading={isImageLoading[resource.id] || false}
                                      isBookmarked={false}
                                      userRating={getUserRatingForResource(resource.id)}
                                      canManage={canManageResource(resource)}
                                      hasUserPurchased={hasUserPurchased(resource.id)}
                                      onImageLoad={() => handleImageLoad(resource.id)}
                                      onImageError={() => handleImageError(resource.id)}
                                      onNavigateImage={(direction: string) => navigateImage(resource.id, direction)}
                                      onRead={() => handleRead(resource)}
                                      onBookmark={() => handleBookmark(resource)}
                                      onShare={() => handleShare(resource)}
                                      onRate={() => {
                                        setSelectedResource(resource)
                                        setUserRating(getUserRatingForResource(resource.id))
                                        setRatingComment("")
                                        setShowRatingDialog(true)
                                      }}
                                    />
                                  ))}
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-center py-12">
                          <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                          <h3 className="text-lg font-medium">Authentication Required</h3>
                          <p className="text-muted-foreground mt-2">Please log in to view your bookmarks</p>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="collections" className="mt-0">
                      {user ? (
                        <>
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Your Collections</h3>
                            <Button onClick={() => setShowCollectionDialog(true)}>
                              <Plus className="h-4 w-4 mr-2" />
                              Create New
                            </Button>
                          </div>

                          {userCollections.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {userCollections.map((collection) => (
                                <Card key={collection.id}>
                                  <CardHeader>
                                    <CardTitle>{collection.name}</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <p>{collection.description}</p>
                                    <p>{collection.resources.length} resources</p>
                                  </CardContent>
                                  <CardFooter>
                                    <Button>View Collection</Button>
                                  </CardFooter>
                                </Card>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-12">
                              <Bookmark className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                              <h3 className="text-lg font-medium">No collections yet</h3>
                              <p className="text-muted-foreground mt-2">
                                Create collections to organize your bookmarks
                              </p>
                              <Button
                                variant="outline"
                                className="mt-4 bg-transparent"
                                onClick={() => setShowCollectionDialog(true)}
                              >
                                Create Your First Collection
                              </Button>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-center py-12">
                          <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                          <h3 className="text-lg font-medium">Authentication Required</h3>
                          <p className="text-muted-foreground mt-2">Please log in to view your collections</p>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="my-uploads" className="mt-0">
                      {user ? (
                        <>
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Your Uploaded Resources</h3>
                            <Button onClick={() => setShowUploadDialog(true)}>
                              <Upload className="h-4 w-4 mr-2" />
                              Upload New
                            </Button>
                          </div>

                          {sortedResources.length > 0 ? (
                            <div
                              className={
                                viewMode === "grid"
                                  ? `grid gap-4 ${isMobile ? "grid-cols-1" : "md:grid-cols-2 lg:grid-cols-3"}`
                                  : "space-y-4"
                              }
                            >
                              {sortedResources.map((resource) => (
                                <ResourceCard
                                  key={resource.id}
                                  resource={resource}
                                  viewMode={viewMode}
                                  isMobile={isMobile}
                                  currentImageIndex={currentImageIndex[resource.id] || 0}
                                  isImageLoading={isImageLoading[resource.id] || false}
                                  isBookmarked={isResourceBookmarked(resource.id)}
                                  userRating={getUserRatingForResource(resource.id)}
                                  canManage={true} // Always true in my-uploads
                                  hasUserPurchased={true} // Always true for own uploads
                                  onImageLoad={() => handleImageLoad(resource.id)}
                                  onImageError={() => handleImageError(resource.id)}
                                  onNavigateImage={(direction: string) => navigateImage(resource.id, direction)}
                                  onRead={() => handleRead(resource)}
                                  onBookmark={() => handleBookmark(resource)}
                                  onShare={() => handleShare(resource)}
                                  onRate={() => {
                                    setSelectedResource(resource)
                                    setUserRating(getUserRatingForResource(resource.id))
                                    setRatingComment("")
                                    setShowRatingDialog(true)
                                  }}
                                  onDelete={() => {
                                    setSelectedResource(resource)
                                    setShowDeleteDialog(true)
                                  }}
                                  onToggleVisibility={() => {
                                    setSelectedResource(resource)
                                    setNewVisibility(resource.visibility || "public")
                                    setShowVisibilityDialog(true)
                                  }}
                                  onRequestVerification={() => {
                                    setSelectedResource(resource)
                                    setVerificationReason("")
                                    setShowVerificationDialog(true)
                                  }}
                                  onVerify={(isVerified: boolean) => handleVerifyResource(resource.id, isVerified)}
                                  onTogglePremium={() => handleTogglePremium(resource)}
                                  showManageOptions={true}
                                />
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-12">
                              <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                              <h3 className="text-lg font-medium">No uploads yet</h3>
                              <p className="text-muted-foreground mt-2">Share your knowledge by uploading resources</p>
                              <Button
                                variant="outline"
                                className="mt-4 bg-transparent"
                                onClick={() => setShowUploadDialog(true)}
                              >
                                Upload Your First Resource
                              </Button>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-center py-12">
                          <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                          <h3 className="text-lg font-medium">Authentication Required</h3>
                          <p className="text-muted-foreground mt-2">Please log in to view your uploads</p>
                        </div>
                      )}
                    </TabsContent>
                  </div>
                </div>
              </div>
            </Tabs>
          </CardContent>
        </Card>

        {/* Upload Dialog */}
        <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Upload Resource</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newResource.title || ""}
                  onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                  aria-required="true"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newResource.description || ""}
                  onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
                  placeholder="Describe your resource in detail"
                  className="min-h-[100px]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={newResource.type}
                    onValueChange={(value: any) => setNewResource({ ...newResource, type: value })}
                  >
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="notes">Notes</SelectItem>
                      <SelectItem value="book">Book</SelectItem>
                      <SelectItem value="paper">Paper</SelectItem>
                      <SelectItem value="assignment">Assignment</SelectItem>
                      <SelectItem value="project">Project</SelectItem>
                      <SelectItem value="quantum">Quantum</SelectItem>
                      <SelectItem value="skill">Skill Book</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="branch">Branch</Label>
                  <Select
                    value={newResource.branch}
                    onValueChange={(value) => setNewResource({ ...newResource, branch: value })}
                  >
                    <SelectTrigger id="branch">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cse">Computer Science</SelectItem>
                      <SelectItem value="ece">Electronics</SelectItem>
                      <SelectItem value="me">Mechanical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="semester">Semester</Label>
                  <Select
                    value={newResource.semester?.toString()}
                    onValueChange={(value) => setNewResource({ ...newResource, semester: Number.parseInt(value) })}
                  >
                    <SelectTrigger id="semester">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                        <SelectItem key={sem} value={sem.toString()}>
                          Semester {sem}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={newResource.subject || ""}
                    onChange={(e) => setNewResource({ ...newResource, subject: e.target.value })}
                    aria-required="true"
                  />
                </div>
              </div>

              {/* Tags Input */}
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input
                  id="tags"
                  placeholder="e.g. programming, algorithms, data structures"
                  value={(newResource.tags || []).join(", ")}
                  onChange={(e) =>
                    setNewResource({
                      ...newResource,
                      tags: e.target.value
                        .split(",")
                        .map((tag) => tag.trim())
                        .filter((tag) => tag),
                    })
                  }
                />
              </div>

              {/* Image Upload Section */}
              <div className="space-y-2">
                <Label>Resource Images (2-4 images)</Label>
                <div className="grid grid-cols-4 gap-2">
                  {uploadedImages.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`Resource image ${index + 1}`}
                        className="w-full aspect-square object-cover rounded-md border"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6"
                        onClick={() => removeUploadedImage(index)}
                        aria-label="Remove image"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}

                  {uploadedImages.length < 4 && (
                    <div
                      className="border-2 border-dashed border-muted-foreground/25 rounded-md flex items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors aspect-square"
                      onClick={handleImageUpload}
                      role="button"
                      tabIndex={0}
                      aria-label="Add image"
                    >
                      <div className="flex flex-col items-center">
                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground mt-1">Add</span>
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Upload 2-4 images of your resource (cover, sample pages, etc.)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="file">PDF File</Label>
                <Input id="file" type="file" accept=".pdf" ref={fileInputRef} aria-label="Upload PDF file" />
              </div>

              {/* Visibility options */}
              <div className="space-y-2">
                <Label htmlFor="visibility">Visibility</Label>
                <Select
                  value={newResource.visibility}
                  onValueChange={(value: "public" | "private" | "connections") =>
                    setNewResource({ ...newResource, visibility: value })
                  }
                >
                  <SelectTrigger id="visibility">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">
                      <div className="flex items-center">
                        <Globe className="h-4 w-4 mr-2" />
                        <span>Public (Everyone can see)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="connections">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        <span>Connections Only</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="private">
                      <div className="flex items-center">
                        <Lock className="h-4 w-4 mr-2" />
                        <span>Private (Only you)</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Premium options (only for admins) */}
              {(isAdmin || isSuperAdmin) && (
                <div className="space-y-4 border-t pt-4 mt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="isPremium" className="text-base">
                        Premium Resource
                      </Label>
                      <p className="text-sm text-muted-foreground">Make this a paid resource</p>
                    </div>
                    <Switch
                      id="isPremium"
                      checked={newResource.isPremium}
                      onCheckedChange={(checked) => setNewResource({ ...newResource, isPremium: checked })}
                    />
                  </div>

                  {newResource.isPremium && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="price">Price (₹)</Label>
                        <Input
                          id="price"
                          type="number"
                          min="0"
                          step="1"
                          value={newResource.price || 0}
                          onChange={(e) => setNewResource({ ...newResource, price: Number(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="previewPages">Free Preview Pages</Label>
                        <Input
                          id="previewPages"
                          type="number"
                          min="0"
                          max="10"
                          value={newResource.previewPages || 2}
                          onChange={(e) => setNewResource({ ...newResource, previewPages: Number(e.target.value) })}
                        />
                        <p className="text-xs text-muted-foreground">
                          Number of pages users can preview before purchasing
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label>Premium Highlights (one per line)</Label>
                        <Textarea
                          placeholder="Enter key highlights of this premium resource"
                          value={(newResource.highlights || []).join("\n")}
                          onChange={(e) =>
                            setNewResource({
                              ...newResource,
                              highlights: e.target.value.split("\n").filter((line) => line.trim() !== ""),
                            })
                          }
                          rows={3}
                        />
                      </div>
                    </>
                  )}
                </div>
              )}

              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    "Upload"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Premium Settings Dialog */}
        <Dialog open={showPremiumDialog} onOpenChange={setShowPremiumDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Premium Resource Settings</DialogTitle>
            </DialogHeader>
            {selectedResource && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="resourcePremium" className="text-base">
                      Premium Status
                    </Label>
                    <p className="text-sm text-muted-foreground">Make this a paid resource</p>
                  </div>
                  <Switch
                    id="resourcePremium"
                    checked={selectedResource.isPremium}
                    onCheckedChange={(checked) =>
                      setSelectedResource({
                        ...selectedResource,
                        isPremium: checked,
                        price: checked ? selectedResource.price || 99 : 0,
                      })
                    }
                  />
                </div>

                {selectedResource.isPremium && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="resourcePrice">Price (₹)</Label>
                      <Input
                        id="resourcePrice"
                        type="number"
                        min="0"
                        step="1"
                        value={selectedResource.price || 0}
                        onChange={(e) =>
                          setSelectedResource({
                            ...selectedResource,
                            price: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="previewPages">Free Preview Pages</Label>
                      <Input
                        id="previewPages"
                        type="number"
                        min="0"
                        max="10"
                        value={selectedResource.previewPages || 2}
                        onChange={(e) =>
                          setSelectedResource({
                            ...selectedResource,
                            previewPages: Number(e.target.value),
                          })
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        Number of pages users can preview before purchasing
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>Premium Highlights (one per line)</Label>
                      <Textarea
                        placeholder="Enter key highlights of this premium resource"
                        value={(selectedResource.highlights || []).join("\n")}
                        onChange={(e) =>
                          setSelectedResource({
                            ...selectedResource,
                            highlights: e.target.value.split("\n").filter((line) => line.trim() !== ""),
                          })
                        }
                        rows={3}
                      />
                    </div>
                  </>
                )}

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowPremiumDialog(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={() =>
                      handleUpdatePremiumStatus(
                        selectedResource.isPremium,
                        selectedResource.price || 0,
                        selectedResource.highlights || [],
                      )
                    }
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Payment Dialog */}
        {selectedResource && (
          <PaymentDialog
            open={showPaymentDialog}
            onOpenChange={setShowPaymentDialog}
            resource={selectedResource}
            onPaymentComplete={() => handlePaymentComplete(selectedResource.id)}
          />
        )}

        {/* PDF Viewer */}
        {selectedResource && showPdfViewer && (
          <PDFViewer
            fileUrl={selectedResource.fileUrl}
            title={selectedResource.title}
            onClose={() => setShowPdfViewer(false)}
          />
        )}

        {/* Rating Dialog */}
        <Dialog open={showRatingDialog} onOpenChange={setShowRatingDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Rate Resource</DialogTitle>
              <DialogDescription>Share your feedback about this resource</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Your Rating</Label>
                <div className="flex items-center justify-center gap-2">
                  <ResourceRating rating={userRating} onRatingChange={setUserRating} interactive size="large" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="comment">Comment (Optional)</Label>
                <Textarea
                  id="comment"
                  placeholder="Share your thoughts about this resource"
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRatingDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => selectedResource && handleRate(selectedResource.id, userRating, ratingComment)}
                disabled={userRating === 0}
              >
                Submit Rating
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Bookmark Dialog */}
        <Dialog open={showBookmarkDialog} onOpenChange={setShowBookmarkDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Bookmark Resource</DialogTitle>
              <DialogDescription>Save this resource to your bookmarks</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="bookmark-note">Notes (Optional)</Label>
                <Textarea
                  id="bookmark-note"
                  placeholder="Add a note about why you're saving this resource"
                  value={bookmarkNote}
                  onChange={(e) => setBookmarkNote(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Add to Collections</Label>
                  <Button variant="ghost" size="sm" onClick={() => setShowCollectionDialog(true)}>
                    <Plus className="h-4 w-4 mr-1" />
                    New
                  </Button>
                </div>

                {userCollections.length > 0 ? (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {userCollections.map((collection) => (
                      <div key={collection.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`collection-${collection.id}`}
                          checked={selectedCollections.includes(collection.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedCollections([...selectedCollections, collection.id])
                            } else {
                              setSelectedCollections(selectedCollections.filter((id) => id !== collection.id))
                            }
                          }}
                        />
                        <Label htmlFor={`collection-${collection.id}`} className="text-sm font-normal cursor-pointer">
                          {collection.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No collections yet. Create one to organize your bookmarks.
                  </p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowBookmarkDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddBookmark}>
                <BookmarkPlus className="h-4 w-4 mr-2" />
                Bookmark
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Collection Dialog */}
        <Dialog open={showCollectionDialog} onOpenChange={setShowCollectionDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Collection</DialogTitle>
              <DialogDescription>Create a new collection to organize your bookmarks</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="collection-name">Collection Name</Label>
                <Input
                  id="collection-name"
                  placeholder="e.g., Machine Learning Resources"
                  value={newCollection.name}
                  onChange={(e) => setNewCollection({ ...newCollection, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="collection-description">Description (Optional)</Label>
                <Textarea
                  id="collection-description"
                  placeholder="Describe what this collection is about"
                  value={newCollection.description}
                  onChange={(e) => setNewCollection({ ...newCollection, description: e.target.value })}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="collection-public"
                  checked={newCollection.isPublic}
                  onCheckedChange={(checked) => setNewCollection({ ...newCollection, isPublic: checked as boolean })}
                />
                <Label htmlFor="collection-public" className="text-sm font-normal cursor-pointer">
                  Make this collection public
                </Label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCollectionDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateCollection} disabled={!newCollection.name}>
                Create Collection
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Resource Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Delete Resource</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this resource? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              {selectedResource && (
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-md overflow-hidden">
                    <img
                      src={selectedResource.thumbnailUrl || "/placeholder.svg"}
                      alt={selectedResource.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-medium">{selectedResource.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      Uploaded on {new Date(selectedResource.uploadDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteResource}>
                <Trash className="h-4 w-4 mr-2" />
                Delete Resource
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Visibility Dialog */}
        <Dialog open={showVisibilityDialog} onOpenChange={setShowVisibilityDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Change Visibility</DialogTitle>
              <DialogDescription>Control who can see this resource</DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="visibility-public"
                    name="visibility"
                    value="public"
                    checked={newVisibility === "public"}
                    onChange={() => setNewVisibility("public")}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="visibility-public" className="flex items-center cursor-pointer">
                    <Globe className="h-4 w-4 mr-2" />
                    <div>
                      <span className="font-medium">Public</span>
                      <p className="text-xs text-muted-foreground">Everyone can see this resource</p>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="visibility-connections"
                    name="visibility"
                    value="connections"
                    checked={newVisibility === "connections"}
                    onChange={() => setNewVisibility("connections")}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="visibility-connections" className="flex items-center cursor-pointer">
                    <Users className="h-4 w-4 mr-2" />
                    <div>
                      <span className="font-medium">Connections Only</span>
                      <p className="text-xs text-muted-foreground">Only your connections can see this resource</p>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="visibility-private"
                    name="visibility"
                    value="private"
                    checked={newVisibility === "private"}
                    onChange={() => setNewVisibility("private")}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="visibility-private" className="flex items-center cursor-pointer">
                    <Lock className="h-4 w-4 mr-2" />
                    <div>
                      <span className="font-medium">Private</span>
                      <p className="text-xs text-muted-foreground">Only you can see this resource</p>
                    </div>
                  </Label>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowVisibilityDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateVisibility}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Verification Dialog */}
        <Dialog open={showVerificationDialog} onOpenChange={setShowVerificationDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Request Verification</DialogTitle>
              <DialogDescription>Submit your resource for verification to get a verified badge</DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium">Why Verify?</h4>
                  <p className="text-sm text-muted-foreground">
                    Verified resources are marked with a badge and rank higher in search results
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="verification-reason">Why should this resource be verified?</Label>
                <Textarea
                  id="verification-reason"
                  placeholder="Explain why this resource is accurate, high-quality, and valuable to others"
                  value={verificationReason}
                  onChange={(e) => setVerificationReason(e.target.value)}
                  rows={4}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowVerificationDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleRequestVerification} disabled={!verificationReason}>
                Submit for Verification
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Preview Dialog */}
        <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>Resource Preview</DialogTitle>
              <DialogDescription>
                Preview the first {selectedResource?.previewPages || 2} pages of this premium resource
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-4">
              {selectedResource && (
                <>
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{selectedResource.title}</h3>
                    <Badge variant="secondary" className="bg-amber-500 text-white">
                      <Crown className="h-3 w-3 mr-1" />
                      Premium
                    </Badge>
                  </div>

                  <div className="relative aspect-[3/4] bg-gray-100 rounded-md overflow-hidden">
                    {isPreviewLoading ? (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      </div>
                    ) : (
                      <>
                        <img
                          src={`/placeholder.svg?height=600&width=450&text=Preview+Page+${previewPage}`}
                          alt={`Preview page ${previewPage}`}
                          className="w-full h-full object-contain"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 text-center text-sm">
                          Page {previewPage} of {selectedResource.previewPages}
                          {selectedResource.totalPages && (
                            <span className="text-gray-300"> (Total: {selectedResource.totalPages} pages)</span>
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleLoadPreviewPage(Math.max(1, previewPage - 1))}
                      disabled={previewPage <= 1 || isPreviewLoading}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleLoadPreviewPage(Math.min(selectedResource.previewPages || 2, previewPage + 1))
                      }
                      disabled={previewPage >= (selectedResource.previewPages || 2) || isPreviewLoading}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>

                  <div className="bg-amber-50 dark:bg-amber-950/20 p-3 rounded-md">
                    <h4 className="text-sm font-medium flex items-center gap-1 text-amber-700 dark:text-amber-400">
                      <Sparkles className="h-3 w-3" />
                      Premium Resource Highlights
                    </h4>
                    <ul className="text-xs space-y-1 mt-2 text-amber-700 dark:text-amber-400">
                      {selectedResource.highlights?.map((highlight, idx) => (
                        <li key={idx} className="flex items-start gap-1">
                          <CheckCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPreviewDialog(false)}>
                Close Preview
              </Button>
              <Button onClick={handlePreviewResource}>
                {hasUserPurchased(selectedResource?.id || "") ? (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Read Full Resource
                  </>
                ) : (
                  <>
                    <Crown className="h-4 w-4 mr-2" />
                    Purchase (₹{selectedResource?.price})
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Share Dialog */}
        <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Share Resource</DialogTitle>
              <DialogDescription>Share this resource with others</DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-4">
              <div className="flex items-center space-x-2">
                <Input value={shareUrl} readOnly onClick={(e) => e.currentTarget.select()} />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    navigator.clipboard.writeText(shareUrl)
                    toast({
                      title: "Link Copied",
                      description: "Resource link copied to clipboard",
                    })
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              <div>
                <Label className="mb-2 block">Share on social media</Label>
                <ShareButtons url={shareUrl} title={shareTitle} open={false} onOpenChange={function (open: boolean): void {
                  throw new Error("Function not implemented.")
                } } />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}

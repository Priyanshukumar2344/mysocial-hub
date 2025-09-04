"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import {
  MessageCircle,
  Share,
  MoreHorizontal,
  ImageIcon,
  Smile,
  Send,
  BookmarkIcon,
  Users,
  User,
  Calendar,
  Briefcase,
  TrendingUp,
  Award,
  Clock,
  ThumbsUp,
  Lightbulb,
  Sparkles,
  Filter,
  X,
  Video,
  Twitter,
  Facebook,
  Linkedin,
  Copy,
  Reply,
  Globe,
  Lock,
  UserCheck,
  AlertCircle,
  RefreshCw,
  ChevronDown,
  Plus,
  Star,
  Zap,
} from "lucide-react"
import { useMobileDetection } from "@/hooks/use-mobile-detection"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { useSectionUpdate } from "@/hooks/use-section-update"
import { useAuth } from "@/contexts/AuthContext"
import { useSectionNotifications } from "@/contexts/SectionNotificationsContext"
import { createNotification } from "@/lib/notifications"
import Link from "next/link"

import { SocialSponsorCard } from "@/components/SocialSponsorCard"

// Version tracking
const VERSION = "5.0.0"

type Comment = {
  id: string
  author: {
    id: string
    name: string
    avatar?: string
    role: string
  }
  content: string
  timestamp: string
  likes: number
  replies: Comment[]
  isLiked: boolean
}

type Post = {
  id: string
  author: {
    id: string
    name: string
    avatar?: string
    role: string
  }
  content: string
  images?: string[]
  videos?: string[]
  timestamp: string
  reactions: {
    thumbsUp: number
    insightful: number
    brilliant: number
  }
  comments: Comment[]
  shares: number
  userReaction?: "thumbsUp" | "insightful" | "brilliant" | null
  saved: boolean
  type?: "general" | "daily-update" | "achievement"
  tags?: string[]
  visibility: "public" | "followers" | "private"
}

type SuggestedUser = {
  id: string
  name: string
  avatar?: string
  role: string
  department?: string
  year?: string
  bio?: string
  followers: number
  following: number
  badges?: number
  impactScore?: number // New metric for top contributors
}

type BadgeEarner = {
  id: string
  name: string
  avatar?: string
  badgeName: string
  badgeIcon: string
  timestamp: string
}

// Number of posts to load per page
const POSTS_PER_PAGE = 5

export default function SocialPage() {
  const { toast } = useToast()
  const { isMobile, isAndroid } = useMobileDetection()
  const { user: currentUser } = useAuth()
  const { addSectionUpdate } = useSectionNotifications()
  const [activeCategory, setActiveCategory] = useState("all-posts")
  const [activePostType, setActivePostType] = useState("all")
  const [postType, setPostType] = useState<"general" | "daily-update" | "achievement">("general")
  const [newPostContent, setNewPostContent] = useState("")
  const [progressValue, setProgressValue] = useState(0)
  const [showReactionMenu, setShowReactionMenu] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(isMobile)
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [uploadedVideos, setUploadedVideos] = useState<string[]>([])
  const [postVisibility, setPostVisibility] = useState<"public" | "followers" | "private">("public")
  const [showShareDialog, setShowShareDialog] = useState<string | null>(null)
  const [showCommentInput, setShowCommentInput] = useState<string | null>(null)
  const [commentText, setCommentText] = useState("")
  const [replyToComment, setReplyToComment] = useState<{ postId: string; commentId: string } | null>(null)
  const [replyText, setReplyText] = useState("")
  const [expandedComments, setExpandedComments] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const reactionMenuRef = useRef<HTMLDivElement>(null)
  const [badgeEarners, setBadgeEarners] = useState<BadgeEarner[]>([])
  const [showNewBadgeAlert, setShowNewBadgeAlert] = useState(false)
  const [currentBadgeEarner, setCurrentBadgeEarner] = useState<BadgeEarner | null>(null)
  const [showAllReactions, setShowAllReactions] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const [showCreatePostDialog, setShowCreatePostDialog] = useState(false) // State for mobile FAB

  // Close reaction menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (reactionMenuRef.current && !reactionMenuRef.current.contains(event.target as Node)) {
        setShowReactionMenu(null)
        setShowAllReactions(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const [allPosts, setAllPosts] = useState<Post[]>([
    {
      id: "1",
      author: {
        id: "user1",
        name: "Rahul Sharma",
        avatar: "/placeholder.svg?height=40&width=40&text=RS",
        role: "Student, CSE",
      },
      content:
        "Just submitted my final project for the AI course! The model achieved 95% accuracy on the test dataset. #AI #MachineLearning",
      images: ["/placeholder.svg?height=300&width=500&text=AI+Project"],
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      reactions: {
        thumbsUp: 28,
        insightful: 15,
        brilliant: 8,
      },
      comments: [
        {
          id: "comment1",
          author: {
            id: "user2",
            name: "Priya Reddy",
            avatar: "/placeholder.svg?height=40&width=40&text=PR",
            role: "Professor, Computer Science",
          },
          content: "Excellent work! What techniques did you use to improve the accuracy?",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(), // 1 hour ago
          likes: 5,
          replies: [],
          isLiked: false,
        },
        {
          id: "comment2",
          author: {
            id: "user3",
            name: "Aditya Kumar",
            avatar: "/placeholder.svg?height=40&width=40&text=AK",
            role: "Student, CSE",
          },
          content: "This is amazing! Could you share your approach?",
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
          likes: 3,
          replies: [
            {
              id: "reply1",
              author: {
                id: "user1",
                name: "Rahul Sharma",
                avatar: "/placeholder.svg?height=40&width=40&text=RS",
                role: "Student, CSE",
              },
              content: "I used a combination of transfer learning with fine-tuning and data augmentation.",
              timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
              likes: 2,
              replies: [],
              isLiked: false,
            },
          ],
          isLiked: true,
        },
      ],
      shares: 2,
      userReaction: "thumbsUp",
      saved: false,
      type: "achievement",
      tags: ["AI", "MachineLearning", "Project"],
      visibility: "public",
    },
    {
      id: "2",
      author: {
        id: "user2",
        name: "Priya Reddy",
        avatar: "/placeholder.svg?height=40&width=40&text=PR",
        role: "Professor, Computer Science",
      },
      content:
        "Reminder: The submission deadline for the semester project is this Friday. Make sure to upload your reports to the portal before 11:59 PM.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
      reactions: {
        thumbsUp: 12,
        insightful: 5,
        brilliant: 1,
      },
      comments: [],
      shares: 7,
      userReaction: null,
      saved: true,
      type: "general",
      visibility: "followers",
    },
    {
      id: "3",
      author: {
        id: "user3",
        name: "Student Council",
        avatar: "/placeholder.svg?height=40&width=40&text=SC",
        role: "Official",
      },
      content:
        "The annual cultural fest 'Rhythms 2024' will be held from March 15-17. Registration for various events is now open! Visit the link in bio to register. #Rhythms2024 #CulturalFest",
      images: ["/placeholder.svg?height=300&width=500&text=Cultural+Fest+Poster"],
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
      reactions: {
        thumbsUp: 45,
        insightful: 12,
        brilliant: 19,
      },
      comments: [
        {
          id: "comment3",
          author: {
            id: "user4",
            name: "Arjun Singh",
            avatar: "/placeholder.svg?height=40&width=40&text=AS",
            role: "Student, Electronics",
          },
          content: "Looking forward to the dance competition! When will the schedule be released?",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
          likes: 8,
          replies: [],
          isLiked: false,
        },
      ],
      shares: 25,
      userReaction: null,
      saved: false,
      type: "general",
      tags: ["Rhythms2024", "CulturalFest"],
      visibility: "public",
    },
    {
      id: "4",
      author: {
        id: "user4",
        name: "Aditya Kumar",
        avatar: "/placeholder.svg?height=40&width=40&text=AK",
        role: "Student, CSE",
      },
      content:
        "📊 Daily Update: Made significant progress on my database project today. Completed the schema design and implemented the first set of queries. Planning to work on the frontend tomorrow. #DailyProgress #DatabaseProject",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
      reactions: {
        thumbsUp: 18,
        insightful: 5,
        brilliant: 1,
      },
      comments: [],
      shares: 3,
      userReaction: null,
      saved: false,
      type: "daily-update",
      tags: ["DailyProgress", "DatabaseProject"],
      visibility: "followers",
    },
    {
      id: "5",
      author: {
        id: "user5",
        name: "Neha Gupta",
        avatar: "/placeholder.svg?height=40&width=40&text=NG",
        role: "Student, CSE",
      },
      content:
        "Just finished reading 'Clean Code' by Robert C. Martin. Highly recommend it to all CS students! It's changed how I think about writing maintainable code. #Programming #CleanCode",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8 hours ago
      reactions: {
        thumbsUp: 32,
        insightful: 24,
        brilliant: 7,
      },
      comments: [
        {
          id: "comment4",
          author: {
            id: "user2",
            name: "Priya Reddy",
            avatar: "/placeholder.svg?height=40&width=40&text=PR",
            role: "Professor, Computer Science",
          },
          content: "Great choice! I recommend 'The Pragmatic Programmer' as your next read.",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 7).toISOString(), // 7 hours ago
          likes: 6,
          replies: [],
          isLiked: true,
        },
      ],
      shares: 9,
      userReaction: "insightful",
      saved: true,
      type: "general",
      tags: ["Programming", "CleanCode", "Books"],
      visibility: "public",
    },
    {
      id: "6",
      author: {
        id: "user6",
        name: "Dr. Amit Kumar",
        avatar: "/placeholder.svg?height=40&width=40&text=AK",
        role: "Professor, Mathematics",
      },
      content:
        "Excited to announce that our department will be hosting a workshop on 'Advanced Calculus and its Applications' next month. Stay tuned for registration details! #Mathematics #Workshop",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(), // 10 hours ago
      reactions: {
        thumbsUp: 27,
        insightful: 18,
        brilliant: 12,
      },
      comments: [],
      shares: 15,
      userReaction: null,
      saved: false,
      type: "general",
      tags: ["Mathematics", "Workshop", "Calculus"],
      visibility: "followers",
    },
    {
      id: "7",
      author: {
        id: "user7",
        name: "Placement Cell",
        avatar: "/placeholder.svg?height=40&width=40&text=PC",
        role: "Official",
      },
      content:
        "🎉 Congratulations to all students who received offers from top companies during our recent placement drive! We achieved 92% placement rate this year. #Placements #CareerSuccess",
      images: ["/placeholder.svg?height=300&width=500&text=Placement+Statistics"],
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
      reactions: {
        thumbsUp: 87,
        insightful: 23,
        brilliant: 35,
      },
      comments: [
        {
          id: "comment5",
          author: {
            id: "user8",
            name: "Vikram Patel",
            avatar: "/placeholder.svg?height=40&width=40&text=VP",
            role: "Student, ECE",
          },
          content: "Proud to be part of this batch! Thanks to the placement cell for their support.",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 11).toISOString(), // 11 hours ago
          likes: 12,
          replies: [],
          isLiked: false,
        },
      ],
      shares: 42,
      userReaction: "thumbsUp",
      saved: true,
      type: "achievement",
      tags: ["Placements", "CareerSuccess"],
      visibility: "public",
    },
    {
      id: "8",
      author: {
        id: "user1",
        name: "Rahul Sharma",
        avatar: "/placeholder.svg?height=40&width=40&text=RS",
        role: "Student, CSE",
      },
      content:
        "📊 Daily Update: Spent the day learning about GraphQL. It's an interesting alternative to REST APIs. Looking forward to implementing it in my next project. #DailyProgress #GraphQL",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 24 hours ago
      reactions: {
        thumbsUp: 14,
        insightful: 8,
        brilliant: 2,
      },
      comments: [],
      shares: 1,
      userReaction: null,
      saved: false,
      type: "daily-update",
      tags: ["DailyProgress", "GraphQL", "WebDevelopment"],
      visibility: "followers",
    },
    {
      id: "9",
      author: {
        id: "user9",
        name: "Library Department",
        avatar: "/placeholder.svg?height=40&width=40&text=LD",
        role: "Official",
      },
      content:
        "The library will remain open 24/7 during the exam period (May 1-15). We've also added more study spaces and extended the book borrowing period. Good luck with your exams! #ExamPrep",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(), // 26 hours ago
      reactions: {
        thumbsUp: 56,
        insightful: 12,
        brilliant: 3,
      },
      comments: [],
      shares: 28,
      userReaction: "thumbsUp",
      saved: true,
      type: "general",
      tags: ["ExamPrep", "Library", "StudyTime"],
      visibility: "public",
    },
    {
      id: "10",
      author: {
        id: "user10",
        name: "Robotics Club",
        avatar: "/placeholder.svg?height=40&width=40&text=RC",
        role: "Club",
      },
      content:
        "Our team won the first prize at the National Robotics Competition! Proud of everyone's hard work and dedication. #Robotics #Achievement",
      images: ["/placeholder.svg?height=300&width=500&text=Robotics+Competition"],
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(), // 28 hours ago
      reactions: {
        thumbsUp: 72,
        insightful: 18,
        brilliant: 29,
      },
      comments: [
        {
          id: "comment6",
          author: {
            id: "user2",
            name: "Priya Reddy",
            avatar: "/placeholder.svg?height=40&width=40&text=PR",
            role: "Professor, Computer Science",
          },
          content: "Congratulations to the entire team! This is a remarkable achievement.",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 27).toISOString(), // 27 hours ago
          likes: 15,
          replies: [],
          isLiked: false,
        },
      ],
      shares: 34,
      userReaction: "brilliant",
      saved: false,
      type: "achievement",
      tags: ["Robotics", "Achievement", "Competition"],
      visibility: "public",
    },
  ])

  // State for displayed posts (paginated)
  const [posts, setPosts] = useState<Post[]>([])

  // Load initial posts
  useEffect(() => {
    // Simulate API call
    setIsLoading(true)
    setTimeout(() => {
      try {
        // Sort posts by timestamp (newest first)
        const sortedPosts = [...allPosts].sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
        )

        // Get first page of posts
        const initialPosts = sortedPosts.slice(0, POSTS_PER_PAGE)
        setPosts(initialPosts)
        setHasMore(sortedPosts.length > POSTS_PER_PAGE)
        setIsLoading(false)
      } catch (error) {
        console.error("Error loading posts:", error)
        setHasError(true)
        setIsLoading(false)
      }
    }, 1000)
  }, [allPosts])

  // Setup intersection observer for infinite scrolling
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMorePosts()
        }
      },
      { threshold: 0.5 },
    )

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current)
    }

    observerRef.current = observer

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [hasMore, isLoadingMore, posts])

  // Load more posts function
  const loadMorePosts = useCallback(() => {
    if (!hasMore || isLoadingMore) return

    setIsLoadingMore(true)

    // Simulate API call with delay
    setTimeout(() => {
      try {
        // Sort posts by timestamp (newest first)
        const sortedPosts = [...allPosts].sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
        )

        // Calculate next page
        const nextPage = page + 1
        const startIndex = (nextPage - 1) * POSTS_PER_PAGE
        const endIndex = startIndex + POSTS_PER_PAGE

        // Get next page of posts
        const nextPosts = sortedPosts.slice(startIndex, endIndex)

        if (nextPosts.length > 0) {
          setPosts((prevPosts) => [...prevPosts, ...nextPosts])
          setPage(nextPage)
          setHasMore(endIndex < sortedPosts.length)
        } else {
          setHasMore(false)
        }

        setIsLoadingMore(false)
      } catch (error) {
        console.error("Error loading more posts:", error)
        setIsLoadingMore(false)
        toast({
          title: "Error loading posts",
          description: "Failed to load more posts. Please try again.",
          variant: "destructive",
        })
      }
    }, 1000)
  }, [allPosts, hasMore, isLoadingMore, page, toast])

  // This will trigger a notification for the social section whenever posts are updated
  useSectionUpdate("social", [allPosts.length])

  const [topContributors, setTopContributors] = useState<SuggestedUser[]>([
    {
      id: "user4",
      name: "Arjun Singh",
      avatar: "/placeholder.svg?height=40&width=40&text=AS",
      role: "Student",
      department: "Electronics",
      year: "3rd Year",
      followers: 120,
      following: 85,
      badges: 15,
      impactScore: 850,
    },
    {
      id: "user5",
      name: "Neha Gupta",
      avatar: "/placeholder.svg?height=40&width=40&text=NG",
      role: "Student",
      department: "Computer Science",
      year: "4th Year",
      followers: 210,
      following: 150,
      badges: 12,
      impactScore: 1200,
    },
    {
      id: "user6",
      name: "Dr. Amit Kumar",
      avatar: "/placeholder.svg?height=40&width=40&text=AK",
      role: "Professor",
      department: "Mathematics",
      bio: "Number theory researcher, Mathematics enthusiast",
      followers: 310,
      following: 42,
      badges: 10,
      impactScore: 1500,
    },
    {
      id: "user1",
      name: "Rahul Sharma",
      avatar: "/placeholder.svg?height=40&width=40&text=RS",
      role: "Student",
      department: "CSE",
      year: "2nd Year",
      followers: 90,
      following: 70,
      badges: 8,
      impactScore: 700,
    },
  ])

  // Sort top contributors by impact score
  useEffect(() => {
    setTopContributors((prev) => [...prev].sort((a, b) => (b.impactScore || 0) - (a.impactScore || 0)))
  }, [])

  // Send notification for post interaction
  const sendInteractionNotification = (
    postId: string,
    interactionType: "like" | "comment" | "share",
    content?: string,
  ) => {
    const post = allPosts.find((p) => p.id === postId)
    if (!post || !currentUser) return

    // Don't notify if the user is interacting with their own post
    if (post.author.id === currentUser.id) return

    let title = ""
    let message = ""

    switch (interactionType) {
      case "like":
        title = "New reaction on your post"
        message = `${currentUser.name} reacted to your post`
        break
      case "comment":
        title = "New comment on your post"
        message = `${currentUser.name} commented: "${content?.substring(0, 50)}${content && content.length > 50 ? "..." : ""}"`
        break
      case "share":
        title = "Someone shared your post"
        message = `${currentUser.name} shared your post`
        break
    }

    // Create notification
    createNotification(
      post.author.id,
      interactionType === "like" ? "like" : interactionType === "comment" ? "mention" : "share",
      title,
      message,
      "medium",
      {
        id: currentUser.id,
        name: currentUser.name,
        avatar: currentUser.avatar,
      },
      `/social?post=${postId}`,
    )
  }

  const handleReaction = (postId: string, reactionType: "thumbsUp" | "insightful" | "brilliant") => {
    // Update all posts
    setAllPosts(
      allPosts.map((post) => {
        if (post.id === postId) {
          // If user already reacted with this type, remove the reaction
          if (post.userReaction === reactionType) {
            const updatedReactions = { ...post.reactions }
            updatedReactions[reactionType] -= 1
            return {
              ...post,
              reactions: updatedReactions,
              userReaction: null,
            }
          }
          // If user already reacted with a different type, switch the reaction
          else if (post.userReaction) {
            const updatedReactions = { ...post.reactions }
            updatedReactions[post.userReaction] -= 1
            updatedReactions[reactionType] += 1
            return {
              ...post,
              reactions: updatedReactions,
              userReaction: reactionType,
            }
          }
          // If user hasn't reacted yet, add the reaction
          else {
            const updatedReactions = { ...post.reactions }
            updatedReactions[reactionType] += 1

            // Send notification
            sendInteractionNotification(postId, "like")

            return {
              ...post,
              reactions: updatedReactions,
              userReaction: reactionType,
            }
          }
        }
        return post
      }),
    )

    // Update displayed posts
    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          // If user already reacted with this type, remove the reaction
          if (post.userReaction === reactionType) {
            const updatedReactions = { ...post.reactions }
            updatedReactions[reactionType] -= 1
            return {
              ...post,
              reactions: updatedReactions,
              userReaction: null,
            }
          }
          // If user already reacted with a different type, switch the reaction
          else if (post.userReaction) {
            const updatedReactions = { ...post.reactions }
            updatedReactions[post.userReaction] -= 1
            updatedReactions[reactionType] += 1
            return {
              ...post,
              reactions: updatedReactions,
              userReaction: reactionType,
            }
          }
          // If user hasn't reacted yet, add the reaction
          else {
            const updatedReactions = { ...post.reactions }
            updatedReactions[reactionType] += 1

            // Send notification
            sendInteractionNotification(postId, "like")

            return {
              ...post,
              reactions: updatedReactions,
              userReaction: reactionType,
            }
          }
        }
        return post
      }),
    )

    setShowReactionMenu(null)
    setShowAllReactions(null)

    toast({
      title: "Reaction added",
      description: `You reacted to the post with ${reactionType}`,
    })
  }

  const handleSave = (postId: string) => {
    // Update all posts
    setAllPosts(
      allPosts.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            saved: !post.saved,
          }
        }
        return post
      }),
    )

    // Update displayed posts
    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            saved: !post.saved,
          }
        }
        return post
      }),
    )

    toast({
      title: posts.find((p) => p.id === postId)?.saved ? "Post unsaved" : "Post saved",
      description: posts.find((p) => p.id === postId)?.saved
        ? "Post removed from your saved items."
        : "You can find this post in your saved items.",
    })
  }

  const handlePostSubmit = () => {
    if (!newPostContent.trim() && uploadedImages.length === 0 && uploadedVideos.length === 0) {
      toast({
        title: "Empty post",
        description: "Please add some content, images, or videos to your post.",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    // Simulate upload delay
    setTimeout(() => {
      const newPost: Post = {
        id: Date.now().toString(),
        author: {
          id: currentUser?.id || "currentUser",
          name: currentUser?.name || "Current User",
          avatar: currentUser?.avatar || "/placeholder.svg",
          role:
            currentUser?.role === "student"
              ? `Student, ${currentUser?.branch || "CSE"}`
              : currentUser?.role === "teacher"
                ? `Professor, ${currentUser?.department || "Computer Science"}`
                : "Student, CSE",
        },
        content: newPostContent,
        timestamp: new Date().toISOString(),
        reactions: {
          thumbsUp: 0,
          insightful: 0,
          brilliant: 0,
        },
        comments: [],
        shares: 0,
        userReaction: null,
        saved: false,
        type: postType,
        tags: postType === "daily-update" ? ["DailyUpdate"] : [],
        visibility: postVisibility,
      }

      // Add uploaded media if any
      if (uploadedImages.length > 0) {
        newPost.images = [...uploadedImages]
      }

      if (uploadedVideos.length > 0) {
        newPost.videos = [...uploadedVideos]
      }

      // Add to all posts
      setAllPosts([newPost, ...allPosts])

      // Add to displayed posts (at the top)
      setPosts([newPost, ...posts])

      setNewPostContent("")
      setUploadedImages([])
      setUploadedVideos([])
      setProgressValue(0)
      setIsUploading(false)
      setPostVisibility("public")
      setShowCreatePostDialog(false) // Close dialog after posting

      // Trigger notification for other users
      addSectionUpdate("social", 1)

      toast({
        title: "Post created",
        description:
          postType === "daily-update"
            ? "Your daily update has been published successfully."
            : "Your post has been published successfully.",
      })
    }, 1000)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newImages = Array.from(e.target.files).map((file) => {
        // In a real app, we would upload the file to a server and get a URL
        // For this demo, we'll create a local object URL
        return URL.createObjectURL(file)
      })

      setUploadedImages((prev) => [...prev, ...newImages])

      toast({
        title: "Images added",
        description: `${newImages.length} image(s) added to your post.`,
      })
    }
  }

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newVideos = Array.from(e.target.files).map((file) => {
        // In a real app, we would upload the file to a server and get a URL
        // For this demo, we'll create a local object URL
        return URL.createObjectURL(file)
      })

      setUploadedVideos((prev) => [...prev, ...newVideos])

      toast({
        title: "Videos added",
        description: `${newVideos.length} video(s) added to your post.`,
      })
    }
  }

  const handleRemoveMedia = (type: "image" | "video", index: number) => {
    if (type === "image") {
      setUploadedImages((prev) => prev.filter((_, i) => i !== index))
    } else {
      setUploadedVideos((prev) => prev.filter((_, i) => i !== index))
    }
  }

  const handleSharePost = (postId: string) => {
    setShowShareDialog(postId)
  }

  const handleCopyLink = (postId: string) => {
    // In a real app, this would be the actual URL to the post
    const postUrl = `https://aitd-student-hub.com/social/post/${postId}`

    navigator.clipboard.writeText(postUrl).then(() => {
      toast({
        title: "Link copied",
        description: "Post link copied to clipboard.",
      })

      // Update share count in all posts
      setAllPosts(allPosts.map((post) => (post.id === postId ? { ...post, shares: post.shares + 1 } : post)))

      // Update share count in displayed posts
      setPosts(posts.map((post) => (post.id === postId ? { ...post, shares: post.shares + 1 } : post)))

      // Send notification
      sendInteractionNotification(postId, "share")

      setShowShareDialog(null)
    })
  }

  const handleShareToSocial = (postId: string, platform: string) => {
    // In a real app, this would open the sharing dialog for the respective platform
    toast({
      title: `Shared to ${platform}`,
      description: `Post has been shared to ${platform}.`,
    })

    // Update share count in all posts
    setAllPosts(allPosts.map((post) => (post.id === postId ? { ...post, shares: post.shares + 1 } : post)))

    // Update share count in displayed posts
    setPosts(posts.map((post) => (post.id === postId ? { ...post, shares: post.shares + 1 } : post)))

    // Send notification
    sendInteractionNotification(postId, "share")

    setShowShareDialog(null)
  }

  const handleAddComment = (postId: string) => {
    if (!commentText.trim()) return

    const newComment: Comment = {
      id: Date.now().toString(),
      author: {
        id: currentUser?.id || "currentUser",
        name: currentUser?.name || "Current User",
        avatar: currentUser?.avatar || "/placeholder.svg",
        role:
          currentUser?.role === "student"
            ? `Student, ${currentUser?.branch || "CSE"}`
            : currentUser?.role === "teacher"
              ? `Professor, ${currentUser?.department || "Computer Science"}`
              : "Student, CSE",
      },
      content: commentText,
      timestamp: new Date().toISOString(),
      likes: 0,
      replies: [],
      isLiked: false,
    }

    // Update all posts
    setAllPosts(
      allPosts.map((post) => {
        if (post.id === postId) {
          // Send notification
          sendInteractionNotification(postId, "comment", commentText)

          return {
            ...post,
            comments: [...post.comments, newComment],
          }
        }
        return post
      }),
    )

    // Update displayed posts
    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            comments: [...post.comments, newComment],
          }
        }
        return post
      }),
    )

    setCommentText("")
    setShowCommentInput(null)

    toast({
      title: "Comment added",
      description: "Your comment has been added to the post.",
    })
  }

  const handleAddReply = (postId: string, commentId: string) => {
    if (!replyText.trim() || !replyToComment) return

    const newReply: Comment = {
      id: Date.now().toString(),
      author: {
        id: currentUser?.id || "currentUser",
        name: currentUser?.name || "Current User",
        avatar: currentUser?.avatar || "/placeholder.svg",
        role:
          currentUser?.role === "student"
            ? `Student, ${currentUser?.branch || "CSE"}`
            : currentUser?.role === "teacher"
              ? `Professor, ${currentUser?.department || "Computer Science"}`
              : "Student, CSE",
      },
      content: replyText,
      timestamp: new Date().toISOString(),
      likes: 0,
      replies: [],
      isLiked: false,
    }

    // Update all posts
    setAllPosts(
      allPosts.map((post) => {
        if (post.id === postId) {
          const updatedComments = post.comments.map((comment) => {
            if (comment.id === commentId) {
              // Find the comment author to notify them
              const commentAuthor = comment.author

              // Send notification to comment author about the reply
              if (commentAuthor.id !== currentUser?.id) {
                createNotification(
                  commentAuthor.id,
                  "mention",
                  "New reply to your comment",
                  `${currentUser?.name} replied to your comment: "${replyText.substring(0, 50)}${replyText.length > 50 ? "..." : ""}"`,
                  "medium",
                  {
                    id: currentUser?.id || "",
                    name: currentUser?.name || "",
                    avatar: currentUser?.avatar,
                  },
                  `/social?post=${postId}`,
                )
              }

              return {
                ...comment,
                replies: [...comment.replies, newReply],
              }
            }
            return comment
          })

          return {
            ...post,
            comments: updatedComments,
          }
        }
        return post
      }),
    )

    // Update displayed posts
    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            comments: post.comments.map((comment) => {
              if (comment.id === commentId) {
                return {
                  ...comment,
                  replies: [...comment.replies, newReply],
                }
              }
              return comment
            }),
          }
        }
        return post
      }),
    )

    setReplyText("")
    setReplyToComment(null)

    toast({
      title: "Reply added",
      description: "Your reply has been added to the comment.",
    })
  }

  const handleLikeComment = (postId: string, commentId: string, isReply = false, parentCommentId?: string) => {
    // Update all posts
    setAllPosts(
      allPosts.map((post) => {
        if (post.id === postId) {
          if (!isReply) {
            const updatedComments = post.comments.map((comment) => {
              if (comment.id === commentId) {
                const wasLiked = comment.isLiked
                const updatedLikes = wasLiked ? comment.likes - 1 : comment.likes + 1

                // Send notification if liking (not unliking)
                if (!wasLiked && comment.author.id !== currentUser?.id) {
                  createNotification(
                    comment.author.id,
                    "like",
                    "Someone liked your comment",
                    `${currentUser?.name} liked your comment`,
                    "low",
                    {
                      id: currentUser?.id || "",
                      name: currentUser?.name || "",
                      avatar: currentUser?.avatar,
                    },
                    `/social?post=${postId}`,
                  )
                }

                return {
                  ...comment,
                  likes: updatedLikes,
                  isLiked: !wasLiked,
                }
              }
              return comment
            })

            return {
              ...post,
              comments: updatedComments,
            }
          } else if (parentCommentId) {
            return {
              ...post,
              comments: post.comments.map((comment) => {
                if (comment.id === parentCommentId) {
                  return {
                    ...comment,
                    replies: comment.replies.map((reply) => {
                      if (reply.id === commentId) {
                        const wasLiked = reply.isLiked
                        const updatedLikes = wasLiked ? reply.likes - 1 : reply.likes + 1

                        // Send notification if liking (not unliking)
                        if (!wasLiked && reply.author.id !== currentUser?.id) {
                          createNotification(
                            reply.author.id,
                            "like",
                            "Someone liked your reply",
                            `${currentUser?.name} liked your reply`,
                            "low",
                            {
                              id: currentUser?.id || "",
                              name: currentUser?.name || "",
                              avatar: currentUser?.avatar,
                            },
                            `/social?post=${postId}`,
                          )
                        }

                        return {
                          ...reply,
                          likes: updatedLikes,
                          isLiked: !wasLiked,
                        }
                      }
                      return reply
                    }),
                  }
                }
                return comment
              }),
            }
          }
        }
        return post
      }),
    )

    // Update displayed posts
    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          if (!isReply) {
            return {
              ...post,
              comments: post.comments.map((comment) => {
                if (comment.id === commentId) {
                  return {
                    ...comment,
                    likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
                    isLiked: !comment.isLiked,
                  }
                }
                return comment
              }),
            }
          } else if (parentCommentId) {
            return {
              ...post,
              comments: post.comments.map((comment) => {
                if (comment.id === parentCommentId) {
                  return {
                    ...comment,
                    replies: comment.replies.map((reply) => {
                      if (reply.id === commentId) {
                        return {
                          ...reply,
                          likes: reply.isLiked ? reply.likes - 1 : reply.likes + 1,
                          isLiked: !reply.isLiked,
                        }
                      }
                      return reply
                    }),
                  }
                }
                return comment
              }),
            }
          }
        }
        return post
      }),
    )
  }

  const toggleExpandComments = (postId: string) => {
    if (expandedComments.includes(postId)) {
      setExpandedComments(expandedComments.filter((id) => id !== postId))
    } else {
      setExpandedComments([...expandedComments, postId])
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const now = new Date()
    const date = new Date(timestamp)
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) {
      return "Just now"
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return `${hours} ${hours === 1 ? "hour" : "hours"} ago`
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400)
      return `${days} ${days === 1 ? "day" : "days"} ago`
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    }
  }

  // Filter posts based on active category, post type, and follower relationship
  const getFilteredPosts = () => {
    // In a real app, we would have a list of users that the current user follows
    // For this demo, we'll assume the current user follows all users
    const followedUsers = ["user1", "user2", "user3", "user4", "user5", "user6", "user7", "user8", "user9", "user10"]

    return posts.filter((post) => {
      // First filter by post type
      if (activePostType !== "all" && post.type !== activePostType) {
        return false
      }

      // Then filter by visibility
      if (post.visibility === "private" && post.author.id !== currentUser?.id) {
        return false
      }

      if (
        post.visibility === "followers" &&
        post.author.id !== currentUser?.id &&
        !followedUsers.includes(post.author.id)
      ) {
        return false
      }

      // Then filter by category
      switch (activeCategory) {
        case "friends":
          // Show posts from followed users
          return followedUsers.includes(post.author.id)
        case "groups":
          // In a real app, you'd filter by group posts
          return false
        case "saved-posts":
          return post.saved
        case "events":
          // In a real app, you'd filter by event posts
          return post.tags?.includes("CulturalFest") || false
        case "work-updates":
          // In a real app, you'd filter by work updates
          return post.tags?.includes("DailyProgress") || false
        case "all-posts":
        default:
          return true
      }
    })
  }

  const filteredPosts = getFilteredPosts()

  const categoryButtons = [
    { id: "all-posts", label: "All Posts", icon: <Filter className="h-4 w-4" /> },
    { id: "friends", label: "Friends", icon: <Users className="h-4 w-4" /> },
    { id: "groups", label: "Groups", icon: <User className="h-4 w-4" /> },
    { id: "saved-posts", label: "Saved", icon: <BookmarkIcon className="h-4 w-4" /> },
    { id: "events", label: "Events", icon: <Calendar className="h-4 w-4" /> },
    { id: "work-updates", label: "Work", icon: <Briefcase className="h-4 w-4" /> },
  ]

  const postTypeButtons = [
    { id: "all", label: "All Types" },
    { id: "daily-update", label: "Daily Updates", icon: <Clock className="h-3 w-3 mr-1" /> },
    { id: "achievement", label: "Achievements", icon: <Award className="h-3 w-3 mr-1" /> },
  ]

  const visibilityOptions = [
    { value: "public", label: "Public", icon: <Globe className="h-4 w-4" /> },
    { value: "followers", label: "Followers Only", icon: <UserCheck className="h-4 w-4" /> },
    { value: "private", label: "Private", icon: <Lock className="h-4 w-4" /> },
  ]

  // Function to refresh the feed
  const refreshFeed = () => {
    setIsLoading(true)
    setPage(1)

    // Simulate API call
    setTimeout(() => {
      try {
        // Sort posts by timestamp (newest first)
        const sortedPosts = [...allPosts].sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
        )

        // Get first page of posts
        const initialPosts = sortedPosts.slice(0, POSTS_PER_PAGE)
        setPosts(initialPosts)
        setHasMore(sortedPosts.length > POSTS_PER_PAGE)
        setIsLoading(false)

        toast({
          title: "Feed refreshed",
          description: "Your feed has been updated with the latest posts.",
        })
      } catch (error) {
        console.error("Error refreshing feed:", error)
        setHasError(true)
        setIsLoading(false)

        toast({
          title: "Error refreshing feed",
          description: "Failed to refresh your feed. Please try again.",
          variant: "destructive",
        })
      }
    }, 1000)
  }

  // Component for the Create Post form (can be used in dialog or directly)
  const CreatePostForm = ({ onClose }: { onClose?: () => void }) => (
    <Card className="shadow-none border-none">
      <CardContent className={`p-4 ${isAndroid ? "pt-3 pb-3" : ""}`}>
        <div className="flex gap-3">
          <Avatar className={isAndroid ? "h-8 w-8" : "h-10 w-10"}>
            <AvatarImage src={currentUser?.avatar || "/placeholder.svg?height=40&width=40&text=U"} />
            <AvatarFallback>{currentUser?.name?.[0] || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea
              id="post-textarea"
              placeholder="What's on your mind?"
              className={`resize-none ${isAndroid ? "min-h-[60px]" : "min-h-[80px]"}`}
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
            />

            {/* Media Preview */}
            {(uploadedImages.length > 0 || uploadedVideos.length > 0) && (
              <div className="mt-3 grid grid-cols-2 gap-2">
                {uploadedImages.map((img, index) => (
                  <div key={`img-${index}`} className="relative">
                    <img
                      src={img || "/placeholder.svg?height=200&width=300&text=Image"}
                      alt={`Upload preview ${index}`}
                      className="rounded-md w-full h-24 object-cover"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 rounded-full"
                      onClick={() => handleRemoveMedia("image", index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                {uploadedVideos.map((video, index) => (
                  <div key={`video-${index}`} className="relative">
                    <video src={video} className="rounded-md w-full h-24 object-cover" controls={false} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Video className="h-8 w-8 text-white drop-shadow-md" />
                    </div>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 rounded-full"
                      onClick={() => handleRemoveMedia("video", index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
              <div className="flex gap-2 items-center flex-wrap">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className={isAndroid ? "h-8 px-2" : ""}
                >
                  <ImageIcon className="mr-1 h-4 w-4" />
                  <span className={isAndroid ? "sr-only" : ""}>Photo</span>
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                />

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => videoInputRef.current?.click()}
                  className={isAndroid ? "h-8 px-2" : ""}
                >
                  <Video className="mr-1 h-4 w-4" />
                  <span className={isAndroid ? "sr-only" : ""}>Video</span>
                </Button>
                <input
                  type="file"
                  ref={videoInputRef}
                  className="hidden"
                  accept="video/*"
                  multiple
                  onChange={handleVideoUpload}
                />

                <Button variant="ghost" size="sm" className={isAndroid ? "h-8 px-2" : ""}>
                  <Smile className="mr-1 h-4 w-4" />
                  <span className={isAndroid ? "sr-only" : ""}>Feeling</span>
                </Button>

                <Select value={postType} onValueChange={(value) => setPostType(value as any)}>
                  <SelectTrigger className={`${isAndroid ? "w-[100px] h-8" : "w-[140px]"}`}>
                    <SelectValue placeholder="Post type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General Post</SelectItem>
                    <SelectItem value="daily-update">Daily Update</SelectItem>
                    <SelectItem value="achievement">Achievement</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Select value={postVisibility} onValueChange={(value) => setPostVisibility(value as any)}>
                  <SelectTrigger className={`${isAndroid ? "w-[120px] h-8" : "w-[150px]"}`}>
                    <SelectValue placeholder="Visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    {visibilityOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center">
                          {option.icon}
                          <span className="ml-2">{option.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  onClick={handlePostSubmit}
                  disabled={
                    (!newPostContent.trim() && uploadedImages.length === 0 && uploadedVideos.length === 0) ||
                    isUploading
                  }
                  size={isAndroid ? "sm" : "default"}
                >
                  {isUploading ? (
                    <div className="flex items-center">
                      <div className="animate-spin mr-1 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                      <span>Posting...</span>
                    </div>
                  ) : (
                    <>
                      <Send className="mr-1 h-4 w-4" />
                      Post
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="container mx-auto py-4 pb-20 md:pb-6">
      {/* Top Categories */}
      <div className="mb-4">
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex space-x-2 pb-2">
            {categoryButtons.map((button) => (
              <Button
                key={button.id}
                variant={activeCategory === button.id ? "default" : "outline"}
                size={isAndroid ? "sm" : "default"}
                className={`flex items-center ${isAndroid ? "px-3" : ""}`}
                onClick={() => setActiveCategory(button.id)}
              >
                {button.icon}
                <span className={isAndroid ? "ml-1 text-xs" : "ml-2"}>{button.label}</span>
              </Button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Post Type Filters */}
      <div className="mb-4">
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex space-x-2 pb-2">
            {postTypeButtons.map((button) => (
              <Button
                key={button.id}
                variant={activePostType === button.id ? "default" : "outline"}
                size={isAndroid ? "sm" : "default"}
                className={`flex items-center ${isAndroid ? "px-3" : ""}`}
                onClick={() => setActivePostType(button.id)}
              >
                {button.icon}
                <span className={isAndroid ? "ml-1 text-xs" : "ml-2"}>{button.label}</span>
              </Button>
            ))}

            {/* Refresh button */}
            <Button
              variant="outline"
              size={isAndroid ? "sm" : "default"}
              className={`flex items-center ${isAndroid ? "px-3" : ""} ml-auto`}
              onClick={refreshFeed}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? "animate-spin" : ""}`} />
              <span className={isAndroid ? "text-xs" : ""}>Refresh</span>
            </Button>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Main Feed */}
        <div className="md:col-span-2 space-y-4">
          {/* Create Post (Desktop) */}
          {!isMobile && (
            <Card className="shadow-lg animate-fade-in">
              <CardHeader className="p-4 pb-0">
                <CardTitle className="text-lg">Create New Post</CardTitle>
              </CardHeader>
              <CreatePostForm />
            </Card>
          )}

          {/* Daily Progress Tracker (Compact for mobile) */}
          {activeCategory === "work-updates" && (
            <Card className={`shadow-md ${isAndroid ? "p-2" : ""}`}>
              <CardHeader className={isAndroid ? "p-2" : ""}>
                <CardTitle className={isAndroid ? "text-base" : ""}>Daily Progress Tracker</CardTitle>
              </CardHeader>
              <CardContent className={`space-y-3 ${isAndroid ? "p-2 pt-0" : ""}`}>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Today's Progress</span>
                    <span className="text-sm text-muted-foreground">{progressValue}%</span>
                  </div>
                  <Progress value={progressValue} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={progressValue}
                      onChange={(e) => setProgressValue(Number.parseInt(e.target.value))}
                      className="w-full"
                    />
                    <Button
                      size="sm"
                      onClick={() => {
                        toast({
                          title: "Progress updated",
                          description: `Your progress has been updated to ${progressValue}%`,
                        })
                      }}
                    >
                      Save
                    </Button>
                  </div>
                </div>
                <div>
                  <Button
                    variant="outline"
                    className="w-full bg-transparent"
                    size={isAndroid ? "sm" : "default"}
                    onClick={() => {
                      setPostType("daily-update")
                      setNewPostContent(
                        `📊 Daily Update: Made ${progressValue}% progress today on my project. ${progressValue > 50 ? "Great progress!" : "Still working hard!"} #DailyUpdate`,
                      )
                      document.getElementById("post-textarea")?.focus()
                      if (isMobile) setShowCreatePostDialog(true) // Open dialog for mobile
                    }}
                  >
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Share Daily Update
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-fade-in">
                  <CardHeader className="p-4 pb-0">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div>
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24 mt-1" />
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-40 w-full mt-3 rounded-md" />
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-16 rounded-md" />
                        <Skeleton className="h-8 w-16 rounded-md" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-16 rounded-md" />
                        <Skeleton className="h-8 w-16 rounded-md" />
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}

          {/* Error State */}
          {hasError && !isLoading && (
            <Alert variant="destructive" className="mb-4 animate-fade-in">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to load posts. Please try refreshing the page.
                <Button variant="outline" size="sm" className="ml-2 bg-transparent" onClick={refreshFeed}>
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {isMobile && <SocialSponsorCard variant="mobile" />}

          {filteredPosts.length === 0 ? (
            <Card className="p-8 text-center animate-fade-in">
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="rounded-full bg-muted p-3">
                  <Filter className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="font-medium text-lg">No posts found</h3>
                <p className="text-muted-foreground text-sm">Try changing your filters or create a new post.</p>
              </div>
            </Card>
          ) : null}

          {/* Posts Feed */}
          {!isLoading && !hasError && filteredPosts.length > 0 && (
            <div className="space-y-4">
              {filteredPosts.map((post) => (
                <Card
                  key={post.id}
                  className={`group/post relative overflow-hidden shadow-md hover:shadow-lg transition-all duration-200 ease-in-out ${
                    post.type === "achievement"
                      ? "border-yellow-200 dark:border-yellow-800 bg-gradient-to-br from-yellow-50/50 to-white dark:from-yellow-950/30 dark:to-gray-950/30"
                      : post.type === "daily-update"
                        ? "border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50/50 to-white dark:from-green-950/30 dark:to-gray-950/30"
                        : ""
                  } animate-fade-in`}
                >
                  <CardHeader className={`p-4 pb-0 ${isAndroid ? "p-3 pb-0" : ""}`}>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <Link href={`/profile/${post.author.id}`} className="flex items-center gap-3">
                          <Avatar className={`border-2 border-primary ${isAndroid ? "h-8 w-8" : ""}`}>
                            <AvatarImage src={post.author.avatar || "/placeholder.svg?height=40&width=40&text=U"} />
                            <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className={`font-semibold hover:underline ${isAndroid ? "text-sm" : ""}`}>
                                {post.author.name}
                              </h3>
                              {post.author.role === "Official" && (
                                <Badge variant="secondary" className="bg-blue-500 text-white">
                                  Official
                                </Badge>
                              )}
                              {post.type === "daily-update" && (
                                <Badge
                                  variant="outline"
                                  className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                                >
                                  <Clock className="h-3 w-3 mr-1" />
                                  Daily Update
                                </Badge>
                              )}
                              {post.type === "achievement" && (
                                <Badge
                                  variant="outline"
                                  className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                                >
                                  <Award className="h-3 w-3 mr-1" />
                                  Achievement
                                </Badge>
                              )}
                              {post.visibility !== "public" && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Badge variant="outline" className="ml-1">
                                        {post.visibility === "followers" ? (
                                          <UserCheck className="h-3 w-3 mr-1" />
                                        ) : (
                                          <Lock className="h-3 w-3 mr-1" />
                                        )}
                                        {post.visibility === "followers" ? "Followers" : "Private"}
                                      </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      {post.visibility === "followers"
                                        ? "Only followers can see this post"
                                        : "Only you can see this post"}
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <p className="text-xs text-muted-foreground">{post.author.role}</p>
                              <span className="text-xs text-muted-foreground">•</span>
                              <p className="text-xs text-muted-foreground">{formatTimestamp(post.timestamp)}</p>
                            </div>
                          </div>
                        </Link>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className={`p-4 ${isAndroid ? "p-3 pt-2" : ""}`}>
                    <p className={`whitespace-pre-line ${isAndroid ? "text-sm" : ""}`}>{post.content}</p>
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {post.tags.map((tag, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100"
                          >
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Media Gallery */}
                    {(post.images && post.images.length > 0) || (post.videos && post.videos.length > 0) ? (
                      <div
                        className={`grid gap-2 mt-3 ${
                          (post.images?.length || 0) + (post.videos?.length || 0) > 1 ? "grid-cols-2" : "grid-cols-1"
                        }`}
                      >
                        {post.images?.map((image, index) => (
                          <img
                            key={`img-${index}`}
                            src={image || "/placeholder.svg?height=200&width=300&text=Image"}
                            alt={`Post image ${index + 1}`}
                            className="rounded-md w-full object-cover h-auto max-h-[300px]"
                          />
                        ))}
                        {post.videos?.map((video, index) => (
                          <div key={`video-${index}`} className="relative">
                            <video src={video} controls className="rounded-md w-full h-auto max-h-[300px] bg-black" />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-md">
                              <Play className="h-12 w-12 text-white opacity-80" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </CardContent>

                  {/* Comments Section */}
                  {post.comments.length > 0 && (
                    <div className={`px-4 ${isAndroid ? "px-3" : ""}`}>
                      <Separator />
                      <div className="py-2">
                        {/* Show top comment or first few comments */}
                        {!expandedComments.includes(post.id) ? (
                          <>
                            {/* Show only top comment (most likes) */}
                            {post.comments
                              .sort((a, b) => b.likes - a.likes)
                              .slice(0, 1)
                              .map((comment) => (
                                <div key={comment.id} className="flex gap-2 items-start mt-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage
                                      src={comment.author.avatar || "/placeholder.svg?height=40&width=40&text=U"}
                                    />
                                    <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1">
                                    <div className="bg-muted rounded-lg p-2">
                                      <div className="flex justify-between items-start">
                                        <p className="font-medium text-sm">{comment.author.name}</p>
                                        <span className="text-xs text-muted-foreground">
                                          {formatTimestamp(comment.timestamp)}
                                        </span>
                                      </div>
                                      <p className="text-sm">{comment.content}</p>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1 text-xs">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className={`h-6 px-2 ${comment.isLiked ? "text-blue-500" : ""}`}
                                        onClick={() => handleLikeComment(post.id, comment.id)}
                                      >
                                        <ThumbsUp className={`h-3 w-3 mr-1 ${comment.isLiked ? "fill-current" : ""}`} />
                                        {comment.likes > 0 && comment.likes}
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 px-2"
                                        onClick={() => setReplyToComment({ postId: post.id, commentId: comment.id })}
                                      >
                                        <Reply className="h-3 w-3 mr-1" />
                                        Reply
                                      </Button>
                                    </div>

                                    {/* Show first reply if exists */}
                                    {comment.replies.length > 0 && (
                                      <div className="ml-6 mt-2">
                                        <div className="flex gap-2 items-start">
                                          <Avatar className="h-5 w-5">
                                            <AvatarImage
                                              src={
                                                comment.replies[0].author.avatar ||
                                                "/placeholder.svg?height=40&width=40&text=U"
                                              }
                                            />
                                            <AvatarFallback>{comment.replies[0].author.name.charAt(0)}</AvatarFallback>
                                          </Avatar>
                                          <div className="flex-1">
                                            <div className="bg-muted rounded-lg p-2">
                                              <div className="flex justify-between items-start">
                                                <p className="font-medium text-xs">{comment.replies[0].author.name}</p>
                                                <span className="text-xs text-muted-foreground">
                                                  {formatTimestamp(comment.replies[0].timestamp)}
                                                </span>
                                              </div>
                                              <p className="text-xs">{comment.replies[0].content}</p>
                                            </div>
                                          </div>
                                        </div>

                                        {comment.replies.length > 1 && (
                                          <Button
                                            variant="link"
                                            size="sm"
                                            className="text-xs h-6 mt-1"
                                            onClick={() => toggleExpandComments(post.id)}
                                          >
                                            View {comment.replies.length - 1} more{" "}
                                            {comment.replies.length - 1 === 1 ? "reply" : "replies"}
                                          </Button>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}

                            {post.comments.length > 1 && (
                              <Button
                                variant="link"
                                size="sm"
                                className="mt-2"
                                onClick={() => toggleExpandComments(post.id)}
                              >
                                View all {post.comments.length} comments
                              </Button>
                            )}
                          </>
                        ) : (
                          <>
                            {/* Show all comments */}
                            <div className="space-y-3">
                              {post.comments.map((comment) => (
                                <div key={comment.id} className="flex gap-2 items-start">
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage
                                      src={comment.author.avatar || "/placeholder.svg?height=40&width=40&text=U"}
                                    />
                                    <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1">
                                    <div className="bg-muted rounded-lg p-2">
                                      <div className="flex justify-between items-start">
                                        <p className="font-medium text-sm">{comment.author.name}</p>
                                        <span className="text-xs text-muted-foreground">
                                          {formatTimestamp(comment.timestamp)}
                                        </span>
                                      </div>
                                      <p className="text-sm">{comment.content}</p>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1 text-xs">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className={`h-6 px-2 ${comment.isLiked ? "text-blue-500" : ""}`}
                                        onClick={() => handleLikeComment(post.id, comment.id)}
                                      >
                                        <ThumbsUp className={`h-3 w-3 mr-1 ${comment.isLiked ? "fill-current" : ""}`} />
                                        {comment.likes > 0 && comment.likes}
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 px-2"
                                        onClick={() => setReplyToComment({ postId: post.id, commentId: comment.id })}
                                      >
                                        <Reply className="h-3 w-3 mr-1" />
                                        Reply
                                      </Button>
                                    </div>

                                    {/* Show all replies */}
                                    {comment.replies.length > 0 && (
                                      <div className="ml-6 mt-2 space-y-2">
                                        {comment.replies.map((reply) => (
                                          <div key={reply.id} className="flex gap-2 items-start">
                                            <Avatar className="h-5 w-5">
                                              <AvatarImage
                                                src={
                                                  reply.author.avatar || "/placeholder.svg?height=40&width=40&text=U"
                                                }
                                              />
                                              <AvatarFallback>{reply.author.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                              <div className="bg-muted rounded-lg p-2">
                                                <div className="flex justify-between items-start">
                                                  <p className="font-medium text-xs">{reply.author.name}</p>
                                                  <span className="text-xs text-muted-foreground">
                                                    {formatTimestamp(reply.timestamp)}
                                                  </span>
                                                </div>
                                                <p className="text-xs">{reply.content}</p>
                                              </div>
                                              <div className="flex items-center gap-2 mt-1 text-xs">
                                                <Button
                                                  variant="ghost"
                                                  size="sm"
                                                  className={`h-5 px-1 ${reply.isLiked ? "text-blue-500" : ""}`}
                                                  onClick={() => handleLikeComment(post.id, reply.id, true, comment.id)}
                                                >
                                                  <ThumbsUp
                                                    className={`h-2 w-2 mr-1 ${reply.isLiked ? "fill-current" : ""}`}
                                                  />
                                                  {reply.likes > 0 && reply.likes}
                                                </Button>
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>

                            <Button
                              variant="link"
                              size="sm"
                              className="mt-2"
                              onClick={() => toggleExpandComments(post.id)}
                            >
                              Hide comments
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  <CardFooter className={`p-4 pt-0 ${isAndroid ? "p-3 pt-0" : ""}`}>
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-1 relative">
                        {/* Reaction Buttons - All three visible */}
                        <div className="flex items-center gap-1">
                          {/* ThumbsUp Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`${post.userReaction === "thumbsUp" ? "text-blue-500" : ""} ${isAndroid ? "h-8 px-2" : ""}`}
                            onClick={() => handleReaction(post.id, "thumbsUp")}
                          >
                            <ThumbsUp
                              className={`mr-1 h-4 w-4 ${post.userReaction === "thumbsUp" ? "fill-current" : ""}`}
                            />
                            {post.reactions.thumbsUp > 0 && post.reactions.thumbsUp}
                          </Button>

                          {/* Insightful Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`${post.userReaction === "insightful" ? "text-green-500" : ""} ${isAndroid ? "h-8 px-2" : ""}`}
                            onClick={() => handleReaction(post.id, "insightful")}
                          >
                            <Lightbulb
                              className={`mr-1 h-4 w-4 ${post.userReaction === "insightful" ? "fill-current" : ""}`}
                            />
                            {post.reactions.insightful > 0 && post.reactions.insightful}
                          </Button>

                          {/* Brilliant Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`${post.userReaction === "brilliant" ? "text-yellow-500" : ""} ${isAndroid ? "h-8 px-2" : ""}`}
                            onClick={() => handleReaction(post.id, "brilliant")}
                          >
                            <Sparkles
                              className={`mr-1 h-4 w-4 ${post.userReaction === "brilliant" ? "fill-current" : ""}`}
                            />
                            {post.reactions.brilliant > 0 && post.reactions.brilliant}
                          </Button>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowCommentInput(post.id)}
                          className={isAndroid ? "h-8 px-2" : ""}
                        >
                          <MessageCircle className="mr-1 h-4 w-4" />
                          {post.comments.length}
                        </Button>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSharePost(post.id)}
                          className={isAndroid ? "h-8 px-2" : ""}
                        >
                          <Share className="mr-1 h-4 w-4" />
                          {isAndroid ? "" : "Share"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`${post.saved ? "text-yellow-500" : ""} ${isAndroid ? "h-8 px-2" : ""}`}
                          onClick={() => handleSave(post.id)}
                        >
                          <BookmarkIcon className={`h-4 w-4 ${post.saved ? "fill-current" : ""}`} />
                          {isAndroid ? "" : post.saved ? "Saved" : "Save"}
                        </Button>
                      </div>
                    </div>
                  </CardFooter>

                  {/* Comment Input */}
                  {showCommentInput === post.id && (
                    <div className="px-4 pb-3">
                      <div className="flex gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={currentUser?.avatar || "/placeholder.svg?height=40&width=40&text=U"} />
                          <AvatarFallback>{currentUser?.name?.[0] || "U"}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <Textarea
                            placeholder="Write a comment..."
                            className="resize-none min-h-[60px]"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                          />
                          <div className="flex justify-end mt-2">
                            <Button size="sm" onClick={() => handleAddComment(post.id)} disabled={!commentText.trim()}>
                              Comment
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Reply Input */}
                  {replyToComment && replyToComment.postId === post.id && (
                    <div className="px-4 pb-3">
                      <div className="flex gap-2 ml-8">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={currentUser?.avatar || "/placeholder.svg?height=40&width=40&text=U"} />
                          <AvatarFallback>{currentUser?.name?.[0] || "U"}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <Textarea
                            placeholder="Write a reply..."
                            className="resize-none min-h-[50px] text-sm"
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                          />
                          <div className="flex justify-end mt-2 gap-2">
                            <Button variant="outline" size="sm" onClick={() => setReplyToComment(null)}>
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleAddReply(replyToComment.postId, replyToComment.commentId)}
                              disabled={!replyText.trim()}
                            >
                              Reply
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              ))}

              {/* Load More */}
              {hasMore && (
                <div ref={loadMoreRef} className="py-4 flex justify-center">
                  {isLoadingMore ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full"></div>
                      <span>Loading more posts...</span>
                    </div>
                  ) : (
                    <Button variant="outline" onClick={loadMorePosts}>
                      <ChevronDown className="h-4 w-4 mr-1" />
                      Load More
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Sidebar - Only visible on desktop */}
        <div className="hidden md:block md:col-span-1 space-y-4">
          <SocialSponsorCard variant="desktop" />

          {/* Real-time Badge Earners */}
          <Card className="shadow-lg bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-950/30 dark:to-teal-950/30 border-green-200 dark:border-green-800 animate-fade-in">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center text-green-700 dark:text-green-300">
                <Zap className="h-5 w-5 mr-2" />
                Recent Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {badgeEarners.slice(0, 3).map((earner) => (
                  <div key={earner.id} className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border-2 border-green-500">
                      <AvatarImage src={earner.avatar || "/placeholder.svg?height=40&width=40&text=U"} />
                      <AvatarFallback>{earner.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">
                        <span className="text-green-800 dark:text-green-200">{earner.name}</span> earned the{" "}
                        <span className="font-semibold text-green-700 dark:text-green-300">{earner.badgeName}</span>{" "}
                        badge!
                      </p>
                      <p className="text-xs text-muted-foreground">{formatTimestamp(earner.timestamp)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Future Features Preview */}
          <Card className="shadow-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-purple-200 dark:border-purple-800 animate-fade-in">
            <CardHeader>
              <CardTitle className="text-lg flex items-center text-purple-700 dark:text-purple-300">
                <Star className="h-5 w-5 mr-2" />
                Coming Soon
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-2">
                    <Users className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Group Creation</p>
                    <p className="text-xs text-muted-foreground">Create and manage study groups</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-green-100 dark:bg-green-900 p-2">
                    <Calendar className="h-4 w-4 text-green-600 dark:text-green-300" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Event Creation</p>
                    <p className="text-xs text-muted-foreground">Organize and promote campus events</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-purple-100 dark:bg-purple-900 p-2">
                    <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-300" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Leaderboards & Challenges</p>
                    <p className="text-xs text-muted-foreground">Compete with peers in academic challenges</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Floating Action Button for Mobile */}
      {isMobile && (
        <Button
          className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg bg-primary text-primary-foreground flex items-center justify-center z-40 animate-fade-in"
          onClick={() => setShowCreatePostDialog(true)}
          aria-label="Create new post"
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}

      {/* Create Post Dialog for Mobile */}
      <Dialog open={showCreatePostDialog} onOpenChange={setShowCreatePostDialog}>
        <DialogContent className="sm:max-w-md p-0">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle>Create New Post</DialogTitle>
          </DialogHeader>
          <CreatePostForm onClose={() => setShowCreatePostDialog(false)} />
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={showShareDialog !== null} onOpenChange={() => setShowShareDialog(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Post</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                className="flex-1 flex-col h-auto py-4 bg-transparent"
                onClick={() => handleShareToSocial(showShareDialog || "", "Twitter")}
              >
                <Twitter className="h-6 w-6 mb-2" />
                <span>Twitter</span>
              </Button>
              <Button
                variant="outline"
                className="flex-1 flex-col h-auto py-4 bg-transparent"
                onClick={() => handleShareToSocial(showShareDialog || "", "Facebook")}
              >
                <Facebook className="h-6 w-6 mb-2" />
                <span>Facebook</span>
              </Button>
              <Button
                variant="outline"
                className="flex-1 flex-col h-auto py-4 bg-transparent"
                onClick={() => handleShareToSocial(showShareDialog || "", "LinkedIn")}
              >
                <Linkedin className="h-6 w-6 mb-2" />
                <span>LinkedIn</span>
              </Button>
            </div>
            <div className="relative">
              <Input value={`https://aitd-student-hub.com/social/post/${showShareDialog}`} readOnly />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full"
                onClick={() => handleCopyLink(showShareDialog || "")}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setShowShareDialog(null)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Simple Play icon for video previews
function Play(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  )
}

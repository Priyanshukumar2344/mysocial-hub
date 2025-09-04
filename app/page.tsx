"use client"

import { DropdownMenuItem } from "@/components/ui/dropdown-menu"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ReviewForm } from "@/components/ReviewForm"
import { SponsorSection } from "@/components/sponsors/SponsorSection"
import {
  BookOpen,
  Users,
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Edit,
  Globe,
  GraduationCap,
  Mail,
  MapPin,
  PhoneIcon,
  Plus,
  Settings,
  Star,
  Trophy,
  Briefcase,
  Award,
  LogIn,
  TrendingUp,
  Clock,
  Heart,
  Share2,
  Eye,
  MessageCircle,
  Zap,
  Target,
  Sparkles,
  ArrowRight,
  Download,
  ExternalLink,
  ChevronDown,
  Filter,
  Search,
  Bell,
  LocateIcon as LocationIcon,
  Lightbulb,
  Shield,
  Code,
  Sun,
  CloudRain,
  Wind,
  Trash2,
  CalendarIcon as CalendarIconComponent,
  Backpack,
} from "lucide-react"
import Link from "next/link"
import type { CollegeProfile } from "@/lib/types"
import { usePublicAccess } from "@/hooks/use-public-access"
import { db } from "@/lib/db"
import { motion, AnimatePresence } from "framer-motion"
import { useMobileDetection } from "@/hooks/use-mobile-detection"
import { toast } from "@/components/ui/use-toast"

// Import the useSectionUpdate hook
import { useSectionUpdate } from "@/hooks/use-section-update"

// Enhanced animations
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const scaleOnHover = {
  whileHover: { scale: 1.05 },
  whileTap: { scale: 0.95 },
}

// Interactive components with animated counter
const AnimatedCounter = ({
  value,
  duration = 4000,
  suffix = "",
}: { value: number; duration?: number; suffix?: string }) => {
  const [count, setCount] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    if (!hasAnimated) {
      setHasAnimated(true)
      const startTime = Date.now()
      const startValue = 0
      const endValue = value

      const updateCount = () => {
        const now = Date.now()
        const progress = Math.min((now - startTime) / duration, 1)
        const easeOutQuart = 1 - Math.pow(1 - progress, 4)
        const currentValue = Math.floor(startValue + (endValue - startValue) * easeOutQuart)

        setCount(currentValue)

        if (progress < 1) {
          requestAnimationFrame(updateCount)
        }
      }

      requestAnimationFrame(updateCount)
    }
  }, [value, duration, hasAnimated])

  return (
    <span>
      {count.toLocaleString()}
      {suffix}
    </span>
  )
}

const InteractiveStatCard = ({ icon: Icon, value, label, color, trend, isAndroid }: any) => (
  <motion.div
    {...scaleOnHover}
    className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${color} border border-white/20 backdrop-blur-sm ${
      isAndroid ? "p-2" : "p-6"
    }`}
  >
    <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10" />
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-1">
        <Icon className={`text-white ${isAndroid ? "h-5 w-5" : "h-8 w-8"}`} />
        {trend && (
          <div className="flex items-center text-white/80 text-xs">
            <TrendingUp className="h-3 w-3 mr-1" />+{trend}%
          </div>
        )}
      </div>
      <p className={`font-bold text-white mb-1 ${isAndroid ? "text-lg" : "text-3xl"}`}>
        {typeof value === "number" ? (
          <AnimatedCounter value={value} />
        ) : value.toString().includes("%") ? (
          <AnimatedCounter value={Number.parseInt(value)} suffix="%" />
        ) : (
          value
        )}
      </p>
      <p className={`text-white/80 ${isAndroid ? "text-xs" : "text-sm"}`}>{label}</p>
    </div>
  </motion.div>
)

const NewsCard = ({ title, excerpt, date, category, image, views, likes, link, onEdit, onDelete, isAdmin }: any) => (
  <motion.div
    {...scaleOnHover}
    className="group relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300"
  >
    <div className="aspect-video overflow-hidden">
      <img
        src={image || "/placeholder.svg"}
        alt={title}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
      />
    </div>
    {isAdmin && (
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button size="sm" variant="secondary" onClick={onEdit} className="h-6 w-6 p-0">
          <Edit className="h-3 w-3" />
        </Button>
        <Button size="sm" variant="destructive" onClick={onDelete} className="h-6 w-6 p-0">
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    )}
    <div className="p-4">
      <div className="flex items-center justify-between mb-2">
        <Badge variant="secondary" className="text-xs">
          {category}
        </Badge>
        <div className="flex items-center text-xs text-muted-foreground gap-2">
          <div className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {views}
          </div>
          <div className="flex items-center gap-1">
            <Heart className="h-3 w-3" />
            {likes}
          </div>
        </div>
      </div>
      <h3 className="font-semibold text-sm mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">{title}</h3>
      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{excerpt}</p>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{date}</span>
        <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" asChild>
          <a href={link} target="_blank" rel="noopener noreferrer">
            Read More <ArrowRight className="h-3 w-3 ml-1" />
          </a>
        </Button>
      </div>
    </div>
  </motion.div>
)

const QuickActionCard = ({ icon: Icon, title, description, color, onClick, isAndroid }: any) => (
  <motion.div
    {...scaleOnHover}
    onClick={onClick}
    className={`cursor-pointer rounded-xl bg-gradient-to-br ${color} border border-white/20 backdrop-blur-sm group ${
      isAndroid ? "p-2" : "p-4"
    }`}
  >
    <div className="flex items-center gap-3">
      <div className={`bg-white/20 rounded-lg ${isAndroid ? "p-1" : "p-2"}`}>
        <Icon className={`text-white ${isAndroid ? "h-4 w-4" : "h-5 w-5"}`} />
      </div>
      <div>
        <h3 className={`font-semibold text-white ${isAndroid ? "text-xs" : "text-sm"}`}>{title}</h3>
        <p className={`text-white/80 ${isAndroid ? "text-xs" : "text-xs"}`}>{description}</p>
      </div>
      <ArrowRight
        className={`text-white/60 ml-auto group-hover:translate-x-1 transition-transform ${isAndroid ? "h-3 w-3" : "h-4 w-4"}`}
      />
    </div>
  </motion.div>
)

const WeatherWidget = ({ isAndroid }: { isAndroid: boolean }) => {
  const [weather, setWeather] = useState({
    temp: 28,
    condition: "Sunny",
    icon: Sun,
    humidity: 65,
    windSpeed: 12,
  })

  return (
    <motion.div
      {...fadeInUp}
      className={`bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl text-white ${isAndroid ? "p-3" : "p-4"}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className={`font-semibold ${isAndroid ? "text-sm" : ""}`}>Campus Weather</h3>
          <p className="text-white/80 text-xs">Kanpur, UP</p>
        </div>
        <weather.icon className={`${isAndroid ? "h-6 w-6" : "h-8 w-8"}`} />
      </div>
      <div className="flex items-center gap-4">
        <div>
          <p className={`font-bold ${isAndroid ? "text-xl" : "text-2xl"}`}>{weather.temp}°C</p>
          <p className="text-white/80 text-xs">{weather.condition}</p>
        </div>
        <div className="text-xs space-y-1">
          <div className="flex items-center gap-1">
            <Wind className="h-3 w-3" />
            {weather.windSpeed} km/h
          </div>
          <div className="flex items-center gap-1">
            <CloudRain className="h-3 w-3" />
            {weather.humidity}%
          </div>
        </div>
      </div>
    </motion.div>
  )
}

const LiveFeedCard = ({ type, user, action, time, avatar }: any) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50"
  >
    <Avatar className="h-8 w-8">
      <AvatarImage src={avatar || "/placeholder.svg"} />
      <AvatarFallback>{user.charAt(0)}</AvatarFallback>
    </Avatar>
    <div className="flex-1 min-w-0">
      <p className="text-sm">
        <span className="font-medium">{user}</span> {action}
      </p>
      <p className="text-xs text-muted-foreground">{time}</p>
    </div>
    <div className="flex-shrink-0">
      {type === "achievement" && <Trophy className="h-4 w-4 text-yellow-500" />}
      {type === "event" && <Calendar className="h-4 w-4 text-blue-500" />}
      {type === "post" && <MessageCircle className="h-4 w-4 text-green-500" />}
    </div>
  </motion.div>
)

export default function Home() {
  // Initialize state first
  const [activeTab, setActiveTab] = useState("overview")
  const [collegeProfile, setCollegeProfile] = useState<CollegeProfile | null>(null)
  const [isHallOfFameAdmin, setIsHallOfFameAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [authChecked, setAuthChecked] = useState(false)
  const [activities, setActivities] = useState([])
  const [showAllNews, setShowAllNews] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  // Mobile detection
  const { isAndroid } = useMobileDetection()

  // New state for enhanced features
  const [liveFeed, setLiveFeed] = useState([
    {
      id: 1,
      type: "achievement",
      user: "Rahul Sharma",
      action: "won the coding competition",
      time: "2 min ago",
      avatar: "/placeholder.svg",
    },
    {
      id: 2,
      type: "event",
      user: "Tech Club",
      action: "posted a new event",
      time: "5 min ago",
      avatar: "/placeholder.svg",
    },
    {
      id: 3,
      type: "post",
      user: "Priya Patel",
      action: "shared a research paper",
      time: "10 min ago",
      avatar: "/placeholder.svg",
    },
  ])

  const [campusNews, setCampusNews] = useState([
    {
      id: 1,
      title: "AITD Students Win National Hackathon",
      excerpt: "Our computer science students secured first place in the national level hackathon competition...",
      date: "2 days ago",
      category: "Achievement",
      image: "/placeholder.svg?height=200&width=300&text=Hackathon+Winners",
      views: 1250,
      likes: 89,
      link: "#",
      author: "Admin",
      publishedAt: new Date().toISOString(),
    },
    {
      id: 2,
      title: "New AI Research Lab Inaugurated",
      excerpt: "State-of-the-art artificial intelligence research laboratory opens with cutting-edge equipment...",
      date: "1 week ago",
      category: "Infrastructure",
      image: "/placeholder.svg?height=200&width=300&text=AI+Lab",
      views: 890,
      likes: 67,
      link: "#",
      author: "Admin",
      publishedAt: new Date().toISOString(),
    },
    {
      id: 3,
      title: "Industry Partnership with Tech Giants",
      excerpt: "AITD signs MOU with leading technology companies for student internships and placements...",
      date: "2 weeks ago",
      category: "Partnership",
      image: "/placeholder.svg?height=200&width=300&text=Partnership",
      views: 2100,
      likes: 156,
      link: "#",
      author: "Admin",
      publishedAt: new Date().toISOString(),
    },
  ])

  // Inside the component, after the activities state is defined
  // Add this line to use the hook
  useSectionUpdate("home", [activities.length])

  // Carousel state
  const [currentSlide, setCurrentSlide] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)
  const carouselInterval = useRef<NodeJS.Timeout | null>(null)

  // Safe access to auth context with error handling
  const router = useRouter()
  const auth = useAuth()
  const isAuthenticated = auth?.isAuthenticated || false
  const isAdmin = auth?.isAdmin || false
  const { canAccess } = usePublicAccess()

  // Handle carousel navigation
  const nextSlide = () => {
    if (!collegeProfile) return
    setCurrentSlide((prev) => (prev === collegeProfile.coverImages.length - 1 ? 0 : prev + 1))
  }

  const prevSlide = () => {
    if (!collegeProfile) return
    setCurrentSlide((prev) => (prev === 0 ? collegeProfile.coverImages.length - 1 : prev - 1))
  }

  // Set up carousel auto-rotation
  useEffect(() => {
    if (collegeProfile?.coverImages && collegeProfile.coverImages.length > 1) {
      // Clear any existing interval
      if (carouselInterval.current) {
        clearInterval(carouselInterval.current)
      }

      // Set up new interval for auto-rotation (4 seconds)
      carouselInterval.current = setInterval(() => {
        nextSlide()
      }, 4000)
    }

    // Cleanup on unmount
    return () => {
      if (carouselInterval.current) {
        clearInterval(carouselInterval.current)
      }
    }
  }, [collegeProfile, currentSlide])

  // Listen for college profile updates from admin
  useEffect(() => {
    const handleProfileUpdate = (event: CustomEvent) => {
      setCollegeProfile(event.detail)
    }

    const handleNewsUpdate = (event: CustomEvent) => {
      setCampusNews(event.detail)
    }

    window.addEventListener("collegeProfileUpdated", handleProfileUpdate as EventListener)
    window.addEventListener("campusNewsUpdated", handleNewsUpdate as EventListener)

    return () => {
      window.removeEventListener("collegeProfileUpdated", handleProfileUpdate as EventListener)
      window.removeEventListener("campusNewsUpdated", handleNewsUpdate as EventListener)
    }
  }, [])

  // Simulate live feed updates
  useEffect(() => {
    const interval = setInterval(() => {
      const newActivity = {
        id: Date.now(),
        type: ["achievement", "event", "post"][Math.floor(Math.random() * 3)],
        user: ["Alex Kumar", "Sarah Singh", "Raj Patel", "Maya Sharma"][Math.floor(Math.random() * 4)],
        action: ["completed a project", "joined a club", "posted an update", "won an award"][
          Math.floor(Math.random() * 4)
        ],
        time: "just now",
        avatar: "/placeholder.svg",
      }
      setLiveFeed((prev) => [newActivity, ...prev.slice(0, 4)])
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Mark auth as checked to prevent multiple redirects
    setAuthChecked(true)

    // Always fetch college profile for both authenticated and non-authenticated users
    const fetchCollegeProfile = async () => {
      setLoading(true)

      // Set Hall of Fame admin access only for authenticated admins
      if (isAuthenticated && isAdmin) {
        setIsHallOfFameAdmin(true)
      }

      // Load from localStorage first, then fallback to mock data
      const savedProfile = db.get("collegeProfile")
      const savedNews = db.get("campusNews")

      if (savedNews) {
        setCampusNews(savedNews)
      }

      const mockProfile: CollegeProfile = savedProfile || {
        id: "2301661530047",
        name: "Dr.ambedkar institute of technology for divyangjan",
        logo: "/placeholder.svg?height=100&width=100",
        coverImages: [
          {
            id: "cover1",
            url: "/placeholder.svg?height=400&width=1200&text=AITD+Campus+Main+Building",
            caption: "Main Campus Building - Where Innovation Meets Excellence",
            order: 1,
          },
          {
            id: "cover2",
            url: "/placeholder.svg?height=400&width=1200&text=AITD+Modern+Library",
            caption: "State-of-the-art Central Library with Digital Resources",
            order: 2,
          },
          {
            id: "cover3",
            url: "/placeholder.svg?height=400&width=1200&text=AITD+Research+Labs",
            caption: "Advanced Research Laboratories for Cutting-edge Innovation",
            order: 3,
          },
          {
            id: "cover4",
            url: "/placeholder.svg?height=400&width=1200&text=AITD+Sports+Complex",
            caption: "Modern Sports Complex and Recreation Facilities",
            order: 4,
          },
        ],
        description:
          "AITD Engineering College stands as a beacon of inclusive education and technological excellence. We are committed to empowering students with disabilities through cutting-edge technology, innovative teaching methods, and comprehensive support systems. Our mission is to create an accessible learning environment where every student can achieve their full potential and contribute meaningfully to society.",
        established: "1998",
        location: {
          address: "misrilal chauraha",
          city: "kanpur",
          state: "Uttar Pradesh",
          country: "India",
          pincode: "560001",
        },
        contact: {
          email: "info@aitd.edu",
          phone: "+91 9470049202",
          website: "www.aitd.edu",
        },
        stats: {
          students: 3500,
          faculty: 76,
          courses: 15,
          alumni: 12000,
          placement: "92%",
        },
        rankings: {
          nirf: 75,
          naac: "A+",
          other: [
            "Top 100 Engineering Colleges in India",
            "Excellence in Research Award 2023",
            "Best Inclusive Education Institute 2023",
          ],
        },
        achievements: [
          {
            id: "1",
            title: "Excellence in Research Award",
            date: "2023-05-15",
            description:
              "Awarded for outstanding contributions to research in AI and Machine Learning with focus on accessibility technologies.",
            images: [],
          },
          {
            id: "2",
            title: "Best Infrastructure Award",
            date: "2022-12-10",
            description: "Recognized for having one of the best accessible campus infrastructures in the region.",
            images: [],
          },
          {
            id: "3",
            title: "Innovation Hub of the Year",
            date: "2023-02-20",
            description: "Awarded for fostering innovation and entrepreneurship among students with disabilities.",
            images: [],
          },
          {
            id: "4",
            title: "Digital Accessibility Champion",
            date: "2023-08-10",
            description: "Leading institution in developing accessible digital learning platforms.",
            images: [],
          },
        ],
        topPerformers: {
          students: [
            {
              id: "1",
              name: "Rahul Sharma",
              course: "B.Tech Computer Science",
              achievement: "Gold Medal in Academics & National Coding Champion",
              avatar: "/placeholder.svg",
            },
            {
              id: "2",
              name: "Priya Patel",
              course: "B.Tech Electronics",
              achievement: "Best Innovation Project - Accessible Smart Home System",
              avatar: "/placeholder.svg",
            },
            {
              id: "3",
              name: "Arjun Singh",
              course: "M.Tech AI & ML",
              achievement: "Research Publication in IEEE - Accessibility AI",
              avatar: "/placeholder.svg",
            },
            {
              id: "4",
              name: "Sneha Gupta",
              course: "B.Tech Civil",
              achievement: "National Award for Accessible Infrastructure Design",
              avatar: "/placeholder.svg",
            },
          ],
        },
        courses: [
          {
            id: "1",
            name: "Computer Science & Engineering",
            description:
              "Comprehensive program covering software development, AI, machine learning, and accessibility technologies with hands-on projects.",
            duration: "4 years",
            fees: 150000,
          },
          {
            id: "2",
            name: "Electronics & Communication",
            description:
              "Advanced curriculum in electronic systems, IoT, communication networks, and assistive technology development.",
            duration: "4 years",
            fees: 140000,
          },
          {
            id: "3",
            name: "Artificial Intelligence & Machine Learning",
            description:
              "Cutting-edge program focusing on AI algorithms, deep learning, accessibility AI, and ethical technology development.",
            duration: "4 years",
            fees: 160000,
          },
          {
            id: "4",
            name: "Civil Engineering",
            description:
              "Specialized in accessible infrastructure design, smart cities, sustainable construction, and universal design principles.",
            duration: "4 years",
            fees: 135000,
          },
        ],
        upcomingEvents: [
          {
            id: "1",
            title: "Tech Symposium 2024: Accessible Innovation",
            description:
              "Annual technical symposium featuring keynote speakers from leading tech companies focusing on inclusive technology.",
            startDate: "2024-04-15",
            endDate: "2024-04-17",
            location: "Main Auditorium",
            organizer: "admin",
            attendees: [],
            interested: [],
            visibility: "public",
          },
          {
            id: "2",
            title: "Alumni Meet & Career Fair",
            description:
              "Annual gathering of alumni with career opportunities and networking sessions for current students.",
            startDate: "2024-05-20",
            endDate: "2024-05-21",
            location: "College Campus",
            organizer: "admin",
            attendees: [],
            interested: [],
            visibility: "public",
          },
          {
            id: "3",
            title: "Accessibility Hackathon 2024",
            description: "48-hour hackathon focused on developing solutions for accessibility and inclusive design.",
            startDate: "2024-06-10",
            endDate: "2024-06-12",
            location: "Innovation Lab",
            organizer: "admin",
            attendees: [],
            interested: [],
            visibility: "public",
          },
        ],
        faculty: [
          {
            id: "1",
            name: "Dr. Anil Kumar",
            designation: "Professor & Head",
            department: "Computer Science",
            avatar: "/placeholder.svg",
            email: "anil@aitd.edu",
            phone: "+91 9876543210",
          },
          {
            id: "2",
            name: "Dr. Priya Reddy",
            designation: "Associate Professor",
            department: "Electronics",
            avatar: "/placeholder.svg",
            email: "priya@aitd.edu",
            phone: "+91 9876543211",
          },
          {
            id: "3",
            name: "Dr. Rajesh Gupta",
            designation: "Professor",
            department: "AI & Machine Learning",
            avatar: "/placeholder.svg",
            email: "rajesh@aitd.edu",
            phone: "+91 9876543212",
          },
        ],
        isVerified: true,
      }

      setCollegeProfile(mockProfile)
      setLoading(false)
    }

    fetchCollegeProfile()
  }, [isAuthenticated, isAdmin, router])

  const quickActions = [
    {
      icon: BookOpen,
      title: "Library Access",
      description: "Browse digital resources",
      color: "from-green-400 to-green-600",
      onClick: () => router.push("/library"),
    },
    {
      icon: Users,
      title: "Connect",
      description: "Find study partners",
      color: "from-blue-400 to-blue-600",
      onClick: () => router.push("/social"),
    },
    {
      icon: Calendar,
      title: "Events",
      description: "Upcoming activities",
      color: "from-purple-400 to-purple-600",
      onClick: () => setActiveTab("events"),
    },
    {
      icon: MessageCircle,
      title: "Chat",
      description: "Join discussions",
      color: "from-pink-400 to-pink-600",
      onClick: () => router.push("/chat"),
    },
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
        />
        <p className="ml-4 text-lg font-medium">Loading your dashboard...</p>
      </div>
    )
  }

  if (!collegeProfile) {
    return (
      <div className="container mx-auto py-10 text-center">
        <p>College profile not found</p>
      </div>
    )
  }

  // Enhanced login prompt with more features
  const LoginPromptBanner = () => (
    <div className="mb-8">
      <Card className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 border-0 text-white">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24" />

        <CardContent className={`relative z-10 ${isAndroid ? "p-4" : "p-8"}`}>
          <div className={`flex items-center ${isAndroid ? "flex-col gap-4" : "justify-between"}`}>
            <div className="flex items-center gap-6">
              <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className={`font-bold mb-2 ${isAndroid ? "text-lg" : "text-2xl"}`}>Welcome to AITD Social Hub</h3>
                <p className={`text-white/90 mb-4 ${isAndroid ? "text-sm" : "text-lg"}`}>
                  Join our inclusive community of learners, innovators, and changemakers
                </p>
                <div className={`flex items-center gap-6 text-sm text-white/80 ${isAndroid ? "flex-wrap" : ""}`}>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>3,500+ Students</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4" />
                    <span>Award Winning</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <span>Inclusive Education</span>
                  </div>
                </div>
              </div>
            </div>
            <div className={`flex gap-3 ${isAndroid ? "flex-col w-full" : "flex-col"}`}>
              <Button
                asChild
                size={isAndroid ? "default" : "lg"}
                className="bg-white text-blue-600 hover:bg-white/90 font-semibold"
              >
                <Link href="/login">
                  <LogIn className="h-5 w-5 mr-2" />
                  Login Now
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size={isAndroid ? "default" : "lg"}
                className="border-white/30 text-white hover:bg-white/10 bg-transparent"
              >
                <Link href="/register">
                  <Users className="h-5 w-5 mr-2" />
                  Join Community
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className={`container mx-auto space-y-8 ${isAndroid ? "py-4 px-4" : "py-6"}`}>
        {/* Show enhanced login prompt for non-authenticated users */}
        {!isAuthenticated && <LoginPromptBanner />}

        {/* Enhanced Hero Section with Parallax Effect - Android Optimized */}
        <motion.div
          {...fadeInUp}
          className={`relative rounded-2xl overflow-hidden shadow-2xl ${isAndroid ? "h-[250px]" : "h-[400px]"}`}
          ref={carouselRef}
        >
          {/* Carousel Images with Parallax */}
          <div className="relative h-full w-full">
            <AnimatePresence mode="wait">
              {collegeProfile.coverImages.map(
                (image, index) =>
                  index === currentSlide && (
                    <motion.div
                      key={image.id}
                      initial={{ opacity: 0, scale: 1.1 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.7 }}
                      className="absolute inset-0"
                    >
                      <img
                        src={image.url || "/placeholder.svg"}
                        alt={image.caption || `${collegeProfile.name} campus`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                      {/* Floating Caption - Android Optimized */}
                      {image.caption && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          className={`absolute text-center ${isAndroid ? "bottom-5 left-4 right-2" : "bottom-10 left-4 right-4"}`}
                        >
                          <p
                            className={`font-medium bg-black/30 backdrop-blur-sm rounded-lg px-4 py-2 inline-block text-white  ? "text-sm" : "text-lg"}`}
                          >
                            {image.caption}
                          </p>
                        </motion.div>
                      )}
                    </motion.div>
                  ),
              )}
            </AnimatePresence>
          </div>

          {/* Enhanced Navigation - Android Optimized */}
          {collegeProfile.coverImages.length > 1 && (
            <>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={prevSlide}
                className={`absolute top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white rounded-full backdrop-blur-sm transition-all ${isAndroid ? "left-2 p-2" : "left-4 p-3"}`}
                aria-label="Previous slide"
              >
                <ChevronLeft className={`${isAndroid ? "h-4 w-4" : "h-6 w-6"}`} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={nextSlide}
                className={`absolute top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white rounded-full backdrop-blur-sm transition-all ${isAndroid ? "right-2 p-2" : "right-4 p-3"}`}
                aria-label="Next slide"
              >
                <ChevronRight className={`${isAndroid ? "h-4 w-4" : "h-6 w-6"}`} />
              </motion.button>

              {/* Enhanced Indicators - Android Optimized */}
              <div className={`absolute left-1/2 -translate-x-1/2 flex gap-2 ${isAndroid ? "bottom-4" : "bottom-6"}`}>
                {collegeProfile.coverImages.map((_, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.2 }}
                    onClick={() => setCurrentSlide(index)}
                    className={`rounded-full transition-all ${isAndroid ? "h-2 w-2" : "h-3 w-3"} ${
                      index === currentSlide ? "bg-white shadow-lg" : "bg-white/50 hover:bg-white/70"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Enhanced College Info Overlay - Android Optimized */}
          <div className={`absolute left-0 right-0 ${isAndroid ? "top-4 p-4" : "top-4 p-8"}`}>
            {isAndroid ? (
              // Android Layout - College name at top
              <div className="flex flex-col gap-4">
                {/* College Name at Top */}
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <h1 className="text-lg font-bold text-white drop-shadow-lg">{collegeProfile.name}</h1>
                    {collegeProfile.isVerified && (
                      <Badge className="bg-blue-500 text-white border-0 shadow-lg text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Official
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-center gap-3 text-white/90 text-sm flex-wrap">
                    <p>Est. {collegeProfile.established}</p>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>
                        {collegeProfile.location.city}, {collegeProfile.location.state}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-400" />
                      <span>NAAC {collegeProfile.rankings.naac}</span>
                    </div>
                  </div>
                </div>

                {/* Admin Controls - Top Right */}
                {isAuthenticated && isAdmin && (
                  <div className="absolute top-4 right-4">
                    <motion.div whileHover={{ scale: 1.05 }}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm p-2">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56">
                          <DropdownMenuLabel>College Profile Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href="/admin/college-profile" className="cursor-pointer flex items-center">
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Profile
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Achievement
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Event
                          </DropdownMenuItem>
                          {isHallOfFameAdmin && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem asChild>
                                <Link href="/admin/hall-of-fame" className="cursor-pointer flex items-center">
                                  <Trophy className="h-4 w-4 mr-2" />
                                  Manage Hall of Fame
                                </Link>
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </motion.div>
                  </div>
                )}
              </div>
            ) : (
              // Desktop Layout - Moved to top like Android
              <div className="flex flex-col gap-4">
                {/* College Name at Top */}
                <div className="text-center">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <h1 className="drop-shadow-lg border-0 text-4xl font-extrabold text-white">
                      {collegeProfile.name}
                    </h1>
                    {collegeProfile.isVerified && (
                      <Badge className="bg-blue-500 text-white border-0 shadow-lg">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Official
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-center gap-4 text-white/90 flex-wrap">
                    <p className="text-lg">Est. {collegeProfile.established}</p>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>
                        {collegeProfile.location.city}, {collegeProfile.location.state}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-400" />
                      <span>NAAC {collegeProfile.rankings.naac}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Profile Photo - Bottom Left for both Desktop and Android */}
          <div className={`absolute ${isAndroid ? "bottom-4 left-4" : "bottom-6 left-6"}`}>
            <motion.div whileHover={{ scale: 1.05 }} className="relative">
              <Avatar className={`border-4 border-white shadow-xl ${isAndroid ? "h-16 w-16" : "h-24 w-24"}`}>
                <AvatarImage src={collegeProfile.logo || "/placeholder.svg"} alt={collegeProfile.name} />
                <AvatarFallback className={`font-bold ${isAndroid ? "text-lg" : "text-xl"}`}>
                  {collegeProfile.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              {collegeProfile.isVerified && (
                <div
                  className={`absolute bg-blue-500 rounded-full p-1 ${isAndroid ? "-top-1 -right-1" : "-top-2 -right-2"}`}
                >
                  <CheckCircle className={`text-white ${isAndroid ? "h-3 w-3" : "h-4 w-4"}`} />
                </div>
              )}
            </motion.div>
          </div>

          {/* Admin Controls - Bottom Right for Desktop */}
          {!isAndroid && isAuthenticated && isAdmin && (
            <div className="absolute bottom-6 right-6">
              <motion.div whileHover={{ scale: 1.05 }}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Manage
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuLabel>College Profile Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/admin/college-profile" className="cursor-pointer flex items-center">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Achievement
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Event
                    </DropdownMenuItem>
                    {isHallOfFameAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/admin/hall-of-fame" className="cursor-pointer flex items-center">
                            <Trophy className="h-4 w-4 mr-2" />
                            Manage Hall of Fame
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </motion.div>
            </div>
          )}
        </motion.div>

        {/* Enhanced Quick Stats with Animations - Android Optimized */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className={`grid gap-3 ${isAndroid ? "grid-cols-2" : "grid-cols-2 md:grid-cols-5"}`}
        >
          <motion.div variants={fadeInUp}>
            <InteractiveStatCard
              icon={Users}
              value={collegeProfile.stats.students.toLocaleString()}
              label="Students"
              color="from-blue-500 to-blue-600"
              trend={8}
              isAndroid={isAndroid}
            />
          </motion.div>
          <motion.div variants={fadeInUp}>
            <InteractiveStatCard
              icon={GraduationCap}
              value={collegeProfile.stats.faculty}
              label="Faculty"
              color="from-purple-500 to-purple-600"
              trend={12}
              isAndroid={isAndroid}
            />
          </motion.div>
          <motion.div variants={fadeInUp}>
            <InteractiveStatCard
              icon={BookOpen}
              value={collegeProfile.stats.courses}
              label="Programs"
              color="from-green-500 to-green-600"
              trend={5}
              isAndroid={isAndroid}
            />
          </motion.div>
          <motion.div variants={fadeInUp}>
            <InteractiveStatCard
              icon={Trophy}
              value={collegeProfile.stats.alumni.toLocaleString()}
              label="Alumni"
              color="from-amber-500 to-amber-600"
              trend={15}
              isAndroid={isAndroid}
            />
          </motion.div>
          <motion.div variants={fadeInUp} className={isAndroid ? "col-span-2" : ""}>
            <InteractiveStatCard
              icon={Briefcase}
              value={Number.parseInt(collegeProfile.stats.placement) || 92}
              label="Placement"
              color="from-red-500 to-red-600"
              trend={3}
              isAndroid={isAndroid}
              suffix="%"
            />
          </motion.div>
        </motion.div>

        {/* Quick Actions & Live Feed Section - Android Optimized */}
        {isAuthenticated && (
          <div className={`grid gap-6 ${isAndroid ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-3"}`}>
            {/* Quick Actions */}
            <motion.div {...fadeInUp} className={isAndroid ? "" : "lg:col-span-2"}>
              <Card className={`bg-white/80 backdrop-blur-sm border-0 shadow-xl ${isAndroid ? "p-4" : "p-6"}`}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className={`font-bold flex items-center gap-2 ${isAndroid ? "text-lg" : "text-xl"}`}>
                    <Zap className="h-5 w-5 text-yellow-500" />
                    Quick Actions
                  </h2>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
                <div className={`grid gap-3 ${isAndroid ? "grid-cols-2" : "grid-cols-2"}`}>
                  {quickActions.map((action, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <QuickActionCard {...action} isAndroid={isAndroid} />
                    </motion.div>
                  ))}
                </div>
              </Card>

              <motion.div {...fadeInUp} className="mt-8">
                <Card className={`bg-white/80 backdrop-blur-sm border-0 shadow-xl ${isAndroid ? "p-4" : "p-6"}`}>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className={`font-semibold flex items-center gap-2 ${isAndroid ? "text-lg" : "text-xl"}`}>
                      <Star className="h-5 w-5 text-yellow-500" />
                      Featured Sponsors
                    </h3>
                  </div>
                  <div className="w-full">
                    <SponsorSection section="home" variant="stacked" size="large" className="w-full" />
                  </div>
                </Card>
              </motion.div>
            </motion.div>

            {/* Live Feed & Weather - Always show on Android */}
            <div className="space-y-4">
              <WeatherWidget isAndroid={isAndroid} />

              <motion.div {...fadeInUp}>
                <Card className={`bg-white/80 backdrop-blur-sm border-0 shadow-xl ${isAndroid ? "p-3" : "p-4"}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`font-semibold flex items-center gap-2 ${isAndroid ? "text-sm" : ""}`}>
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      Live Campus Feed
                    </h3>
                    <Button variant="ghost" size="sm">
                      <Bell className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className={`space-y-3 overflow-y-auto ${isAndroid ? "max-h-48" : "max-h-64"}`}>
                    <AnimatePresence>
                      {liveFeed.slice(0, isAndroid ? 3 : 5).map((item) => (
                        <LiveFeedCard key={item.id} {...item} />
                      ))}
                    </AnimatePresence>
                  </div>
                </Card>
              </motion.div>
            </div>
          </div>
        )}

        {/* Campus News & Updates - Android Optimized */}
        <motion.div {...fadeInUp}>
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <div className={`flex items-center mb-6 ${isAndroid ? "flex-col gap-4" : "justify-between"}`}>
              <h2 className={`font-bold flex items-center gap-2 ${isAndroid ? "text-lg" : "text-2xl"}`}>
                <Sparkles className={`text-blue-500 ${isAndroid ? "h-5 w-5" : "h-6 w-6"}`} />
                Campus News & Updates
              </h2>
              <div className={`flex items-center gap-2 ${isAndroid ? "w-full" : ""}`}>
                <div className="relative flex-1">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search news..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`pl-10 ${isAndroid ? "text-sm h-9" : "w-64"}`}
                  />
                </div>
                <Button variant="outline" size={isAndroid ? "sm" : "sm"} className={isAndroid ? "text-xs" : ""}>
                  <Filter className={`mr-2 ${isAndroid ? "h-3 w-3" : "h-4 w-4"}`} />
                  Filter
                </Button>
                {isAuthenticated && isAdmin && (
                  <Button asChild size={isAndroid ? "sm" : "sm"} className={isAndroid ? "text-xs" : ""}>
                    <Link href="/admin/college-profile?tab=news">
                      <Plus className={`mr-2 ${isAndroid ? "h-3 w-3" : "h-4 w-4"}`} />
                      Add News
                    </Link>
                  </Button>
                )}
              </div>
            </div>

            <div className={`grid gap-6 ${isAndroid ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"}`}>
              {campusNews
                .filter(
                  (news) =>
                    searchQuery === "" ||
                    news.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    news.category.toLowerCase().includes(searchQuery.toLowerCase()),
                )
                .slice(0, showAllNews ? campusNews.length : isAndroid ? 2 : 3)
                .map((news, index) => (
                  <motion.div
                    key={news.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <NewsCard
                      {...news}
                      isAdmin={isAuthenticated && isAdmin}
                      onEdit={() => router.push(`/admin/college-profile?tab=news&edit=${news.id}`)}
                      onDelete={() => {
                        setCampusNews(campusNews.filter((n) => n.id !== news.id))
                        toast({
                          title: "News Deleted",
                          description: "News article has been removed successfully.",
                        })
                      }}
                    />
                  </motion.div>
                ))}
            </div>

            {campusNews.length > (isAndroid ? 2 : 3) && (
              <div className="text-center mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowAllNews(!showAllNews)}
                  className="bg-white/50 hover:bg-white/80"
                >
                  {showAllNews ? "Show Less" : "View All News"}
                  <ChevronDown
                    className={`ml-2 transition-transform ${isAndroid ? "h-3 w-3" : "h-4 w-4"} ${showAllNews ? "rotate-180" : ""}`}
                  />
                </Button>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Enhanced Featured Sections - Android Optimized */}
        <div className={`grid gap-6 ${isAndroid ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-3"}`}>
          {/* Achievements with Progress */}
          <motion.div {...fadeInUp}>
            <Card className="h-full bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-800 shadow-xl">
              <CardHeader className="pb-3">
                <CardTitle className={`flex items-center gap-2 ${isAndroid ? "text-base" : ""}`}>
                  <Trophy className="h-5 w-5 text-amber-500" />
                  Recent Achievements
                  <Badge variant="secondary" className="ml-auto">
                    {collegeProfile.achievements.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {collegeProfile.achievements.slice(0, isAndroid ? 2 : 3).map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group p-3 rounded-lg bg-white/50 hover:bg-white/80 transition-all cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600 group-hover:scale-110 transition-transform">
                        <Award className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h4
                          className={`font-semibold group-hover:text-amber-600 transition-colors ${isAndroid ? "text-sm" : "text-sm"}`}
                        >
                          {achievement.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mb-2">
                          {new Date(achievement.date).toLocaleDateString()}
                        </p>
                        <p className="text-xs line-clamp-2">{achievement.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
                <Button variant="outline" className="w-full bg-white/50 hover:bg-white/80" size="sm">
                  <Trophy className="h-4 w-4 mr-2" />
                  View All Achievements
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Top Performers with Rankings */}
          <motion.div {...fadeInUp}>
            <Card className="h-full bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/30 border-yellow-200 dark:border-yellow-800 shadow-xl">
              <CardHeader className="pb-3">
                <CardTitle className={`flex items-center gap-2 ${isAndroid ? "text-base" : ""}`}>
                  <Star className="h-5 w-5 text-yellow-500" />
                  Hall of Fame
                  <Badge variant="secondary" className="ml-auto">
                    Top {collegeProfile.topPerformers.students.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {collegeProfile.topPerformers.students.slice(0, isAndroid ? 2 : 4).map((student, index) => (
                  <motion.div
                    key={student.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group p-3 rounded-lg bg-white/50 hover:bg-white/80 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar
                          className={`border-2 border-yellow-200 group-hover:border-yellow-400 transition-colors ${isAndroid ? "h-10 w-10" : "h-12 w-12"}`}
                        >
                          <AvatarImage src={student.avatar || "/placeholder.svg"} />
                          <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div
                          className={`absolute -top-1 -right-1 flex items-center justify-center rounded-full bg-yellow-500 text-white text-xs font-bold border-2 border-white ${isAndroid ? "h-5 w-5" : "h-6 w-6"}`}
                        >
                          {index + 1}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4
                          className={`font-semibold group-hover:text-yellow-600 transition-colors ${isAndroid ? "text-sm" : "text-sm"}`}
                        >
                          {student.name}
                        </h4>
                        <p className="text-xs text-muted-foreground">{student.course}</p>
                        <p className="text-xs mt-1 line-clamp-1">{student.achievement}</p>
                      </div>
                      <div className="flex flex-col items-center">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-xs text-muted-foreground">#{index + 1}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
                <Button variant="outline" className="w-full bg-white/50 hover:bg-white/80" size="sm" asChild>
                  <Link href="/hall-of-fame">
                    <Star className="h-4 w-4 mr-2" />
                    View Hall of Fame
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div {...fadeInUp}>
            <Card className="h-full bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800 shadow-xl">
              <CardHeader className="pb-3">
                <CardTitle className={`flex items-center gap-2 ${isAndroid ? "text-base" : ""}`}>
                  <Calendar className="h-5 w-5 text-blue-500" />
                  Upcoming Events
                  <Badge variant="secondary" className="ml-auto">
                    {collegeProfile.upcomingEvents.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {collegeProfile.upcomingEvents.slice(0, isAndroid ? 2 : 3).map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group p-3 rounded-lg bg-white/50 hover:bg-white/80 transition-all cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`shrink-0 flex-col items-center justify-center rounded-lg bg-blue-100 text-blue-600 group-hover:scale-110 transition-transform ${isAndroid ? "flex h-10 w-10" : "flex h-12 w-12"}`}
                      >
                        <span className="text-xs font-semibold">
                          {new Date(event.startDate).toLocaleDateString("en-US", { month: "short" })}
                        </span>
                        <span className={`font-bold ${isAndroid ? "text-xs" : "text-sm"}`}>
                          {new Date(event.startDate).getDate()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4
                          className={`font-semibold group-hover:text-blue-600 transition-colors line-clamp-1 ${isAndroid ? "text-sm" : "text-sm"}`}
                        >
                          {event.title}
                        </h4>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                          <MapPin className="h-3 w-3" /> {event.location}
                        </p>
                        <p className="text-xs line-clamp-2">{event.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Button size="sm" variant="ghost" className={`px-2 text-xs ${isAndroid ? "h-5" : "h-6"}`}>
                            <Heart className="h-3 w-3 mr-1" />
                            Interested
                          </Button>
                          <Button size="sm" variant="ghost" className={`px-2 text-xs ${isAndroid ? "h-5" : "h-6"}`}>
                            <Share2 className="h-3 w-3 mr-1" />
                            Share
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
                <Button variant="outline" className="w-full bg-white/50 hover:bg-white/80" size="sm">
                  <CalendarIconComponent className="h-4 w-4 mr-2" />
                  View Event Calendar
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
        <motion.div {...fadeInUp}>
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="border-b bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-t-lg">
                <TabsList className={`grid grid-cols-4 bg-transparent p-1 ${isAndroid ? "h-12" : "h-14"}`}>
                  <TabsTrigger
                    value="overview"
                    className={`data-[state=active]:bg-white data-[state=active]:shadow-md ${isAndroid ? "text-xs" : ""}`}
                  >
                    <BookOpen className={`mr-2 ${isAndroid ? "h-3 w-3" : "h-4 w-4"}`} />
                    Overview
                  </TabsTrigger>
                  <TabsTrigger
                    value="courses"
                    className={`data-[state=active]:bg-white data-[state=active]:shadow-md ${isAndroid ? "text-xs" : ""}`}
                  >
                    <GraduationCap className={`mr-2 ${isAndroid ? "h-3 w-3" : "h-4 w-4"}`} />
                    Programs
                  </TabsTrigger>
                  <TabsTrigger
                    value="faculty"
                    className={`data-[state=active]:bg-white data-[state=active]:shadow-md ${isAndroid ? "text-xs" : ""}`}
                  >
                    <Users className={`mr-2 ${isAndroid ? "h-3 w-3" : "h-4 w-4"}`} />
                    Faculty
                  </TabsTrigger>
                  <TabsTrigger
                    value="contact"
                    className={`data-[state=active]:bg-white data-[state=active]:shadow-md ${isAndroid ? "text-xs" : ""}`}
                  >
                    <Mail className={`mr-2 ${isAndroid ? "h-3 w-3" : "h-4 w-4"}`} />
                    Contact
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className={`${isAndroid ? "p-4" : "p-6"}`}>
                <TabsContent value="overview" className="space-y-6 mt-0">
                  <div className="prose max-w-none">
                    <motion.div {...fadeInUp}>
                      <h2 className={`font-bold mb-4 flex items-center gap-2 ${isAndroid ? "text-xl" : "text-2xl"}`}>
                        <Lightbulb className={`text-yellow-500 ${isAndroid ? "h-5 w-5" : "h-6 w-6"}`} />
                        About {collegeProfile.name}
                      </h2>
                      <p
                        className={`leading-relaxed text-muted-foreground mb-6 ${isAndroid ? "text-base" : "text-lg"}`}
                      >
                        {collegeProfile.description}
                      </p>
                    </motion.div>

                    {/* Enhanced Rankings Section - Android Optimized */}
                    <motion.div {...fadeInUp} className="mt-8">
                      <h3 className={`font-semibold mb-4 flex items-center gap-2 ${isAndroid ? "text-lg" : "text-xl"}`}>
                        <Trophy className="h-5 w-5 text-amber-500" />
                        Rankings & Accreditations
                      </h3>
                      <div className={`grid gap-4 ${isAndroid ? "grid-cols-1" : "grid-cols-1 md:grid-cols-3"}`}>
                        {collegeProfile.rankings.nirf && (
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200"
                          >
                            <div className={`font-bold text-blue-600 mb-2 ${isAndroid ? "text-2xl" : "text-3xl"}`}>
                              #{collegeProfile.rankings.nirf}
                            </div>
                            <div className="text-sm text-blue-700 font-medium">NIRF Ranking</div>
                            <div className="text-xs text-blue-600 mt-1">National Ranking</div>
                          </motion.div>
                        )}
                        {collegeProfile.rankings.naac && (
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200"
                          >
                            <div className={`font-bold text-green-600 mb-2 ${isAndroid ? "text-2xl" : "text-3xl"}`}>
                              {collegeProfile.rankings.naac}
                            </div>
                            <div className="text-sm text-green-700 font-medium">NAAC Grade</div>
                            <div className="text-xs text-green-600 mt-1">Accreditation</div>
                          </motion.div>
                        )}
                        {collegeProfile.rankings.other && collegeProfile.rankings.other.length > 0 && (
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200"
                          >
                            <div className={`font-bold text-purple-600 mb-2 ${isAndroid ? "text-xl" : "text-2xl"}`}>
                              <Award className={`${isAndroid ? "h-6 w-6" : "h-8 w-8"}`} />
                            </div>
                            <div className="text-sm text-purple-700 font-medium text-center">
                              {collegeProfile.rankings.other.length} Awards
                            </div>
                            <div className="text-xs text-purple-600 mt-1">Recognition</div>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>

                    {/* Enhanced Categories for Authenticated Users - Android Optimized */}
                    {isAuthenticated && (
                      <motion.div {...fadeInUp} className="mt-8">
                        <h3
                          className={`font-semibold mb-4 flex items-center gap-2 ${isAndroid ? "text-lg" : "text-xl"}`}
                        >
                          <Target className="h-5 w-5 text-blue-500" />
                          Explore Categories
                        </h3>
                        <div className={`grid gap-4 ${isAndroid ? "grid-cols-2" : "grid-cols-2 md:grid-cols-4"}`}>
                          {[
                            {
                              icon: Backpack,
                              label: "Academics",
                              color: "from-blue-500 to-blue-600",
                              href: "/academics",
                            },
                            {
                              icon: Users,
                              label: "Admissions",
                              color: "from-green-500 to-green-600",
                              href: "/admissions",
                            },
                            {
                              icon: Trophy,
                              label: "Achievements",
                              color: "from-amber-500 to-amber-600",
                              href: "/achievements",
                            },
                            {
                              icon: Star,
                              label: "Hall of Fame",
                              color: "from-purple-500 to-purple-600",
                              href: "/hall-of-fame",
                            },
                          ].map((category, index) => (
                            <motion.div
                              key={category.label}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Link href={category.href}>
                                <div
                                  className={`rounded-xl bg-gradient-to-br ${category.color} text-white cursor-pointer group ${isAndroid ? "p-3" : "p-4"}`}
                                >
                                  <category.icon
                                    className={`mb-2 group-hover:scale-110 transition-transform ${isAndroid ? "h-5 w-5" : "h-6 w-6"}`}
                                  />
                                  <p className={`font-medium ${isAndroid ? "text-sm" : ""}`}>{category.label}</p>
                                  <ArrowRight
                                    className={`mt-2 group-hover:translate-x-1 transition-transform ${isAndroid ? "h-3 w-3" : "h-4 w-4"}`}
                                  />
                                </div>
                              </Link>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="courses" className="space-y-6 mt-0">
                  <motion.div {...fadeInUp}>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className={`font-bold flex items-center gap-2 ${isAndroid ? "text-xl" : "text-2xl"}`}>
                        <GraduationCap className={`text-blue-500 ${isAndroid ? "h-5 w-5" : "h-6 w-6"}`} />
                        Academic Programs
                      </h2>
                      <Badge variant="secondary" className={`${isAndroid ? "text-xs" : "text-sm"}`}>
                        {collegeProfile.courses.length} Programs Available
                      </Badge>
                    </div>

                    <div className="grid gap-6">
                      {collegeProfile.courses.map((course, index) => (
                        <motion.div
                          key={course.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.02 }}
                          className="group"
                        >
                          <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
                            <CardHeader className="pb-3">
                              <div className={`flex items-start ${isAndroid ? "flex-col gap-3" : "justify-between"}`}>
                                <div>
                                  <CardTitle
                                    className={`group-hover:text-blue-600 transition-colors flex items-center gap-2 ${isAndroid ? "text-lg" : "text-xl"}`}
                                  >
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                      <Code className="h-5 w-5 text-blue-600" />
                                    </div>
                                    {course.name}
                                  </CardTitle>
                                  <CardDescription className={`${isAndroid ? "text-sm" : "text-base"}`}>
                                    Duration: {course.duration}
                                  </CardDescription>
                                </div>
                                <div className={`${isAndroid ? "self-start" : "text-right"}`}>
                                  <Badge
                                    variant="secondary"
                                    className={`font-semibold px-3 py-1 ${isAndroid ? "text-base" : "text-lg"}`}
                                  >
                                    ₹{course.fees?.toLocaleString()}
                                  </Badge>
                                  <p className="text-xs text-muted-foreground mt-1">Annual Fee</p>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="pb-4">
                              <p className="text-muted-foreground leading-relaxed">{course.description}</p>

                              {/* Course Features */}
                              <div className="flex flex-wrap gap-2 mt-4">
                                <Badge variant="outline" className="text-xs">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {course.duration}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  <Users className="h-3 w-3 mr-1" />
                                  Limited Seats
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  <Trophy className="h-3 w-3 mr-1" />
                                  Industry Recognized
                                </Badge>
                              </div>
                            </CardContent>
                            <CardFooter
                              className={`pt-0 bg-gray-50/50 dark:bg-gray-800/50 ${isAndroid ? "flex-col gap-3" : "flex justify-between items-center"}`}
                            >
                              <div
                                className={`flex items-center gap-4 text-sm text-muted-foreground ${isAndroid ? "self-start" : ""}`}
                              >
                                <div className="flex items-center gap-1">
                                  <BookOpen className="h-4 w-4" />
                                  <span>Full-time</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <GraduationCap className="h-4 w-4" />
                                  <span>B.Tech Degree</span>
                                </div>
                              </div>
                              <div className={`flex gap-2 ${isAndroid ? "w-full" : ""}`}>
                                <Button size="sm" variant="outline" className={isAndroid ? "flex-1" : ""}>
                                  <Download className="h-4 w-4 mr-2" />
                                  Brochure
                                </Button>
                                <Button
                                  size="sm"
                                  className={`bg-blue-600 hover:bg-blue-700 ${isAndroid ? "flex-1" : ""}`}
                                >
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  Learn More
                                </Button>
                              </div>
                            </CardFooter>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </TabsContent>

                <TabsContent value="faculty" className="space-y-6 mt-0">
                  <motion.div {...fadeInUp}>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className={`font-bold flex items-center gap-2 ${isAndroid ? "text-xl" : "text-2xl"}`}>
                        <Users className={`text-purple-500 ${isAndroid ? "h-5 w-5" : "h-6 w-6"}`} />
                        Our Distinguished Faculty
                      </h2>
                      <Badge variant="secondary" className={`${isAndroid ? "text-xs" : "text-sm"}`}>
                        {collegeProfile.faculty.length} Expert Educators
                      </Badge>
                    </div>

                    <div className={`grid gap-6 ${isAndroid ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"}`}>
                      {collegeProfile.faculty.map((faculty, index) => (
                        <motion.div
                          key={faculty.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.02 }}
                        >
                          <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all bg-gradient-to-br from-white to-purple-50/30 dark:from-gray-800 dark:to-purple-950/30">
                            <CardContent className={`${isAndroid ? "p-4" : "p-6"}`}>
                              <div className="flex items-start gap-4">
                                <motion.div whileHover={{ scale: 1.1 }}>
                                  <Avatar
                                    className={`border-4 border-purple-200 shadow-lg ${isAndroid ? "h-16 w-16" : "h-20 w-20"}`}
                                  >
                                    <AvatarImage src={faculty.avatar || "/placeholder.svg"} />
                                    <AvatarFallback
                                      className={`font-bold bg-purple-100 text-purple-600 ${isAndroid ? "text-lg" : "text-xl"}`}
                                    >
                                      {faculty.name.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                </motion.div>
                                <div className="flex-1">
                                  <h3
                                    className={`font-bold text-gray-900 dark:text-white mb-1 ${isAndroid ? "text-lg" : "text-xl"}`}
                                  >
                                    {faculty.name}
                                  </h3>
                                  <p className={`text-purple-600 font-semibold mb-1 ${isAndroid ? "text-sm" : ""}`}>
                                    {faculty.designation}
                                  </p>
                                  <p className={`text-muted-foreground mb-3 ${isAndroid ? "text-sm" : "text-sm"}`}>
                                    {faculty.department} Department
                                  </p>

                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <Mail className="h-4 w-4 text-blue-500" />
                                      <span className={isAndroid ? "text-xs" : ""}>{faculty.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <PhoneIcon className="h-4 w-4 text-green-500" />
                                      <span className={isAndroid ? "text-xs" : ""}>{faculty.phone}</span>
                                    </div>
                                  </div>

                                  <div className="flex gap-2 mt-4">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className={`bg-transparent ${isAndroid ? "text-xs" : "text-xs"}`}
                                    >
                                      <MessageCircle className="h-3 w-3 mr-1" />
                                      Contact
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className={`bg-transparent ${isAndroid ? "text-xs" : "text-xs"}`}
                                    >
                                      <BookOpen className="h-3 w-3 mr-1" />
                                      Profile
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </TabsContent>

                <TabsContent value="contact" className="space-y-6 mt-0">
                  <motion.div {...fadeInUp}>
                    <h2 className={`font-bold mb-6 flex items-center gap-2 ${isAndroid ? "text-xl" : "text-2xl"}`}>
                      <Mail className={`text-blue-500 ${isAndroid ? "h-5 w-5" : "h-6 w-6"}`} />
                      Get in Touch
                    </h2>

                    <div className={`grid gap-8 ${isAndroid ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2"}`}>
                      {/* Contact Information */}
                      <div className="space-y-6">
                        <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800">
                          <h3
                            className={`font-semibold mb-4 flex items-center gap-2 ${isAndroid ? "text-lg" : "text-xl"}`}
                          >
                            <LocationIcon className="h-5 w-5 text-blue-500" />
                            Contact Information
                          </h3>
                          <div className="space-y-4">
                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              className="flex items-start gap-3 p-3 rounded-lg bg-white/50 hover:bg-white/80 transition-all"
                            >
                              <MapPin className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                              <div>
                                <h4 className="font-medium text-gray-900 dark:text-white">Campus Address</h4>
                                <p className={`text-muted-foreground ${isAndroid ? "text-sm" : "text-sm"}`}>
                                  {collegeProfile.location.address}, {collegeProfile.location.city},{" "}
                                  {collegeProfile.location.state}, {collegeProfile.location.country} -{" "}
                                  {collegeProfile.location.pincode}
                                </p>
                              </div>
                            </motion.div>

                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              className="flex items-start gap-3 p-3 rounded-lg bg-white/50 hover:bg-white/80 transition-all"
                            >
                              <Mail className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                              <div>
                                <h4 className="font-medium text-gray-900 dark:text-white">Email Address</h4>
                                <p className={`text-muted-foreground ${isAndroid ? "text-sm" : "text-sm"}`}>
                                  {collegeProfile.contact.email}
                                </p>
                              </div>
                            </motion.div>

                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              className="flex items-start gap-3 p-3 rounded-lg bg-white/50 hover:bg-white/80 transition-all"
                            >
                              <PhoneIcon className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                              <div>
                                <h4 className="font-medium text-gray-900 dark:text-white">Phone Number</h4>
                                <p className={`text-muted-foreground ${isAndroid ? "text-sm" : "text-sm"}`}>
                                  {collegeProfile.contact.phone}
                                </p>
                              </div>
                            </motion.div>

                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              className="flex items-start gap-3 p-3 rounded-lg bg-white/50 hover:bg-white/80 transition-all"
                            >
                              <Globe className="h-5 w-5 text-purple-500 shrink-0 mt-0.5" />
                              <div>
                                <h4 className="font-medium text-gray-900 dark:text-white">Website</h4>
                                <p className={`text-muted-foreground ${isAndroid ? "text-sm" : "text-sm"}`}>
                                  {collegeProfile.contact.website}
                                </p>
                              </div>
                            </motion.div>
                          </div>
                        </Card>

                        {/* Campus Map */}
                        <Card className="p-6">
                          <h3
                            className={`font-semibold mb-4 flex items-center gap-2 ${isAndroid ? "text-lg" : "text-xl"}`}
                          >
                            <MapPin className="h-5 w-5 text-red-500" />
                            Campus Location
                          </h3>
                          <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-lg flex items-center justify-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20" />
                            <div className="text-center z-10">
                              <MapPin
                                className={`text-red-500 mx-auto mb-2 ${isAndroid ? "h-10 w-10" : "h-12 w-12"}`}
                              />
                              <p
                                className={`font-semibold text-gray-700 dark:text-gray-300 ${isAndroid ? "text-base" : "text-lg"}`}
                              >
                                Interactive Campus Map
                              </p>
                              <p className={`text-muted-foreground ${isAndroid ? "text-sm" : "text-sm"}`}>
                                Click to explore our campus
                              </p>
                            </div>
                          </div>
                        </Card>
                      </div>

                      {/* Contact Form */}
                      <div>
                        <Card className="p-6">
                          <h3
                            className={`font-semibold mb-4 flex items-center gap-2 ${isAndroid ? "text-lg" : "text-xl"}`}
                          >
                            <MessageCircle className="h-5 w-5 text-green-500" />
                            Send us a Message
                          </h3>

                          {isAuthenticated ? (
                            <motion.form {...fadeInUp} className="space-y-4">
                              <div className={`grid gap-4 ${isAndroid ? "grid-cols-1" : "grid-cols-2"}`}>
                                <div className="space-y-2">
                                  <Label htmlFor="firstName">First Name</Label>
                                  <Input
                                    id="firstName"
                                    placeholder="Your first name"
                                    className={isAndroid ? "text-sm" : ""}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="lastName">Last Name</Label>
                                  <Input
                                    id="lastName"
                                    placeholder="Your last name"
                                    className={isAndroid ? "text-sm" : ""}
                                  />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                  id="email"
                                  type="email"
                                  placeholder="your.email@example.com"
                                  className={isAndroid ? "text-sm" : ""}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="subject">Subject</Label>
                                <Input
                                  id="subject"
                                  placeholder="What is this regarding?"
                                  className={isAndroid ? "text-sm" : ""}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="message">Message</Label>
                                <Textarea
                                  id="message"
                                  placeholder="Tell us how we can help you..."
                                  rows={isAndroid ? 4 : 6}
                                  className={`resize-none ${isAndroid ? "text-sm" : ""}`}
                                />
                              </div>
                              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                                  <Mail className="h-4 w-4 mr-2" />
                                  Send Message
                                </Button>
                              </motion.div>
                            </motion.form>
                          ) : (
                            <motion.div
                              {...fadeInUp}
                              className="text-center p-8 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-950/30 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600"
                            >
                              <div className="p-4 bg-blue-100 dark:bg-blue-900/50 rounded-full w-fit mx-auto mb-4">
                                <LogIn
                                  className={`text-blue-600 dark:text-blue-400 ${isAndroid ? "h-6 w-6" : "h-8 w-8"}`}
                                />
                              </div>
                              <h4
                                className={`font-semibold text-gray-900 dark:text-white mb-2 ${isAndroid ? "text-base" : "text-lg"}`}
                              >
                                Login Required
                              </h4>
                              <p className={`text-muted-foreground mb-4 ${isAndroid ? "text-sm" : ""}`}>
                                Please login to send us a message and get personalized assistance
                              </p>
                              <Button
                                asChild
                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                              >
                                <Link href="/login">
                                  <LogIn className="h-4 w-4 mr-2" />
                                  Login to Contact Us
                                </Link>
                              </Button>
                            </motion.div>
                          )}
                        </Card>
                      </div>
                    </div>
                  </motion.div>
                </TabsContent>
              </div>
            </Tabs>
          </Card>
        </motion.div>
        {isAuthenticated && (
          <motion.div {...fadeInUp}>
            <ReviewForm resourceId={0} onReviewSubmit={function (rating: number, comment: string): void {
              throw new Error("Function not implemented.")
            } } />
          </motion.div>
        )}
      </div>
    </div>
  )
}

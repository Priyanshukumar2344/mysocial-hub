"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import { db } from "@/lib/db"
import {
  Edit,
  Plus,
  Trash2,
  Brain,
  MessageCircle,
  School,
  BookOpen,
  Briefcase,
  Settings,
  MapPin,
  LinkIcon,
  Camera,
  PlusCircle,
  Award,
  Upload,
  Info,
  TrendingUp,
  Calendar,
  Users,
  Heart,
  Eye,
  Target,
  Trophy,
  Activity,
  Code,
  Palette,
  Music,
  Gamepad2,
  Coffee,
  Sparkles,
  ThumbsUp,
  ChevronRight,
  Flame,
  Crown,
  CheckCircle,
} from "lucide-react"
import { FollowButton } from "@/components/FollowButton"
import { ProfileChat } from "@/components/ProfileChat"
import { useMobileDetection } from "@/hooks/use-mobile-detection"
import type {
  UserData,
  Skill,
  Education,
  Experience,
  Project,
  Interest,
  Badge as BadgeType,
  UserBadge,
} from "@/lib/types"
import Link from "next/link"

// New types for enhanced features
interface ActivityItem {
  id: string
  type: "achievement" | "post" | "resource" | "connection" | "badge"
  title: string
  description: string
  timestamp: string
  icon: React.ReactNode
  color: string
}

interface ProfileStats {
  profileViews: number
  resourcesShared: number
  connectionsGained: number
  badgesEarned: number
  streakDays: number
  totalLikes: number
}

export default function UserProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { user: currentUser, updateUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [showProfilePictureDialog, setShowProfilePictureDialog] = useState(false)
  const [newProfilePicture, setNewProfilePicture] = useState<File | null>(null)
  const [showPrivacySettings, setShowPrivacySettings] = useState(false)
  const [showBadgeDetails, setShowBadgeDetails] = useState(false)
  const [selectedBadge, setSelectedBadge] = useState<BadgeType | null>(null)
  const [showActivityTimeline, setShowActivityTimeline] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { isMobile } = useMobileDetection()

  const [profile, setProfile] = useState<UserData | null>(null)
  const [userBadges, setUserBadges] = useState<BadgeType[]>([])
  const [profileStats, setProfileStats] = useState<ProfileStats>({
    profileViews: 0,
    resourcesShared: 0,
    connectionsGained: 0,
    badgesEarned: 0,
    streakDays: 0,
    totalLikes: 0,
  })
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([])
  const [editableProfile, setEditableProfile] = useState<{
    name: string
    bio: string
    year: string
    branch: string
    location: string
    websiteUrl: string
    socialLinks: { platform: string; url: string }[]
    skills: Skill[]
    education: Education[]
    experience: Experience[]
    projects: Project[]
    interests: Interest[]
    privacy: {
      showEmail: boolean
      showLocation: boolean
      showEducation: boolean
      allowMessages: boolean
    }
  } | null>(null)

  const isOwnProfile = currentUser?.id === params.userId
  const [isFollowing, setIsFollowing] = useState(currentUser?.following?.includes(params.userId) || false)
  const [followerCount, setFollowerCount] = useState(0)

  useEffect(() => {
    const fetchUserProfile = () => {
      const users = db.get("users") || []
      const user = users.find((u) => u.id === params.userId)

      if (user) {
        setProfile(user)

        // Generate mock stats
        setProfileStats({
          profileViews: Math.floor(Math.random() * 1000) + 100,
          resourcesShared: user.streak?.resourceContributions || 0,
          connectionsGained: user.connections?.length || 0,
          badgesEarned: user.badges?.length || 0,
          streakDays: user.streak?.currentStreak || 0,
          totalLikes: user.totalLikes || 0,
        })

        // Generate mock activity
        setRecentActivity([
          {
            id: "1",
            type: "badge",
            title: "New Badge Earned",
            description: 'Earned the "Active Contributor" badge',
            timestamp: "2 hours ago",
            icon: <Award className="h-4 w-4" />,
            color: "text-amber-500",
          },
          {
            id: "2",
            type: "resource",
            title: "Resource Shared",
            description: 'Uploaded "Data Structures Notes"',
            timestamp: "1 day ago",
            icon: <Upload className="h-4 w-4" />,
            color: "text-blue-500",
          },
          {
            id: "3",
            type: "connection",
            title: "New Connection",
            description: "Connected with 5 new students",
            timestamp: "2 days ago",
            icon: <Users className="h-4 w-4" />,
            color: "text-green-500",
          },
        ])

        // Initialize editable profile with default values if fields don't exist
        setEditableProfile({
          name: user.name || "",
          bio: user.bio || "",
          year: user.year || "",
          branch: user.branch || "",
          location: user.location || "",
          websiteUrl: user.websiteUrl || "",
          socialLinks: user.socialLinks || [],
          skills: user.skills || [],
          education: user.education || [],
          experience: user.experience || [],
          projects: user.projects || [],
          interests: user.interests || [],
          privacy: user.privacy || {
            showEmail: true,
            showLocation: true,
            showEducation: true,
            allowMessages: true,
          },
        })

        // Fetch user badges
        const allBadges = db.get("badges") || []
        const userBadgeIds = user.badges?.map((badge) => badge.badgeId) || []
        const userBadgesData = allBadges.filter((badge) => userBadgeIds.includes(badge.id))
        setUserBadges(userBadgesData)
        setIsFollowing(currentUser?.following?.includes(params.userId) || false)
        setFollowerCount(user.followers?.length || 0)
      } else {
        toast({
          title: "User not found",
          description: "This user profile doesn't exist",
          variant: "destructive",
        })
        router.push("/")
      }
    }

    fetchUserProfile()
  }, [params.userId, router, currentUser?.following])

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setNewProfilePicture(file)
      // Create a preview URL
      const imageUrl = URL.createObjectURL(file)

      // In a real app, upload to server/cloud storage
      if (currentUser && isOwnProfile) {
        updateUser({ avatar: imageUrl })

        // Update the profile in the local database
        const users = db.get("users") || []
        const updatedUsers = users.map((u) => (u.id === currentUser.id ? { ...u, avatar: imageUrl } : u))
        db.set("users", updatedUsers)

        // Update local state
        setProfile((prev) => (prev ? { ...prev, avatar: imageUrl } : null))

        // Update streak for photo upload
        updateUserStreak("photoUploads")
      }

      setShowProfilePictureDialog(false)
      toast({
        title: "Profile Picture Updated",
        description: "Your profile picture has been successfully updated.",
      })
    }
  }

  const updateUserStreak = (activityType: "photoUploads" | "resourceContributions" | "activeTimeMinutes") => {
    if (!currentUser || !isOwnProfile) return

    const users = db.get("users") || []
    const userIndex = users.findIndex((u) => u.id === currentUser.id)

    if (userIndex === -1) return

    const user = users[userIndex]
    const now = new Date()
    const today = now.toISOString().split("T")[0]

    // Initialize streak if it doesn't exist
    if (!user.streak) {
      user.streak = {
        currentStreak: 1,
        longestStreak: 1,
        lastActive: today,
        photoUploads: 0,
        resourceContributions: 0,
        activeTimeMinutes: 0,
        totalBadges: user.badges?.length || 0,
      }
    }

    // Update streak based on activity type
    if (activityType === "photoUploads") {
      user.streak.photoUploads += 1
    } else if (activityType === "resourceContributions") {
      user.streak.resourceContributions += 1
    } else if (activityType === "activeTimeMinutes") {
      user.streak.activeTimeMinutes += 10 // Assuming 10 minutes of activity
    }

    // Check if user was active today
    if (user.streak.lastActive !== today) {
      // Check if user was active yesterday
      const yesterday = new Date(now)
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split("T")[0]

      if (user.streak.lastActive === yesterdayStr) {
        // Continue streak
        user.streak.currentStreak += 1
        if (user.streak.currentStreak > user.streak.longestStreak) {
          user.streak.longestStreak = user.streak.currentStreak
        }
      } else {
        // Reset streak
        user.streak.currentStreak = 1
      }

      user.streak.lastActive = today
    }

    // Update user in database
    users[userIndex] = user
    db.set("users", users)

    // Update local state
    setProfile(user)

    // Check for badge eligibility
    checkBadgeEligibility(user)
  }

  const checkBadgeEligibility = (user: UserData) => {
    if (!user.streak) return

    const allBadges = db.get("badges") || []
    const userBadgeIds = user.badges?.map((badge) => badge.badgeId) || []

    // Check for streak badges
    if (user.streak.currentStreak >= 7 && !userBadgeIds.includes("streak-7")) {
      awardBadge(user.id, "streak-7", "system")
    }

    if (user.streak.currentStreak >= 30 && !userBadgeIds.includes("streak-30")) {
      awardBadge(user.id, "streak-30", "system")
    }

    // Check for contribution badges
    if (user.streak.resourceContributions >= 5 && !userBadgeIds.includes("contributor-5")) {
      awardBadge(user.id, "contributor-5", "system")
    }

    if (user.streak.photoUploads >= 10 && !userBadgeIds.includes("photographer-10")) {
      awardBadge(user.id, "photographer-10", "system")
    }

    // Check for active time badges
    if (user.streak.activeTimeMinutes >= 300 && !userBadgeIds.includes("active-300")) {
      awardBadge(user.id, "active-300", "system")
    }
  }

  const awardBadge = (userId: string, badgeId: string, awardedBy: string) => {
    const users = db.get("users") || []
    const userIndex = users.findIndex((u) => u.id === userId)

    if (userIndex === -1) return

    const user = users[userIndex]

    // Initialize badges array if it doesn't exist
    if (!user.badges) {
      user.badges = []
    }

    // Check if user already has this badge
    if (user.badges.some((badge) => badge.badgeId === badgeId)) {
      return
    }

    // Add badge to user
    const newBadge: UserBadge = {
      badgeId,
      earnedAt: new Date().toISOString(),
      awardedBy,
    }

    user.badges.push(newBadge)

    // Update streak total badges count
    if (user.streak) {
      user.streak.totalBadges = user.badges.length
    }

    // Update user in database
    users[userIndex] = user
    db.set("users", users)

    // Create notification
    const allBadges = db.get("badges") || []
    const badge = allBadges.find((b) => b.id === badgeId)

    if (badge) {
      const notifications = db.get("notifications") || []
      const newNotification = {
        id: Date.now().toString(),
        type: "badge",
        title: "New Badge Earned!",
        message: `You've earned the ${badge.name} badge: ${badge.description}`,
        timestamp: new Date().toISOString(),
        read: false,
        userId,
        badgeId,
        priority: "high",
        deliveryStatus: "delivered",
      }

      notifications.push(newNotification)
      db.set("notifications", notifications)

      // Update local state if it's the current user's profile
      if (userId === params.userId) {
        setProfile(user)

        // Fetch updated badges
        const userBadgeIds = user.badges.map((badge) => badge.badgeId)
        const userBadgesData = allBadges.filter((badge) => userBadgeIds.includes(badge.id))
        setUserBadges(userBadgesData)

        toast({
          title: "New Badge Earned!",
          description: `You've earned the ${badge.name} badge!`,
        })
      }
    }
  }

  const handleFollowChange = (newIsFollowing: boolean, newFollowerCount: number) => {
    setIsFollowing(newIsFollowing)
    setFollowerCount(newFollowerCount)
  }

  const handleBadgeClick = (badge: BadgeType) => {
    setSelectedBadge(badge)
    setShowBadgeDetails(true)
  }

  const handleSaveProfile = async () => {
    if (!editableProfile || !currentUser || !isOwnProfile) return

    setIsSaving(true)

    try {
      // Update user data in the database
      const users = db.get("users") || []
      const updatedUsers = users.map((u) => {
        if (u.id === currentUser.id) {
          return {
            ...u,
            name: editableProfile.name,
            bio: editableProfile.bio,
            year: editableProfile.year,
            branch: editableProfile.branch,
            location: editableProfile.location,
            websiteUrl: editableProfile.websiteUrl,
            socialLinks: editableProfile.socialLinks,
            skills: editableProfile.skills,
            education: editableProfile.education,
            experience: editableProfile.experience,
            projects: editableProfile.projects,
            interests: editableProfile.interests,
            privacy: editableProfile.privacy,
          }
        }
        return u
      })

      db.set("users", updatedUsers)

      // Update current user context
      await updateUser({
        name: editableProfile.name,
        bio: editableProfile.bio,
        year: editableProfile.year,
        branch: editableProfile.branch,
        location: editableProfile.location,
        websiteUrl: editableProfile.websiteUrl,
        socialLinks: editableProfile.socialLinks,
        skills: editableProfile.skills,
        education: editableProfile.education,
        experience: editableProfile.experience,
        projects: editableProfile.projects,
        interests: editableProfile.interests,
        privacy: editableProfile.privacy,
      })

      // Update local profile state
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              name: editableProfile.name,
              bio: editableProfile.bio,
              year: editableProfile.year,
              branch: editableProfile.branch,
              location: editableProfile.location,
              websiteUrl: editableProfile.websiteUrl,
              socialLinks: editableProfile.socialLinks,
              skills: editableProfile.skills,
              education: editableProfile.education,
              experience: editableProfile.experience,
              projects: editableProfile.projects,
              interests: editableProfile.interests,
              privacy: editableProfile.privacy,
            }
          : null,
      )

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      })

      setIsEditing(false)
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddSkill = () => {
    setEditableProfile((prev) => {
      if (!prev) return prev
      const newSkill = { id: Date.now().toString(), name: "", level: "Beginner", endorsements: 0 }
      return { ...prev, skills: [...prev.skills, newSkill] }
    })
  }

  const handleUpdateSkill = (index: number, field: string, value: string | boolean) => {
    setEditableProfile((prev) => {
      if (!prev) return prev
      const updatedSkills = [...prev.skills]
      // @ts-expect-error
      updatedSkills[index][field] = value
      return { ...prev, skills: updatedSkills }
    })
  }

  const handleRemoveSkill = (index: number) => {
    setEditableProfile((prev) => {
      if (!prev) return prev
      const updatedSkills = [...prev.skills]
      updatedSkills.splice(index, 1)
      return { ...prev, skills: updatedSkills }
    })
  }

  const handleAddEducation = () => {
    setEditableProfile((prev) => {
      if (!prev) return prev
      const newEducation = {
        id: Date.now().toString(),
        institution: "",
        degree: "",
        field: "",
        startDate: "",
        endDate: "",
        current: false,
      }
      return { ...prev, education: [...prev.education, newEducation] }
    })
  }

  const handleUpdateEducation = (index: number, field: string, value: string | boolean) => {
    setEditableProfile((prev) => {
      if (!prev) return prev
      const updatedEducation = [...prev.education]
      // @ts-expect-error
      updatedEducation[index][field] = value
      return { ...prev, education: updatedEducation }
    })
  }

  const handleRemoveEducation = (index: number) => {
    setEditableProfile((prev) => {
      if (!prev) return prev
      const updatedEducation = [...prev.education]
      updatedEducation.splice(index, 1)
      return { ...prev, education: updatedEducation }
    })
  }

  const handleAddInterest = () => {
    setEditableProfile((prev) => {
      if (!prev) return prev
      const newInterest = { id: Date.now().toString(), name: "", category: "Hobby" }
      return { ...prev, interests: [...prev.interests, newInterest] }
    })
  }

  const handleUpdateInterest = (index: number, field: string, value: string) => {
    setEditableProfile((prev) => {
      if (!prev) return prev
      const updatedInterests = [...prev.interests]
      // @ts-expect-error
      updatedInterests[index][field] = value
      return { ...prev, interests: updatedInterests }
    })
  }

  const handleRemoveInterest = (index: number) => {
    setEditableProfile((prev) => {
      if (!prev) return prev
      const updatedInterests = [...prev.interests]
      updatedInterests.splice(index, 1)
      return { ...prev, interests: updatedInterests }
    })
  }

  const handleAddProject = () => {
    setEditableProfile((prev) => {
      if (!prev) return prev
      const newProject = {
        id: Date.now().toString(),
        title: "",
        url: "",
        description: "",
        startDate: "",
        endDate: "",
        current: false,
      }
      return { ...prev, projects: [...prev.projects, newProject] }
    })
  }

  const handleUpdateProject = (index: number, field: string, value: string | boolean) => {
    setEditableProfile((prev) => {
      if (!prev) return prev
      const updatedProjects = [...prev.projects]
      // @ts-expect-error
      updatedProjects[index][field] = value
      return { ...prev, projects: updatedProjects }
    })
  }

  const handleRemoveProject = (index: number) => {
    setEditableProfile((prev) => {
      if (!prev) return prev
      const updatedProjects = [...prev.projects]
      updatedProjects.splice(index, 1)
      return { ...prev, projects: updatedProjects }
    })
  }

  const handleAddExperience = () => {
    setEditableProfile((prev) => {
      if (!prev) return prev
      const newExperience = {
        id: Date.now().toString(),
        company: "",
        position: "",
        location: "",
        description: "",
        startDate: "",
        endDate: "",
        current: false,
      }
      return { ...prev, experience: [...prev.experience, newExperience] }
    })
  }

  const handleUpdateExperience = (index: number, field: string, value: string | boolean) => {
    setEditableProfile((prev) => {
      if (!prev) return prev
      const updatedExperience = [...prev.experience]
      // @ts-expect-error
      updatedExperience[index][field] = value
      return { ...prev, experience: updatedExperience }
    })
  }

  const handleRemoveExperience = (index: number) => {
    setEditableProfile((prev) => {
      if (!prev) return prev
      const updatedExperience = [...prev.experience]
      updatedExperience.splice(index, 1)
      return { ...prev, experience: updatedExperience }
    })
  }

  const togglePrivacySetting = (setting: string) => {
    setEditableProfile((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        privacy: {
          ...prev.privacy,
          [setting]: !prev.privacy[setting],
        },
      }
    })
  }

  const getSkillIcon = (skillName: string) => {
    const name = skillName.toLowerCase()
    if (name.includes("code") || name.includes("programming")) return <Code className="h-4 w-4" />
    if (name.includes("design") || name.includes("ui")) return <Palette className="h-4 w-4" />
    if (name.includes("music")) return <Music className="h-4 w-4" />
    if (name.includes("game")) return <Gamepad2 className="h-4 w-4" />
    return <Brain className="h-4 w-4" />
  }

  const getInterestIcon = (category: string) => {
    switch (category) {
      case "Professional":
        return <Briefcase className="h-4 w-4" />
      case "Academic":
        return <BookOpen className="h-4 w-4" />
      case "Sport":
        return <Trophy className="h-4 w-4" />
      default:
        return <Coffee className="h-4 w-4" />
    }
  }

  if (!profile || !editableProfile) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50
    to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto py-8 space-y-8">
        {/* Enhanced Header Section */}
        <div className="relative">
          {/* Cover Photo with Gradient Overlay */}
          <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden bg-gradient-to-r from-blue-500 via-purple-500 to-pink-600">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>

            {/* Floating Elements */}
            <div className="absolute top-4 right-4 flex gap-2">
              {isOwnProfile && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="backdrop-blur-md bg-white/20 border-white/30 text-white hover:bg-white/30"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Change Cover
                </Button>
              )}
            </div>

            {/* Profile Picture with Glow Effect */}
            <div className="absolute bottom-6 left-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-lg opacity-100 "></div>
                {/* Inner Strong Glow */}
    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-2xl opacity-100"></div>
                <Avatar className="relative h-32 w-32 border-4 border-white shadow-2xl ">
                  <AvatarImage src={profile.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="font-bold text-4xl text-black ">
                    {profile.name[0]}
                  </AvatarFallback>
                </Avatar>
                {isOwnProfile && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute bottom-0 right-0 rounded-full w-10 h-10 p-0 shadow-lg"
                    onClick={() => setShowProfilePictureDialog(true)}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Status Indicators */}
            <div className="absolute bottom-4 right-4 flex gap-2">
              {profile.streak && profile.streak.currentStreak > 0 && (
                <Badge className="bg-orange-500/90 text-white backdrop-blur-sm">
                  <Flame className="h-3 w-3 mr-1" />
                  {profile.streak.currentStreak} day streak
                </Badge>
              )}
              {profile.isVerified && (
                <Badge className="bg-blue-500/90 text-white backdrop-blur-sm">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>
          </div>

          {/* Profile Info Card */}
          <Card className="mt-20 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-white/20 shadow-2xl">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                <div className="flex-1 space-y-4">
                  {/* Name and Basic Info */}
                  {isEditing ? (
                    <div className="space-y-3">
                      <Input
                        value={editableProfile.name}
                        onChange={(e) => setEditableProfile({ ...editableProfile, name: e.target.value })}
                        className="text-2xl font-bold border-2 focus:border-blue-500"
                      />
                      <div className="flex gap-3">
                        <Select
                          value={editableProfile.year}
                          onValueChange={(value) => setEditableProfile({ ...editableProfile, year: value })}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Select Year" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1st Year">1st Year</SelectItem>
                            <SelectItem value="2nd Year">2nd Year</SelectItem>
                            <SelectItem value="3rd Year">3rd Year</SelectItem>
                            <SelectItem value="4th Year">4th Year</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select
                          value={editableProfile.branch}
                          onValueChange={(value) => setEditableProfile({ ...editableProfile, branch: value })}
                        >
                          <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Select Branch" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Computer Science">Computer Science</SelectItem>
                            <SelectItem value="Ai/Ml">Artificial intelligence</SelectItem>
                            <SelectItem value="IT">Information Technology</SelectItem>
                            <SelectItem value="Electronics">Electronics Engineering</SelectItem>
                            <SelectItem value="chemical">Chemical Engineering</SelectItem>
                            <SelectItem value="Mechanical">Mechanical</SelectItem>
                            <SelectItem value="BioTech">Bio Technology</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          {profile.name}
                        </h1>
                        {profile.isVerified && <CheckCircle className="h-6 w-6 text-blue-500" />}
                        {profile.role === "admin" && <Crown className="h-6 w-6 text-amber-500" />}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        {profile.year && <span className="font-medium">{profile.year}</span>}
                        {profile.year && profile.branch && <span>•</span>}
                        {profile.branch && <span className="font-medium">{profile.branch}</span>}
                      </div>
                    </div>
                  )}

                  {/* Bio */}
                  <div>
                    {isEditing ? (
                      <Textarea
                        value={editableProfile.bio || ""}
                        onChange={(e) => setEditableProfile({ ...editableProfile, bio: e.target.value })}
                        placeholder="Write something about yourself..."
                        className="min-h-[100px] border-2 focus:border-blue-500"
                      />
                    ) : (
                      <p className="text-muted-foreground leading-relaxed">{profile.bio || "No bio provided"}</p>
                    )}
                  </div>

                  {/* Location and Website */}
                  {(isEditing || profile?.privacy?.showLocation !== false) && (
                    <div className="flex flex-wrap gap-4">
                      {isEditing ? (
                        <>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <Input
                              value={editableProfile.location || ""}
                              onChange={(e) => setEditableProfile({ ...editableProfile, location: e.target.value })}
                              placeholder="Location"
                              className="w-[200px]"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <LinkIcon className="h-4 w-4 text-muted-foreground" />
                            <Input
                              value={editableProfile.websiteUrl || ""}
                              onChange={(e) => setEditableProfile({ ...editableProfile, websiteUrl: e.target.value })}
                              placeholder="Website URL"
                              className="w-[200px]"
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          {profile.location && (
                            <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-full">
                              <MapPin className="h-4 w-4 text-blue-500" />
                              <span className="text-sm font-medium">{profile.location}</span>
                            </div>
                          )}
                          {profile.websiteUrl && (
                            <div className="flex items-center gap-2 px-3 py-1 bg-purple-50 dark:bg-purple-900/20 rounded-full">
                              <LinkIcon className="h-4 w-4 text-purple-500" />
                              <a
                                href={
                                  profile.websiteUrl.startsWith("http")
                                    ? profile.websiteUrl
                                    : `https://${profile.websiteUrl}`
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm font-medium text-purple-600 hover:underline"
                              >
                                {profile.websiteUrl}
                              </a>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3">
                  {isOwnProfile ? (
                    isEditing ? (
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setIsEditing(false)}>
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSaveProfile}
                          disabled={isSaving}
                          className="bg-gradient-to-r from-blue-500 to-purple-500"
                        >
                          {isSaving ? "Saving..." : "Save Profile"}
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <Button
                          onClick={() => setIsEditing(true)}
                          className="bg-gradient-to-r from-blue-500 to-purple-500"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Profile
                        </Button>
                        <Button variant="outline" onClick={() => setShowPrivacySettings(true)}>
                          <Settings className="h-4 w-4 mr-2" />
                          Privacy
                        </Button>
                        <Button variant="outline" asChild>
                          <Link href="/pages/create">
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Create Page
                          </Link>
                        </Button>
                      </div>
                    )
                  ) : (
                    <div className="flex flex-col gap-2">
                      {profile?.privacy?.allowMessages !== false && (
                        <Button
                          onClick={() => setShowChat(true)}
                          className="bg-gradient-to-r from-green-500 to-blue-500"
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Message
                        </Button>
                      )}
                      <FollowButton
                        userId={profile.id}
                        initialIsFollowing={isFollowing}
                        onFollowChange={handleFollowChange}
                      />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[
            {
              label: "Profile Views",
              value: profileStats.profileViews,
              icon: <Eye className="h-5 w-5" />,
              color: "from-blue-500 to-cyan-500",
            },
            {
              label: "Followers",
              value: followerCount,
              icon: <Users className="h-5 w-5" />,
              color: "from-green-500 to-emerald-500",
            },
            {
              label: "Resources",
              value: profileStats.resourcesShared,
              icon: <Upload className="h-5 w-5" />,
              color: "from-purple-500 to-pink-500",
            },
            {
              label: "Badges",
              value: profileStats.badgesEarned,
              icon: <Award className="h-5 w-5" />,
              color: "from-amber-500 to-orange-500",
            },
            {
              label: "Streak",
              value: profileStats.streakDays,
              icon: <Flame className="h-5 w-5" />,
              color: "from-red-500 to-pink-500",
            },
            {
              label: "Likes",
              value: profileStats.totalLikes,
              icon: <Heart className="h-5 w-5" />,
              color: "from-rose-500 to-red-500",
            },
          ].map((stat, index) => (
            <Card
              key={index}
              className="relative overflow-hidden group hover:scale-105 transition-all duration-300 cursor-pointer"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-10 group-hover:opacity-20 transition-opacity`}
              ></div>
              <CardContent className="p-4 text-center relative">
                <div className={`inline-flex p-2 rounded-full bg-gradient-to-r ${stat.color} text-white mb-2`}>
                  {stat.icon}
                </div>
                <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground font-medium">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Badges Showcase */}
        <Card className="backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-white/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                Achievements & Badges
              </CardTitle>
              <Badge variant="secondary">{userBadges.length} earned</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {userBadges.length > 0 ? (
                userBadges.map((badge) => (
                  <div key={badge.id} className="group relative cursor-pointer" onClick={() => handleBadgeClick(badge)}>
                    <div className="relative p-4 rounded-xl bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/20 dark:to-yellow-900/20 border-2 border-amber-200 dark:border-amber-800 hover:scale-110 transition-all duration-300 hover:shadow-lg">
                      <Award className="h-8 w-8 text-amber-500 mx-auto" />
                      <div className="absolute -top-1 -right-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                        {badge.level === "Gold"
                          ? "G"
                          : badge.level === "Silver"
                            ? "S"
                            : badge.level === "Bronze"
                              ? "B"
                              : "P"}
                      </div>
                    </div>
                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs p-2 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10 transition-opacity">
                      {badge.name}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 w-full">
                  <Award className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No badges earned yet</p>
                  <p className="text-sm text-muted-foreground">Complete activities to earn your first badge!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Tabs */}
        <Card className="backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-white/20">
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="border-b bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                <TabsList className="w-full justify-start bg-transparent h-auto p-0">
                  {[
                    { value: "overview", label: "Overview", icon: <Info className="h-4 w-4" /> },
                    { value: "skills", label: "Skills", icon: <Brain className="h-4 w-4" /> },
                    { value: "education", label: "Education", icon: <School className="h-4 w-4" /> },
                    { value: "projects", label: "Projects", icon: <BookOpen className="h-4 w-4" /> },
                    { value: "experience", label: "Experience", icon: <Briefcase className="h-4 w-4" /> },
                    { value: "activity", label: "Activity", icon: <Activity className="h-4 w-4" /> },
                  ].map((tab) => (
                    <TabsTrigger
                      key={tab.value}
                      value={tab.value}
                      className="flex items-center gap-2 px-6 py-4 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500"
                    >
                      {tab.icon}
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {/* Overview Tab */}
              <TabsContent value="overview" className="p-6 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Quick Stats */}
                  <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                        <TrendingUp className="h-5 w-5" />
                        Quick Stats
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Profile Completion</span>
                        <span className="font-bold">85%</span>
                      </div>
                      <Progress value={85} className="h-2" />
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-blue-600">{profile.connections?.length || 0}</div>
                          <div className="text-xs text-muted-foreground">Connections</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-purple-600">{profile.streak?.totalBadges || 0}</div>
                          <div className="text-xs text-muted-foreground">Total Badges</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recent Activity */}
                  <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
                        <Activity className="h-5 w-5" />
                        Recent Activity
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {recentActivity.map((activity) => (
                          <div
                            key={activity.id}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/50 transition-colors"
                          >
                            <div className={`p-1 rounded-full bg-white ${activity.color}`}>{activity.icon}</div>
                            <div className="flex-1">
                              <div className="font-medium text-sm">{activity.title}</div>
                              <div className="text-xs text-muted-foreground">{activity.description}</div>
                            </div>
                            <div className="text-xs text-muted-foreground">{activity.timestamp}</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Interests */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-purple-500" />
                        Interests & Hobbies
                      </CardTitle>
                      {isEditing && (
                        <Button variant="outline" size="sm" onClick={handleAddInterest}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Interest
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isEditing ? (
                      <div className="space-y-4">
                        {editableProfile.interests && editableProfile.interests.length > 0 ? (
                          editableProfile.interests.map((interest, index) => (
                            <div key={interest.id} className="flex items-center gap-2">
                              <Input
                                value={interest.name}
                                onChange={(e) => handleUpdateInterest(index, "name", e.target.value)}
                                placeholder="Interest name"
                                className="flex-1"
                              />
                              <Select
                                value={interest.category}
                                onValueChange={(value) => handleUpdateInterest(index, "category", value)}
                              >
                                <SelectTrigger className="w-[180px]">
                                  <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Professional">Professional</SelectItem>
                                  <SelectItem value="Academic">Academic</SelectItem>
                                  <SelectItem value="Hobby">Hobby</SelectItem>
                                  <SelectItem value="Sport">Sport</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button variant="ghost" size="sm" onClick={() => handleRemoveInterest(index)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          ))
                        ) : (
                          <p className="text-muted-foreground text-center py-8">
                            No interests added yet. Add some to show what you're passionate about!
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-3">
                        {profile.interests && profile.interests.length > 0 ? (
                          profile.interests.map((interest) => (
                            <div
                              key={interest.id}
                              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-full border border-purple-200 dark:border-purple-800"
                            >
                              {getInterestIcon(interest.category)}
                              <span className="font-medium">{interest.name}</span>
                              <Badge variant="secondary" className="text-xs">
                                {interest.category}
                              </Badge>
                            </div>
                          ))
                        ) : (
                          <p className="text-muted-foreground text-center py-8 w-full">No interests added yet</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Skills Tab */}
              <TabsContent value="skills" className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <Brain className="h-5 w-5 text-blue-500" />
                    Skills & Expertise
                  </h3>
                  {isEditing && (
                    <Button variant="outline" size="sm" onClick={handleAddSkill}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Skill
                    </Button>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-4">
                    {editableProfile.skills && editableProfile.skills.length > 0 ? (
                      editableProfile.skills.map((skill, index) => (
                        <div key={skill.id} className="flex items-center gap-2 p-4 border rounded-lg">
                          <Input
                            value={skill.name}
                            onChange={(e) => handleUpdateSkill(index, "name", e.target.value)}
                            placeholder="Skill name"
                            className="flex-1"
                          />
                          <Select
                            value={skill.level}
                            onValueChange={(value) => handleUpdateSkill(index, "level", value)}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Level" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Beginner">Beginner</SelectItem>
                              <SelectItem value="Intermediate">Intermediate</SelectItem>
                              <SelectItem value="Advanced">Advanced</SelectItem>
                              <SelectItem value="Expert">Expert</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button variant="ghost" size="sm" onClick={() => handleRemoveSkill(index)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          No skills added yet. Add the technologies and abilities you excel at!
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {profile.skills && profile.skills.length > 0 ? (
                      profile.skills.map((skill) => (
                        <Card
                          key={skill.id}
                          className="group hover:shadow-lg transition-all duration-300 overflow-hidden"
                        >
                          <div
                            className={`h-1 bg-gradient-to-r ${
                              skill.level === "Expert"
                                ? "from-green-500 to-emerald-500"
                                : skill.level === "Advanced"
                                  ? "from-blue-500 to-cyan-500"
                                  : skill.level === "Intermediate"
                                    ? "from-yellow-500 to-orange-500"
                                    : "from-gray-400 to-gray-500"
                            }`}
                          ></div>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center gap-2">
                                {getSkillIcon(skill.name)}
                                <h4 className="font-semibold">{skill.name}</h4>
                              </div>
                              <Badge variant="secondary" className="text-xs">
                                {skill.level}
                              </Badge>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Proficiency</span>
                                <span className="font-medium">
                                  {skill.level === "Expert"
                                    ? "90-100%"
                                    : skill.level === "Advanced"
                                      ? "70-89%"
                                      : skill.level === "Intermediate"
                                        ? "40-69%"
                                        : "10-39%"}
                                </span>
                              </div>
                              <Progress
                                value={
                                  skill.level === "Expert"
                                    ? 95
                                    : skill.level === "Advanced"
                                      ? 80
                                      : skill.level === "Intermediate"
                                        ? 55
                                        : 25
                                }
                                className="h-2"
                              />
                              {skill.endorsements > 0 && (
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <ThumbsUp className="h-3 w-3" />
                                  <span>{skill.endorsements} endorsements</span>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="col-span-2 text-center py-12">
                        <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No skills added yet</p>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>

              {/* Education Tab */}
              <TabsContent value="education" className="p-6 space-y-6">
                {(isEditing || profile?.privacy?.showEducation !== false) && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold flex items-center gap-2">
                        <School className="h-5 w-5 text-green-500" />
                        Education Background
                      </h3>
                      {isEditing && (
                        <Button variant="outline" size="sm" onClick={handleAddEducation}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Education
                        </Button>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="space-y-6">
                        {editableProfile.education && editableProfile.education.length > 0 ? (
                          editableProfile.education.map((education, index) => (
                            <Card key={education.id} className="p-4">
                              <div className="flex justify-between items-center mb-4">
                                <h4 className="font-medium">Education #{index + 1}</h4>
                                <Button variant="ghost" size="sm" onClick={() => handleRemoveEducation(index)}>
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <Label>Institution</Label>
                                  <Input
                                    value={education.institution}
                                    onChange={(e) => handleUpdateEducation(index, "institution", e.target.value)}
                                    placeholder="School or University name"
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <Label>Degree</Label>
                                  <Input
                                    value={education.degree}
                                    onChange={(e) => handleUpdateEducation(index, "degree", e.target.value)}
                                    placeholder="Degree type (e.g., Bachelor's, Master's)"
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <Label>Field of Study</Label>
                                  <Input
                                    value={education.field}
                                    onChange={(e) => handleUpdateEducation(index, "field", e.target.value)}
                                    placeholder="Major or field of study"
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <Label>Start Year</Label>
                                  <Input
                                    type="date"
                                    value={education.startDate}
                                    onChange={(e) => handleUpdateEducation(index, "startDate", e.target.value)}
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <Label>End Date</Label>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Input
                                      type="date"
                                      value={education.endDate}
                                      onChange={(e) => handleUpdateEducation(index, "endDate", e.target.value)}
                                      disabled={education.current}
                                    />
                                    <div className="flex items-center gap-2">
                                      <Switch
                                        checked={education.current}
                                        onCheckedChange={(checked) => handleUpdateEducation(index, "current", checked)}
                                      />
                                      <Label>Current</Label>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </Card>
                          ))
                        ) : (
                          <div className="text-center py-12">
                            <School className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">
                              No education details added yet. Add your educational background to showcase your
                              qualifications.
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {profile.education && profile.education.length > 0 ? (
                          profile.education.map((education) => (
                            <Card key={education.id} className="group hover:shadow-lg transition-all duration-300">
                              <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                  <div className="p-3 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20">
                                    <School className="h-6 w-6 text-green-600" />
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-lg">{education.institution}</h4>
                                    <p className="text-muted-foreground mt-1">
                                      {education.degree}
                                      {education.field ? `, ${education.field}` : ""}
                                    </p>
                                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                                      <Calendar className="h-4 w-4" />
                                      <span>
                                        {new Date(education.startDate).toLocaleDateString("en-US", {
                                          year: "numeric",
                                          month: "short",
                                        })}{" "}
                                        -
                                        {education.current
                                          ? " Present"
                                          : ` ${new Date(education.endDate).toLocaleDateString("en-US", { year: "numeric", month: "short" })}`}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))
                        ) : (
                          <div className="text-center py-12">
                            <School className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">No education details added yet</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>

              {/* Projects Tab */}
              <TabsContent value="projects" className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-purple-500" />
                    Projects & Portfolio
                  </h3>
                  {isEditing && (
                    <Button variant="outline" size="sm" onClick={handleAddProject}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Project
                    </Button>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-6">
                    {editableProfile.projects && editableProfile.projects.length > 0 ? (
                      editableProfile.projects.map((project, index) => (
                        <Card key={project.id} className="p-4">
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="font-medium">Project #{index + 1}</h4>
                            <Button variant="ghost" size="sm" onClick={() => handleRemoveProject(index)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label>Title</Label>
                              <Input
                                value={project.title}
                                onChange={(e) => handleUpdateProject(index, "title", e.target.value)}
                                placeholder="Project title"
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label>URL</Label>
                              <Input
                                value={project.url}
                                onChange={(e) => handleUpdateProject(index, "url", e.target.value)}
                                placeholder="Project URL (GitHub, Demo, etc.)"
                                className="mt-1"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <Label>Description</Label>
                              <Textarea
                                value={project.description}
                                onChange={(e) => handleUpdateProject(index, "description", e.target.value)}
                                placeholder="Describe your project, technologies used, and your contributions"
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label>Start Date</Label>
                              <Input
                                type="date"
                                value={project.startDate}
                                onChange={(e) => handleUpdateProject(index, "startDate", e.target.value)}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label>End Date</Label>
                              <div className="flex items-center gap-2 mt-1">
                                <Input
                                  type="date"
                                  value={project.endDate}
                                  onChange={(e) => handleUpdateProject(index, "endDate", e.target.value)}
                                  disabled={project.current}
                                />
                                <div className="flex items-center gap-2">
                                  <Switch
                                    checked={project.current}
                                    onCheckedChange={(checked) => handleUpdateProject(index, "current", checked)}
                                  />
                                  <Label>Ongoing</Label>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          No projects added yet. Showcase your portfolio to demonstrate your practical skills!
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {profile.projects && profile.projects.length > 0 ? (
                      profile.projects.map((project) => (
                        <Card
                          key={project.id}
                          className="group hover:shadow-lg transition-all duration-300 overflow-hidden"
                        >
                          <div className="h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
                          <CardContent className="p-6">
                            <div className="flex items-start gap-3 mb-4">
                              <div className="p-2 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20">
                                <BookOpen className="h-5 w-5 text-purple-600" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-lg group-hover:text-purple-600 transition-colors">
                                  {project.title}
                                </h4>
                                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                                  <Calendar className="h-4 w-4" />
                                  <span>
                                    {new Date(project.startDate).toLocaleDateString("en-US", {
                                      year: "numeric",
                                      month: "short",
                                    })}{" "}
                                    -
                                    {project.current
                                      ? " Ongoing"
                                      : ` ${new Date(project.endDate).toLocaleDateString("en-US", { year: "numeric", month: "short" })}`}
                                  </span>
                                </div>
                              </div>
                            </div>
                            {project.description && (
                              <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{project.description}</p>
                            )}
                            {project.url && (
                              <a
                                href={project.url.startsWith("http") ? project.url : `https://${project.url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors"
                              >
                                <LinkIcon className="h-4 w-4" />
                                View Project
                                <ChevronRight className="h-3 w-3" />
                              </a>
                            )}
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="col-span-2 text-center py-12">
                        <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No projects added yet</p>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>

              {/* Experience Tab */}
              <TabsContent value="experience" className="p-6 space-y-6">
                {(isEditing || profile?.privacy?.showExperience !== false) && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-orange-500" />
                        Work Experience
                      </h3>
                      {isEditing && (
                        <Button variant="outline" size="sm" onClick={handleAddExperience}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Experience
                        </Button>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="space-y-6">
                        {editableProfile.experience && editableProfile.experience.length > 0 ? (
                          editableProfile.experience.map((experience, index) => (
                            <Card key={experience.id} className="p-4">
                              <div className="flex justify-between items-center mb-4">
                                <h4 className="font-medium">Experience #{index + 1}</h4>
                                <Button variant="ghost" size="sm" onClick={() => handleRemoveExperience(index)}>
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <Label>Company</Label>
                                  <Input
                                    value={experience.company}
                                    onChange={(e) => handleUpdateExperience(index, "company", e.target.value)}
                                    placeholder="Company name"
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <Label>Position</Label>
                                  <Input
                                    value={experience.position}
                                    onChange={(e) => handleUpdateExperience(index, "position", e.target.value)}
                                    placeholder="Your job title"
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <Label>Location</Label>
                                  <Input
                                    value={experience.location}
                                    onChange={(e) => handleUpdateExperience(index, "location", e.target.value)}
                                    placeholder="City, Country"
                                    className="mt-1"
                                  />
                                </div>
                                <div className="md:col-span-2">
                                  <Label>Description</Label>
                                  <Textarea
                                    value={experience.description}
                                    onChange={(e) => handleUpdateExperience(index, "description", e.target.value)}
                                    placeholder="Describe your responsibilities and achievements"
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <Label>Start Date</Label>
                                  <Input
                                    type="date"
                                    value={experience.startDate}
                                    onChange={(e) => handleUpdateExperience(index, "startDate", e.target.value)}
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <Label>End Date</Label>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Input
                                      type="date"
                                      value={experience.endDate}
                                      onChange={(e) => handleUpdateExperience(index, "endDate", e.target.value)}
                                      disabled={experience.current}
                                    />
                                    <div className="flex items-center gap-2">
                                      <Switch
                                        checked={experience.current}
                                        onCheckedChange={(checked) => handleUpdateExperience(index, "current", checked)}
                                      />
                                      <Label>Current</Label>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </Card>
                          ))
                        ) : (
                          <div className="text-center py-12">
                            <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">
                              No experience added yet. Share your work history and internships to highlight your
                              professional journey.
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {profile.experience && profile.experience.length > 0 ? (
                          profile.experience.map((experience) => (
                            <Card key={experience.id} className="group hover:shadow-lg transition-all duration-300">
                              <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                  <div className="p-3 rounded-full bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/20 dark:to-red-900/20">
                                    <Briefcase className="h-6 w-6 text-orange-600" />
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-lg group-hover:text-orange-600 transition-colors">
                                      {experience.position}
                                    </h4>
                                    <p className="text-muted-foreground mt-1">
                                      {experience.company}
                                      {experience.location ? ` • ${experience.location}` : ""}
                                    </p>
                                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                                      <Calendar className="h-4 w-4" />
                                      <span>
                                        {new Date(experience.startDate).toLocaleDateString("en-US", {
                                          year: "numeric",
                                          month: "short",
                                        })}{" "}
                                        -
                                        {experience.current
                                          ? " Present"
                                          : ` ${new Date(experience.endDate).toLocaleDateString("en-US", { year: "numeric", month: "short" })}`}
                                      </span>
                                    </div>
                                    {experience.description && (
                                      <p className="mt-3 text-sm leading-relaxed">{experience.description}</p>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))
                        ) : (
                          <div className="text-center py-12">
                            <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">No experience added yet</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>

              {/* Activity Tab */}
              <TabsContent value="activity" className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <Activity className="h-5 w-5 text-green-500" />
                    Activity Timeline
                  </h3>
                  <Button variant="outline" size="sm" onClick={() => setShowActivityTimeline(!showActivityTimeline)}>
                    {showActivityTimeline ? "Hide Details" : "Show Details"}
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Activity Stats */}
                  <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
                    <CardHeader>
                      <CardTitle className="text-green-700 dark:text-green-300">Activity Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{profileStats.streakDays}</div>
                          <div className="text-xs text-muted-foreground">Day Streak</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{profileStats.resourcesShared}</div>
                          <div className="text-xs text-muted-foreground">Resources</div>
                        </div>
                      </div>
                      <Separator />
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Weekly Goal</span>
                          <span className="font-medium">7/10 days</span>
                        </div>
                        <Progress value={70} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recent Activity Feed */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {recentActivity.map((activity) => (
                          <div
                            key={activity.id}
                            className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <div className={`p-2 rounded-full bg-white shadow-sm ${activity.color}`}>
                              {activity.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm">{activity.title}</div>
                              <div className="text-xs text-muted-foreground mt-1">{activity.description}</div>
                              <div className="text-xs text-muted-foreground mt-1">{activity.timestamp}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Detailed Timeline */}
                {showActivityTimeline && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Detailed Timeline</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="relative">
                        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 to-purple-500"></div>
                        <div className="space-y-6">
                          {[
                            { date: "Today", activities: ["Updated profile picture", "Added new skill: React"] },
                            { date: "Yesterday", activities: ["Shared 2 resources", "Connected with 3 students"] },
                            {
                              date: "2 days ago",
                              activities: ["Earned 'Active Contributor' badge", "Posted in discussion"],
                            },
                          ].map((day, index) => (
                            <div key={index} className="relative pl-10">
                              <div className="absolute left-2 w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full border-2 border-white shadow-sm"></div>
                              <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border">
                                <div className="font-medium text-sm text-muted-foreground mb-2">{day.date}</div>
                                <div className="space-y-1">
                                  {day.activities.map((activity, actIndex) => (
                                    <div key={actIndex} className="text-sm">
                                      {activity}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Profile Picture Upload Dialog */}
      <Dialog open={showProfilePictureDialog} onOpenChange={setShowProfilePictureDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Profile Picture</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="relative">
                <Avatar className="h-40 w-40 border-4 border-muted">
                  <AvatarImage src={profile.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="text-4xl">{profile.name[0]}</AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 bg-black/20 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
            <Input id="picture" type="file" accept="image/*" onChange={handleProfilePictureChange} />
            <Button onClick={() => fileInputRef.current?.click()} className="w-full">
              <Camera className="mr-2 h-4 w-4" />
              Choose Photo
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleProfilePictureChange}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Privacy Settings Dialog */}
      <Dialog open={showPrivacySettings} onOpenChange={setShowPrivacySettings}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Privacy Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show Email Address</Label>
                <p className="text-sm text-muted-foreground">Allow others to see your email address</p>
              </div>
              <Switch
                checked={editableProfile.privacy.showEmail}
                onCheckedChange={() => togglePrivacySetting("showEmail")}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show Location</Label>
                <p className="text-sm text-muted-foreground">Display your location on your profile</p>
              </div>
              <Switch
                checked={editableProfile.privacy.showLocation}
                onCheckedChange={() => togglePrivacySetting("showLocation")}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show Education</Label>
                <p className="text-sm text-muted-foreground">Display your educational background</p>
              </div>
              <Switch
                checked={editableProfile.privacy.showEducation}
                onCheckedChange={() => togglePrivacySetting("showEducation")}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Allow Messages</Label>
                <p className="text-sm text-muted-foreground">Let others send you direct messages</p>
              </div>
              <Switch
                checked={editableProfile.privacy.allowMessages}
                onCheckedChange={() => togglePrivacySetting("allowMessages")}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Badge Details Dialog */}
      <Dialog open={showBadgeDetails} onOpenChange={setShowBadgeDetails}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Badge Details</DialogTitle>
          </DialogHeader>
          {selectedBadge && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/20 dark:to-yellow-900/20 flex items-center justify-center border-2 border-amber-500">
                  <Award className="h-10 w-10 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedBadge.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedBadge.level} Level</p>
                </div>
              </div>
              <Separator />
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p>{selectedBadge.description}</p>
              </div>
              {selectedBadge.criteria && (
                <div>
                  <h4 className="font-medium mb-2">How to Earn</h4>
                  <p>{selectedBadge.criteria}</p>
                </div>
              )}
              <div>
                <h4 className="font-medium mb-2">Category</h4>
                <Badge variant="outline">{selectedBadge.category}</Badge>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Chat Dialog */}
      {showChat && (
        <Dialog open={showChat} onOpenChange={setShowChat}>
          <DialogContent className="max-w-2xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Message {profile.name}</DialogTitle>
            </DialogHeader>
            <ProfileChat recipientId={profile.id} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

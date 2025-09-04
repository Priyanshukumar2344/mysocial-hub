"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Plus, Trash2, Save, Eye, ChevronUp, ChevronDown, Upload } from "lucide-react"
import { CollegeProfilePreview } from "@/components/CollegeProfilePreview"
import type { CollegeProfile, Achievement, Course, Faculty, Event } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { db } from "@/lib/db"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function CollegeProfileAdmin() {
  const router = useRouter()
  const { isAuthenticated, isAdmin } = useAuth()
  const { toast } = useToast()
  const [profile, setProfile] = useState<CollegeProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")
  const [previewMode, setPreviewMode] = useState(false)

  // Form states
  const [basicInfo, setBasicInfo] = useState({
    name: "",
    description: "",
    established: "",
    logo: "",
  })

  const [contactInfo, setContactInfo] = useState({
    address: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
    email: "",
    phone: "",
    website: "",
  })

  const [stats, setStats] = useState({
    students: 0,
    faculty: 0,
    courses: 0,
    alumni: 0,
    placement: "",
  })

  const [rankings, setRankings] = useState({
    nirf: 0,
    naac: "",
    other: [] as string[],
  })

  const [coverImages, setCoverImages] = useState<CollegeProfile["coverImages"]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [faculty, setFaculty] = useState<Faculty[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([])
  const [topPerformers, setTopPerformers] = useState<CollegeProfile["topPerformers"]["students"]>([])

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
  ])

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    if (!isAdmin) {
      router.push("/")
      return
    }

    loadCollegeProfile()
  }, [isAuthenticated, isAdmin, router])

  const loadCollegeProfile = async () => {
    setLoading(true)
    try {
      // Load from localStorage or use mock data
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
            url: "/placeholder.svg?height=300&width=1200&text=AITD+Campus",
            caption: "Main Campus Building",
            order: 1,
          },
          {
            id: "cover2",
            url: "/placeholder.svg?height=300&width=1200&text=AITD+Library",
            caption: "Central Library",
            order: 2,
          },
          {
            id: "cover3",
            url: "/placeholder.svg?height=300&width=1200&text=AITD+Labs",
            caption: "Computer Science Labs",
            order: 3,
          },
        ],
        description:
          "AITD Engineering College is one of the premier engineering colleges in the region, offering a wide range of courses in engineering and technology. The college is known for its excellent infrastructure, qualified faculty, and state-of-the-art laboratories.",
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
          other: ["Top 100 Engineering Colleges in India", "Excellence in Research Award 2023"],
        },
        achievements: [
          {
            id: "1",
            title: "Excellence in Research Award",
            date: "2023-05-15",
            description: "Awarded for outstanding contributions to research in AI and Machine Learning.",
            images: [],
          },
          {
            id: "2",
            title: "Best Infrastructure Award",
            date: "2022-12-10",
            description: "Recognized for having one of the best campus infrastructures in the region.",
            images: [],
          },
        ],
        topPerformers: {
          students: [
            {
              id: "1",
              name: "Rahul Sharma",
              course: "B.Tech Computer Science",
              achievement: "Gold Medal in Academics",
              avatar: "/placeholder.svg",
            },
            {
              id: "2",
              name: "Priya Patel",
              course: "B.Tech Electronics",
              achievement: "Best Innovation Project",
              avatar: "/placeholder.svg",
            },
          ],
        },
        courses: [
          {
            id: "1",
            name: "Computer Science & Engineering",
            description: "A comprehensive course covering fundamentals of computer science.",
            duration: "4 years",
            fees: 150000,
          },
          {
            id: "2",
            name: "Electronics & Communication",
            description: "Focuses on electronic systems and communication networks.",
            duration: "4 years",
            fees: 140000,
          },
        ],
        upcomingEvents: [
          {
            id: "1",
            title: "Tech Symposium 2024",
            description: "Annual technical symposium featuring keynote speakers.",
            startDate: "2024-04-15",
            endDate: "2024-04-15",
            location: "Main Auditorium",
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
        ],
        isVerified: true,
      }

      setProfile(mockProfile)
      populateFormFields(mockProfile)
      setLoading(false)
    } catch (error) {
      console.error("Error loading college profile:", error)
      setLoading(false)
    }
  }

  const populateFormFields = (profile: CollegeProfile) => {
    setBasicInfo({
      name: profile.name,
      description: profile.description,
      established: profile.established,
      logo: profile.logo || "",
    })

    setContactInfo({
      address: profile.location.address,
      city: profile.location.city,
      state: profile.location.state,
      country: profile.location.country,
      pincode: profile.location.pincode,
      email: profile.contact.email,
      phone: profile.contact.phone,
      website: profile.contact.website,
    })

    setStats(profile.stats)
    setRankings(profile.rankings)
    setCoverImages(profile.coverImages)
    setAchievements(profile.achievements)
    setCourses(profile.courses)
    setFaculty(profile.faculty)
    setUpcomingEvents(profile.upcomingEvents)
    setTopPerformers(profile.topPerformers.students)
  }

  const saveProfile = async () => {
    setSaving(true)
    try {
      const updatedProfile: CollegeProfile = {
        ...profile!,
        name: basicInfo.name,
        description: basicInfo.description,
        established: basicInfo.established,
        logo: basicInfo.logo,
        location: {
          address: contactInfo.address,
          city: contactInfo.city,
          state: contactInfo.state,
          country: contactInfo.country,
          pincode: contactInfo.pincode,
        },
        contact: {
          email: contactInfo.email,
          phone: contactInfo.phone,
          website: contactInfo.website,
        },
        stats,
        rankings,
        coverImages,
        achievements,
        courses,
        faculty,
        upcomingEvents,
        topPerformers: { students: topPerformers },
        lastUpdated: new Date().toISOString(),
      }

      // Save to localStorage
      db.set("collegeProfile", updatedProfile)
      db.set("campusNews", campusNews)
      setProfile(updatedProfile)

      // Dispatch events for instant updates across the app
      window.dispatchEvent(
        new CustomEvent("collegeProfileUpdated", {
          detail: updatedProfile,
        }),
      )

      window.dispatchEvent(
        new CustomEvent("campusNewsUpdated", {
          detail: campusNews,
        }),
      )

      toast({
        title: "Profile Updated",
        description: "College profile and campus news have been updated successfully and are now live!",
      })
    } catch (error) {
      console.error("Error saving profile:", error)
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  // Cover Image Management
  const addCoverImage = () => {
    const newImage = {
      id: `cover${Date.now()}`,
      url: "/placeholder.svg?height=300&width=1200&text=New+Cover",
      caption: "New Cover Image",
      order: coverImages.length + 1,
    }
    setCoverImages([...coverImages, newImage])
  }

  const updateCoverImage = (id: string, updates: Partial<CollegeProfile["coverImages"][0]>) => {
    setCoverImages(coverImages.map((img) => (img.id === id ? { ...img, ...updates } : img)))
  }

  const deleteCoverImage = (id: string) => {
    setCoverImages(coverImages.filter((img) => img.id !== id))
  }

  const moveCoverImage = (id: string, direction: "up" | "down") => {
    const index = coverImages.findIndex((img) => img.id === id)
    if (index === -1) return

    const newImages = [...coverImages]
    if (direction === "up" && index > 0) {
      ;[newImages[index], newImages[index - 1]] = [newImages[index - 1], newImages[index]]
    } else if (direction === "down" && index < newImages.length - 1) {
      ;[newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]]
    }

    // Update order numbers
    newImages.forEach((img, idx) => {
      img.order = idx + 1
    })

    setCoverImages(newImages)
  }

  // Achievement Management
  const addAchievement = () => {
    const newAchievement: Achievement = {
      id: `achievement${Date.now()}`,
      title: "New Achievement",
      description: "Achievement description",
      date: new Date().toISOString().split("T")[0],
      images: [],
    }
    setAchievements([...achievements, newAchievement])
  }

  const updateAchievement = (id: string, updates: Partial<Achievement>) => {
    setAchievements(achievements.map((ach) => (ach.id === id ? { ...ach, ...updates } : ach)))
  }

  const deleteAchievement = (id: string) => {
    setAchievements(achievements.filter((ach) => ach.id !== id))
  }

  // Course Management
  const addCourse = () => {
    const newCourse: Course = {
      id: `course${Date.now()}`,
      name: "New Course",
      description: "Course description",
      duration: "4 years",
      fees: 0,
    }
    setCourses([...courses, newCourse])
  }

  const updateCourse = (id: string, updates: Partial<Course>) => {
    setCourses(courses.map((course) => (course.id === id ? { ...course, ...updates } : course)))
  }

  const deleteCourse = (id: string) => {
    setCourses(courses.filter((course) => course.id !== id))
  }

  // Faculty Management
  const addFaculty = () => {
    const newFaculty: Faculty = {
      id: `faculty${Date.now()}`,
      name: "New Faculty",
      designation: "Professor",
      department: "Department",
      email: "faculty@college.edu",
      phone: "+91 0000000000",
    }
    setFaculty([...faculty, newFaculty])
  }

  const updateFaculty = (id: string, updates: Partial<Faculty>) => {
    setFaculty(faculty.map((fac) => (fac.id === id ? { ...fac, ...updates } : fac)))
  }

  const deleteFaculty = (id: string) => {
    setFaculty(faculty.filter((fac) => fac.id !== id))
  }

  // Event Management
  const addEvent = () => {
    const newEvent: Event = {
      id: `event${Date.now()}`,
      title: "New Event",
      description: "Event description",
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date().toISOString().split("T")[0],
      location: "Event Location",
      organizer: "admin",
      attendees: [],
      interested: [],
      visibility: "public",
    }
    setUpcomingEvents([...upcomingEvents, newEvent])
  }

  const updateEvent = (id: string, updates: Partial<Event>) => {
    setUpcomingEvents(upcomingEvents.map((event) => (event.id === id ? { ...event, ...updates } : event)))
  }

  const deleteEvent = (id: string) => {
    setUpcomingEvents(upcomingEvents.filter((event) => event.id !== id))
  }

  // Top Performer Management
  const addTopPerformer = () => {
    const newPerformer = {
      id: `performer${Date.now()}`,
      name: "New Performer",
      course: "Course Name",
      achievement: "Achievement",
      avatar: "/placeholder.svg",
    }
    setTopPerformers([...topPerformers, newPerformer])
  }

  const updateTopPerformer = (id: string, updates: Partial<CollegeProfile["topPerformers"]["students"][0]>) => {
    setTopPerformers(topPerformers.map((perf) => (perf.id === id ? { ...perf, ...updates } : perf)))
  }

  const deleteTopPerformer = (id: string) => {
    setTopPerformers(topPerformers.filter((perf) => perf.id !== id))
  }

  // News Management
  const addNews = () => {
    const newNews = {
      id: Date.now(),
      title: "New News Article",
      excerpt: "News excerpt...",
      date: "Just now",
      category: "General",
      image: "/placeholder.svg?height=200&width=300&text=News",
      views: 0,
      likes: 0,
      link: "#",
      author: "Admin",
      publishedAt: new Date().toISOString(),
    }
    setCampusNews([newNews, ...campusNews])
  }

  const updateNews = (id: number, updates: any) => {
    setCampusNews(campusNews.map((news) => (news.id === id ? { ...news, ...updates } : news)))
  }

  const deleteNews = (id: number) => {
    setCampusNews(campusNews.filter((news) => news.id !== id))
  }

  const handleNewsImageUpload = (event: React.ChangeEvent<HTMLInputElement>, newsId: number) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      updateNews(newsId, { image: e.target?.result as string })
    }
    reader.readAsDataURL(file)
  }

  // File upload handlers
  const handleCoverImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    Array.from(files).forEach((file, index) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const newImage = {
          id: `cover${Date.now()}_${index}`,
          url: e.target?.result as string,
          caption: `Uploaded Image ${coverImages.length + index + 1}`,
          order: coverImages.length + index + 1,
        }
        setCoverImages((prev) => [...prev, newImage])
      }
      reader.readAsDataURL(file)
    })
  }

  const handleSingleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, imageId: string) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      updateCoverImage(imageId, { url: e.target?.result as string })
    }
    reader.readAsDataURL(file)
  }

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      setBasicInfo({ ...basicInfo, logo: e.target?.result as string })
    }
    reader.readAsDataURL(file)
  }

  if (loading) {
    return (
      <div className="container mx-auto py-10 text-center">
        <p>Loading college profile...</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="container mx-auto py-10 text-center">
        <p>College profile not found</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">College Profile Management</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setPreviewMode(!previewMode)}>
            <Eye className="h-4 w-4 mr-2" />
            {previewMode ? "Edit Mode" : "Preview"}
          </Button>
          <Button onClick={saveProfile} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save & Publish"}
          </Button>
        </div>
      </div>

      {previewMode ? (
        <CollegeProfilePreview profile={profile} />
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-9 mb-6">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
            <TabsTrigger value="covers">Cover Images</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="faculty">Faculty</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="news">Campus News</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">College Name</Label>
                  <Input
                    id="name"
                    value={basicInfo.name}
                    onChange={(e) => setBasicInfo({ ...basicInfo, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    rows={4}
                    value={basicInfo.description}
                    onChange={(e) => setBasicInfo({ ...basicInfo, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="established">Established Year</Label>
                    <Input
                      id="established"
                      value={basicInfo.established}
                      onChange={(e) => setBasicInfo({ ...basicInfo, established: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="logo">College Logo</Label>
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Avatar className="h-20 w-20 border-2 border-gray-200">
                          <AvatarImage src={basicInfo.logo || "/placeholder.svg"} alt="College Logo" />
                          <AvatarFallback>Logo</AvatarFallback>
                        </Avatar>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          id="logo-upload"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity rounded-full flex items-center justify-center">
                          <Upload className="h-4 w-4 text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <Input
                          id="logo"
                          value={basicInfo.logo}
                          onChange={(e) => setBasicInfo({ ...basicInfo, logo: e.target.value })}
                          placeholder="Logo URL or upload an image"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Click on the logo to upload a new image or enter a URL
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={contactInfo.address}
                    onChange={(e) => setContactInfo({ ...contactInfo, address: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={contactInfo.city}
                      onChange={(e) => setContactInfo({ ...contactInfo, city: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={contactInfo.state}
                      onChange={(e) => setContactInfo({ ...contactInfo, state: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input
                      id="pincode"
                      value={contactInfo.pincode}
                      onChange={(e) => setContactInfo({ ...contactInfo, pincode: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={contactInfo.email}
                      onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={contactInfo.phone}
                      onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={contactInfo.website}
                    onChange={(e) => setContactInfo({ ...contactInfo, website: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>College Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="students">Total Students</Label>
                    <Input
                      id="students"
                      type="number"
                      value={stats.students}
                      onChange={(e) => setStats({ ...stats, students: Number.parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="faculty-count">Total Faculty</Label>
                    <Input
                      id="faculty-count"
                      type="number"
                      value={stats.faculty}
                      onChange={(e) => setStats({ ...stats, faculty: Number.parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="courses-count">Total Courses</Label>
                    <Input
                      id="courses-count"
                      type="number"
                      value={stats.courses}
                      onChange={(e) => setStats({ ...stats, courses: Number.parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="alumni">Total Alumni</Label>
                    <Input
                      id="alumni"
                      type="number"
                      value={stats.alumni}
                      onChange={(e) => setStats({ ...stats, alumni: Number.parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="placement">Placement Rate</Label>
                  <Input
                    id="placement"
                    value={stats.placement}
                    onChange={(e) => setStats({ ...stats, placement: e.target.value })}
                    placeholder="e.g., 92%"
                  />
                </div>
                <Separator />
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Rankings</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nirf">NIRF Ranking</Label>
                      <Input
                        id="nirf"
                        type="number"
                        value={rankings.nirf}
                        onChange={(e) => setRankings({ ...rankings, nirf: Number.parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="naac">NAAC Grade</Label>
                      <Input
                        id="naac"
                        value={rankings.naac}
                        onChange={(e) => setRankings({ ...rankings, naac: e.target.value })}
                        placeholder="e.g., A+"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="covers" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Cover Images</CardTitle>
                  <div className="flex gap-2">
                    <Button onClick={addCoverImage}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Cover Image
                    </Button>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleCoverImageUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        id="cover-upload"
                      />
                      <Button variant="outline" className="relative bg-transparent">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Images
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {coverImages.map((image, index) => (
                  <Card key={image.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <img
                            src={image.url || "/placeholder.svg"}
                            alt={image.caption}
                            className="w-24 h-16 object-cover rounded cursor-pointer"
                            onClick={() => document.getElementById(`image-upload-${image.id}`)?.click()}
                          />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleSingleImageUpload(e, image.id)}
                            className="hidden"
                            id={`image-upload-${image.id}`}
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                            <Upload className="h-4 w-4 text-white" />
                          </div>
                        </div>
                        <div className="flex-1 space-y-2">
                          <Input
                            value={image.url}
                            onChange={(e) => updateCoverImage(image.id, { url: e.target.value })}
                            placeholder="Image URL or upload an image"
                          />
                          <Input
                            value={image.caption || ""}
                            onChange={(e) => updateCoverImage(image.id, { caption: e.target.value })}
                            placeholder="Caption"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => moveCoverImage(image.id, "up")}
                            disabled={index === 0}
                          >
                            <ChevronUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => moveCoverImage(image.id, "down")}
                            disabled={index === coverImages.length - 1}
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </div>
                        <Button variant="destructive" size="sm" onClick={() => deleteCoverImage(image.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>College Achievements</CardTitle>
                  <Button onClick={addAchievement}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Achievement
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {achievements.map((achievement) => (
                  <Card key={achievement.id}>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 space-y-2">
                          <Input
                            value={achievement.title}
                            onChange={(e) => updateAchievement(achievement.id, { title: e.target.value })}
                            placeholder="Achievement Title"
                          />
                          <Textarea
                            value={achievement.description}
                            onChange={(e) => updateAchievement(achievement.id, { description: e.target.value })}
                            placeholder="Achievement Description"
                            rows={2}
                          />
                          <Input
                            type="date"
                            value={achievement.date}
                            onChange={(e) => updateAchievement(achievement.id, { date: e.target.value })}
                          />
                        </div>
                        <Button variant="destructive" size="sm" onClick={() => deleteAchievement(achievement.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="courses" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Academic Courses</CardTitle>
                  <Button onClick={addCourse}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Course
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {courses.map((course) => (
                  <Card key={course.id}>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 space-y-2">
                          <Input
                            value={course.name}
                            onChange={(e) => updateCourse(course.id, { name: e.target.value })}
                            placeholder="Course Name"
                          />
                          <Textarea
                            value={course.description}
                            onChange={(e) => updateCourse(course.id, { description: e.target.value })}
                            placeholder="Course Description"
                            rows={2}
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              value={course.duration}
                              onChange={(e) => updateCourse(course.id, { duration: e.target.value })}
                              placeholder="Duration"
                            />
                            <Input
                              type="number"
                              value={course.fees}
                              onChange={(e) => updateCourse(course.id, { fees: Number.parseInt(e.target.value) || 0 })}
                              placeholder="Fees"
                            />
                          </div>
                        </div>
                        <Button variant="destructive" size="sm" onClick={() => deleteCourse(course.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="faculty" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Faculty Members</CardTitle>
                  <Button onClick={addFaculty}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Faculty
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {faculty.map((fac) => (
                  <Card key={fac.id}>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              value={fac.name}
                              onChange={(e) => updateFaculty(fac.id, { name: e.target.value })}
                              placeholder="Faculty Name"
                            />
                            <Input
                              value={fac.designation}
                              onChange={(e) => updateFaculty(fac.id, { designation: e.target.value })}
                              placeholder="Designation"
                            />
                          </div>
                          <Input
                            value={fac.department}
                            onChange={(e) => updateFaculty(fac.id, { department: e.target.value })}
                            placeholder="Department"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              type="email"
                              value={fac.email}
                              onChange={(e) => updateFaculty(fac.id, { email: e.target.value })}
                              placeholder="Email"
                            />
                            <Input
                              value={fac.phone}
                              onChange={(e) => updateFaculty(fac.id, { phone: e.target.value })}
                              placeholder="Phone"
                            />
                          </div>
                          <Input
                            value={fac.avatar || ""}
                            onChange={(e) => updateFaculty(fac.id, { avatar: e.target.value })}
                            placeholder="Avatar URL"
                          />
                        </div>
                        <Button variant="destructive" size="sm" onClick={() => deleteFaculty(fac.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Upcoming Events</CardTitle>
                  <Button onClick={addEvent}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Event
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingEvents.map((event) => (
                  <Card key={event.id}>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 space-y-2">
                          <Input
                            value={event.title}
                            onChange={(e) => updateEvent(event.id, { title: e.target.value })}
                            placeholder="Event Title"
                          />
                          <Textarea
                            value={event.description}
                            onChange={(e) => updateEvent(event.id, { description: e.target.value })}
                            placeholder="Event Description"
                            rows={2}
                          />
                          <div className="grid grid-cols-3 gap-2">
                            <Input
                              type="date"
                              value={event.startDate}
                              onChange={(e) => updateEvent(event.id, { startDate: e.target.value })}
                            />
                            <Input
                              type="date"
                              value={event.endDate}
                              onChange={(e) => updateEvent(event.id, { endDate: e.target.value })}
                            />
                            <Input
                              value={event.location || ""}
                              onChange={(e) => updateEvent(event.id, { location: e.target.value })}
                              placeholder="Location"
                            />
                          </div>
                        </div>
                        <Button variant="destructive" size="sm" onClick={() => deleteEvent(event.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="news" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Campus News & Updates</CardTitle>
                  <Button onClick={addNews}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add News Article
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {campusNews.map((news) => (
                  <Card key={news.id}>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              value={news.title}
                              onChange={(e) => updateNews(news.id, { title: e.target.value })}
                              placeholder="News Title"
                            />
                            <Input
                              value={news.category}
                              onChange={(e) => updateNews(news.id, { category: e.target.value })}
                              placeholder="Category"
                            />
                          </div>
                          <Textarea
                            value={news.excerpt}
                            onChange={(e) => updateNews(news.id, { excerpt: e.target.value })}
                            placeholder="News Excerpt"
                            rows={3}
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              value={news.link}
                              onChange={(e) => updateNews(news.id, { link: e.target.value })}
                              placeholder="External Link (optional)"
                            />
                            <Input
                              value={news.author}
                              onChange={(e) => updateNews(news.id, { author: e.target.value })}
                              placeholder="Author"
                            />
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <img
                                src={news.image || "/placeholder.svg"}
                                alt={news.title}
                                className="w-24 h-16 object-cover rounded cursor-pointer"
                                onClick={() => document.getElementById(`news-image-upload-${news.id}`)?.click()}
                              />
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleNewsImageUpload(e, news.id)}
                                className="hidden"
                                id={`news-image-upload-${news.id}`}
                              />
                              <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                                <Upload className="h-4 w-4 text-white" />
                              </div>
                            </div>
                            <div className="flex-1">
                              <Input
                                value={news.image}
                                onChange={(e) => updateNews(news.id, { image: e.target.value })}
                                placeholder="Image URL or upload an image"
                              />
                              <p className="text-xs text-muted-foreground mt-1">
                                Click on the image to upload or enter a URL
                              </p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex items-center gap-2">
                              <Label className="text-xs">Views:</Label>
                              <Input
                                type="number"
                                value={news.views}
                                onChange={(e) => updateNews(news.id, { views: Number.parseInt(e.target.value) || 0 })}
                                className="w-20 h-8 text-xs"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <Label className="text-xs">Likes:</Label>
                              <Input
                                type="number"
                                value={news.likes}
                                onChange={(e) => updateNews(news.id, { likes: Number.parseInt(e.target.value) || 0 })}
                                className="w-20 h-8 text-xs"
                              />
                            </div>
                          </div>
                        </div>
                        <Button variant="destructive" size="sm" onClick={() => deleteNews(news.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

export type { CollegeProfile }

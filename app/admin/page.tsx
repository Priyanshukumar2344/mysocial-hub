"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/contexts/AuthContext"
import { db, type UserData } from "@/lib/db"
import { toast } from "@/components/ui/use-toast"
import {
  Users,
  GraduationCap,
  School,
  BookOpen,
  FileCheck,
  UserPlus,
  ChevronRight,
  BarChart3,
  TrendingUp,
  Activity,
  Globe,
  Flag,
} from "lucide-react"
import Link from "next/link"

type UserStats = {
  totalUsers: number
  totalTeachers: number
  totalStudents: number
  activeUsers: number
  newUsersThisMonth: number
  verifiedUsers: number
}

type ResourceStats = {
  totalResources: number
  pendingVerification: number
  approvedResources: number
  rejectedResources: number
}

type PageStats = {
  totalPages: number
  featuredPages: number
  verifiedPages: number
  reportedPages: number
}

export default function AdminDashboard() {
  const { user, isSuperAdmin } = useAuth()
  const [showRegisterDialog, setShowRegisterDialog] = useState(false)
  const [userStats, setUserStats] = useState<UserStats>({
    totalUsers: 0,
    totalTeachers: 0,
    totalStudents: 0,
    activeUsers: 0,
    newUsersThisMonth: 0,
    verifiedUsers: 0,
  })
  const [resourceStats, setResourceStats] = useState<ResourceStats>({
    totalResources: 0,
    pendingVerification: 0,
    approvedResources: 0,
    rejectedResources: 0,
  })
  const [pageStats, setPageStats] = useState<PageStats>({
    totalPages: 0,
    featuredPages: 0,
    verifiedPages: 0,
    reportedPages: 0,
  })
  const [newUser, setNewUser] = useState({
    collegeId: "",
    name: "",
    email: "",
    mobile: "",
    role: "student",
    department: "",
    semester: "",
    dateOfBirth: "",
  })

  useEffect(() => {
    // Load user statistics
    const users = db.get("users") || []
    const currentDate = new Date()
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)

    setUserStats({
      totalUsers: users.length,
      totalTeachers: users.filter((u: UserData) => u.role === "teacher").length,
      totalStudents: users.filter((u: UserData) => u.role === "student").length,
      activeUsers: users.filter((u: UserData) => u.status === "active").length,
      newUsersThisMonth: users.filter((u: UserData) => new Date(u.createdAt) >= firstDayOfMonth).length,
      verifiedUsers: users.filter((u: UserData) => u.isVerified).length,
    })

    // Load resource statistics
    const resources = db.get("resources") || []
    const verifications = db.get("verifications") || []

    setResourceStats({
      totalResources: resources.length,
      pendingVerification: verifications.filter((v: any) => v.status === "pending").length,
      approvedResources: verifications.filter((v: any) => v.status === "approved").length,
      rejectedResources: verifications.filter((v: any) => v.status === "rejected").length,
    })

    // Load page statistics
    const pages = db.get("pages") || []
    setPageStats({
      totalPages: pages.length,
      featuredPages: pages.filter((p: any) => p.featured).length,
      verifiedPages: pages.filter((p: any) => p.verified).length,
      reportedPages: pages.filter((p: any) => p.reported).length || 0,
    })
  }, [])

  const handleRegister = async () => {
    if (!newUser.collegeId || !newUser.name || !newUser.mobile) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    // Validate college ID format
    if (!/^\d{13}$/.test(newUser.collegeId)) {
      toast({
        title: "Error",
        description: "College ID must be 13 digits",
        variant: "destructive",
      })
      return
    }

    // Validate mobile number
    if (!/^\d{10}$/.test(newUser.mobile)) {
      toast({
        title: "Error",
        description: "Mobile number must be 10 digits",
        variant: "destructive",
      })
      return
    }

    try {
      const users = db.get("users") || []

      // Check if user already exists
      if (users.some((u: UserData) => u.collegeId === newUser.collegeId)) {
        toast({
          title: "Error",
          description: "A user with this College ID already exists",
          variant: "destructive",
        })
        return
      }

      // Create new user
      const newUserData: Partial<UserData> = {
        id: newUser.collegeId,
        collegeId: newUser.collegeId,
        name: newUser.name,
        email: newUser.email,
        dateOfBirth: newUser.dateOfBirth,
        role: newUser.role as "student" | "teacher",
        status: "active",
        createdAt: new Date().toISOString(),
        department: newUser.department,
        semester: Number.parseInt(newUser.semester),
        section: newUser.section,
        verification: "none",
        permissions: {
          canUploadResources: true,
          canVerifyResources: newUser.role === "teacher",
          canManageUsers: false,
          canEditCollegeProfile: false,
          canCreateAnnouncements: newUser.role === "teacher",
          canManageEvents: false,
          canVerifyUsers: false,
          canAssignRoles: false,
          canManageConnections: true,
          canCreateGroups: true,
        },
      }

      // Add to users list
      db.set("users", [...users, newUserData])

      toast({
        title: "Success",
        description: "User registered successfully",
      })

      setShowRegisterDialog(false)
      setNewUser({
        collegeId: "",
        name: "",
        email: "",
        mobile: "",
        role: "student",
        department: "",
        semester: "",
        section: "",
        dateOfBirth: "",
      })

      // Update stats
      setUserStats((prev) => ({
        ...prev,
        totalUsers: prev.totalUsers + 1,
        totalStudents: newUser.role === "student" ? prev.totalStudents + 1 : prev.totalStudents,
        totalTeachers: newUser.role === "teacher" ? prev.totalTeachers + 1 : prev.totalTeachers,
        activeUsers: prev.activeUsers + 1,
        newUsersThisMonth: prev.newUsersThisMonth + 1,
      }))
    } catch (error) {
      console.error("Registration error:", error)
      toast({
        title: "Error",
        description: "Failed to register user",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
        {isSuperAdmin && (
          <Dialog open={showRegisterDialog} onOpenChange={setShowRegisterDialog}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Register New User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Register New User</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="collegeId">College ID (13 digits)</Label>
                    <Input
                      id="collegeId"
                      value={newUser.collegeId}
                      onChange={(e) => setNewUser({ ...newUser, collegeId: e.target.value })}
                      maxLength={13}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mobile">Mobile Number</Label>
                    <Input
                      id="mobile"
                      value={newUser.mobile}
                      onChange={(e) => setNewUser({ ...newUser, mobile: e.target.value })}
                      maxLength={10}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email (Optional)</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="teacher">Teacher</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Select
                      value={newUser.department}
                      onValueChange={(value) => setNewUser({ ...newUser, department: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
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
                  {newUser.role === "student" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="semester">Semester</Label>
                        <Select
                          value={newUser.semester}
                          onValueChange={(value) => setNewUser({ ...newUser, semester: value })}
                        >
                          <SelectTrigger>
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
                        <Label htmlFor="dateOfBirth">Date of Birth</Label>
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={newUser.dateOfBirth}
                          onChange={(e) => setNewUser({ ...newUser, dateOfBirth: e.target.value })}
                        />
                      </div>
                    </>
                  )}
                </div>
                <Button onClick={handleRegister}>Register User</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* User Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">{userStats.newUsersThisMonth} new this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Teachers</CardTitle>
            <School className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.totalTeachers}</div>
            <p className="text-xs text-muted-foreground">
              {((userStats.totalTeachers / userStats.totalUsers) * 100).toFixed(1)}% of total users
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              {((userStats.totalStudents / userStats.totalUsers) * 100).toFixed(1)}% of total users
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              {((userStats.activeUsers / userStats.totalUsers) * 100).toFixed(1)}% active rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Resource Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Resources</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resourceStats.totalResources}</div>
            <p className="text-xs text-muted-foreground">{resourceStats.pendingVerification} pending verification</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Resources</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resourceStats.approvedResources}</div>
            <p className="text-xs text-muted-foreground">
              {((resourceStats.approvedResources / resourceStats.totalResources) * 100).toFixed(1)}% approval rate
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User Growth</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{userStats.newUsersThisMonth}</div>
            <p className="text-xs text-muted-foreground">New users this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verification Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((userStats.verifiedUsers / userStats.totalUsers) * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">{userStats.verifiedUsers} verified users</p>
          </CardContent>
        </Card>
      </div>

      {/* Page Statistics */}
      {isSuperAdmin && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pages</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pageStats.totalPages}</div>
              <p className="text-xs text-muted-foreground">User-created pages</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Featured Pages</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pageStats.featuredPages}</div>
              <p className="text-xs text-muted-foreground">
                {((pageStats.featuredPages / pageStats.totalPages) * 100).toFixed(1)}% of total pages
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verified Pages</CardTitle>
              <FileCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pageStats.verifiedPages}</div>
              <p className="text-xs text-muted-foreground">
                {((pageStats.verifiedPages / pageStats.totalPages) * 100).toFixed(1)}% verification rate
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reported Pages</CardTitle>
              <Flag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pageStats.reportedPages}</div>
              <p className="text-xs text-muted-foreground">
                {((pageStats.reportedPages / pageStats.totalPages) * 100).toFixed(1)}% reported rate
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/admin/users">
          <Card className="hover:bg-muted/50 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Manage Users
                <ChevronRight className="h-5 w-5" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">View and manage all users, roles, and permissions</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/resources">
          <Card className="hover:bg-muted/50 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Resource Management
                <ChevronRight className="h-5 w-5" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Review and verify uploaded resources</p>
            </CardContent>
          </Card>
        </Link>
        {isSuperAdmin && (
          <Link href="/admin/sponsors">
            <Card className="hover:bg-muted/50 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Sponsor Management
                  <ChevronRight className="h-5 w-5" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Manage advertisements across all sections</p>
              </CardContent>
            </Card>
          </Link>
        )}
        {isSuperAdmin && (
          <Link href="/admin/college-profile">
            <Card className="hover:bg-muted/50 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  College Profile
                  <ChevronRight className="h-5 w-5" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Manage college information and settings</p>
              </CardContent>
            </Card>
          </Link>
        )}
        {isSuperAdmin && (
          <Link href="/admin/pages">
            <Card className="hover:bg-muted/50 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Page Management
                  <ChevronRight className="h-5 w-5" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Manage user-created pages, verify, feature, or remove them
                </p>
              </CardContent>
            </Card>
          </Link>
        )}
      </div>
    </div>
  )
}

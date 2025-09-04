"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { db, type UserData, validateCollegeId } from "@/lib/db"
import {
  Plus,
  Edit,
  Ban,
  CheckCircle,
  BadgeCheck,
  GraduationCap,
  School,
  Upload,
  FileUp,
  Trash2,
  Shield,
  Eye,
  Filter,
  Download,
  Search,
  AlertCircle,
  MoreHorizontal,
  Clock,
  Archive,
} from "lucide-react"
import { VerificationBadge } from "@/components/VerificationBadge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"

const ENABLE_BULK_REGISTRATION = false // Set to false to disable the feature

type VerificationType = "none" | "blue" | "golden"
type UserStatus = "active" | "suspended" | "pending" | "archived"
type UserPrivacySetting = "public" | "private" | "connections-only"

interface UserFilters {
  status: string[]
  role: string[]
  verification: string[]
  search: string
}

export default function UsersAdminPage() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<UserData[]>(() => db.get("users") || [])
  const [showAddUser, setShowAddUser] = useState(false)
  const [showEditUser, setShowEditUser] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showPrivacySettings, setShowPrivacySettings] = useState(false)
  const [showPermissions, setShowPermissions] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
  const [activeTab, setActiveTab] = useState<"all" | "students" | "teachers" | "pending" | "suspended">("all")
  const [showBulkUpload, setShowBulkUpload] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [previewData, setPreviewData] = useState<any[]>([])
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [selectAll, setSelectAll] = useState(false)
  const [filters, setFilters] = useState<UserFilters>({
    status: [],
    role: [],
    verification: [],
    search: "",
  })
  const [showFilters, setShowFilters] = useState(false)
  const [userNotes, setUserNotes] = useState<{ [key: string]: string }>({})
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [newUser, setNewUser] = useState<Partial<UserData & { mobile: string }>>({
    role: "student",
    status: "pending",
    permissions: {
      canUploadResources: true,
      canVerifyResources: false,
      canManageUsers: false,
      canEditCollegeProfile: false,
      canCreateAnnouncements: false,
      canManageEvents: false,
      canVerifyUsers: false,
      canAssignRoles: false,
      canManageConnections: false,
      canCreateGroups: false,
    },
    verification: "none",
    privacySettings: {
      profileVisibility: "public",
      activityVisibility: "connections-only",
      contactInfoVisibility: "private",
      allowDirectMessages: true,
      showOnlineStatus: true,
      allowTagging: true,
      allowMentions: true,
    },
  })

  useEffect(() => {
    // Load user notes from storage
    const storedNotes = db.get("userNotes") || {}
    setUserNotes(storedNotes)
  }, [])

  useEffect(() => {
    if (selectAll) {
      setSelectedUsers(filteredUsers.map((user) => user.id))
    } else if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([])
    }
  }, [selectAll])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setUploadedFile(file)
    setUploadError(null)

    if (file) {
      // In a real implementation, we would parse the Excel file here
      // For now, we'll just simulate preview data
      simulateExcelParsing(file)
    }
  }

  const simulateExcelParsing = (file: File) => {
    // This is a placeholder function that would be replaced with actual Excel parsing
    // In a real implementation, you would use a library like xlsx to parse the file
    console.log("Simulating parsing of file:", file.name)

    // Simulate preview data
    const mockData = [
      {
        collegeId: "2301661530048",
        name: "John Doe",
        mobile: "9876543210",
        role: "student",
        dateOfBirth: "2000-01-01",
      },
      {
        collegeId: "2301661530049",
        name: "Jane Smith",
        mobile: "9876543211",
        role: "teacher",
        dateOfBirth: "1985-05-15",
      },
    ]

    setPreviewData(mockData)
  }

  const handleBulkUpload = async () => {
    if (!uploadedFile) {
      setUploadError("Please select a file to upload")
      return
    }

    setIsUploading(true)

    try {
      // In a real implementation, this would send the file to the server
      // For now, we'll just simulate the upload process
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Simulate successful upload
      const newUsers = previewData.map((item) => ({
        id: item.collegeId,
        collegeId: item.collegeId,
        name: item.name,
        email: "",
        mobile: item.mobile,
        dateOfBirth: item.dateOfBirth,
        role: item.role as "student" | "teacher" | "admin" | "superadmin",
        permissions: {
          canUploadResources: true,
          canVerifyResources: false,
          canManageUsers: false,
          canEditCollegeProfile: false,
          canCreateAnnouncements: false,
          canManageEvents: false,
          canVerifyUsers: false,
          canAssignRoles: false,
          canManageConnections: false,
          canCreateGroups: false,
        },
        isVerified: false,
        createdAt: new Date().toISOString(),
        lastLogin: "",
        status: "pending",
        followers: [],
        following: [],
        connections: [],
        verification: "none",
        chats: [],
        privacySettings: {
          profileVisibility: "public",
          activityVisibility: "connections-only",
          contactInfoVisibility: "private",
          allowDirectMessages: true,
          showOnlineStatus: true,
          allowTagging: true,
          allowMentions: true,
        },
      }))

      // Add the new users to the existing users
      const updatedUsers = [...users, ...newUsers]
      db.set("users", updatedUsers)
      setUsers(updatedUsers)

      setShowBulkUpload(false)
      setUploadedFile(null)
      setPreviewData([])

      toast({
        title: "Success",
        description: `${newUsers.length} users registered successfully.`,
      })
    } catch (error) {
      console.error("Bulk upload error:", error)
      setUploadError("Failed to process the file. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  const handleAddUser = async () => {
    if (!newUser.collegeId || !newUser.name || !newUser.role) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    if (!validateCollegeId(newUser.collegeId)) {
      toast({
        title: "Error",
        description: "College ID must be 13 digits.",
        variant: "destructive",
      })
      return
    }

    // Validate mobile number format (10 digits) if provided
    if (newUser.mobile && !/^\d{10}$/.test(newUser.mobile)) {
      toast({
        title: "Error",
        description: "Mobile number must be 10 digits.",
        variant: "destructive",
      })
      return
    }

    const userExists = users.some((u) => u.collegeId === newUser.collegeId)
    if (userExists) {
      toast({
        title: "Error",
        description: "A user with this College ID already exists.",
        variant: "destructive",
      })
      return
    }

    // Create the new user without a password
    const user: UserData = {
      id: newUser.collegeId!,
      collegeId: newUser.collegeId!,
      name: newUser.name!,
      email: newUser.email || "",
      mobile: newUser.mobile || "",
      dateOfBirth: newUser.dateOfBirth || "",
      role: newUser.role as "student" | "teacher" | "admin" | "superadmin",
      permissions: newUser.permissions!,
      isVerified: false,
      department: newUser.department,
      designation: newUser.designation,
      subjects: newUser.subjects,
      semester: newUser.semester,
      section: newUser.section,
      registrationDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      lastLogin: "",
      status: "pending",
      followers: [],
      following: [],
      connections: [],
      verification: newUser.verification!,
      chats: [],
      privacySettings: newUser.privacySettings || {
        profileVisibility: "public",
        activityVisibility: "connections-only",
        contactInfoVisibility: "private",
        allowDirectMessages: true,
        showOnlineStatus: true,
        allowTagging: true,
        allowMentions: true,
      },
    }

    // Add user directly to the users array
    const updatedUsers = [...users, user]
    db.set("users", updatedUsers)
    setUsers(updatedUsers)

    setShowAddUser(false)
    setNewUser({
      role: "student",
      status: "pending",
      permissions: {
        canUploadResources: true,
        canVerifyResources: false,
        canManageUsers: false,
        canEditCollegeProfile: false,
        canCreateAnnouncements: false,
        canManageEvents: false,
        canVerifyUsers: false,
        canAssignRoles: false,
        canManageConnections: false,
        canCreateGroups: false,
      },
      verification: "none",
      privacySettings: {
        profileVisibility: "public",
        activityVisibility: "connections-only",
        contactInfoVisibility: "private",
        allowDirectMessages: true,
        showOnlineStatus: true,
        allowTagging: true,
        allowMentions: true,
      },
    })

    toast({
      title: "Success",
      description: `User ${user.name} registered successfully. They can now set up their password.`,
    })
  }

  const handleUpdateUser = () => {
    if (!selectedUser) return

    const updatedUsers = users.map((u) => (u.id === selectedUser.id ? selectedUser : u))

    db.set("users", updatedUsers)
    setUsers(updatedUsers)
    setShowEditUser(false)
    setSelectedUser(null)

    toast({
      title: "Success",
      description: "User updated successfully.",
    })
  }

  const handleVerifyUser = (userId: string) => {
    const updatedUsers = users.map((u) => (u.id === userId ? { ...u, isVerified: !u.isVerified } : u))

    db.set("users", updatedUsers)
    setUsers(updatedUsers)

    toast({
      title: "Success",
      description: `User ${updatedUsers.find((u) => u.id === userId)?.isVerified ? "verified" : "unverified"} successfully.`,
    })
  }

  const handleStatusChange = (userId: string, newStatus: UserStatus) => {
    const updatedUsers = users.map((u) => (u.id === userId ? { ...u, status: newStatus } : u))

    db.set("users", updatedUsers)
    setUsers(updatedUsers)

    toast({
      title: "Success",
      description: `User status changed to ${newStatus} successfully.`,
    })
  }

  const handleVerificationChange = (userId: string, type: VerificationType) => {
    const updatedUsers = users.map((u) => (u.id === userId ? { ...u, verification: type } : u))
    db.set("users", updatedUsers)
    setUsers(updatedUsers)

    toast({
      title: "Success",
      description: `User verification updated to ${type}`,
    })
  }

  const handleDeleteUser = () => {
    if (!selectedUser) return

    // Remove the user from the users array
    const updatedUsers = users.filter((u) => u.id !== selectedUser.id)
    db.set("users", updatedUsers)
    setUsers(updatedUsers)

    // Remove any notes for this user
    const updatedNotes = { ...userNotes }
    delete updatedNotes[selectedUser.id]
    db.set("userNotes", updatedNotes)
    setUserNotes(updatedNotes)

    setShowDeleteConfirm(false)
    setSelectedUser(null)

    toast({
      title: "Success",
      description: "User deleted successfully.",
    })
  }

  const handleBulkAction = (action: string) => {
    if (selectedUsers.length === 0) {
      toast({
        title: "No Users Selected",
        description: "Please select at least one user to perform this action.",
        variant: "destructive",
      })
      return
    }

    let updatedUsers = [...users]
    let actionDescription = ""

    switch (action) {
      case "verify":
        updatedUsers = users.map((user) => (selectedUsers.includes(user.id) ? { ...user, isVerified: true } : user))
        actionDescription = "verified"
        break
      case "unverify":
        updatedUsers = users.map((user) => (selectedUsers.includes(user.id) ? { ...user, isVerified: false } : user))
        actionDescription = "unverified"
        break
      case "activate":
        updatedUsers = users.map((user) =>
          selectedUsers.includes(user.id) ? { ...user, status: "active" as UserStatus } : user,
        )
        actionDescription = "activated"
        break
      case "suspend":
        updatedUsers = users.map((user) =>
          selectedUsers.includes(user.id) ? { ...user, status: "suspended" as UserStatus } : user,
        )
        actionDescription = "suspended"
        break
      case "delete":
        if (
          window.confirm(`Are you sure you want to delete ${selectedUsers.length} users? This action cannot be undone.`)
        ) {
          updatedUsers = users.filter((user) => !selectedUsers.includes(user.id))
          actionDescription = "deleted"
        } else {
          return
        }
        break
      default:
        return
    }

    db.set("users", updatedUsers)
    setUsers(updatedUsers)
    setSelectedUsers([])
    setSelectAll(false)

    toast({
      title: "Success",
      description: `${selectedUsers.length} users ${actionDescription} successfully.`,
    })
  }

  const handleSaveUserNote = (userId: string, note: string) => {
    const updatedNotes = { ...userNotes, [userId]: note }
    db.set("userNotes", updatedNotes)
    setUserNotes(updatedNotes)

    toast({
      title: "Success",
      description: "Admin note saved successfully.",
    })
  }

  const handleSavePrivacySettings = () => {
    if (!selectedUser) return

    const updatedUsers = users.map((u) => (u.id === selectedUser.id ? selectedUser : u))
    db.set("users", updatedUsers)
    setUsers(updatedUsers)
    setShowPrivacySettings(false)

    toast({
      title: "Success",
      description: "Privacy settings updated successfully.",
    })
  }

  const handleSavePermissions = () => {
    if (!selectedUser) return

    const updatedUsers = users.map((u) => (u.id === selectedUser.id ? selectedUser : u))
    db.set("users", updatedUsers)
    setUsers(updatedUsers)
    setShowPermissions(false)

    toast({
      title: "Success",
      description: "User permissions updated successfully.",
    })
  }

  const handleUserSelection = (userId: string) => {
    setSelectedUsers((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]))
  }

  const handleSelectAllChange = () => {
    setSelectAll(!selectAll)
  }

  const handleFilterChange = (filterType: keyof UserFilters, value: string) => {
    setFilters((prev) => {
      const currentValues = prev[filterType] as string[]

      if (filterType === "search") {
        return { ...prev, search: value }
      }

      return {
        ...prev,
        [filterType]: currentValues.includes(value)
          ? currentValues.filter((v) => v !== value)
          : [...currentValues, value],
      }
    })
  }

  const clearFilters = () => {
    setFilters({
      status: [],
      role: [],
      verification: [],
      search: "",
    })
  }

  const exportUserData = () => {
    const dataToExport = filteredUsers.map((user) => ({
      "College ID": user.collegeId,
      Name: user.name,
      Email: user.email,
      Mobile: user.mobile,
      Role: user.role,
      Status: user.status,
      Verified: user.isVerified ? "Yes" : "No",
      "Created At": new Date(user.createdAt).toLocaleDateString(),
      "Last Login": user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "Never",
    }))

    // Convert to CSV
    const headers = Object.keys(dataToExport[0]).join(",")
    const rows = dataToExport.map((obj) => Object.values(obj).join(","))
    const csv = [headers, ...rows].join("\n")

    // Create download link
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `users_export_${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Export Complete",
      description: `${dataToExport.length} user records exported to CSV.`,
    })
  }

  // Apply filters to users
  const filteredUsers = users.filter((user) => {
    // Filter by tab
    if (activeTab === "students" && user.role !== "student") return false
    if (activeTab === "teachers" && user.role !== "teacher") return false
    if (activeTab === "pending" && user.status !== "pending") return false
    if (activeTab === "suspended" && user.status !== "suspended") return false

    // Apply additional filters
    if (filters.status.length > 0 && !filters.status.includes(user.status)) return false
    if (filters.role.length > 0 && !filters.role.includes(user.role)) return false
    if (filters.verification.length > 0 && !filters.verification.includes(user.verification)) return false

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      return (
        user.name.toLowerCase().includes(searchTerm) ||
        user.collegeId.toLowerCase().includes(searchTerm) ||
        (user.email && user.email.toLowerCase().includes(searchTerm)) ||
        (user.mobile && user.mobile.toLowerCase().includes(searchTerm))
      )
    }

    return true
  })

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>User Management</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Manage users, control access, and monitor account statuses
            </p>
          </div>
          <div className="flex space-x-2">
            <Dialog open={showAddUser} onOpenChange={setShowAddUser}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Register User
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Register New User</DialogTitle>
                  <DialogDescription>
                    Register a new student or teacher. They will receive an OTP for verification.
                  </DialogDescription>
                </DialogHeader>
                <Tabs defaultValue="student" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="student">
                      <GraduationCap className="mr-2 h-4 w-4" />
                      Student
                    </TabsTrigger>
                    <TabsTrigger value="teacher">
                      <School className="mr-2 h-4 w-4" />
                      Teacher
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="student" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="studentId">College ID (13 digits)</Label>
                        <Input
                          id="studentId"
                          value={newUser.collegeId || ""}
                          onChange={(e) => setNewUser({ ...newUser, collegeId: e.target.value, role: "student" })}
                          maxLength={13}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="studentName">Name</Label>
                        <Input
                          id="studentName"
                          value={newUser.name || ""}
                          onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="mobile">Mobile Number</Label>
                        <Input
                          id="mobile"
                          type="tel"
                          value={newUser.mobile || ""}
                          onChange={(e) => setNewUser({ ...newUser, mobile: e.target.value })}
                          maxLength={10}
                          placeholder="10-digit mobile number"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email (Optional)</Label>
                        <Input
                          id="email"
                          type="email"
                          value={newUser.email || ""}
                          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="semester">Semester</Label>
                        <Select
                          value={newUser.semester?.toString()}
                          onValueChange={(value) => setNewUser({ ...newUser, semester: Number.parseInt(value) })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select semester" />
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
                        <Label htmlFor="section">Section</Label>
                        <Select
                          value={newUser.section}
                          onValueChange={(value) => setNewUser({ ...newUser, section: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select section" />
                          </SelectTrigger>
                          <SelectContent>
                            {["A", "B", "C", "D"].map((section) => (
                              <SelectItem key={section} value={section}>
                                Section {section}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="teacher" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="teacherId">College ID (13 digits)</Label>
                        <Input
                          id="teacherId"
                          value={newUser.collegeId || ""}
                          onChange={(e) => setNewUser({ ...newUser, collegeId: e.target.value, role: "teacher" })}
                          maxLength={13}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="teacherName">Name</Label>
                        <Input
                          id="teacherName"
                          value={newUser.name || ""}
                          onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="mobile">Mobile Number</Label>
                        <Input
                          id="mobile"
                          type="tel"
                          value={newUser.mobile || ""}
                          onChange={(e) => setNewUser({ ...newUser, mobile: e.target.value })}
                          maxLength={10}
                          placeholder="10-digit mobile number"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email (Optional)</Label>
                        <Input
                          id="email"
                          type="email"
                          value={newUser.email || ""}
                          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="department">Department</Label>
                        <Select
                          value={newUser.department}
                          onValueChange={(value) => setNewUser({ ...newUser, department: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cse">Computer Science</SelectItem>
                            <SelectItem value="ece">Electronics</SelectItem>
                            <SelectItem value="me">Mechanical</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="designation">Designation</Label>
                        <Select
                          value={newUser.designation}
                          onValueChange={(value) => setNewUser({ ...newUser, designation: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select designation" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="professor">Professor</SelectItem>
                            <SelectItem value="associate">Associate Professor</SelectItem>
                            <SelectItem value="assistant">Assistant Professor</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
                <div className="flex justify-end">
                  <Button onClick={handleAddUser}>Register User</Button>
                </div>
              </DialogContent>
            </Dialog>

            {ENABLE_BULK_REGISTRATION ? (
              <Dialog open={showBulkUpload} onOpenChange={setShowBulkUpload}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Upload className="mr-2 h-4 w-4" />
                    Bulk Register
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Bulk User Registration</DialogTitle>
                    <DialogDescription>
                      Upload an Excel file containing user details for bulk registration.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".xlsx,.xls"
                        className="hidden"
                      />
                      <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="mb-2">
                        <FileUp className="mr-2 h-4 w-4" />
                        Select Excel File
                      </Button>
                      <p className="text-sm text-muted-foreground">
                        {uploadedFile ? uploadedFile.name : "No file selected"}
                      </p>
                    </div>

                    {uploadError && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{uploadError}</AlertDescription>
                      </Alert>
                    )}

                    {previewData.length > 0 && (
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">Preview ({previewData.length} users)</h3>
                        <div className="max-h-60 overflow-y-auto border rounded-md">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>College ID</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Mobile</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {previewData.map((item, index) => (
                                <TableRow key={index}>
                                  <TableCell>{item.collegeId}</TableCell>
                                  <TableCell>{item.name}</TableCell>
                                  <TableCell>{item.role}</TableCell>
                                  <TableCell>{item.mobile}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowBulkUpload(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleBulkUpload} disabled={!uploadedFile || isUploading}>
                      {isUploading ? "Uploading..." : "Upload and Register"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            ) : (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" disabled>
                      <Upload className="mr-2 h-4 w-4" />
                      Bulk Register
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>This feature is coming soon</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="mr-2 h-4 w-4" />
              Filters
              {Object.values(filters).flat().filter(Boolean).length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {Object.values(filters).flat().filter(Boolean).length}
                </Badge>
              )}
            </Button>

            <Button variant="outline" onClick={exportUserData}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </CardHeader>

        {showFilters && (
          <div className="px-6 py-3 border-b">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-[240px]">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, ID, email..."
                    className="pl-8"
                    value={filters.search}
                    onChange={(e) => handleFilterChange("search", e.target.value)}
                  />
                </div>
              </div>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    Status
                    {filters.status.length > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {filters.status.length}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-3">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="status-active"
                        checked={filters.status.includes("active")}
                        onCheckedChange={() => handleFilterChange("status", "active")}
                      />
                      <Label htmlFor="status-active">Active</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="status-pending"
                        checked={filters.status.includes("pending")}
                        onCheckedChange={() => handleFilterChange("status", "pending")}
                      />
                      <Label htmlFor="status-pending">Pending</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="status-suspended"
                        checked={filters.status.includes("suspended")}
                        onCheckedChange={() => handleFilterChange("status", "suspended")}
                      />
                      <Label htmlFor="status-suspended">Suspended</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="status-archived"
                        checked={filters.status.includes("archived")}
                        onCheckedChange={() => handleFilterChange("status", "archived")}
                      />
                      <Label htmlFor="status-archived">Archived</Label>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    Role
                    {filters.role.length > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {filters.role.length}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-3">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="role-student"
                        checked={filters.role.includes("student")}
                        onCheckedChange={() => handleFilterChange("role", "student")}
                      />
                      <Label htmlFor="role-student">Student</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="role-teacher"
                        checked={filters.role.includes("teacher")}
                        onCheckedChange={() => handleFilterChange("role", "teacher")}
                      />
                      <Label htmlFor="role-teacher">Teacher</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="role-admin"
                        checked={filters.role.includes("admin")}
                        onCheckedChange={() => handleFilterChange("role", "admin")}
                      />
                      <Label htmlFor="role-admin">Admin</Label>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    Verification
                    {filters.verification.length > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {filters.verification.length}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-3">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="verification-none"
                        checked={filters.verification.includes("none")}
                        onCheckedChange={() => handleFilterChange("verification", "none")}
                      />
                      <Label htmlFor="verification-none">None</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="verification-blue"
                        checked={filters.verification.includes("blue")}
                        onCheckedChange={() => handleFilterChange("verification", "blue")}
                      />
                      <Label htmlFor="verification-blue">Blue</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="verification-golden"
                        checked={filters.verification.includes("golden")}
                        onCheckedChange={() => handleFilterChange("verification", "golden")}
                      />
                      <Label htmlFor="verification-golden">Golden</Label>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              {Object.values(filters).flat().filter(Boolean).length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        )}

        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
            <div className="px-6 pt-6">
              <TabsList className="mb-4">
                <TabsTrigger value="all">All Users</TabsTrigger>
                <TabsTrigger value="students">Students</TabsTrigger>
                <TabsTrigger value="teachers">Teachers</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="suspended">Suspended</TabsTrigger>
              </TabsList>
            </div>

            {selectedUsers.length > 0 && (
              <div className="px-6 py-2 bg-muted/50 border-y flex items-center justify-between">
                <div className="text-sm">
                  {selectedUsers.length} user{selectedUsers.length !== 1 ? "s" : ""} selected
                </div>
                <div className="flex space-x-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        Bulk Actions
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleBulkAction("verify")}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Verify
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBulkAction("unverify")}>
                        <Ban className="mr-2 h-4 w-4" />
                        Unverify
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBulkAction("activate")}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Activate
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBulkAction("suspend")}>
                        <Ban className="mr-2 h-4 w-4" />
                        Suspend
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleBulkAction("delete")} className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedUsers([])}>
                    Clear Selection
                  </Button>
                </div>
              </div>
            )}

            <TabsContent value={activeTab} className="m-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]">
                      <Checkbox
                        checked={selectAll}
                        onCheckedChange={handleSelectAllChange}
                        aria-label="Select all users"
                      />
                    </TableHead>
                    <TableHead>College ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Verification</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No users found. Try adjusting your filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedUsers.includes(user.id)}
                            onCheckedChange={() => handleUserSelection(user.id)}
                            aria-label={`Select ${user.name}`}
                          />
                        </TableCell>
                        <TableCell>{user.collegeId}</TableCell>
                        <TableCell className="flex items-center gap-2">
                          {user.name}
                          {user.isVerified && <BadgeCheck className="h-4 w-4 text-blue-500" />}
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.role === "teacher" ? "default" : "secondary"}>
                            {user.role === "teacher" ? "Teacher" : user.role === "admin" ? "Admin" : "Student"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              user.status === "active"
                                ? "success"
                                : user.status === "pending"
                                  ? "warning"
                                  : user.status === "archived"
                                    ? "outline"
                                    : "destructive"
                            }
                            className={user.status === "active" ? "bg-green-100 text-green-800" : ""}
                          >
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <VerificationBadge type={user.verification} />
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedUser(user)
                                  setShowEditUser(true)
                                }}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedUser(user)
                                  setShowPrivacySettings(true)
                                }}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                Privacy Settings
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedUser(user)
                                  setShowPermissions(true)
                                }}
                              >
                                <Shield className="mr-2 h-4 w-4" />
                                Permissions
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleVerifyUser(user.id)}>
                                {user.isVerified ? (
                                  <>
                                    <Ban className="mr-2 h-4 w-4" />
                                    Unverify
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Verify
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuLabel>Status</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(user.id, "active")}
                                disabled={user.status === "active"}
                              >
                                <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                Set Active
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(user.id, "pending")}
                                disabled={user.status === "pending"}
                              >
                                <Clock className="mr-2 h-4 w-4 text-yellow-600" />
                                Set Pending
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(user.id, "suspended")}
                                disabled={user.status === "suspended"}
                              >
                                <Ban className="mr-2 h-4 w-4 text-red-600" />
                                Suspend
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(user.id, "archived")}
                                disabled={user.status === "archived"}
                              >
                                <Archive className="mr-2 h-4 w-4" />
                                Archive
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedUser(user)
                                  setShowDeleteConfirm(true)
                                }}
                                className="text-red-600"
                                disabled={user.id === currentUser?.id}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between py-4">
          <div className="text-sm text-muted-foreground">
            Showing {filteredUsers.length} of {users.length} users
          </div>
        </CardFooter>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={showEditUser} onOpenChange={setShowEditUser}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Modify user details and information.</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="grid gap-4 py-4">
              <Tabs defaultValue="details">
                <TabsList className="grid grid-cols-3 mb-4">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="academic">Academic Info</TabsTrigger>
                  <TabsTrigger value="notes">Admin Notes</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-name">Name</Label>
                      <Input
                        id="edit-name"
                        value={selectedUser.name}
                        onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-email">Email</Label>
                      <Input
                        id="edit-email"
                        type="email"
                        value={selectedUser.email}
                        onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-mobile">Mobile Number</Label>
                      <Input
                        id="edit-mobile"
                        type="tel"
                        value={selectedUser.mobile || ""}
                        onChange={(e) => setSelectedUser({ ...selectedUser, mobile: e.target.value })}
                        maxLength={10}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-dob">Date of Birth</Label>
                      <Input
                        id="edit-dob"
                        type="date"
                        value={selectedUser.dateOfBirth || ""}
                        onChange={(e) => setSelectedUser({ ...selectedUser, dateOfBirth: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-role">Role</Label>
                      <Select
                        value={selectedUser.role}
                        onValueChange={(value: "student" | "teacher" | "admin" | "superadmin") =>
                          setSelectedUser({ ...selectedUser, role: value })
                        }
                      >
                        <SelectTrigger id="edit-role">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="student">Student</SelectItem>
                          <SelectItem value="teacher">Teacher</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          {currentUser?.role === "superadmin" && (
                            <SelectItem value="superadmin">Super Admin</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-verification">Verification Badge</Label>
                      <Select
                        value={selectedUser.verification}
                        onValueChange={(value: VerificationType) =>
                          setSelectedUser({ ...selectedUser, verification: value })
                        }
                      >
                        <SelectTrigger id="edit-verification">
                          <SelectValue placeholder="Select verification" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="blue">Blue</SelectItem>
                          <SelectItem value="golden">Golden</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="academic" className="space-y-4">
                  {selectedUser.role === "student" ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="edit-semester">Semester</Label>
                        <Select
                          value={selectedUser.semester?.toString()}
                          onValueChange={(value) =>
                            setSelectedUser({
                              ...selectedUser,
                              semester: Number.parseInt(value),
                            })
                          }
                        >
                          <SelectTrigger id="edit-semester">
                            <SelectValue placeholder="Select semester" />
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
                      <div className="grid gap-2">
                        <Label htmlFor="edit-section">Section</Label>
                        <Select
                          value={selectedUser.section}
                          onValueChange={(value) => setSelectedUser({ ...selectedUser, section: value })}
                        >
                          <SelectTrigger id="edit-section">
                            <SelectValue placeholder="Select section" />
                          </SelectTrigger>
                          <SelectContent>
                            {["A", "B", "C", "D"].map((section) => (
                              <SelectItem key={section} value={section}>
                                Section {section}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="edit-branch">Branch</Label>
                        <Input
                          id="edit-branch"
                          value={selectedUser.branch || ""}
                          onChange={(e) => setSelectedUser({ ...selectedUser, branch: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="edit-year">Year</Label>
                        <Select
                          value={selectedUser.year}
                          onValueChange={(value) => setSelectedUser({ ...selectedUser, year: value })}
                        >
                          <SelectTrigger id="edit-year">
                            <SelectValue placeholder="Select year" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1st Year">1st Year</SelectItem>
                            <SelectItem value="2nd Year">2nd Year</SelectItem>
                            <SelectItem value="3rd Year">3rd Year</SelectItem>
                            <SelectItem value="4th Year">4th Year</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ) : selectedUser.role === "teacher" ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="edit-department">Department</Label>
                        <Select
                          value={selectedUser.department}
                          onValueChange={(value) => setSelectedUser({ ...selectedUser, department: value })}
                        >
                          <SelectTrigger id="edit-department">
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cse">Computer Science</SelectItem>
                            <SelectItem value="ece">Electronics</SelectItem>
                            <SelectItem value="me">Mechanical</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="edit-designation">Designation</Label>
                        <Select
                          value={selectedUser.designation}
                          onValueChange={(value) => setSelectedUser({ ...selectedUser, designation: value })}
                        >
                          <SelectTrigger id="edit-designation">
                            <SelectValue placeholder="Select designation" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="professor">Professor</SelectItem>
                            <SelectItem value="associate">Associate Professor</SelectItem>
                            <SelectItem value="assistant">Assistant Professor</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2 col-span-2">
                        <Label htmlFor="edit-subjects">Subjects (comma separated)</Label>
                        <Input
                          id="edit-subjects"
                          value={selectedUser.subjects?.join(", ") || ""}
                          onChange={(e) =>
                            setSelectedUser({
                              ...selectedUser,
                              subjects: e.target.value
                                .split(",")
                                .map((s) => s.trim())
                                .filter(Boolean),
                            })
                          }
                          placeholder="e.g. Data Structures, Algorithms, Database Management"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 text-center text-muted-foreground">
                      No academic information required for this role.
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="notes" className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="admin-notes">Admin Notes</Label>
                    <Textarea
                      id="admin-notes"
                      value={userNotes[selectedUser.id] || ""}
                      onChange={(e) => setUserNotes({ ...userNotes, [selectedUser.id]: e.target.value })}
                      placeholder="Add private notes about this user (only visible to admins)"
                      className="min-h-[150px]"
                    />
                    <p className="text-xs text-muted-foreground">
                      These notes are only visible to administrators and are not shared with the user.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSaveUserNote(selectedUser.id, userNotes[selectedUser.id] || "")}
                    className="w-full"
                  >
                    Save Notes
                  </Button>
                </TabsContent>
              </Tabs>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditUser(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateUser}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="py-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>
                  Deleting user "{selectedUser.name}" will permanently remove all their data, including posts, comments,
                  and resources.
                </AlertDescription>
              </Alert>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Privacy Settings Dialog */}
      <Dialog open={showPrivacySettings} onOpenChange={setShowPrivacySettings}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Privacy Settings</DialogTitle>
            <DialogDescription>Manage privacy settings for this user.</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="py-4 space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="profile-visibility">Profile Visibility</Label>
                    <p className="text-sm text-muted-foreground">Who can see this user's profile</p>
                  </div>
                  <Select
                    value={selectedUser.privacySettings?.profileVisibility || "public"}
                    onValueChange={(value: UserPrivacySetting) =>
                      setSelectedUser({
                        ...selectedUser,
                        privacySettings: {
                          ...(selectedUser.privacySettings || {}),
                          profileVisibility: value,
                        },
                      })
                    }
                  >
                    <SelectTrigger id="profile-visibility" className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="connections-only">Connections Only</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="activity-visibility">Activity Visibility</Label>
                    <p className="text-sm text-muted-foreground">Who can see this user's activity</p>
                  </div>
                  <Select
                    value={selectedUser.privacySettings?.activityVisibility || "connections-only"}
                    onValueChange={(value: UserPrivacySetting) =>
                      setSelectedUser({
                        ...selectedUser,
                        privacySettings: {
                          ...(selectedUser.privacySettings || {}),
                          activityVisibility: value,
                        },
                      })
                    }
                  >
                    <SelectTrigger id="activity-visibility" className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="connections-only">Connections Only</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="contact-visibility">Contact Info Visibility</Label>
                    <p className="text-sm text-muted-foreground">Who can see this user's contact information</p>
                  </div>
                  <Select
                    value={selectedUser.privacySettings?.contactInfoVisibility || "private"}
                    onValueChange={(value: UserPrivacySetting) =>
                      setSelectedUser({
                        ...selectedUser,
                        privacySettings: {
                          ...(selectedUser.privacySettings || {}),
                          contactInfoVisibility: value,
                        },
                      })
                    }
                  >
                    <SelectTrigger id="contact-visibility" className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="connections-only">Connections Only</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="allow-messages">Allow Direct Messages</Label>
                      <p className="text-sm text-muted-foreground">Allow others to send direct messages</p>
                    </div>
                    <Switch
                      id="allow-messages"
                      checked={selectedUser.privacySettings?.allowDirectMessages !== false}
                      onCheckedChange={(checked) =>
                        setSelectedUser({
                          ...selectedUser,
                          privacySettings: {
                            ...(selectedUser.privacySettings || {}),
                            allowDirectMessages: checked,
                          },
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="show-online">Show Online Status</Label>
                      <p className="text-sm text-muted-foreground">Show when user is online</p>
                    </div>
                    <Switch
                      id="show-online"
                      checked={selectedUser.privacySettings?.showOnlineStatus !== false}
                      onCheckedChange={(checked) =>
                        setSelectedUser({
                          ...selectedUser,
                          privacySettings: {
                            ...(selectedUser.privacySettings || {}),
                            showOnlineStatus: checked,
                          },
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="allow-tagging">Allow Tagging</Label>
                      <p className="text-sm text-muted-foreground">Allow others to tag this user</p>
                    </div>
                    <Switch
                      id="allow-tagging"
                      checked={selectedUser.privacySettings?.allowTagging !== false}
                      onCheckedChange={(checked) =>
                        setSelectedUser({
                          ...selectedUser,
                          privacySettings: {
                            ...(selectedUser.privacySettings || {}),
                            allowTagging: checked,
                          },
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPrivacySettings(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePrivacySettings}>Save Settings</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Permissions Dialog */}
      <Dialog open={showPermissions} onOpenChange={setShowPermissions}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>User Permissions</DialogTitle>
            <DialogDescription>Manage what this user can do in the system.</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="py-4 space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="perm-upload">Upload Resources</Label>
                    <p className="text-sm text-muted-foreground">Can upload study materials and resources</p>
                  </div>
                  <Switch
                    id="perm-upload"
                    checked={selectedUser.permissions?.canUploadResources !== false}
                    onCheckedChange={(checked) =>
                      setSelectedUser({
                        ...selectedUser,
                        permissions: {
                          ...selectedUser.permissions,
                          canUploadResources: checked,
                        },
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="perm-verify-resources">Verify Resources</Label>
                    <p className="text-sm text-muted-foreground">Can verify and approve resources</p>
                  </div>
                  <Switch
                    id="perm-verify-resources"
                    checked={selectedUser.permissions?.canVerifyResources === true}
                    onCheckedChange={(checked) =>
                      setSelectedUser({
                        ...selectedUser,
                        permissions: {
                          ...selectedUser.permissions,
                          canVerifyResources: checked,
                        },
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="perm-manage-users">Manage Users</Label>
                    <p className="text-sm text-muted-foreground">Can manage other users</p>
                  </div>
                  <Switch
                    id="perm-manage-users"
                    checked={selectedUser.permissions?.canManageUsers === true}
                    onCheckedChange={(checked) =>
                      setSelectedUser({
                        ...selectedUser,
                        permissions: {
                          ...selectedUser.permissions,
                          canManageUsers: checked,
                        },
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="perm-edit-profile">Edit College Profile</Label>
                    <p className="text-sm text-muted-foreground">Can edit college profile information</p>
                  </div>
                  <Switch
                    id="perm-edit-profile"
                    checked={selectedUser.permissions?.canEditCollegeProfile === true}
                    onCheckedChange={(checked) =>
                      setSelectedUser({
                        ...selectedUser,
                        permissions: {
                          ...selectedUser.permissions,
                          canEditCollegeProfile: checked,
                        },
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="perm-announcements">Create Announcements</Label>
                    <p className="text-sm text-muted-foreground">Can create and publish announcements</p>
                  </div>
                  <Switch
                    id="perm-announcements"
                    checked={selectedUser.permissions?.canCreateAnnouncements === true}
                    onCheckedChange={(checked) =>
                      setSelectedUser({
                        ...selectedUser,
                        permissions: {
                          ...selectedUser.permissions,
                          canCreateAnnouncements: checked,
                        },
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="perm-events">Manage Events</Label>
                    <p className="text-sm text-muted-foreground">Can create and manage events</p>
                  </div>
                  <Switch
                    id="perm-events"
                    checked={selectedUser.permissions?.canManageEvents === true}
                    onCheckedChange={(checked) =>
                      setSelectedUser({
                        ...selectedUser,
                        permissions: {
                          ...selectedUser.permissions,
                          canManageEvents: checked,
                        },
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="perm-verify-users">Verify Users</Label>
                    <p className="text-sm text-muted-foreground">Can verify other users</p>
                  </div>
                  <Switch
                    id="perm-verify-users"
                    checked={selectedUser.permissions?.canVerifyUsers === true}
                    onCheckedChange={(checked) =>
                      setSelectedUser({
                        ...selectedUser,
                        permissions: {
                          ...selectedUser.permissions,
                          canVerifyUsers: checked,
                        },
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="perm-assign-roles">Assign Roles</Label>
                    <p className="text-sm text-muted-foreground">Can assign roles to other users</p>
                  </div>
                  <Switch
                    id="perm-assign-roles"
                    checked={selectedUser.permissions?.canAssignRoles === true}
                    onCheckedChange={(checked) =>
                      setSelectedUser({
                        ...selectedUser,
                        permissions: {
                          ...selectedUser.permissions,
                          canAssignRoles: checked,
                        },
                      })
                    }
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPermissions(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePermissions}>Save Permissions</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

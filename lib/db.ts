// Simple client-side database simulation
class ClientDB {
  update(arg0: string, arg1: (users: UserData[]) => UserData[]) {
    throw new Error("Method not implemented.")
  }
  get(key: string): any {
    try {
      const value = localStorage.getItem(key)
      return value ? JSON.parse(value) : null
    } catch (error) {
      console.error("Error getting data from localStorage:", error)
      return null
    }
  }

  set(key: string, value: any): void {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error("Error setting data in localStorage:", error)
    }
  }

  remove(key: string): void {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error("Error removing data from localStorage:", error)
    }
  }
}

// Create a singleton instance
export const db =
  typeof window !== "undefined"
    ? new ClientDB()
    : {
        get: () => null,
        set: () => {},
        remove: () => {},
      }

// Data structure types
export type UserPermissions = {
  canCreatePages: UserData | null
  canUploadResources: boolean
  canVerifyResources: boolean
  canManageUsers: boolean
  canEditCollegeProfile: boolean
  canCreateAnnouncements: boolean
  canManageEvents: boolean
  canVerifyUsers: boolean
  canAssignRoles: boolean
  canManageConnections: boolean
  canCreateGroups: boolean
}

export type UserRole = "student" | "teacher" | "admin" | "superadmin"

// User privacy settings type
export type UserPrivacySettings = {
  profileVisibility: "public" | "private" | "connections-only"
  activityVisibility: "public" | "private" | "connections-only"
  contactInfoVisibility: "public" | "private" | "connections-only"
  allowDirectMessages: boolean
  showOnlineStatus: boolean
  allowTagging: boolean
  allowMentions: boolean
}

// Update the UserData type to include privacySettings
export type UserData = {
  totalLikes: number
  id: string
  collegeId: string
  name: string
  email: string
  role: UserRole
  permissions: UserPermissions
  branch?: string
  year?: string
  bio?: string
  avatar?: string
  createdAt: string
  lastLogin: string
  status: "active" | "suspended" | "pending" | "archived"
  isVerified?: boolean
  followers?: string[]
  following?: string[]
  connections?: string[]
  teacherId?: string // For teachers only
  department?: string // For teachers only
  designation?: string // For teachers only
  subjects?: string[] // For teachers only
  studentId?: string // For students only
  semester?: number // For students only
  section?: string // For students only
  registrationDate?: string
  password?: string
  verification?: string
  chats?: string[]
  mobile?: string
  dateOfBirth?: string
  privacySettings?: UserPrivacySettings
}

export type UserSettings = {
  notifications: {
    email: boolean
    push: boolean
    resourceUpdates: boolean
    mentorshipRequests: boolean
  }
  privacy: {
    showProfile: boolean
    showActivity: boolean
    allowMessages: boolean
  }
  theme: "light" | "dark" | "system"
}

// Default super admin data
export const DEFAULT_ADMIN: UserData = {
  id: "2301661530047",
  collegeId: "2301661530047",
  name: "Priyanshu Kumar",
  email: "priyanshu@aitd.edu.in",
  role: "superadmin",
  password: "Jwala@#4432", // In real app, this would be hashed
  permissions: {
    canUploadResources: true,
    canVerifyResources: true,
    canManageUsers: true,
    canEditCollegeProfile: true,
    canCreateAnnouncements: true,
    canManageEvents: true,
    canVerifyUsers: true,
    canAssignRoles: true,
    canManageConnections: true,
    canCreateGroups: true,
    canCreatePages: null
  },
  bio: "Super Admin - College Profile Manager",
  branch: "Computer Science",
  year: "2nd Year",
  createdAt: new Date().toISOString(),
  lastLogin: new Date().toISOString(),
  status: "active",
  followers: [],
  following: [],
  connections: [],
  verification: "golden",
  chats: [],
  totalLikes: 0
}

// Initialize storage with default data
export const initializeStorage = () => {
  const users = db.get("users")
  if (!users) {
    db.set("users", [DEFAULT_ADMIN])
  }
}

// Initialize settings if not exists
export const initializeUserSettings = (userId: string) => {
  const settings = db.get(`settings_${userId}`)
  if (!settings) {
    const defaultSettings: UserSettings = {
      notifications: {
        email: true,
        push: true,
        resourceUpdates: true,
        mentorshipRequests: true,
      },
      privacy: {
        showProfile: true,
        showActivity: true,
        allowMessages: true,
      },
      theme: "system",
    }
    db.set(`settings_${userId}`, defaultSettings)
    return defaultSettings
  }
  return settings
}

// Add validation function
export const validateCollegeId = (collegeId: string): boolean => {
  // College ID must be 13 digits
  return /^\d{13}$/.test(collegeId)
}

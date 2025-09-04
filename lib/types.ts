// User types
export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: "student" | "teacher" | "admin" | "superadmin"
  verification: "none" | "blue" | "golden"
  createdAt: string
  lastActive?: string
  bio?: string
  branch?: string
  semester?: number
  college?: string
  interests?: string[]
  skills?: string[]
  social?: {
    twitter?: string
    linkedin?: string
    github?: string
    website?: string
  }
  settings?: UserSettings
}

export interface UserSettings {
  theme: "light" | "dark" | "system"
  notifications: boolean
  emailNotifications: boolean
  privacy: {
    profileVisibility: "public" | "private" | "connections"
    activityVisibility: "public" | "private" | "connections"
  }
}

export type NotificationType =
  | "follow"
  | "mention"
  | "announcement"
  | "welcome"
  | "profile_update"
  | "admin_message"
  | "verification"
  | "like"
  | "share"
  | "page"
  | "event"
  | "marketplace"
  | "badge" // Added badge notification type

export type NotificationPriority = "high" | "medium" | "low"

// Notification types
export interface Notification {
  link: any
  timestamp: string | number | Date
  id: string
  userId: string
  type: "message" | "mention" | "follow" | "like" | "comment" | "resource" | "system"
  title: string
  message: string
  read: boolean
  createdAt: string
  actionUrl?: string
  sender?: {
    id: string
    name: string
    avatar?: string
  }
  priority?: NotificationPriority // Added priority field
  scheduledFor?: string // Added for scheduled notifications
  targetGroup?: string // Added for targeting specific groups
  deliveryStatus?: "pending" | "delivered" | "failed" // Added for tracking delivery
  badgeId?: string // Added for badge notifications
  pageId?: string // Added for page notifications
}

export type VerificationType = "none" | "blue" | "golden"

// Chat types
export interface ChatMessage {
  timestamp: string | number | Date
  type: string
  fileUrl: string
  parentId: ChatMessage & { replies?: ChatMessage[] }
  id: string
  senderId: string
  receiverId?: string
  groupId?: string
  content: string
  attachments?: Attachment[]
  createdAt: string
  readBy: string[]
}

export interface Attachment {
  id: string
  type: "image" | "document" | "audio" | "video"
  url: string
  name: string
  size: number
  mimeType: string
}

export interface ChatGroup {
  id: string
  name: string
  avatar?: string
  members: string[]
  createdBy: string
  createdAt: string
  lastMessage?: ChatMessage
}

export type ChatMessageOld = {
  id: string
  senderId: string
  content: string
  timestamp: string
  type: "text" | "image" | "file"
  fileUrl?: string
}

export type Chat = {
  id: string
  type: "direct" | "group"
  participants: string[]
  messages: ChatMessageOld[]
  lastMessage?: ChatMessageOld
  groupName?: string
  groupAvatar?: string
  createdAt: string
  updatedAt: string
}

export type UserRole = "student" | "teacher" | "admin" | "superadmin"

export interface UserPermissions {
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
  canCreatePages: boolean
  canManageBadges?: boolean // Added permission for badge management
}

// New badge types
export type BadgeCategory = "Engagement" | "Academic" | "Contribution" | "Achievement" | "Special"

export type BadgeLevel = "Bronze" | "Silver" | "Gold" | "Platinum"

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  category: BadgeCategory
  level: BadgeLevel
  criteria?: string
  pointsRequired?: number
  createdBy: string
  createdAt: string
  isAutomatic: boolean
}

export interface UserBadge {
  badgeId: string
  earnedAt: string
  awardedBy?: string
}

export interface UserStreak {
  currentStreak: number
  longestStreak: number
  lastActive: string
  photoUploads: number
  resourceContributions: number
  activeTimeMinutes: number
  totalBadges: number
}

export type Skill = {
  id: string
  name: string
  level: "Beginner" | "Intermediate" | "Advanced" | "Expert"
  endorsements: number
}

export type Education = {
  id: string
  institution: string
  degree: string
  field: string
  startYear: string
  endYear: string
  current: boolean
}

export type Experience = {
  id: string
  company: string
  position: string
  location: string
  startDate: string
  endDate: string
  current: boolean
  description: string
}

export type Project = {
  id: string
  title: string
  description: string
  url: string
  startDate: string
  endDate: string
  current: boolean
}

export type Interest = {
  id: string
  name: string
  category: "Professional" | "Academic" | "Hobby" | "Sport"
}

export interface UserData {
  id: string
  collegeId: string
  name: string
  email: string
  mobile?: string
  dateOfBirth?: string
  role: UserRole
  permissions: UserPermissions
  password?: string
  branch?: string
  year?: string
  bio?: string
  avatar?: string
  location?: string
  websiteUrl?: string
  socialLinks?: { platform: string; url: string }[]
  skills?: Skill[]
  education?: Education[]
  experience?: Experience[]
  projects?: Project[]
  interests?: Interest[]
  privacy?: {
    showEmail: boolean
    showLocation: boolean
    showEducation: boolean
    showExperience: boolean
    allowMessages: boolean
  }
  createdAt: string
  lastLogin: string
  status: "active" | "suspended" | "pending"
  isVerified?: boolean
  followers?: string[]
  following?: string[]
  connections?: string[]
  teacherId?: string
  department?: string
  designation?: string
  subjects?: string[]
  studentId?: string
  semester?: number
  section?: string
  registrationDate?: string
  verification: VerificationType
  chats: string[]
  purchases?: string[]
  pages?: string[]
  totalLikes?: number
  totalFollowers?: number
  badges?: UserBadge[] // Added user badges
  streak?: UserStreak // Added user streak information
}

export type Product = {
  id: string
  title: string
  description: string
  price: number
  category: string
  condition: "new" | "like-new" | "good" | "fair"
  images: string[]
  seller: {
    id: string
    name: string
    verification: "none" | "blue" | "golden"
  }
  createdAt: string
  status: "available" | "sold" | "reserved"
  tags: string[]
  location: string
  negotiable: boolean
  views: number
  likes: number
}

// Resource types
export interface Resource {
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
    avatar?: string
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
}

export type ResourceOld = {
  id: string
  title: string
  description: string
  type: "notes" | "book" | "paper" | "assignment" | "project"
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
  tags: string[]
  isPremium: boolean
  price: number
  highlights?: string[]
}

export type Purchase = {
  id: string
  userId: string
  resourceId: string
  date: string
  amount: number
  status: "completed" | "pending" | "refunded"
  paymentMethod: "card" | "upi" | "other"
}

export type PaymentSettings = {
  currency: string
  minPrice: number
  maxPrice: number
  commissionRate: number
  allowInstallments: boolean
  allowRefunds: boolean
  refundPeriodDays: number
}

export type BankDetails = {
  accountName: string
  accountNumber: string
  ifscCode: string
  bankName: string
  branch: string
}

export type UpiDetails = {
  upiId: string
  displayName: string
  isEnabled: boolean
}

// New types for user-created pages
export type PageCategory =
  | "Education"
  | "Technology"
  | "Arts"
  | "Science"
  | "Sports"
  | "Entertainment"
  | "Business"
  | "Health"
  | "Community"
  | "Other"

export type PageMedia = {
  id: string
  type: "image" | "video"
  url: string
  caption?: string
  uploadDate: string
  likes: number
  comments: PageComment[]
}

export type PageComment = {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  content: string
  timestamp: string
  likes: number
}

export type Page = {
  id: string
  name: string
  handle: string
  description: string
  category: PageCategory
  coverPhoto?: string
  profilePhoto?: string
  createdBy: string
  createdAt: string
  updatedAt: string
  followers: string[]
  likes: string[]
  media: PageMedia[]
  featured: boolean
  verified: boolean
  contactEmail?: string
  contactPhone?: string
  location?: string
  websiteUrl?: string
  socialLinks?: { platform: string; url: string }[]
  tags: string[]
  totalViews: number
}

// Connection types for filtering
export type ConnectionType = "all" | "students" | "teachers" | "pages"

// Update the CollegeProfile type to support multiple cover images

export interface Achievement {
  id: string
  title: string
  description: string
  date: string
  images: string[]
}

export interface Course {
  id: string
  name: string
  description: string
  duration: string
  fees: number
}

export interface Faculty {
  id: string
  name: string
  designation: string
  department: string
  avatar?: string
  email: string
  phone: string
}

export interface CollegeProfile {
  id: string
  name: string
  logo?: string
  coverImages: {
    id: string
    url: string
    caption?: string
    order: number
  }[]
  description: string
  established: string
  location: {
    address: string
    city: string
    state: string
    country: string
    pincode: string
  }
  contact: {
    email: string
    phone: string
    website: string
  }
  stats: {
    students: number
    faculty: number
    courses: number
    alumni: number
    placement: string
  }
  rankings: {
    nirf?: number
    naac?: string
    other?: string[]
  }
  achievements: Achievement[]
  topPerformers: {
    students: {
      id: string
      name: string
      course: string
      achievement: string
      avatar?: string
    }[]
  }
  courses: Course[]
  upcomingEvents: Event[]
  faculty: Faculty[]
  isVerified: boolean
  lastUpdated?: string
}

// Social types
export interface Post {
  id: string
  userId: string
  content: string
  attachments?: Attachment[]
  likes: string[]
  comments: Comment[]
  createdAt: string
  updatedAt?: string
  tags?: string[]
  visibility: "public" | "connections" | "private"
}

export interface Comment {
  id: string
  userId: string
  content: string
  createdAt: string
  likes: string[]
}

export interface Event {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  location?: string
  organizer: string
  attendees: string[]
  interested: string[]
  image?: string
  tags?: string[]
  visibility: "public" | "connections" | "private"
}

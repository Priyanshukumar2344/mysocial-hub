export type SponsorType = "image" | "video" | "link" | "poster"

export type SponsorSection = "home" | "marketplace" | "library" | "social"

export type SponsorStatus = "active" | "inactive" | "scheduled" | "expired"

export interface Sponsor {
  id: string
  title: string
  description?: string
  type: SponsorType
  section: SponsorSection
  status: SponsorStatus

  // Content based on type
  imageUrl?: string
  videoUrl?: string
  linkUrl?: string
  linkText?: string

  // Scheduling
  startDate?: string
  endDate?: string

  // Display settings
  priority: number // Higher number = higher priority
  clickCount: number
  impressions: number

  // Metadata
  createdAt: string
  updatedAt: string
  createdBy: string
}

export interface SponsorDisplaySettings {
  maxSponsorsPerSection: {
    home: number
    marketplace: number
    library: number
    social: number
  }
  autoRotate: boolean
  rotationInterval: number // in seconds
}

// Default sponsor display settings
export const defaultSponsorSettings: SponsorDisplaySettings = {
  maxSponsorsPerSection: {
    home: 2,
    marketplace: 3,
    library: 2,
    social: 2,
  },
  autoRotate: true,
  rotationInterval: 30,
}

// Utility functions
export const getSponsorsBySection = (sponsors: Sponsor[], section: SponsorSection): Sponsor[] => {
  const now = new Date()

  return sponsors
    .filter((sponsor) => {
      // Filter by section
      if (sponsor.section !== section) return false

      // Filter by status
      if (sponsor.status === "inactive") return false

      // Check scheduling
      if (sponsor.startDate && new Date(sponsor.startDate) > now) return false
      if (sponsor.endDate && new Date(sponsor.endDate) < now) return false

      return true
    })
    .sort((a, b) => b.priority - a.priority) // Sort by priority (highest first)
}

export const incrementSponsorClicks = (sponsorId: string) => {
  // This would typically update the database
  // For now, we'll handle it in the component
}

export const incrementSponsorImpressions = (sponsorId: string) => {
  // This would typically update the database
  // For now, we'll handle it in the component
}

// Sample sponsor data for development
export const sampleSponsors: Sponsor[] = [
  {
    id: "1",
    title: "Campus Bookstore Sale",
    description: "Get 20% off on all textbooks this month!",
    type: "image",
    section: "home",
    status: "active",
    imageUrl: "/placeholder.svg?height=200&width=400&text=Campus+Bookstore+Sale",
    linkUrl: "https://campusbookstore.com/sale",
    linkText: "Shop Now",
    priority: 10,
    clickCount: 45,
    impressions: 1250,
    createdAt: "2024-02-01T10:00:00Z",
    updatedAt: "2024-02-01T10:00:00Z",
    createdBy: "admin",
  },
  {
    id: "2",
    title: "Student Laptop Deals",
    description: "Special discounts for AITD students on laptops and accessories",
    type: "poster",
    section: "marketplace",
    status: "active",
    imageUrl: "/placeholder.svg?height=300&width=400&text=Student+Laptop+Deals",
    linkUrl: "https://techstore.com/student-deals",
    linkText: "View Deals",
    priority: 8,
    clickCount: 32,
    impressions: 890,
    createdAt: "2024-02-05T14:30:00Z",
    updatedAt: "2024-02-05T14:30:00Z",
    createdBy: "admin",
  },
  {
    id: "3",
    title: "Online Learning Platform",
    description: "Access thousands of courses with student discount",
    type: "link",
    section: "library",
    status: "active",
    linkUrl: "https://learningplatform.com/student",
    linkText: "Start Learning",
    priority: 7,
    clickCount: 28,
    impressions: 650,
    createdAt: "2024-02-10T09:15:00Z",
    updatedAt: "2024-02-10T09:15:00Z",
    createdBy: "admin",
  },
  {
    id: "4",
    title: "Student Networking Event",
    description: "Join fellow AITD students for networking and career opportunities",
    type: "image",
    section: "social",
    status: "active",
    imageUrl: "/placeholder.svg?height=200&width=300&text=Student+Networking",
    linkUrl: "https://aitd.edu/networking-event",
    linkText: "Register Now",
    priority: 9,
    clickCount: 15,
    impressions: 420,
    createdAt: "2024-02-12T16:00:00Z",
    updatedAt: "2024-02-12T16:00:00Z",
    createdBy: "admin",
  },
]

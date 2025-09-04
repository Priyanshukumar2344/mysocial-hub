"use client"

import { useEffect, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Home, Users, Book, MessageSquare, ShoppingCart } from "lucide-react"
import { useContext } from "react"
import { SectionNotificationsContext, type SectionType } from "@/contexts/SectionNotificationsContext"

interface AndroidNavigationProps {
  className?: string
}

export function AndroidNavigation({ className }: AndroidNavigationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const previousPathRef = useRef(pathname)

  // Get context with proper error handling
  const context = useContext(SectionNotificationsContext)

  // Use default values if context is undefined
  const sectionUpdates = context?.sectionUpdates || {
    home: 0,
    social: 0,
    chat: 0,
    marketplace: 0,
    library: 0,
  }

  // Create a safe version of markSectionAsSeen
  const markSectionAsSeen = (section: SectionType) => {
    if (context && typeof context.markSectionAsSeen === "function") {
      context.markSectionAsSeen(section)
    } else {
      console.log("Fallback markSectionAsSeen called with:", section)
    }
  }

  // Define navigation items with their corresponding sections
  const navigationItems = [
    { path: "/", label: "Home", icon: Home, section: "home" as SectionType },
    { path: "/social", label: "Social", icon: Users, section: "social" as SectionType },
    { path: "/chat", label: "Chat", icon: MessageSquare, section: "chat" as SectionType },
    { path: "/marketplace", label: "Sell/Buy", icon: ShoppingCart, section: "marketplace" as SectionType },
    { path: "/library", label: "Library", icon: Book, section: "library" as SectionType },
  ]

  // Handle navigation and mark section as seen
  const handleNavigation = (path: string, section: SectionType) => {
    router.push(path)
    markSectionAsSeen(section)
  }

  // Check if this is the active path
  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/"
    }
    return pathname?.startsWith(path)
  }

  // Mark section as seen if already on that page
  useEffect(() => {
    // Skip if pathname hasn't changed
    if (pathname === previousPathRef.current) return

    // Update the previous path ref
    previousPathRef.current = pathname

    // Find the current section based on pathname
    const currentItem = navigationItems.find((item) => isActive(item.path))

    if (currentItem) {
      markSectionAsSeen(currentItem.section)
    }
  }, [pathname])

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/60 dark:bg-gray-900/80 backdrop-blur border-t z-50 md:hidden">
      <div className="flex items-center justify-around p-2">
        {navigationItems.map((item) => (
          <button
            key={item.path}
            className={`flex flex-col items-center justify-center text-xs p-2 rounded-lg relative ${
              isActive(item.path) ? "text-blue-500" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
            onClick={() => handleNavigation(item.path, item.section)}
            aria-label={item.label}
          >
            <item.icon className="h-5 w-5 mb-1" />
            <span>{item.label}</span>

            {/* Notification Badge */}
            {sectionUpdates[item.section] > 0 && (
              <div className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                {sectionUpdates[item.section] > 9 ? "9+" : sectionUpdates[item.section]}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

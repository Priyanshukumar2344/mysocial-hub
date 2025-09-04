"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { UserProfileMenu } from "@/components/UserProfileMenu"
import { Home, Users, Book, Shield, Sun, Moon, MessageSquare, ShoppingCart } from "lucide-react"
import { NotificationBell } from "@/components/NotificationBell"
import { LoginPromptDialog } from "@/components/LoginPromptDialog"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { useReducedMotion } from "framer-motion"
import { useMobileDetection } from "@/hooks/use-mobile-detection"
import { useSectionNotifications, type SectionType } from "@/contexts/SectionNotificationsContext"
import { usePublicAccess } from "@/hooks/use-public-access"

// Add version tracking at the top of the file
const NAVBAR_VERSION = "2.3.0" // Updated for public access control

// Define animation variants
const itemVariants = {
  initial: { rotateX: 0, opacity: 1 },
  hover: { rotateX: -90, opacity: 0 },
}

const backVariants = {
  initial: { rotateX: 90, opacity: 0 },
  hover: { rotateX: 0, opacity: 1 },
}

const glowVariants = {
  initial: { opacity: 0, scale: 0.8 },
  hover: {
    opacity: 0.5,
    scale: 1.5,
    transition: {
      opacity: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
      scale: { duration: 0.5, type: "spring", stiffness: 300, damping: 25 },
    },
  },
}

const sharedTransition = {
  type: "spring",
  stiffness: 100,
  damping: 20,
  duration: 0.5,
}

/**
 * NavBar component that provides the main navigation for the application
 * @returns {JSX.Element} The rendered NavBar component
 */
export function NavBar() {
  const { isAuthenticated, isAdmin, user } = useAuth()
  const { theme, setTheme } = useTheme()
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [loginPrompt, setLoginPrompt] = useState<{ isOpen: boolean; featureName: string }>({
    isOpen: false,
    featureName: "",
  })
  const prefersReducedMotion = useReducedMotion()
  const router = useRouter()
  const pathname = usePathname()
  const { isMobile, isAndroid } = useMobileDetection()
  const { settings: publicAccessSettings, canAccess } = usePublicAccess()

  // Wrap the context usage in a try/catch to handle the case when the context is not available
  const context = useSectionNotifications()
  const sectionUpdates = {
    home: 0,
    social: 0,
    chat: 0,
    marketplace: 0,
    library: 0,
    ...context.sectionUpdates,
  }
  const markSectionAsSeen = context.markSectionAsSeen || (() => {})

  const previousPathRef = useRef(pathname)

  // Handle hydration
  useEffect(() => {
    if (typeof window === "undefined") return
    setMounted(true)

    // Set initial active section based on pathname
    const section = getActiveSectionFromPath(pathname)
    if (section) {
      setActiveSection(section)
    }
  }, [])

  // Get active section from pathname
  const getActiveSectionFromPath = (path: string | null): string | null => {
    if (!path) return null

    if (path === "/") return "home"
    if (path.startsWith("/social")) return "social"
    if (path.startsWith("/chat")) return "chat"
    if (path.startsWith("/marketplace")) return "marketplace"
    if (path.startsWith("/library")) return "library"
    if (path.startsWith("/admin")) return "admin"
    if (path.startsWith("/connections")) return "connections"

    return null
  }

  // Update active section when pathname changes
  useEffect(() => {
    if (pathname === previousPathRef.current) return

    previousPathRef.current = pathname
    const section = getActiveSectionFromPath(pathname)
    if (section) {
      setActiveSection(section)

      if (["home", "social", "chat", "marketplace", "library"].includes(section)) {
        markSectionAsSeen(section as SectionType)
      }
    }
  }, [pathname, markSectionAsSeen])

  /**
   * Handles click on a navigation item
   */
  const handleNavClick = (section: string, href: string, requiresAuth = false, featureName = "") => {
    // If user is not authenticated and feature requires auth, show login prompt
    if (!isAuthenticated && requiresAuth) {
      setLoginPrompt({ isOpen: true, featureName })
      return
    }

    setActiveSection(section)

    if (["home", "social", "chat", "marketplace", "library"].includes(section)) {
      markSectionAsSeen(section as SectionType)
    }

    router.push(href)
  }

  // Define the navigation items with access control
  const navItems = [
    {
      href: "/",
      icon: <Home className="h-4 w-4" />,
      label: "Home",
      section: "home",
      gradient: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(37,99,235,0.06) 50%, rgba(29,78,216,0) 100%)",
      iconColor: "text-blue-500",
      hideOnAndroid: true,
      requiresAuth: false,
      featureName: "Home",
    },
    {
      href: "/social",
      icon: <Users className="h-4 w-4" />,
      label: "Social",
      section: "social",
      gradient: "radial-gradient(circle, rgba(249,115,22,0.15) 0%, rgba(234,88,12,0.06) 50%, rgba(194,65,12,0) 100%)",
      iconColor: "text-orange-500",
      hideOnAndroid: true,
      requiresAuth: !canAccess("allowSocialAccess"),
      featureName: "Social Features",
    },
    {
      href: "/chat",
      icon: <MessageSquare className="h-4 w-4" />,
      label: "Chat",
      section: "chat",
      gradient: "radial-gradient(circle, rgba(168,85,247,0.15) 0%, rgba(147,51,234,0.06) 50%, rgba(126,34,206,0) 100%)",
      iconColor: "text-purple-500",
      hideOnAndroid: true,
      requiresAuth: !canAccess("allowChatAccess"),
      featureName: "Chat Features",
    },
    {
      href: "/marketplace",
      icon: <ShoppingCart className="h-4 w-4" />,
      label: (
        <>
          Sell<span className="text-blue-500">ꨄ</span>Buy
        </>
      ),
      section: "marketplace",
      gradient: "radial-gradient(circle, rgba(202,138,4,0.15) 0%, rgba(161,98,7,0.06) 50%, rgba(133,77,14,0) 100%)",
      iconColor: "text-yellow-600",
      hideOnAndroid: true,
      requiresAuth: !canAccess("allowMarketplaceAccess"),
      featureName: "Marketplace",
    },
    {
      href: "/library",
      icon: <Book className="h-4 w-4" />,
      label: "Library",
      section: "library",
      gradient: "radial-gradient(circle, rgba(34,197,94,0.15) 0%, rgba(22,163,74,0.06) 50%, rgba(21,128,61,0) 100%)",
      iconColor: "text-green-500",
      hideOnAndroid: true,
      requiresAuth: !canAccess("allowLibraryAccess"),
      featureName: "Library Resources",
    },
    {
      href: "/admin",
      icon: <Shield className="h-4 w-4" />,
      label: "Admin",
      section: "admin",
      gradient: "radial-gradient(circle, rgba(239,68,68,0.15) 0%, rgba(220,38,38,0.06) 50%, rgba(185,28,28,0) 100%)",
      iconColor: "text-red-500",
      adminOnly: true,
      hideOnAndroid: false,
      requiresAuth: true,
      featureName: "Admin Panel",
    },
  ]

  // If reduced motion is preferred, use simpler animations
  const useSimpleAnimations = prefersReducedMotion || !mounted

  return (
    <>
      <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <span className={`font-bold text-black-500 dark:text-white ${isAndroid ? "text-lg" : "text-xl"}`}>
                  AITD Social Hub
                </span>
              </div>
              {!isAndroid && (
                <motion.div
                  className="hidden sm:ml-6 sm:flex sm:items-center relative p-2 rounded-2xl"
                  initial="initial"
                  whileHover="hover"
                >
                  <ul className="flex items-center gap-2 relative z-10">
                    {navItems.map((item) => {
                      if (item.adminOnly && !isAdmin) return null

                      const isActive = activeSection === item.section
                      const sectionType = item.section as SectionType
                      const hasUpdates =
                        isAuthenticated &&
                        ["home", "social", "chat", "marketplace", "library"].includes(item.section) &&
                        sectionUpdates[sectionType] > 0

                      return useSimpleAnimations ? (
                        // Simple version without animations
                        <li key={item.section} className="relative">
                          <button
                            className={cn(
                              "nav-link text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white inline-flex items-center px-3 py-2 text-sm font-medium transition-all duration-200 rounded-md",
                              isActive ? "border-b-2 border-blue-500" : "border-b-2 border-transparent",
                            )}
                            onClick={() => handleNavClick(item.section, item.href, item.requiresAuth, item.featureName)}
                            aria-current={isActive ? "page" : undefined}
                          >
                            <span className={`mr-2 ${isActive ? item.iconColor : ""}`}>{item.icon}</span>
                            {item.label}

                            {/* Notification Badge */}
                            {hasUpdates && (
                              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                                {sectionUpdates[sectionType] > 9 ? "9+" : sectionUpdates[sectionType]}
                              </span>
                            )}
                          </button>
                        </li>
                      ) : (
                        // Animated version
                        <motion.li key={item.section} className="relative">
                          <motion.div
                            className="block rounded-xl overflow-visible group relative"
                            style={{ perspective: "600px" }}
                            whileHover="hover"
                            initial="initial"
                          >
                            {/* Notification Badge */}
                            {hasUpdates && (
                              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 z-20">
                                {sectionUpdates[sectionType] > 9 ? "9+" : sectionUpdates[sectionType]}
                              </span>
                            )}

                            <motion.div
                              className="absolute inset-0 z-0 pointer-events-none"
                              variants={glowVariants}
                              style={{
                                background: item.gradient,
                                opacity: isActive ? 0.5 : 0,
                                borderRadius: "16px",
                              }}
                            />
                            <motion.div
                              onClick={() =>
                                handleNavClick(item.section, item.href, item.requiresAuth, item.featureName)
                              }
                              className={cn(
                                "flex items-center gap-2 px-4 py-2 relative z-10 bg-transparent text-muted-foreground transition-colors rounded-xl cursor-pointer",
                                isActive ? "text-foreground" : "group-hover:text-foreground",
                                isActive ? "border-b-2 border-blue-500" : "border-b-2 border-transparent",
                              )}
                              variants={itemVariants}
                              transition={sharedTransition}
                              style={{ transformStyle: "preserve-3d", transformOrigin: "center bottom" }}
                            >
                              <span
                                className={cn(
                                  "transition-all duration-300",
                                  isActive ? item.iconColor : `group-hover:${item.iconColor}`,
                                )}
                                style={{ transition: `color ${sharedTransition.duration}s` }}
                              >
                                {item.icon}
                              </span>
                              <span>{item.label}</span>
                            </motion.div>
                            <motion.div
                              onClick={() =>
                                handleNavClick(item.section, item.href, item.requiresAuth, item.featureName)
                              }
                              className={cn(
                                "flex items-center gap-2 px-4 py-2 absolute inset-0 z-10 bg-transparent text-muted-foreground transition-colors rounded-xl cursor-pointer",
                                isActive ? "text-foreground" : "group-hover:text-foreground",
                                isActive ? "border-b-2 border-blue-500" : "border-b-2 border-transparent",
                              )}
                              variants={backVariants}
                              transition={sharedTransition}
                              style={{
                                transformStyle: "preserve-3d",
                                transformOrigin: "center top",
                                rotateX: 90,
                                backfaceVisibility: "hidden",
                              }}
                            >
                              <span
                                className={cn(
                                  "transition-all duration-300",
                                  isActive ? item.iconColor : `group-hover:${item.iconColor}`,
                                )}
                                style={{ transition: `color ${sharedTransition.duration}s` }}
                              >
                                {item.icon}
                              </span>
                              <span>{item.label}</span>
                            </motion.div>
                          </motion.div>
                        </motion.li>
                      )
                    })}
                  </ul>
                </motion.div>
              )}

              {/* Android-specific admin navigation */}
              {isAndroid && isAdmin && (
                <div className="ml-2 flex items-center">
                  <button
                    className={cn(
                      "flex items-center gap-1 px-2 py-1 rounded-md",
                      activeSection === "admin" ? "bg-red-100 dark:bg-red-900/30" : "",
                    )}
                    onClick={() => handleNavClick("admin", "/admin", true, "Admin Panel")}
                  >
                    <Shield className="h-4 w-4 text-red-500" />
                    <span className="text-xs font-medium">Admin</span>
                  </button>
                </div>
              )}
            </div>

            {/* Right side navigation items */}
            <div className="flex items-center gap-1 sm:gap-2">
              {isAuthenticated && (
                <>
                  {/* Android-specific search button */}
                  {isAndroid && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative"
                      onClick={() => router.push("/search")}
                      aria-label="Search"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-search"
                      >
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.3-4.3"></path>
                      </svg>
                    </Button>
                  )}

                  <NotificationBell />

                  <button
                    className={`p-1 sm:p-2 ${activeSection === "connections" ? "text-blue-500" : "text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"}`}
                    onClick={() =>
                      handleNavClick("connections", "/connections", !canAccess("allowConnectionsAccess"), "Connections")
                    }
                    aria-label="Connections"
                  >
                    <Users className="h-5 w-5" />
                  </button>
                </>
              )}

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                className="mr-0 sm:mr-2"
                aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>

              {isAuthenticated ? (
                <UserProfileMenu />
              ) : (
                <Button asChild variant="ghost" className={isAndroid ? "px-2 py-1 h-8 text-sm" : "mr-2"}>
                  <Link href="/login">Login</Link>
                </Button>
              )}
            </div>
          </div>

          {/* Android-specific breadcrumb */}
          {isAndroid && activeSection && activeSection !== "home" && (
            <div className="px-4 py-1 text-xs text-muted-foreground flex items-center">
              <Link href="/" className="hover:text-foreground">
                Home
              </Link>
              <span className="mx-1">/</span>
              <span className="font-medium text-foreground capitalize">{activeSection}</span>
            </div>
          )}
        </div>
      </nav>

      {/* Login Prompt Dialog */}
      <LoginPromptDialog
        isOpen={loginPrompt.isOpen}
        onClose={() => setLoginPrompt({ isOpen: false, featureName: "" })}
        featureName={loginPrompt.featureName}
      />
    </>
  )
}

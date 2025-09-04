"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { UserProfileMenu } from "@/components/UserProfileMenu"
import { Home, Users, BookOpen, Shield, Sun, Moon, MessageSquare, ShoppingCart, User, Bell } from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

// Define the navigation items with their colors
const navItems = [
  {
    href: "/",
    icon: <Home className="h-5 w-5" />,
    label: "Home",
    section: "home",
    color: "#3b82f6", // blue
    hoverColor: "#60a5fa",
    glowColor: "rgba(59, 130, 246, 0.5)",
  },
  {
    href: "/social",
    icon: <Users className="h-5 w-5" />,
    label: "Social",
    section: "social",
    color: "#f97316", // orange
    hoverColor: "#fb923c",
    glowColor: "rgba(249, 115, 22, 0.5)",
  },
  {
    href: "/chat",
    icon: <MessageSquare className="h-5 w-5" />,
    label: "Chat",
    section: "chat",
    color: "#a855f7", // purple
    hoverColor: "#c084fc",
    glowColor: "rgba(168, 85, 247, 0.5)",
  },
  {
    href: "/marketplace",
    icon: <ShoppingCart className="h-5 w-5" />,
    label: "SellꨄBuy",
    section: "marketplace",
    color: "#ca8a04", // yellow
    hoverColor: "#d99f1b",
    glowColor: "rgba(202, 138, 4, 0.5)",
  },
  {
    href: "/library",
    icon: <BookOpen className="h-5 w-5" />,
    label: "Library",
    section: "library",
    color: "#22c55e", // green
    hoverColor: "#4ade80",
    glowColor: "rgba(34, 197, 94, 0.5)",
  },
  {
    href: "/admin",
    icon: <Shield className="h-5 w-5" />,
    label: "Admin",
    section: "admin",
    color: "#ef4444", // red
    hoverColor: "#f87171",
    glowColor: "rgba(239, 68, 68, 0.5)",
    adminOnly: true,
  },
]

// NavItem component with 3D flip animation
const NavItem = ({
  href,
  icon,
  label,
  color,
  hoverColor,
  glowColor,
  isActive,
  onClick,
}: {
  href: string
  icon: React.ReactNode
  label: React.ReactNode
  color: string
  hoverColor: string
  glowColor: string
  isActive: boolean
  onClick: () => void
}) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      className="relative"
      initial={false}
      animate={{ scale: isActive ? 1.05 : 1 }}
      style={{ perspective: "600px" }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Glow effect behind the item */}
      <motion.div
        className="absolute inset-0 rounded-xl z-0"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: isHovered || isActive ? 0.6 : 0,
          scale: isHovered || isActive ? 1.2 : 0.8,
        }}
        transition={{ duration: 0.3 }}
        style={{
          background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
        }}
      />

      <Link href={href} onClick={onClick} className="block">
        <div className="relative w-full h-full" style={{ perspective: "600px" }}>
          <motion.div
            className="relative w-full h-full"
            style={{
              transformStyle: "preserve-3d",
              transformOrigin: "center center",
            }}
            initial={false}
            animate={{
              rotateX: isHovered ? -90 : 0,
            }}
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 20,
            }}
          >
            {/* Front face */}
            <motion.div
              className={cn(
                "absolute inset-0 flex items-center justify-center px-4 py-3 rounded-xl backdrop-blur-sm",
                "bg-white/20 dark:bg-gray-800/20 border border-white/30 dark:border-gray-700/30",
                isActive ? "shadow-md" : "",
              )}
              style={{
                backfaceVisibility: "hidden",
                color: isActive ? color : "inherit",
              }}
            >
              <span className="mr-2">{icon}</span>
              <span className="font-medium">{label}</span>
            </motion.div>

            {/* Back face (flipped) */}
            <motion.div
              className={cn(
                "absolute inset-0 flex items-center justify-center px-4 py-3 rounded-xl backdrop-blur-sm",
                "bg-white/30 dark:bg-gray-800/30 border border-white/40 dark:border-gray-700/40",
                "shadow-lg",
              )}
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateX(90deg)",
                transformOrigin: "center center",
                color: hoverColor,
              }}
            >
              <span className="mr-2">{icon}</span>
              <span className="font-medium">{label}</span>
            </motion.div>
          </motion.div>
        </div>
      </Link>

      {/* Active indicator */}
      {isActive && (
        <motion.div
          className="absolute bottom-0 left-1/2 h-1 rounded-full"
          initial={{ width: 0, x: "-50%" }}
          animate={{ width: "50%", x: "-50%" }}
          style={{ backgroundColor: color }}
        />
      )}
    </motion.div>
  )
}

export function AnimatedNavBar() {
  const { isAuthenticated, isAdmin, user } = useAuth()
  const { theme, setTheme } = useTheme()
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [isNavHovered, setIsNavHovered] = useState(false)

  const handleNavClick = (section: string) => {
    setActiveSection(activeSection === section ? null : section)
  }

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 py-3"
      style={{
        background: "rgba(255, 255, 255, 0.7)",
        backdropFilter: "blur(10px)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-xl font-bold text-blue-600 dark:text-white mr-8">AITD Social Hub</span>

            {isAuthenticated && (
              <motion.div
                className="relative hidden sm:flex space-x-4 p-2 rounded-xl"
                onHoverStart={() => setIsNavHovered(true)}
                onHoverEnd={() => setIsNavHovered(false)}
              >
                {/* Multi-color radial gradient glow behind entire nav */}
                <motion.div
                  className="absolute inset-0 rounded-xl -z-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isNavHovered ? 0.3 : 0 }}
                  transition={{ duration: 0.5 }}
                  style={{
                    background: `
                      radial-gradient(circle at 10% 50%, rgba(59, 130, 246, 0.4), transparent 30%),
                      radial-gradient(circle at 30% 50%, rgba(249, 115, 22, 0.4), transparent 30%),
                      radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.4), transparent 30%),
                      radial-gradient(circle at 70% 50%, rgba(34, 197, 94, 0.4), transparent 30%),
                      radial-gradient(circle at 90% 50%, rgba(239, 68, 68, 0.4), transparent 30%)
                    `,
                  }}
                />

                {navItems.map((item) => {
                  if (item.adminOnly && !isAdmin) return null

                  return (
                    <NavItem
                      key={item.section}
                      href={item.href}
                      icon={item.icon}
                      label={item.label}
                      color={item.color}
                      hoverColor={item.hoverColor}
                      glowColor={item.glowColor}
                      isActive={activeSection === item.section}
                      onClick={() => handleNavClick(item.section)}
                    />
                  )
                })}
              </motion.div>
            )}
          </div>

          <div className="hidden sm:flex sm:items-center space-x-3">
            {isAuthenticated && (
              <>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="relative p-2 rounded-full bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm border border-white/30 dark:border-gray-700/30"
                >
                  <motion.div
                    className="absolute inset-0 rounded-full -z-10"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ opacity: 0.6, scale: 1.2 }}
                    transition={{ duration: 0.3 }}
                    style={{
                      background: "radial-gradient(circle, rgba(249, 115, 22, 0.5) 0%, transparent 70%)",
                    }}
                  />
                  <Bell className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="relative p-2 rounded-full bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm border border-white/30 dark:border-gray-700/30"
                >
                  <motion.div
                    className="absolute inset-0 rounded-full -z-10"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ opacity: 0.6, scale: 1.2 }}
                    transition={{ duration: 0.3 }}
                    style={{
                      background: "radial-gradient(circle, rgba(168, 85, 247, 0.5) 0%, transparent 70%)",
                    }}
                  />
                  <User className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                </motion.div>
              </>
            )}

            <motion.button
              whileHover={{ scale: 1.1, rotate: 180 }}
              transition={{ duration: 0.3 }}
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="p-2 rounded-full bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm border border-white/30 dark:border-gray-700/30"
              aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </motion.button>

            {isAuthenticated ? (
              <UserProfileMenu />
            ) : (
              <>
                <Button asChild variant="ghost" className="mr-2">
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild variant="ghost">
                  <Link href="/register">Register</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

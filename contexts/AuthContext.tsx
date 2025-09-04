"use client"

import type React from "react"
import { createContext, useState, useContext, useEffect } from "react"
import { db, type UserData, type UserPermissions, DEFAULT_ADMIN } from "@/lib/db"
import { toast } from "@/components/ui/use-toast"
import { createNotification } from "@/lib/notifications"
import { initializeStorage } from "@/lib/storage"
import { verifyPassword } from "@/lib/auth"

// Define default values for the context
const defaultContextValue = {
  user: null,
  isAuthenticated: false,
  isAdmin: false,
  isSuperAdmin: false,
  permissions: null,
  login: async () => {},
  logout: () => {},
  updateUser: async () => {},
}

type AuthContextType = {
  user: UserData | null
  isAuthenticated: boolean
  isAdmin: boolean
  isSuperAdmin: boolean
  permissions: UserPermissions | null
  login: (collegeId: string, password: string) => Promise<void>
  logout: () => void
  updateUser: (userData: Partial<UserData>) => Promise<void>
}

// Create context with default values
const AuthContext = createContext<AuthContextType>(defaultContextValue)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    // Ensure this only runs in the browser
    if (typeof window !== "undefined") {
      try {
        initializeStorage()
        const storedUser = db.get("currentUser")
        if (storedUser) {
          setUser(storedUser)
        }
      } catch (error) {
        console.error("Error initializing auth:", error)
      } finally {
        setInitialized(true)
      }
    }
  }, [])

  const login = async (collegeId: string, password: string) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Special handling for super admin
      if (collegeId === DEFAULT_ADMIN.collegeId) {
        if (password !== DEFAULT_ADMIN.password) {
          toast({
            title: "Access Denied",
            description: "Invalid credentials.",
            variant: "destructive",
          })
          throw new Error("Invalid credentials")
        }
        setUser(DEFAULT_ADMIN)
        db.set("currentUser", DEFAULT_ADMIN)
        toast({
          title: "Welcome back!",
          description: `Logged in as ${DEFAULT_ADMIN.name}`,
        })
        return
      }

      // For other users, check if they exist
      const users = db.get("users") || [DEFAULT_ADMIN]
      const currentUser = users.find((u: { collegeId: string }) => u.collegeId === collegeId)

      if (!currentUser) {
        toast({
          title: "Access Denied",
          description: "User not found. Please contact your administrator.",
          variant: "destructive",
        })
        throw new Error("User not found")
      }

      if (!currentUser.password) {
        toast({
          title: "Password Not Set",
          description: "Please complete your account setup first.",
          variant: "destructive",
        })
        throw new Error("Password not set")
      }

      // Verify password
      const passwordMatches = await verifyPassword(password, currentUser.password)
      if (!passwordMatches) {
        toast({
          title: "Access Denied",
          description: "Invalid credentials.",
          variant: "destructive",
        })
        throw new Error("Invalid credentials")
      }

      if (currentUser.status === "suspended") {
        toast({
          title: "Account Suspended",
          description: "Please contact the administrator.",
          variant: "destructive",
        })
        throw new Error("Account suspended")
      }

      // If this is the first login, show welcome notification
      if (!currentUser.lastLogin) {
        createNotification(
          currentUser.id,
          "welcome",
          "Welcome to AITD Social Hub!",
          "Complete your profile to get started.",
          undefined,
          `/profile/${currentUser.id}`,
        )
      }

      // Update last login
      currentUser.lastLogin = new Date().toISOString()
      db.set(
        "users",
        users.map((u: { collegeId: string }) => (u.collegeId === collegeId ? currentUser : u)),
      )
      db.set("currentUser", currentUser)
      setUser(currentUser)

      toast({
        title: "Welcome back!",
        description: `Logged in as ${currentUser.name}`,
      })
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  }

  const logout = () => {
    db.set("currentUser", null)
    setUser(null)
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    })
  }

  const updateUser = async (userData: Partial<UserData>) => {
    if (!user) return

    try {
      const updatedUser = { ...user, ...userData }

      // Update user in storage
      if (user.id === DEFAULT_ADMIN.id) {
        setUser(updatedUser)
        db.set("currentUser", updatedUser)
      } else {
        db.update("users", (users: UserData[]) => users.map((u) => (u.id === user.id ? updatedUser : u)))
        db.set("currentUser", updatedUser)
        setUser(updatedUser)
      }

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      })
    } catch (error) {
      console.error("Update user error:", error)
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      })
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin" || user?.role === "superadmin",
        isSuperAdmin: user?.role === "superadmin",
        permissions: user?.permissions || null,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

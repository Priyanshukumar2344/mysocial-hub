"use client"

import type React from "react"

import { createContext, useState, useContext, useEffect } from "react"

export type SectionType = "home" | "social" | "chat" | "marketplace" | "library"

interface SectionNotificationsContextType {
  sectionUpdates: Record<SectionType, number>
  markSectionAsSeen: (section: SectionType) => void
  addSectionUpdate: (section: SectionType, count?: number) => void
  totalUpdates: number
}

// Create a default context value
const defaultContextValue: SectionNotificationsContextType = {
  sectionUpdates: {
    home: 0,
    social: 0,
    chat: 0,
    marketplace: 0,
    library: 0,
  },
  markSectionAsSeen: () => {},
  addSectionUpdate: () => {},
  totalUpdates: 0,
}

// Export the context so it can be imported directly
export const SectionNotificationsContext = createContext<SectionNotificationsContextType>(defaultContextValue)

export function SectionNotificationsProvider({ children }: { children: React.ReactNode }) {
  // Initialize with some notifications for demonstration
  const [sectionUpdates, setSectionUpdates] = useState<Record<SectionType, number>>({
    home: 2,
    social: 3,
    chat: 1,
    marketplace: 4,
    library: 2,
  })

  // Mark a section as seen
  const markSectionAsSeen = (section: SectionType) => {
    setSectionUpdates((prev) => ({
      ...prev,
      [section]: 0,
    }))

    // Also update localStorage to persist the state
    try {
      const storedUpdates = JSON.parse(localStorage.getItem("sectionUpdates") || "{}")
      localStorage.setItem(
        "sectionUpdates",
        JSON.stringify({
          ...storedUpdates,
          [section]: 0,
        }),
      )
    } catch (error) {
      console.error("Error updating localStorage:", error)
    }
  }

  // Add a new update to a section
  const addSectionUpdate = (section: SectionType, count = 1) => {
    setSectionUpdates((prev) => ({
      ...prev,
      [section]: prev[section] + count,
    }))

    // Also update localStorage to persist the state
    try {
      const storedUpdates = JSON.parse(localStorage.getItem("sectionUpdates") || "{}")
      localStorage.setItem(
        "sectionUpdates",
        JSON.stringify({
          ...storedUpdates,
          [section]: (storedUpdates[section] || 0) + count,
        }),
      )
    } catch (error) {
      console.error("Error updating localStorage:", error)
    }

    // Dispatch a custom event to notify other components
    const event = new CustomEvent("section-update", {
      detail: { section, count },
    })
    window.dispatchEvent(event)
  }

  // Load initial state from localStorage
  useEffect(() => {
    try {
      const storedUpdates = localStorage.getItem("sectionUpdates")
      if (storedUpdates) {
        const parsedUpdates = JSON.parse(storedUpdates)
        setSectionUpdates((prev) => ({
          ...prev,
          ...parsedUpdates,
        }))
      }
    } catch (error) {
      console.error("Error loading from localStorage:", error)
    }
  }, [])

  // Listen for custom events from other components
  useEffect(() => {
    const handleSectionUpdate = (event: CustomEvent) => {
      const { section, count } = event.detail
      setSectionUpdates((prev) => ({
        ...prev,
        [section]: prev[section] + (count || 1),
      }))
    }

    window.addEventListener("section-update" as any, handleSectionUpdate as EventListener)

    return () => {
      window.removeEventListener("section-update" as any, handleSectionUpdate as EventListener)
    }
  }, [])

  // Calculate total updates across all sections
  const totalUpdates = Object.values(sectionUpdates).reduce((sum, count) => sum + count, 0)

  return (
    <SectionNotificationsContext.Provider
      value={{
        sectionUpdates,
        markSectionAsSeen,
        addSectionUpdate,
        totalUpdates,
      }}
    >
      {children}
    </SectionNotificationsContext.Provider>
  )
}

export function useSectionNotifications() {
  const context = useContext(SectionNotificationsContext)
  if (context === undefined) {
    throw new Error("useSectionNotifications must be used within a SectionNotificationsProvider")
  }
  return context
}

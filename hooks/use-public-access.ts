"use client"

import { useState, useEffect } from "react"
import { db } from "@/lib/db"
import type { PublicAccessSettings } from "@/app/admin/settings/page"

const defaultSettings: PublicAccessSettings = {
  allowHomeAccess: true,
  allowConnectionsAccess: true,
  allowSocialAccess: false,
  allowChatAccess: false,
  allowMarketplaceAccess: false,
  allowLibraryAccess: false,
  allowProfileViewing: false,
  showCollegeInfo: true,
  requireLoginMessage: "Login first to access these features or contact admin",
  contactInfo: {
    email: "admin@aitd.edu",
    phone: "+91 9470049202",
    showContact: true,
  },
}

export function usePublicAccess() {
  const [settings, setSettings] = useState<PublicAccessSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadSettings = () => {
      try {
        const savedSettings = db.get("publicAccessSettings")
        if (savedSettings) {
          setSettings(savedSettings)
        } else {
          db.set("publicAccessSettings", defaultSettings)
          setSettings(defaultSettings)
        }
      } catch (error) {
        console.error("Error loading public access settings:", error)
        setSettings(defaultSettings)
      } finally {
        setLoading(false)
      }
    }

    loadSettings()
  }, [])

  const canAccess = (feature: keyof PublicAccessSettings): boolean => {
    if (loading) return false
    return settings[feature] as boolean
  }

  const getLoginMessage = (): string => {
    return settings.requireLoginMessage || defaultSettings.requireLoginMessage
  }

  const getContactInfo = () => {
    return settings.contactInfo
  }

  return {
    settings,
    loading,
    canAccess,
    getLoginMessage,
    getContactInfo,
  }
}

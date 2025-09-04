"use client"

import { useEffect } from "react"
import { useSectionNotifications, type SectionType } from "@/contexts/SectionNotificationsContext"

interface UpdateNotifierProps {
  section: SectionType
  count?: number
  trigger?: any
  autoTrigger?: boolean
}

/**
 * A component that triggers a section update when rendered or when trigger changes
 */
export function UpdateNotifier({ section, count = 1, trigger, autoTrigger = false }: UpdateNotifierProps) {
  const { addSectionUpdate } = useSectionNotifications()

  useEffect(() => {
    // If autoTrigger is true, add an update when the component mounts
    if (autoTrigger) {
      addSectionUpdate(section, count)
    }
  }, [])

  useEffect(() => {
    // Skip the initial render
    if (trigger === undefined) return

    // Add update when the trigger changes
    addSectionUpdate(section, count)
  }, [trigger, section, count, addSectionUpdate])

  // This component doesn't render anything
  return null
}

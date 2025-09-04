"use client"

import { AndroidNavigation } from "@/components/AndroidNavigation"

export function AndroidNavigationWrapper() {
  // Create a default context value
  const defaultContextValue = {
    sectionUpdates: {
      home: 0,
      social: 0,
      chat: 0,
      marketplace: 0,
      library: 0,
    },
    markSectionAsSeen: (section: any) => {
      console.log("Default markSectionAsSeen called with:", section)
    },
    addSectionUpdate: () => {},
    totalUpdates: 0,
  }

  return <AndroidNavigation />
}

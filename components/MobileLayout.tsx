"use client"

import type { ReactNode } from "react"
import { useMobileDetection } from "@/hooks/use-mobile-detection"
import { cn } from "@/lib/utils"

interface MobileLayoutProps {
  children: ReactNode
}

export function MobileLayout({ children }: MobileLayoutProps) {
  const { isAndroid } = useMobileDetection()

  return <div className={cn("min-h-screen", isAndroid && "android-device pb-20")}>{children}</div>
}

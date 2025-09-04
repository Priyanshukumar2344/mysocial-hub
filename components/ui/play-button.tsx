"use client"

import { Play } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PlayButtonProps {
  onClick?: () => void
  size?: "sm" | "md" | "lg"
  className?: string
}

export function PlayButton({ onClick, size = "md", className = "" }: PlayButtonProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  }

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  }

  return (
    <Button
      variant="secondary"
      size="icon"
      className={`rounded-full ${sizeClasses[size]} ${className}`}
      onClick={onClick}
    >
      <Play className={iconSizes[size]} />
    </Button>
  )
}

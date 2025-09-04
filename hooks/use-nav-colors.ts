"use client"

import { useTheme } from "next-themes"

type NavColorItem = {
  color: string
  textColor: string
  hoverTextColor: string
  activeTextColor: string
  hoverBg: string
  activeBg: string
  glowColor: string
}

export function useNavColors() {
  const { theme } = useTheme()
  const isDark = theme === "dark"

  const getNavItemColors = (colorName: string): NavColorItem => {
    const colorMap: Record<string, NavColorItem> = {
      blue: {
        color: "blue-500",
        textColor: "text-gray-600 dark:text-gray-300",
        hoverTextColor: "text-blue-500 dark:text-blue-400",
        activeTextColor: "text-blue-600 dark:text-blue-400",
        hoverBg: "bg-blue-500/10 dark:bg-blue-500/20",
        activeBg: "bg-blue-500/20 dark:bg-blue-500/30",
        glowColor: isDark ? "rgba(96, 165, 250, 0.3)" : "rgba(59, 130, 246, 0.2)",
      },
      orange: {
        color: "orange-500",
        textColor: "text-gray-600 dark:text-gray-300",
        hoverTextColor: "text-orange-500 dark:text-orange-400",
        activeTextColor: "text-orange-600 dark:text-orange-400",
        hoverBg: "bg-orange-500/10 dark:bg-orange-500/20",
        activeBg: "bg-orange-500/20 dark:bg-orange-500/30",
        glowColor: isDark ? "rgba(251, 146, 60, 0.3)" : "rgba(249, 115, 22, 0.2)",
      },
      purple: {
        color: "purple-500",
        textColor: "text-gray-600 dark:text-gray-300",
        hoverTextColor: "text-purple-500 dark:text-purple-400",
        activeTextColor: "text-purple-600 dark:text-purple-400",
        hoverBg: "bg-purple-500/10 dark:bg-purple-500/20",
        activeBg: "bg-purple-500/20 dark:bg-purple-500/30",
        glowColor: isDark ? "rgba(192, 132, 252, 0.3)" : "rgba(168, 85, 247, 0.2)",
      },
      olive: {
        color: "yellow-600",
        textColor: "text-gray-600 dark:text-gray-300",
        hoverTextColor: "text-yellow-600 dark:text-yellow-500",
        activeTextColor: "text-yellow-700 dark:text-yellow-500",
        hoverBg: "bg-yellow-600/10 dark:bg-yellow-600/20",
        activeBg: "bg-yellow-600/20 dark:bg-yellow-600/30",
        glowColor: isDark ? "rgba(217, 159, 27, 0.3)" : "rgba(202, 138, 4, 0.2)",
      },
      green: {
        color: "green-500",
        textColor: "text-gray-600 dark:text-gray-300",
        hoverTextColor: "text-green-500 dark:text-green-400",
        activeTextColor: "text-green-600 dark:text-green-400",
        hoverBg: "bg-green-500/10 dark:bg-green-500/20",
        activeBg: "bg-green-500/20 dark:bg-green-500/30",
        glowColor: isDark ? "rgba(74, 222, 128, 0.3)" : "rgba(34, 197, 94, 0.2)",
      },
      red: {
        color: "red-500",
        textColor: "text-gray-600 dark:text-gray-300",
        hoverTextColor: "text-red-500 dark:text-red-400",
        activeTextColor: "text-red-600 dark:text-red-400",
        hoverBg: "bg-red-500/10 dark:bg-red-500/20",
        activeBg: "bg-red-500/20 dark:bg-red-500/30",
        glowColor: isDark ? "rgba(248, 113, 113, 0.3)" : "rgba(239, 68, 68, 0.2)",
      },
    }

    return colorMap[colorName] || colorMap.blue
  }

  return { getNavItemColors }
}

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getInitials(name: string): string {
  const parts = name.split(" ")
  let initials = ""
  if (parts.length > 1) {
    initials += parts[0].charAt(0).toUpperCase()
    initials += parts[parts.length - 1].charAt(0).toUpperCase()
  } else {
    initials = parts[0].substring(0, 2).toUpperCase()
  }
  return initials
}

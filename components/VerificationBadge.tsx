import { CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface VerificationBadgeProps {
  type: "none" | "blue" | "golden"
  className?: string
}

export function VerificationBadge({ type, className }: VerificationBadgeProps) {
  if (type === "none") return null

  return <CheckCircle className={cn("inline-block", type === "blue" ? "text-blue-500" : "text-amber-500", className)} />
}

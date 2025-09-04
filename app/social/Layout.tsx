import type React from "react"

export default function SocialLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="bg-slate-50 dark:bg-slate-950 min-h-screen pt-20">{children}</div>
}

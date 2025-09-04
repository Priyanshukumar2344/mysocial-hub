"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { Users, Settings, Bell, FileText, Building2, ShieldAlert, HelpCircle, CreditCard, Award } from "lucide-react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isAdmin, isSuperAdmin } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAdmin && !isSuperAdmin) {
      router.push("/")
    }
  }, [isAdmin, isSuperAdmin, router])

  if (!isAdmin && !isSuperAdmin) return null

  const tabs = [
    {
      value: "users",
      label: "Users",
      icon: Users,
      href: "/admin/users",
    },
    {
      value: "resources",
      label: "Resources",
      icon: FileText,
      href: "/admin/resources",
    },
    {
      value: "notifications",
      label: "Notifications",
      icon: Bell,
      href: "/admin/notifications",
    },
    {
      value: "support",
      label: "Support",
      icon: HelpCircle,
      href: "/admin/support",
    },
    ...(isSuperAdmin
      ? [
          {
            value: "college-profile",
            label: "College Profile",
            icon: Building2,
            href: "/admin/college-profile",
          },
          {
            value: "payment-settings",
            label: "Payment Settings",
            icon: CreditCard,
            href: "/admin/payment-settings",
          },
          {
            value: "permissions",
            label: "Permissions",
            icon: ShieldAlert,
            href: "/admin/permissions",
          },
          {
            value: "settings",
            label: "Settings",
            icon: Settings,
            href: "/admin/settings",
          },
          {
            value: "badges",
            label: "Badge Management",
            icon: Award,
            href: "/admin/badges",
          },
        ]
      : []),
  ]

  return (
    <div className="container mx-auto py-8">
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-8">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} asChild>
              <Link href={tab.href} className="flex items-center gap-2">
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </Link>
            </TabsTrigger>
          ))}
        </TabsList>
        {children}
      </Tabs>
    </div>
  )
}

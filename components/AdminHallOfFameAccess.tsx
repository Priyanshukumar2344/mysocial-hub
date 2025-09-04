"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, Trophy, ArrowRight } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import Link from "next/link"

export function AdminHallOfFameAccess() {
  const { isAdmin } = useAuth()
  const router = useRouter()
  const [hasAccess, setHasAccess] = useState(false)
  const collegeId = "2301661530047"

  useEffect(() => {
    // This would typically check against a database or API
    // Here we're just simulating the check
    setHasAccess(isAdmin)
  }, [isAdmin])

  const handleRequestAccess = () => {
    toast({
      title: "Access Request Submitted",
      description: "Your request for Hall of Fame admin access has been submitted for approval.",
    })
  }

  if (!isAdmin) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-500" />
          <CardTitle>Hall of Fame Administration</CardTitle>
        </div>
        <CardDescription>Manage the Hall of Fame for AITD Engineering College (ID: {collegeId})</CardDescription>
      </CardHeader>
      <CardContent>
        {hasAccess ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-md">
              <Shield className="h-5 w-5" />
              <p className="text-sm">You have administrator access to the Hall of Fame</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button asChild>
                <Link href="/admin/hall-of-fame">
                  Manage Hall of Fame
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href={`/profile/${collegeId}`}>View College Profile</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-md">
              <Shield className="h-5 w-5" />
              <p className="text-sm">You need special access to manage the Hall of Fame</p>
            </div>
            <Button onClick={handleRequestAccess}>Request Hall of Fame Admin Access</Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

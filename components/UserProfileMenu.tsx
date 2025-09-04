"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/AuthContext"
import Link from "next/link"
import { User, Settings, LogOut, Shield, BadgeCheck, MessageSquare } from "lucide-react"
import { PlusCircle } from "lucide-react"
import { useMobileDetection } from "@/hooks/use-mobile-detection"

const USER_PROFILE_MENU_VERSION = "2.0.0" // Incremented for Android optimization

export function UserProfileMenu() {
  const { user, logout, isAdmin, isSuperAdmin } = useAuth()
  const { isAndroid } = useMobileDetection()

  if (!user) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={`relative ${isAndroid ? "h-8 w-8 p-0" : "h-8 w-8"} rounded-full`}>
          <Avatar className={`${isAndroid ? "h-7 w-7" : "h-8 w-8"}`}>
            <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
            <AvatarFallback>{user.name[0]}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className={`${isAndroid ? "w-[calc(100vw-32px)] max-w-[300px]" : "w-56"}`}
        align="end"
        forceMount
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex items-center justify-start gap-2 p-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
              <AvatarFallback>{user.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none flex items-center gap-2">
                {user.name}
                {user.isVerified && <BadgeCheck className="h-4 w-4 text-blue-500" />}
              </p>
              <p className="text-xs leading-none text-muted-foreground">{user.collegeId}</p>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href={`/profile/${user.id}`} className="flex items-center">
              <User className="mr-2 h-4 w-4" />
              <span>My Profile</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/messages" className="flex items-center">
              <MessageSquare className="mr-2 h-4 w-4" />
              <span>Messages</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/settings" className="flex items-center">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/pages/create" className="flex items-center">
              <PlusCircle className="h-4 w-4 mr-2" />
              <span>Create Page</span>
            </Link>
          </DropdownMenuItem>
          {isAdmin && (
            <DropdownMenuItem asChild>
              <Link href="/teacher/verify" className="flex items-center">
                <Shield className="mr-2 h-4 w-4" />
                <span>Verify Resources</span>
              </Link>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout} className="flex items-center text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

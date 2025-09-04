"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { UserMinus, AlertTriangle, Users, Heart } from "lucide-react"

interface UnfollowConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  userName: string
  isLoading?: boolean
}

export function UnfollowConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  userName,
  isLoading = false,
}: UnfollowConfirmationDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/20">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <AlertDialogTitle className="text-lg">Unfollow {userName}?</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-left space-y-3">
            <p className="text-base">
              Are you sure you want to unfollow <strong className="text-foreground">{userName}</strong>?
            </p>

            <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200">You're no longer friends</p>
                  <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                    <li>• You won't see their posts in your feed</li>
                    <li>• They won't receive notifications from your activities</li>
                    <li>• Your connection will be removed</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Heart className="h-4 w-4" />
              <span>You can always follow them again later</span>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel onClick={onClose} disabled={isLoading} className="flex-1">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600 flex-1"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Unfollowing...
              </>
            ) : (
              <>
                <UserMinus className="h-4 w-4 mr-2" />
                Yes, Unfollow
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

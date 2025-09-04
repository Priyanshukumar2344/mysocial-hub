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
import { useRouter } from "next/navigation"
import { Lock, Mail, Phone } from "lucide-react"

interface LoginPromptDialogProps {
  isOpen: boolean
  onClose: () => void
  featureName: string
}

export function LoginPromptDialog({ isOpen, onClose, featureName }: LoginPromptDialogProps) {
  const router = useRouter()

  const handleLogin = () => {
    onClose()
    router.push("/login")
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Lock className="h-5 w-5 text-amber-500" />
            <AlertDialogTitle>Login Required</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-left space-y-3">
            <p>
              You need to login first to access <strong>{featureName}</strong> and other features.
            </p>
            <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-md">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">Need help getting access?</p>
              <div className="space-y-1 text-sm text-blue-700 dark:text-blue-300">
                <div className="flex items-center gap-2">
                  <Mail className="h-3 w-3" />
                  <span>Email: admin@aitd.edu</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-3 w-3" />
                  <span>Phone: +91 9470049202</span>
                </div>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleLogin} className="bg-blue-600 hover:bg-blue-700">
            Login Now
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

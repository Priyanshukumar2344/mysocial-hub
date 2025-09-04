"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "@/components/ui/use-toast"
import { Progress } from "@/components/ui/progress"
import { hashPassword, validatePassword } from "@/lib/auth"
import { saveUserPassword } from "@/lib/verification"
import { AlertCircle, CheckCircle, Lock } from "lucide-react"
import { db, type UserData } from "@/lib/db"

export default function VerifyPage({ params }: { params: { collegeId: string } }) {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [passwordValidation, setPasswordValidation] = useState({
    isValid: false,
    message: "",
  })

  // Add this function to check if the user exists in the uploaded data
  const verifyUserAgainstUploadedData = (collegeId: string): boolean => {
    // In a real implementation, this would check against the uploaded data
    // For now, we'll just return true since the feature is disabled
    return true
  }

  // Update the useEffect that checks the user to include verification against uploaded data
  useEffect(() => {
    const checkUser = async () => {
      const users = db.get("users") || []
      const user = users.find((u: UserData) => u.collegeId === params.collegeId)

      if (!user) {
        toast({
          title: "Error",
          description: "Invalid verification link. Please start from the login page.",
          variant: "destructive",
        })
        router.push("/login")
        return
      }

      // Check if the user exists in the uploaded data
      // This is currently disabled but would be enabled in the future
      const isVerifiedAgainstUpload = verifyUserAgainstUploadedData(params.collegeId)

      if (!isVerifiedAgainstUpload) {
        toast({
          title: "Error",
          description: "Your details could not be verified. Please contact the administrator.",
          variant: "destructive",
        })
        router.push("/login")
        return
      }

      if (user.password) {
        toast({
          title: "Already Set Up",
          description: "This account already has a password. Please login.",
        })
        router.push("/login")
      }
    }

    checkUser()
  }, [params.collegeId, router])

  useEffect(() => {
    // Calculate password strength
    let strength = 0
    if (password.length >= 8) strength += 20
    if (/[A-Z]/.test(password)) strength += 20
    if (/[a-z]/.test(password)) strength += 20
    if (/[0-9]/.test(password)) strength += 20
    if (/[!@#$%^&*]/.test(password)) strength += 20
    setPasswordStrength(strength)

    // Validate password
    setPasswordValidation(validatePassword(password))
  }, [password])

  const handleSetPassword = async () => {
    if (!passwordValidation.isValid) {
      toast({
        title: "Invalid Password",
        description: passwordValidation.message,
        variant: "destructive",
      })
      return
    }

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const hashedPassword = await hashPassword(password)
      const success = await saveUserPassword(params.collegeId, hashedPassword)

      if (success) {
        toast({
          title: "Success",
          description: "Password set successfully. You can now login.",
        })
        router.push("/login")
      } else {
        throw new Error("Failed to save password")
      }
    } catch (error) {
      console.error("Password setup error:", error)
      toast({
        title: "Error",
        description: "Failed to set password. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container max-w-md mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Set Your Password
          </CardTitle>
          <CardDescription>Create a strong password to secure your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Password strength</span>
                <span>{passwordStrength}%</span>
              </div>
              <Progress value={passwordStrength} className="h-2" />
            </div>
          </div>

          <Alert variant={passwordValidation.isValid ? "default" : "destructive"}>
            {passwordValidation.isValid ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            <AlertTitle>Password Requirements</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li className={password.length >= 8 ? "text-green-600" : ""}>At least 8 characters</li>
                <li className={/[A-Z]/.test(password) ? "text-green-600" : ""}>One uppercase letter</li>
                <li className={/[a-z]/.test(password) ? "text-green-600" : ""}>One lowercase letter</li>
                <li className={/[0-9]/.test(password) ? "text-green-600" : ""}>One number</li>
                <li className={/[!@#$%^&*]/.test(password) ? "text-green-600" : ""}>
                  One special character (!@#$%^&*)
                </li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
            />
          </div>

          {password && confirmPassword && password !== confirmPassword && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Passwords do not match</AlertTitle>
              <AlertDescription>Please ensure both passwords are identical</AlertDescription>
            </Alert>
          )}

          <Button
            className="w-full"
            onClick={handleSetPassword}
            disabled={isLoading || !passwordValidation.isValid || password !== confirmPassword}
          >
            {isLoading ? "Setting Password..." : "Set Password"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

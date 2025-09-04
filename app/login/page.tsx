"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import {
  Loader2,
  Eye,
  EyeOff,
  AlertCircle,
  Lock,
  HelpCircle,
  Shield,
  CheckCircle,
  X,
  Upload,
  ImageIcon,
  AlertTriangle,
} from "lucide-react"
import { createNotification } from "@/lib/notifications"
import { db, type UserData } from "@/lib/db"

interface ValidationErrors {
  collegeId?: string
  name?: string
  mobile?: string
  dateOfBirth?: string
}

interface SecurityState {
  loginAttempts: number
  lastAttempt: number
  isLocked: boolean
  lockUntil: number
}

export default function LoginPage() {
  // Login state
  const [collegeId, setCollegeId] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  // Security features
  const [securityState, setSecurityState] = useState<SecurityState>({
    loginAttempts: 0,
    lastAttempt: 0,
    isLocked: false,
    lockUntil: 0,
  })
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [showCaptcha, setShowCaptcha] = useState(false)
  const [captchaAnswer, setCaptchaAnswer] = useState("")
  const [captchaQuestion, setCaptchaQuestion] = useState({ question: "", answer: 0 })

  // First-time setup state
  const [setupData, setSetupData] = useState({
    collegeId: "",
    name: "",
    mobile: "",
    dateOfBirth: "",
  })
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [isVerifying, setIsVerifying] = useState(false)

  // Support state
  const [supportMessage, setSupportMessage] = useState("")
  const [supportEmail, setSupportEmail] = useState("")
  const [supportImages, setSupportImages] = useState<File[]>([])
  const [activeTab, setActiveTab] = useState("login")

  const { toast } = useToast()
  const router = useRouter()
  const { login } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Security: Generate captcha
  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1
    const num2 = Math.floor(Math.random() * 10) + 1
    const operators = ["+", "-", "*"]
    const operator = operators[Math.floor(Math.random() * operators.length)]

    let answer = 0
    let question = ""

    switch (operator) {
      case "+":
        answer = num1 + num2
        question = `${num1} + ${num2}`
        break
      case "-":
        answer = Math.max(num1, num2) - Math.min(num1, num2)
        question = `${Math.max(num1, num2)} - ${Math.min(num1, num2)}`
        break
      case "*":
        answer = num1 * num2
        question = `${num1} × ${num2}`
        break
    }

    setCaptchaQuestion({ question, answer })
  }

  // Security: Check password strength
  const checkPasswordStrength = (pwd: string) => {
    let strength = 0
    if (pwd.length >= 8) strength += 1
    if (/[a-z]/.test(pwd)) strength += 1
    if (/[A-Z]/.test(pwd)) strength += 1
    if (/[0-9]/.test(pwd)) strength += 1
    if (/[^A-Za-z0-9]/.test(pwd)) strength += 1
    setPasswordStrength(strength)
  }

  // Security: Check if account is locked
  const checkAccountLock = () => {
    const stored = localStorage.getItem(`security_${collegeId}`)
    if (stored) {
      const security: SecurityState = JSON.parse(stored)
      const now = Date.now()

      if (security.isLocked && now < security.lockUntil) {
        setSecurityState(security)
        return true
      } else if (security.isLocked && now >= security.lockUntil) {
        // Unlock account
        const newState = { ...security, isLocked: false, loginAttempts: 0 }
        setSecurityState(newState)
        localStorage.setItem(`security_${collegeId}`, JSON.stringify(newState))
        return false
      }

      setSecurityState(security)
    }
    return false
  }

  // Security: Handle failed login
  const handleFailedLogin = () => {
    const stored = localStorage.getItem(`security_${collegeId}`)
    const current = stored ? JSON.parse(stored) : { loginAttempts: 0, lastAttempt: 0, isLocked: false, lockUntil: 0 }

    const newAttempts = current.loginAttempts + 1
    const now = Date.now()

    const newState: SecurityState = {
      loginAttempts: newAttempts,
      lastAttempt: now,
      isLocked: false,
      lockUntil: 0,
    }

    // Lock account after 5 failed attempts
    if (newAttempts >= 5) {
      newState.isLocked = true
      newState.lockUntil = now + 15 * 60 * 1000 // 15 minutes
    } else if (newAttempts >= 3) {
      setShowCaptcha(true)
      generateCaptcha()
    }

    setSecurityState(newState)
    localStorage.setItem(`security_${collegeId}`, JSON.stringify(newState))
  }

  // Security: Reset login attempts on successful login
  const resetSecurityState = () => {
    const newState: SecurityState = {
      loginAttempts: 0,
      lastAttempt: 0,
      isLocked: false,
      lockUntil: 0,
    }
    setSecurityState(newState)
    localStorage.removeItem(`security_${collegeId}`)
  }

  useEffect(() => {
    if (collegeId) {
      checkAccountLock()
    }
  }, [collegeId])

  useEffect(() => {
    checkPasswordStrength(password)
  }, [password])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!collegeId || !password) {
      toast({
        title: "Error",
        description: "Please enter both College ID and Password.",
        variant: "destructive",
      })
      return
    }

    // Check if account is locked
    if (securityState.isLocked) {
      const remainingTime = Math.ceil((securityState.lockUntil - Date.now()) / 60000)
      toast({
        title: "Account Locked",
        description: `Too many failed attempts. Try again in ${remainingTime} minutes.`,
        variant: "destructive",
      })
      return
    }

    // Check captcha if required
    if (showCaptcha) {
      if (!captchaAnswer || Number.parseInt(captchaAnswer) !== captchaQuestion.answer) {
        toast({
          title: "Invalid Captcha",
          description: "Please solve the math problem correctly.",
          variant: "destructive",
        })
        generateCaptcha()
        setCaptchaAnswer("")
        return
      }
    }

    setIsLoading(true)
    try {
      await login(collegeId, password)
      resetSecurityState()

      // Remember me functionality
      if (rememberMe) {
        localStorage.setItem("rememberedUser", collegeId)
      }

      router.push("/")
    } catch (error) {
      handleFailedLogin()
      toast({
        title: "Login Failed",
        description: "Invalid credentials. Please check your College ID and password.",
        variant: "destructive",
      })

      if (showCaptcha) {
        generateCaptcha()
        setCaptchaAnswer("")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const validateSetupData = (data: typeof setupData): ValidationErrors => {
    const errors: ValidationErrors = {}
    const users = db.get("users") || []
    const registeredUser = users.find((u: UserData) => u.collegeId === data.collegeId)

    if (!registeredUser) {
      errors.collegeId = "College ID not found in registered users"
      return errors
    }

    // Validate each field against registered data
    if (data.name.trim().toLowerCase() !== registeredUser.name.trim().toLowerCase()) {
      errors.name = "Name does not match registered data"
    }

    if (data.mobile && registeredUser.mobile && data.mobile !== registeredUser.mobile) {
      errors.mobile = "Mobile number does not match registered data"
    }

    if (data.dateOfBirth && registeredUser.dateOfBirth && data.dateOfBirth !== registeredUser.dateOfBirth) {
      errors.dateOfBirth = "Date of birth does not match registered data"
    }

    return errors
  }

  const handleFirstTimeSetup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsVerifying(true)
    setValidationErrors({})

    try {
      // Validate required fields
      if (!setupData.collegeId || !setupData.name) {
        toast({
          title: "Missing Information",
          description: "College ID and Full Name are required",
          variant: "destructive",
        })
        setIsVerifying(false)
        return
      }

      // Validate college ID format
      if (!/^\d{13}$/.test(setupData.collegeId)) {
        setValidationErrors({ collegeId: "College ID must be exactly 13 digits" })
        setIsVerifying(false)
        return
      }

      // Validate against registered data
      const errors = validateSetupData(setupData)

      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors)
        toast({
          title: "Verification Failed",
          description: "Please check the highlighted fields and ensure they match your registered information.",
          variant: "destructive",
        })
        setIsVerifying(false)
        return
      }

      // All validations passed
      toast({
        title: "Verification Successful",
        description: "Your information has been verified. Redirecting to password setup...",
      })

      // Small delay to show success message
      setTimeout(() => {
        router.push(`/verify/${setupData.collegeId}`)
      }, 1500)
    } catch (error) {
      console.error("Setup error:", error)
      toast({
        title: "Verification Error",
        description: "An error occurred during verification. Please try again.",
        variant: "destructive",
      })
      setIsVerifying(false)
    }
  }

  const handleSupportImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const validFiles = files.filter((file) => {
      const isValidType = file.type.startsWith("image/")
      const isValidSize = file.size <= 5 * 1024 * 1024 // 5MB limit

      if (!isValidType) {
        toast({
          title: "Invalid File Type",
          description: "Please upload only image files.",
          variant: "destructive",
        })
        return false
      }

      if (!isValidSize) {
        toast({
          title: "File Too Large",
          description: "Please upload images smaller than 5MB.",
          variant: "destructive",
        })
        return false
      }

      return true
    })

    if (supportImages.length + validFiles.length > 3) {
      toast({
        title: "Too Many Files",
        description: "You can upload maximum 3 images.",
        variant: "destructive",
      })
      return
    }

    setSupportImages((prev) => [...prev, ...validFiles])
  }

  const removeSupportImage = (index: number) => {
    setSupportImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSupportRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supportMessage || !supportEmail) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(supportEmail)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      // In a real implementation, you would upload images to a server
      const imageInfo =
        supportImages.length > 0 ? `\n\nAttached Images: ${supportImages.map((img) => img.name).join(", ")}` : ""

      // Create support notification for admin
      createNotification(
        "admin",
        "support",
        "New Support Request",
        `From: ${supportEmail}\n\n${supportMessage}${imageInfo}`,
        undefined,
        "/admin/support",
      )

      toast({
        title: "Request Sent Successfully",
        description: "Your support request has been sent. We'll get back to you within 24 hours.",
      })

      // Clear form
      setSupportMessage("")
      setSupportEmail("")
      setSupportImages([])
    } catch (error) {
      toast({
        title: "Failed to Send Request",
        description: "Please try again or contact support directly.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 0:
      case 1:
        return "bg-red-500"
      case 2:
        return "bg-orange-500"
      case 3:
        return "bg-yellow-500"
      case 4:
        return "bg-blue-500"
      case 5:
        return "bg-green-500"
      default:
        return "bg-gray-300"
    }
  }

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 0:
      case 1:
        return "Very Weak"
      case 2:
        return "Weak"
      case 3:
        return "Fair"
      case 4:
        return "Good"
      case 5:
        return "Strong"
      default:
        return ""
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-2">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Secure Access</CardTitle>
          <CardDescription className="text-center">
            Sign in to access your account or set up your password
          </CardDescription>
        </CardHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="login" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Login
            </TabsTrigger>
            <TabsTrigger value="setup" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              First Time Setup
            </TabsTrigger>
            <TabsTrigger value="support" className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              Support
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLogin}>
              <CardContent className="space-y-4">
                {/* Security Alerts */}
                {securityState.isLocked && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Account Temporarily Locked</AlertTitle>
                    <AlertDescription>
                      Too many failed login attempts. Please try again in{" "}
                      {Math.ceil((securityState.lockUntil - Date.now()) / 60000)} minutes.
                    </AlertDescription>
                  </Alert>
                )}

                {securityState.loginAttempts > 0 && securityState.loginAttempts < 5 && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Security Warning</AlertTitle>
                    <AlertDescription>
                      {5 - securityState.loginAttempts} attempts remaining before account lock.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="collegeId">College ID</Label>
                  <Input
                    id="collegeId"
                    placeholder="Enter your 13-digit college ID"
                    value={collegeId}
                    onChange={(e) => setCollegeId(e.target.value)}
                    disabled={isLoading || securityState.isLocked}
                    maxLength={13}
                    pattern="[0-9]{13}"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading || securityState.isLocked}
                      className="pr-10"
                      placeholder="Enter your password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading || securityState.isLocked}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>

                  {/* Password Strength Indicator */}
                  {password && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Password Strength</span>
                        <span className={passwordStrength >= 4 ? "text-green-600" : "text-orange-600"}>
                          {getPasswordStrengthText()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${getPasswordStrengthColor()}`}
                          style={{ width: `${(passwordStrength / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Captcha */}
                {showCaptcha && (
                  <div className="space-y-2">
                    <Label htmlFor="captcha">Security Check</Label>
                    <div className="flex items-center space-x-2">
                      <div className="bg-gray-100 p-2 rounded border text-center font-mono">
                        {captchaQuestion.question} = ?
                      </div>
                      <Input
                        id="captcha"
                        type="number"
                        value={captchaAnswer}
                        onChange={(e) => setCaptchaAnswer(e.target.value)}
                        placeholder="Answer"
                        className="w-20"
                        disabled={isLoading}
                      />
                      <Button type="button" variant="outline" size="sm" onClick={generateCaptcha} disabled={isLoading}>
                        New
                      </Button>
                    </div>
                  </div>
                )}

                {/* Remember Me */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-gray-300"
                    disabled={isLoading || securityState.isLocked}
                  />
                  <Label htmlFor="rememberMe" className="text-sm">
                    Remember my College ID
                  </Label>
                </div>
              </CardContent>

              <CardFooter>
                <Button type="submit" className="w-full" disabled={isLoading || securityState.isLocked}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {securityState.isLocked ? "Account Locked" : "Sign In Securely"}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>

          <TabsContent value="setup">
            <form onSubmit={handleFirstTimeSetup}>
              <CardContent className="space-y-4">
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertTitle>Data Verification Required</AlertTitle>
                  <AlertDescription>
                    Please enter your information exactly as registered by your administrator. All fields must match our
                    records.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="setupCollegeId">College ID *</Label>
                  <Input
                    id="setupCollegeId"
                    placeholder="Enter your 13-digit college ID"
                    value={setupData.collegeId}
                    onChange={(e) => {
                      setSetupData({ ...setupData, collegeId: e.target.value })
                      if (validationErrors.collegeId) {
                        setValidationErrors({ ...validationErrors, collegeId: undefined })
                      }
                    }}
                    disabled={isVerifying}
                    maxLength={13}
                    pattern="[0-9]{13}"
                    className={validationErrors.collegeId ? "border-red-500" : ""}
                  />
                  {validationErrors.collegeId && (
                    <div className="flex items-center space-x-1 text-red-600 text-sm">
                      <AlertCircle className="h-4 w-4" />
                      <span>{validationErrors.collegeId}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    placeholder="Enter your full name as registered"
                    value={setupData.name}
                    onChange={(e) => {
                      setSetupData({ ...setupData, name: e.target.value })
                      if (validationErrors.name) {
                        setValidationErrors({ ...validationErrors, name: undefined })
                      }
                    }}
                    disabled={isVerifying}
                    className={validationErrors.name ? "border-red-500" : ""}
                  />
                  {validationErrors.name && (
                    <div className="flex items-center space-x-1 text-red-600 text-sm">
                      <AlertCircle className="h-4 w-4" />
                      <span>{validationErrors.name}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile Number</Label>
                  <Input
                    id="mobile"
                    placeholder="Enter your registered mobile number"
                    value={setupData.mobile}
                    onChange={(e) => {
                      setSetupData({ ...setupData, mobile: e.target.value })
                      if (validationErrors.mobile) {
                        setValidationErrors({ ...validationErrors, mobile: undefined })
                      }
                    }}
                    disabled={isVerifying}
                    maxLength={10}
                    pattern="[0-9]{10}"
                    className={validationErrors.mobile ? "border-red-500" : ""}
                  />
                  {validationErrors.mobile && (
                    <div className="flex items-center space-x-1 text-red-600 text-sm">
                      <AlertCircle className="h-4 w-4" />
                      <span>{validationErrors.mobile}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={setupData.dateOfBirth}
                    onChange={(e) => {
                      setSetupData({ ...setupData, dateOfBirth: e.target.value })
                      if (validationErrors.dateOfBirth) {
                        setValidationErrors({ ...validationErrors, dateOfBirth: undefined })
                      }
                    }}
                    disabled={isVerifying}
                    className={validationErrors.dateOfBirth ? "border-red-500" : ""}
                  />
                  {validationErrors.dateOfBirth && (
                    <div className="flex items-center space-x-1 text-red-600 text-sm">
                      <AlertCircle className="h-4 w-4" />
                      <span>{validationErrors.dateOfBirth}</span>
                    </div>
                  )}
                </div>
              </CardContent>

              <CardFooter className="flex flex-col space-y-4">
                <Button type="submit" className="w-full" disabled={isVerifying}>
                  {isVerifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isVerifying ? "Verifying Information..." : "Verify & Continue"}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  All information must exactly match your registration details
                </p>
              </CardFooter>
            </form>
          </TabsContent>

          <TabsContent value="support">
            <form onSubmit={handleSupportRequest}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="supportEmail">Your Email Address *</Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    placeholder="Enter your email address"
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supportMessage">Message *</Label>
                  <Textarea
                    id="supportMessage"
                    placeholder="Describe your issue or question in detail..."
                    value={supportMessage}
                    onChange={(e) => setSupportMessage(e.target.value)}
                    disabled={isLoading}
                    rows={4}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Attach Images (Optional)</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleSupportImageUpload}
                      accept="image/*"
                      multiple
                      className="hidden"
                      disabled={isLoading}
                    />

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isLoading || supportImages.length >= 3}
                      className="w-full"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Images (Max 3, 5MB each)
                    </Button>

                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      Supported formats: JPG, PNG, GIF. Max size: 5MB per image.
                    </p>
                  </div>

                  {/* Image Previews */}
                  {supportImages.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      {supportImages.map((image, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center border">
                            <div className="text-center p-2">
                              <ImageIcon className="h-6 w-6 mx-auto text-gray-400 mb-1" />
                              <p className="text-xs text-gray-600 truncate">{image.name}</p>
                              <p className="text-xs text-gray-400">{(image.size / 1024 / 1024).toFixed(1)}MB</p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeSupportImage(index)}
                            disabled={isLoading}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>

              <CardFooter className="flex flex-col space-y-4">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Send Support Request
                </Button>
                <div className="text-xs text-muted-foreground text-center space-y-1">
                  <p>Our support team typically responds within 24 hours</p>
                  <p>For urgent issues, please contact: support@college.edu</p>
                </div>
              </CardFooter>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}

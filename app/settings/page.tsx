"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/AuthContext"
import { Shield, Bell, Lock, User, Sun, Moon, Monitor } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { useTheme } from "next-themes"
import { db } from "@/lib/db"

type UserSettings = {
  notifications: {
    email: boolean
    push: boolean
    resourceUpdates: boolean
    mentorshipRequests: boolean
  }
  privacy: {
    showProfile: boolean
    showActivity: boolean
    allowMessages: boolean
  }
  theme: "light" | "dark" | "system"
}

export default function SettingsPage() {
  const { user, updateUser } = useAuth()
  const { setTheme, theme } = useTheme()
  const [settings, setSettings] = useState<UserSettings>({
    notifications: {
      email: true,
      push: true,
      resourceUpdates: true,
      mentorshipRequests: true,
    },
    privacy: {
      showProfile: true,
      showActivity: true,
      allowMessages: true,
    },
    theme: "system",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [userProfile, setUserProfile] = useState({
    name: user?.name || "",
    email: user?.email || "",
    branch: user?.branch || "",
  })

  // Load saved settings on mount
  useEffect(() => {
    const savedSettings = db.get(`settings_${user?.id}`)
    if (savedSettings) {
      setSettings(savedSettings)
      // Apply saved theme
      setTheme(savedSettings.theme)
    }
  }, [user?.id, setTheme])

  // Save settings whenever they change
  const saveSettings = async (newSettings: Partial<UserSettings>) => {
    if (!user) return

    setIsLoading(true)
    try {
      const updatedSettings = { ...settings, ...newSettings }
      db.set(`settings_${user.id}`, updatedSettings)
      setSettings(updatedSettings)

      // Apply theme change immediately
      if (newSettings.theme) {
        setTheme(newSettings.theme)
      }

      toast({
        title: "Settings Saved",
        description: "Your settings have been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle profile updates
  const handleProfileUpdate = async () => {
    setIsLoading(true)
    try {
      await updateUser(userProfile)
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>Manage your account settings and preferences.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="account">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="account">
                <User className="h-4 w-4 mr-2" />
                Account
              </TabsTrigger>
              <TabsTrigger value="appearance">
                <Sun className="h-4 w-4 mr-2" />
                Appearance
              </TabsTrigger>
              <TabsTrigger value="notifications">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="security">
                <Lock className="h-4 w-4 mr-2" />
                Security
              </TabsTrigger>
              {user?.isAdmin && (
                <TabsTrigger value="verification">
                  <Shield className="h-4 w-4 mr-2" />
                  Verification
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="account" className="space-y-4">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={userProfile.name}
                    onChange={(e) => setUserProfile((prev) => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={userProfile.email}
                    onChange={(e) => setUserProfile((prev) => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="branch">Branch</Label>
                  <Select
                    value={userProfile.branch}
                    onValueChange={(value) => setUserProfile((prev) => ({ ...prev, branch: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Computer Science">Computer Science</SelectItem>
                      <SelectItem value="Ai/Ml">Artificial intelligence</SelectItem>
                      <SelectItem value="IT">Information Technology</SelectItem>
                      <SelectItem value="Electronics">Electronics Engineering</SelectItem>
                      <SelectItem value="chemical">Chemical Engineering</SelectItem>
                      <SelectItem value="Mechanical">Mechanical</SelectItem>
                      <SelectItem value="BioTech">Bio Technology</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleProfileUpdate} disabled={isLoading}>
                  Save Profile
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="appearance" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Theme</h3>
                  <p className="text-sm text-muted-foreground">Select your preferred theme.</p>
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <Button
                      variant={settings.theme === "light" ? "default" : "outline"}
                      className="w-full"
                      onClick={() => saveSettings({ theme: "light" })}
                    >
                      <Sun className="h-4 w-4 mr-2" />
                      Light
                    </Button>
                    <Button
                      variant={settings.theme === "dark" ? "default" : "outline"}
                      className="w-full"
                      onClick={() => saveSettings({ theme: "dark" })}
                    >
                      <Moon className="h-4 w-4 mr-2" />
                      Dark
                    </Button>
                    <Button
                      variant={settings.theme === "system" ? "default" : "outline"}
                      className="w-full"
                      onClick={() => saveSettings({ theme: "system" })}
                    >
                      <Monitor className="h-4 w-4 mr-2" />
                      System
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive email notifications about your activity</p>
                  </div>
                  <Switch
                    checked={settings.notifications.email}
                    onCheckedChange={(checked) =>
                      saveSettings({
                        notifications: { ...settings.notifications, email: checked },
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive push notifications about your activity</p>
                  </div>
                  <Switch
                    checked={settings.notifications.push}
                    onCheckedChange={(checked) =>
                      saveSettings({
                        notifications: { ...settings.notifications, push: checked },
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Resource Updates</Label>
                    <p className="text-sm text-muted-foreground">Get notified about new resources in your branch</p>
                  </div>
                  <Switch
                    checked={settings.notifications.resourceUpdates}
                    onCheckedChange={(checked) =>
                      saveSettings({
                        notifications: { ...settings.notifications, resourceUpdates: checked },
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Mentorship Requests</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications about mentorship requests</p>
                  </div>
                  <Switch
                    checked={settings.notifications.mentorshipRequests}
                    onCheckedChange={(checked) =>
                      saveSettings({
                        notifications: { ...settings.notifications, mentorshipRequests: checked },
                      })
                    }
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="security" className="space-y-4">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input id="current-password" type="password" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type="password" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input id="confirm-password" type="password" />
                </div>
                <Button>Update Password</Button>
              </div>
            </TabsContent>

            {user?.isAdmin && (
              <TabsContent value="verification" className="space-y-4">
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Resource Verification Settings</CardTitle>
                      <CardDescription>Configure how you want to handle resource verifications</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Auto-approve Known Contributors</Label>
                          <p className="text-sm text-muted-foreground">
                            Automatically approve resources from trusted students
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Verification Notifications</Label>
                          <p className="text-sm text-muted-foreground">
                            Get notified when new resources need verification
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

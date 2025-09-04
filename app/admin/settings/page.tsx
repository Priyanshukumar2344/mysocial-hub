"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { AdminHallOfFameAccess } from "@/components/AdminHallOfFameAccess"
import { toast } from "@/components/ui/use-toast"
import { BellRing, Shield, Users, Settings, FileText, Server, Database, Lock } from "lucide-react"
import { db } from "@/lib/db"

export type PublicAccessSettings = {
  allowHomeAccess: boolean
  allowConnectionsAccess: boolean
  allowSocialAccess: boolean
  allowChatAccess: boolean
  allowMarketplaceAccess: boolean
  allowLibraryAccess: boolean
  allowProfileViewing: boolean
  showCollegeInfo: boolean
  requireLoginMessage: string
  contactInfo: {
    email: string
    phone: string
    showContact: boolean
  }
}

export default function AdminSettingsPage() {
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [marketingEmails, setMarketingEmails] = useState(false)
  const [securityUpdates, setSecurityUpdates] = useState(true)
  const [maintenanceMode, setMaintenanceMode] = useState(false)

  // Public access settings
  const [publicAccess, setPublicAccess] = useState<PublicAccessSettings>({
    allowHomeAccess: true,
    allowConnectionsAccess: true,
    allowSocialAccess: false,
    allowChatAccess: false,
    allowMarketplaceAccess: false,
    allowLibraryAccess: false,
    allowProfileViewing: false,
    showCollegeInfo: true,
    requireLoginMessage: "Login first to access these features or contact admin",
    contactInfo: {
      email: "admin@aitd.edu",
      phone: "+91 9470049202",
      showContact: true,
    },
  })

  // Load public access settings on component mount
  useEffect(() => {
    const savedSettings = db.get("publicAccessSettings")
    if (savedSettings) {
      setPublicAccess(savedSettings)
    } else {
      // Save default settings
      db.set("publicAccessSettings", publicAccess)
    }
  }, [])

  const handleSaveGeneral = () => {
    toast({
      title: "Settings saved",
      description: "Your general settings have been updated successfully.",
    })
  }

  const handleSaveNotifications = () => {
    toast({
      title: "Notification preferences saved",
      description: "Your notification settings have been updated successfully.",
    })
  }

  const handleSavePublicAccess = () => {
    db.set("publicAccessSettings", publicAccess)
    toast({
      title: "Public access settings saved",
      description: "Non-authenticated user access permissions have been updated.",
    })
  }

  const handleToggleMaintenance = () => {
    setMaintenanceMode(!maintenanceMode)
    toast({
      title: maintenanceMode ? "Maintenance mode disabled" : "Maintenance mode enabled",
      description: maintenanceMode
        ? "The site is now accessible to all users."
        : "The site is now in maintenance mode. Only administrators can access it.",
    })
  }

  const updatePublicAccessSetting = (key: keyof PublicAccessSettings, value: any) => {
    setPublicAccess((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const updateContactInfo = (key: keyof PublicAccessSettings["contactInfo"], value: any) => {
    setPublicAccess((prev) => ({
      ...prev,
      contactInfo: {
        ...prev.contactInfo,
        [key]: value,
      },
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Admin Settings</h2>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <BellRing className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="public-access" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Public Access
          </TabsTrigger>
          <TabsTrigger value="access" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Access Control
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Server className="h-4 w-4" />
            System
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure the general settings for the platform.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="siteName">Site Name</Label>
                <Input id="siteName" defaultValue="AITD Student Resource Hub" />
                <p className="text-sm text-muted-foreground">
                  This will be displayed in the browser tab and throughout the application.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="siteDescription">Site Description</Label>
                <Input
                  id="siteDescription"
                  defaultValue="A comprehensive platform for AITD students to access resources, events, and community features."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input id="contactEmail" type="email" defaultValue="admin@aitd.edu" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="supportPhone">Support Phone</Label>
                <Input id="supportPhone" defaultValue="+91 9470049202" />
              </div>

              <Button onClick={handleSaveGeneral}>Save Changes</Button>
            </CardContent>
          </Card>

          <AdminHallOfFameAccess />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure how and when notifications are sent.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="emailNotifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Switch
                    id="emailNotifications"
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="marketingEmails">Marketing Emails</Label>
                    <p className="text-sm text-muted-foreground">Receive marketing and promotional emails</p>
                  </div>
                  <Switch id="marketingEmails" checked={marketingEmails} onCheckedChange={setMarketingEmails} />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="securityUpdates">Security Updates</Label>
                    <p className="text-sm text-muted-foreground">Receive security and privacy policy updates</p>
                  </div>
                  <Switch id="securityUpdates" checked={securityUpdates} onCheckedChange={setSecurityUpdates} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notificationEmail">Notification Email</Label>
                <Input id="notificationEmail" type="email" defaultValue="admin@aitd.edu" />
              </div>

              <Button onClick={handleSaveNotifications}>Save Preferences</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="public-access" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Public Access Control</CardTitle>
              <CardDescription>Control what features and pages non-authenticated users can access.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Page Access Permissions</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 border rounded-md">
                    <div className="space-y-0.5">
                      <Label htmlFor="allowHomeAccess">Home Page</Label>
                      <p className="text-sm text-muted-foreground">Allow access to college information</p>
                    </div>
                    <Switch
                      id="allowHomeAccess"
                      checked={publicAccess.allowHomeAccess}
                      onCheckedChange={(checked) => updatePublicAccessSetting("allowHomeAccess", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-md">
                    <div className="space-y-0.5">
                      <Label htmlFor="allowConnectionsAccess">Connections Page</Label>
                      <p className="text-sm text-muted-foreground">Allow viewing connections (read-only)</p>
                    </div>
                    <Switch
                      id="allowConnectionsAccess"
                      checked={publicAccess.allowConnectionsAccess}
                      onCheckedChange={(checked) => updatePublicAccessSetting("allowConnectionsAccess", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-md">
                    <div className="space-y-0.5">
                      <Label htmlFor="allowSocialAccess">Social Features</Label>
                      <p className="text-sm text-muted-foreground">Allow access to social posts and interactions</p>
                    </div>
                    <Switch
                      id="allowSocialAccess"
                      checked={publicAccess.allowSocialAccess}
                      onCheckedChange={(checked) => updatePublicAccessSetting("allowSocialAccess", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-md">
                    <div className="space-y-0.5">
                      <Label htmlFor="allowChatAccess">Chat Features</Label>
                      <p className="text-sm text-muted-foreground">Allow access to messaging system</p>
                    </div>
                    <Switch
                      id="allowChatAccess"
                      checked={publicAccess.allowChatAccess}
                      onCheckedChange={(checked) => updatePublicAccessSetting("allowChatAccess", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-md">
                    <div className="space-y-0.5">
                      <Label htmlFor="allowMarketplaceAccess">Marketplace</Label>
                      <p className="text-sm text-muted-foreground">Allow access to buy/sell features</p>
                    </div>
                    <Switch
                      id="allowMarketplaceAccess"
                      checked={publicAccess.allowMarketplaceAccess}
                      onCheckedChange={(checked) => updatePublicAccessSetting("allowMarketplaceAccess", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-md">
                    <div className="space-y-0.5">
                      <Label htmlFor="allowLibraryAccess">Library Resources</Label>
                      <p className="text-sm text-muted-foreground">Allow access to library and resources</p>
                    </div>
                    <Switch
                      id="allowLibraryAccess"
                      checked={publicAccess.allowLibraryAccess}
                      onCheckedChange={(checked) => updatePublicAccessSetting("allowLibraryAccess", checked)}
                    />
                  </div>
                </div>

                <Separator />

                <h3 className="text-lg font-semibold">Additional Settings</h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="allowProfileViewing">Profile Viewing</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow non-authenticated users to view user profiles
                      </p>
                    </div>
                    <Switch
                      id="allowProfileViewing"
                      checked={publicAccess.allowProfileViewing}
                      onCheckedChange={(checked) => updatePublicAccessSetting("allowProfileViewing", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="showCollegeInfo">Show College Information</Label>
                      <p className="text-sm text-muted-foreground">Display college details on home page for visitors</p>
                    </div>
                    <Switch
                      id="showCollegeInfo"
                      checked={publicAccess.showCollegeInfo}
                      onCheckedChange={(checked) => updatePublicAccessSetting("showCollegeInfo", checked)}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Login Prompt Settings</h3>

                  <div className="space-y-2">
                    <Label htmlFor="requireLoginMessage">Login Required Message</Label>
                    <Input
                      id="requireLoginMessage"
                      value={publicAccess.requireLoginMessage}
                      onChange={(e) => updatePublicAccessSetting("requireLoginMessage", e.target.value)}
                      placeholder="Custom message for login requirement"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="showContact">Show Contact Information</Label>
                      <p className="text-sm text-muted-foreground">Display admin contact info in login prompts</p>
                    </div>
                    <Switch
                      id="showContact"
                      checked={publicAccess.contactInfo.showContact}
                      onCheckedChange={(checked) => updateContactInfo("showContact", checked)}
                    />
                  </div>

                  {publicAccess.contactInfo.showContact && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-md">
                      <div className="space-y-2">
                        <Label htmlFor="contactEmail">Contact Email</Label>
                        <Input
                          id="contactEmail"
                          type="email"
                          value={publicAccess.contactInfo.email}
                          onChange={(e) => updateContactInfo("email", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contactPhone">Contact Phone</Label>
                        <Input
                          id="contactPhone"
                          value={publicAccess.contactInfo.phone}
                          onChange={(e) => updateContactInfo("phone", e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <Button onClick={handleSavePublicAccess} className="w-full">
                  Save Public Access Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="access" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Access Control</CardTitle>
              <CardDescription>Manage user roles and permissions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>User Roles</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Students
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Can view resources, participate in forums, and submit assignments.
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Faculty
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Can upload resources, create assignments, and grade submissions.
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Database className="h-4 w-4" />
                        Moderators
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Can manage content, users, and comments across the platform.
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Administrators
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">Full access to all features and settings.</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="space-y-2">
                <Label>API Access</Label>
                <div className="flex items-center justify-between p-4 border rounded-md">
                  <div>
                    <h4 className="font-medium">API Keys</h4>
                    <p className="text-sm text-muted-foreground">Manage API keys for third-party integrations</p>
                  </div>
                  <Button variant="outline">Manage Keys</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>Configure system-wide settings and maintenance.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-md">
                <div>
                  <h4 className="font-medium">Maintenance Mode</h4>
                  <p className="text-sm text-muted-foreground">
                    Enable maintenance mode to temporarily restrict access
                  </p>
                </div>
                <Switch checked={maintenanceMode} onCheckedChange={handleToggleMaintenance} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="storageLimit">Storage Limit (GB)</Label>
                <Input id="storageLimit" type="number" defaultValue="500" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxUploadSize">Maximum Upload Size (MB)</Label>
                <Input id="maxUploadSize" type="number" defaultValue="50" />
              </div>

              <div className="space-y-2">
                <Label>Backup Settings</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-md">
                    <h4 className="font-medium">Automated Backups</h4>
                    <p className="text-sm text-muted-foreground mb-2">Configure automated system backups</p>
                    <Button variant="outline" size="sm">
                      Configure
                    </Button>
                  </div>
                  <div className="p-4 border rounded-md">
                    <h4 className="font-medium">Manual Backup</h4>
                    <p className="text-sm text-muted-foreground mb-2">Create a manual backup of the system</p>
                    <Button variant="outline" size="sm">
                      Create Backup
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { db } from "@/lib/db"
import type { PageCategory } from "@/lib/types"
// Add these imports at the top with the other imports
import { FileImage, Link2, Tag, Info } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"

export default function CreatePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Update the formData state to include more fields
  const [formData, setFormData] = useState({
    name: "",
    handle: "",
    description: "",
    category: "" as PageCategory,
    contactEmail: "",
    contactPhone: "",
    location: "",
    websiteUrl: "",
    tags: "",
    isPrivate: false,
    allowComments: true,
    allowSharing: true,
    coverPhotoUrl: "",
    profilePhotoUrl: "",
    mission: "",
    vision: "",
    foundedDate: "",
  })

  // Add this function to handle file uploads
  const [coverPhotoFile, setCoverPhotoFile] = useState<File | null>(null)
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null)
  const coverPhotoRef = useRef<HTMLInputElement>(null)
  const profilePhotoRef = useRef<HTMLInputElement>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Check if user is logged in
  useEffect(() => {
    setIsLoggedIn(!!user)

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to create a page",
        variant: "destructive",
      })
      router.push("/login")
    }
  }, [user, router])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "cover" | "profile") => {
    const file = e.target.files?.[0]
    if (file) {
      if (type === "cover") {
        setCoverPhotoFile(file)
        setFormData((prev) => ({
          ...prev,
          coverPhotoUrl: URL.createObjectURL(file),
        }))
      } else {
        setProfilePhotoFile(file)
        setFormData((prev) => ({
          ...prev,
          profilePhotoUrl: URL.createObjectURL(file),
        }))
      }
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleSelectChange = (value: string, name: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when user selects
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  // Update the validateForm function to include validation for new fields
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Page name is required"
    }

    if (!formData.handle.trim()) {
      newErrors.handle = "Page handle is required"
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.handle)) {
      newErrors.handle = "Handle can only contain letters, numbers, and underscores"
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required"
    }

    if (!formData.category) {
      newErrors.category = "Category is required"
    }

    if (
      formData.websiteUrl &&
      !/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(formData.websiteUrl)
    ) {
      newErrors.websiteUrl = "Please enter a valid URL"
    }

    if (formData.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      newErrors.contactEmail = "Please enter a valid email address"
    }

    if (formData.mission && formData.mission.length > 500) {
      newErrors.mission = "Mission statement should be less than 500 characters"
    }

    if (formData.vision && formData.vision.length > 500) {
      newErrors.vision = "Vision statement should be less than 500 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Check if handle is already taken
      const pages = db.get("pages") || []
      const handleExists = pages.some((page: any) => page.handle === formData.handle)

      if (handleExists) {
        setErrors((prev) => ({ ...prev, handle: "This handle is already taken" }))
        setIsSubmitting(false)
        return
      }

      // Create new page
      // Find the newPage object creation and update it:
      const newPage = {
        id: Date.now().toString(),
        name: formData.name,
        handle: formData.handle,
        description: formData.description,
        category: formData.category,
        createdBy: user?.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        followers: [],
        likes: [],
        media: [],
        featured: false,
        verified: false,
        contactEmail: formData.contactEmail || undefined,
        contactPhone: formData.contactPhone || undefined,
        location: formData.location || undefined,
        websiteUrl: formData.websiteUrl || undefined,
        tags: formData.tags ? formData.tags.split(",").map((tag) => tag.trim()) : [],
        totalViews: 0,
        coverPhoto: formData.coverPhotoUrl || undefined,
        profilePhoto: formData.profilePhotoUrl || undefined,
        isPrivate: formData.isPrivate,
        allowComments: formData.allowComments,
        allowSharing: formData.allowSharing,
        mission: formData.mission || undefined,
        vision: formData.vision || undefined,
        foundedDate: formData.foundedDate || undefined,
      }

      // Save page to database
      db.set("pages", [...pages, newPage])

      // Update user's pages list
      const users = db.get("users") || []
      const updatedUsers = users.map((u: any) => {
        if (u.id === user?.id) {
          return {
            ...u,
            pages: [...(u.pages || []), newPage.id],
          }
        }
        return u
      })
      db.set("users", updatedUsers)

      toast({
        title: "Success",
        description: "Your page has been created successfully!",
      })

      // Redirect to the new page
      router.push(`/pages/${formData.handle}`)
    } catch (error) {
      console.error("Error creating page:", error)
      toast({
        title: "Error",
        description: "Failed to create page. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Render a loading state or the form based on login status
  if (!isLoggedIn) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="flex items-center justify-center p-6">
            <p>Please log in to create a page...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Replace the form JSX with this enhanced version
  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Create a New Page</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Information</TabsTrigger>
              <TabsTrigger value="details">Details & Media</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <form onSubmit={handleSubmit} className="space-y-6 mt-6">
              <TabsContent value="basic" className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Page Name*</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter page name"
                      className={errors.name ? "border-red-500" : ""}
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <Label htmlFor="handle">Page Handle*</Label>
                    <div className="flex items-center">
                      <span className="bg-muted px-3 py-2 rounded-l-md border border-r-0 border-input">@</span>
                      <Input
                        id="handle"
                        name="handle"
                        value={formData.handle}
                        onChange={handleChange}
                        placeholder="unique_handle"
                        className={`rounded-l-none ${errors.handle ? "border-red-500" : ""}`}
                      />
                    </div>
                    {errors.handle && <p className="text-red-500 text-sm mt-1">{errors.handle}</p>}
                    <p className="text-sm text-muted-foreground mt-1">
                      This will be the URL of your page: example.com/pages/{formData.handle || "your_handle"}
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="description">Description*</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Describe what your page is about"
                      className={errors.description ? "border-red-500" : ""}
                      rows={4}
                    />
                    {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                  </div>

                  <div>
                    <Label htmlFor="category">Category*</Label>
                    <Select value={formData.category} onValueChange={(value) => handleSelectChange(value, "category")}>
                      <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Education">Education</SelectItem>
                        <SelectItem value="Technology">Technology</SelectItem>
                        <SelectItem value="Arts">Arts</SelectItem>
                        <SelectItem value="Science">Science</SelectItem>
                        <SelectItem value="Sports">Sports</SelectItem>
                        <SelectItem value="Entertainment">Entertainment</SelectItem>
                        <SelectItem value="Business">Business</SelectItem>
                        <SelectItem value="Health">Health</SelectItem>
                        <SelectItem value="Community">Community</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
                  </div>

                  <div>
                    <Label htmlFor="tags">Tags</Label>
                    <div className="flex items-center">
                      <Tag className="mr-2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="tags"
                        name="tags"
                        value={formData.tags}
                        onChange={handleChange}
                        placeholder="education, technology, science (comma separated)"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Add tags to help people discover your page</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="details" className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label>Cover Photo</Label>
                    <div className="mt-2">
                      {formData.coverPhotoUrl ? (
                        <div className="relative">
                          <img
                            src={formData.coverPhotoUrl || "/placeholder.svg"}
                            alt="Cover"
                            className="w-full h-40 object-cover rounded-md"
                          />
                          <Button
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() => {
                              setFormData((prev) => ({ ...prev, coverPhotoUrl: "" }))
                              setCoverPhotoFile(null)
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <div
                          className="border-2 border-dashed border-muted-foreground/25 rounded-md p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => coverPhotoRef.current?.click()}
                        >
                          <FileImage className="h-8 w-8 mx-auto text-muted-foreground" />
                          <p className="mt-2 text-sm text-muted-foreground">Click to upload a cover photo</p>
                        </div>
                      )}
                      <input
                        type="file"
                        ref={coverPhotoRef}
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, "cover")}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Profile Photo</Label>
                    <div className="mt-2">
                      {formData.profilePhotoUrl ? (
                        <div className="relative inline-block">
                          <img
                            src={formData.profilePhotoUrl || "/placeholder.svg"}
                            alt="Profile"
                            className="w-32 h-32 object-cover rounded-full"
                          />
                          <Button
                            variant="destructive"
                            size="sm"
                            className="absolute top-0 right-0"
                            onClick={() => {
                              setFormData((prev) => ({ ...prev, profilePhotoUrl: "" }))
                              setProfilePhotoFile(null)
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <div
                          className="border-2 border-dashed border-muted-foreground/25 rounded-full p-8 w-32 h-32 text-center cursor-pointer hover:bg-muted/50 transition-colors flex flex-col items-center justify-center"
                          onClick={() => profilePhotoRef.current?.click()}
                        >
                          <FileImage className="h-8 w-8 mx-auto text-muted-foreground" />
                          <p className="mt-2 text-xs text-muted-foreground">Upload profile photo</p>
                        </div>
                      )}
                      <input
                        type="file"
                        ref={profilePhotoRef}
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, "profile")}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contactEmail">Contact Email</Label>
                      <div className="flex items-center">
                        <Info className="mr-2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="contactEmail"
                          name="contactEmail"
                          type="email"
                          value={formData.contactEmail}
                          onChange={handleChange}
                          placeholder="contact@example.com"
                          className={errors.contactEmail ? "border-red-500" : ""}
                        />
                      </div>
                      {errors.contactEmail && <p className="text-red-500 text-sm mt-1">{errors.contactEmail}</p>}
                    </div>

                    <div>
                      <Label htmlFor="contactPhone">Contact Phone</Label>
                      <Input
                        id="contactPhone"
                        name="contactPhone"
                        value={formData.contactPhone}
                        onChange={handleChange}
                        placeholder="+1 (123) 456-7890"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="City, Country"
                    />
                  </div>

                  <div>
                    <Label htmlFor="websiteUrl">Website URL</Label>
                    <div className="flex items-center">
                      <Link2 className="mr-2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="websiteUrl"
                        name="websiteUrl"
                        value={formData.websiteUrl}
                        onChange={handleChange}
                        placeholder="https://example.com"
                        className={errors.websiteUrl ? "border-red-500" : ""}
                      />
                    </div>
                    {errors.websiteUrl && <p className="text-red-500 text-sm mt-1">{errors.websiteUrl}</p>}
                  </div>

                  <div>
                    <Label htmlFor="mission">Mission Statement</Label>
                    <Textarea
                      id="mission"
                      name="mission"
                      value={formData.mission}
                      onChange={handleChange}
                      placeholder="What is the mission of your page?"
                      className={errors.mission ? "border-red-500" : ""}
                      rows={3}
                    />
                    {errors.mission && <p className="text-red-500 text-sm mt-1">{errors.mission}</p>}
                  </div>

                  <div>
                    <Label htmlFor="vision">Vision Statement</Label>
                    <Textarea
                      id="vision"
                      name="vision"
                      value={formData.vision}
                      onChange={handleChange}
                      placeholder="What is the vision of your page?"
                      className={errors.vision ? "border-red-500" : ""}
                      rows={3}
                    />
                    {errors.vision && <p className="text-red-500 text-sm mt-1">{errors.vision}</p>}
                  </div>

                  <div>
                    <Label htmlFor="foundedDate">Founded Date</Label>
                    <Input
                      id="foundedDate"
                      name="foundedDate"
                      type="date"
                      value={formData.foundedDate}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="isPrivate">Private Page</Label>
                      <p className="text-sm text-muted-foreground">Only approved followers can see your page content</p>
                    </div>
                    <Switch
                      id="isPrivate"
                      checked={formData.isPrivate}
                      onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isPrivate: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="allowComments">Allow Comments</Label>
                      <p className="text-sm text-muted-foreground">Let visitors comment on your page posts</p>
                    </div>
                    <Switch
                      id="allowComments"
                      checked={formData.allowComments}
                      onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, allowComments: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="allowSharing">Allow Sharing</Label>
                      <p className="text-sm text-muted-foreground">Let visitors share your page content</p>
                    </div>
                    <Switch
                      id="allowSharing"
                      checked={formData.allowSharing}
                      onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, allowSharing: checked }))}
                    />
                  </div>
                </div>
              </TabsContent>

              <div className="flex justify-end pt-4 border-t">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Page"}
                </Button>
              </div>
            </form>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

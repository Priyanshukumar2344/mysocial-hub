"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Users, Lock, Globe, UserCheck, ImageIcon, Plus, X } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

type GroupPrivacy = "public" | "private" | "invite-only"

export function GroupCreation() {
  const { toast } = useToast()
  const [groupName, setGroupName] = useState("")
  const [groupDescription, setGroupDescription] = useState("")
  const [groupPrivacy, setGroupPrivacy] = useState<GroupPrivacy>("public")
  const [groupTags, setGroupTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [groupImage, setGroupImage] = useState<string | null>(null)

  const handleAddTag = () => {
    if (tagInput.trim() && !groupTags.includes(tagInput.trim())) {
      setGroupTags([...groupTags, tagInput.trim()])
      setTagInput("")
    }
  }

  const handleRemoveTag = (tag: string) => {
    setGroupTags(groupTags.filter((t) => t !== tag))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const reader = new FileReader()
      reader.onload = (event) => {
        setGroupImage(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCreateGroup = () => {
    if (!groupName.trim()) {
      toast({
        title: "Group name required",
        description: "Please enter a name for your group",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Group created",
      description: "Your group has been created successfully!",
    })

    // Reset form
    setGroupName("")
    setGroupDescription("")
    setGroupPrivacy("public")
    setGroupTags([])
    setGroupImage(null)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Create a New Group
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="group-name">Group Name</Label>
          <Input
            id="group-name"
            placeholder="Enter group name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="group-description">Description</Label>
          <Textarea
            id="group-description"
            placeholder="What is this group about?"
            value={groupDescription}
            onChange={(e) => setGroupDescription(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Group Image</Label>
          <div className="flex items-center gap-4">
            <div className="relative w-24 h-24 border rounded-md flex items-center justify-center overflow-hidden">
              {groupImage ? (
                <img src={groupImage || "/placeholder.svg"} alt="Group" className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            <Button variant="outline" onClick={() => document.getElementById("group-image")?.click()}>
              Upload Image
            </Button>
            <input type="file" id="group-image" className="hidden" accept="image/*" onChange={handleImageUpload} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="group-privacy">Privacy</Label>
          <Select value={groupPrivacy} onValueChange={(value) => setGroupPrivacy(value as GroupPrivacy)}>
            <SelectTrigger>
              <SelectValue placeholder="Select privacy level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">
                <div className="flex items-center">
                  <Globe className="h-4 w-4 mr-2" />
                  <span>Public</span>
                </div>
              </SelectItem>
              <SelectItem value="private">
                <div className="flex items-center">
                  <Lock className="h-4 w-4 mr-2" />
                  <span>Private</span>
                </div>
              </SelectItem>
              <SelectItem value="invite-only">
                <div className="flex items-center">
                  <UserCheck className="h-4 w-4 mr-2" />
                  <span>Invite Only</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="group-tags">Tags</Label>
          <div className="flex gap-2">
            <Input
              id="group-tags"
              placeholder="Add tags"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleAddTag()
                }
              }}
            />
            <Button type="button" onClick={handleAddTag}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {groupTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {groupTags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <Button variant="ghost" size="icon" className="h-4 w-4 p-0 ml-1" onClick={() => handleRemoveTag(tag)}>
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleCreateGroup} className="w-full">
          Create Group
        </Button>
      </CardFooter>
    </Card>
  )
}

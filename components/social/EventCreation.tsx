"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, MapPin, ImageIcon, Plus, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"

export function EventCreation() {
  const { toast } = useToast()
  const [eventName, setEventName] = useState("")
  const [eventDescription, setEventDescription] = useState("")
  const [eventDate, setEventDate] = useState("")
  const [eventTime, setEventTime] = useState("")
  const [eventLocation, setEventLocation] = useState("")
  const [eventType, setEventType] = useState("in-person")
  const [eventImage, setEventImage] = useState<string | null>(null)
  const [eventTags, setEventTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")

  const handleAddTag = () => {
    if (tagInput.trim() && !eventTags.includes(tagInput.trim())) {
      setEventTags([...eventTags, tagInput.trim()])
      setTagInput("")
    }
  }

  const handleRemoveTag = (tag: string) => {
    setEventTags(eventTags.filter((t) => t !== tag))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const reader = new FileReader()
      reader.onload = (event) => {
        setEventImage(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCreateEvent = () => {
    if (!eventName.trim() || !eventDate || !eventTime || !eventLocation) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Event created",
      description: "Your event has been created successfully!",
    })

    // Reset form
    setEventName("")
    setEventDescription("")
    setEventDate("")
    setEventTime("")
    setEventLocation("")
    setEventType("in-person")
    setEventTags([])
    setEventImage(null)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Create an Event
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="event-name">Event Name</Label>
          <Input
            id="event-name"
            placeholder="Enter event name"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="event-description">Description</Label>
          <Textarea
            id="event-description"
            placeholder="What is this event about?"
            value={eventDescription}
            onChange={(e) => setEventDescription(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="event-date">Date</Label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground">
                <Calendar className="h-4 w-4" />
              </span>
              <Input
                id="event-date"
                type="date"
                className="rounded-l-none"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="event-time">Time</Label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground">
                <Clock className="h-4 w-4" />
              </span>
              <Input
                id="event-time"
                type="time"
                className="rounded-l-none"
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="event-location">Location</Label>
          <div className="flex">
            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground">
              <MapPin className="h-4 w-4" />
            </span>
            <Input
              id="event-location"
              placeholder="Enter location or meeting link"
              className="rounded-l-none"
              value={eventLocation}
              onChange={(e) => setEventLocation(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="event-type">Event Type</Label>
          <Select value={eventType} onValueChange={setEventType}>
            <SelectTrigger>
              <SelectValue placeholder="Select event type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="in-person">In-Person</SelectItem>
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="hybrid">Hybrid</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Event Image</Label>
          <div className="flex items-center gap-4">
            <div className="relative w-24 h-24 border rounded-md flex items-center justify-center overflow-hidden">
              {eventImage ? (
                <img src={eventImage || "/placeholder.svg"} alt="Event" className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            <Button variant="outline" onClick={() => document.getElementById("event-image")?.click()}>
              Upload Image
            </Button>
            <input type="file" id="event-image" className="hidden" accept="image/*" onChange={handleImageUpload} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="event-tags">Tags</Label>
          <div className="flex gap-2">
            <Input
              id="event-tags"
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
          {eventTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {eventTags.map((tag) => (
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
        <Button onClick={handleCreateEvent} className="w-full">
          Create Event
        </Button>
      </CardFooter>
    </Card>
  )
}

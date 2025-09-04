"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Send, ImageIcon, Paperclip, MoreVertical } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import type { Chat, UserData } from "@/lib/types"
import { db } from "@/lib/db"

const formatTimeAgo = (date: Date) => {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return "just now"
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`
  return `${Math.floor(diffInSeconds / 2592000)} months ago`
}

interface ChatWindowProps {
  chat: Chat
  onSendMessage: (content: string, type: "text" | "image" | "file", fileUrl?: string) => void
}

export function ChatWindow({ chat, onSendMessage }: ChatWindowProps) {
  const { user } = useAuth()
  const [message, setMessage] = useState("")
  const [participants, setParticipants] = useState<UserData[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load participants
    const users = db.get("users") || []
    const chatParticipants = users.filter((u: UserData) => chat.participants.includes(u.id))
    setParticipants(chatParticipants)
  }, [chat.participants])

  useEffect(() => {
    // Scroll to bottom on new messages
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, []) //Corrected dependency

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return
    onSendMessage(message, "text")
    setMessage("")
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // In a real app, upload to storage and get URL
      const fileUrl = URL.createObjectURL(file)
      onSendMessage(file.name, file.type.startsWith("image/") ? "image" : "file", fileUrl)
    }
  }

  return (
    <Card className="flex flex-col h-[600px]">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {chat.type === "group" ? (
              <Avatar>
                <AvatarImage src={chat.groupAvatar || "/placeholder.svg"} />
                <AvatarFallback>{chat.groupName?.[0]}</AvatarFallback>
              </Avatar>
            ) : (
              <Avatar>
                <AvatarImage
                  src={participants.find((p) => p.id !== user?.id)?.avatar || "/placeholder.svg"}
                  alt={participants.find((p) => p.id !== user?.id)?.name}
                />
                <AvatarFallback>{participants.find((p) => p.id !== user?.id)?.name[0]}</AvatarFallback>
              </Avatar>
            )}
            <div>
              <CardTitle>
                {chat.type === "group" ? chat.groupName : participants.find((p) => p.id !== user?.id)?.name}
              </CardTitle>
              {chat.type === "group" && (
                <p className="text-sm text-muted-foreground">{participants.length} participants</p>
              )}
            </div>
          </div>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        <div className="space-y-4">
          {chat.messages.map((message, index) => (
            <div key={message.id} className={`flex ${message.senderId === user?.id ? "justify-end" : "justify-start"}`}>
              <div
                className={`flex items-start gap-2 max-w-[70%] ${
                  message.senderId === user?.id ? "flex-row-reverse" : ""
                }`}
              >
                {message.senderId !== user?.id && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={participants.find((p) => p.id === message.senderId)?.avatar || "/placeholder.svg"}
                    />
                    <AvatarFallback>{participants.find((p) => p.id === message.senderId)?.name[0]}</AvatarFallback>
                  </Avatar>
                )}
                <div>
                  {message.type === "text" && (
                    <div
                      className={`rounded-lg p-3 ${
                        message.senderId === user?.id ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}
                    >
                      {message.content}
                    </div>
                  )}
                  {message.type === "image" && (
                    <img
                      src={message.fileUrl || "/placeholder.svg"}
                      alt="Shared image"
                      className="rounded-lg max-w-sm"
                    />
                  )}
                  {message.type === "file" && (
                    <a
                      href={message.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-lg bg-muted p-3"
                    >
                      <Paperclip className="h-4 w-4" />
                      {message.content}
                    </a>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">{formatTimeAgo(new Date(message.timestamp))}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      <CardContent className="border-t p-4">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
          />
          <input type="file" className="hidden" id="file-upload" onChange={handleFileUpload} />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => document.getElementById("file-upload")?.click()}
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
          <Button type="submit" size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

"use client"

import { useState, useRef, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, X, CornerDownRight } from "lucide-react"
import type { ChatMessage, UserData } from "@/lib/types"

interface MessageThreadProps {
  parentMessage: ChatMessage
  threadMessages: ChatMessage[]
  sender: UserData
  currentUser: UserData
  onSendReply: (content: string, parentId: string) => void
  onClose: () => void
}

const formatTimeAgo = (date: Date) => {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return "just now"
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`
  return `${Math.floor(diffInSeconds / 2592000)} months ago`
}

export function MessageThread({
  parentMessage,
  threadMessages,
  sender,
  currentUser,
  onSendReply,
  onClose,
}: MessageThreadProps) {
  const [replyText, setReplyText] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Scroll to bottom when thread messages change
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [threadMessages])

  const handleSendReply = () => {
    if (!replyText.trim()) return
    onSendReply(replyText, parentMessage.id)
    setReplyText("")
  }

  return (
    <div className="flex flex-col h-full border-l bg-background">
      <div className="p-3 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CornerDownRight className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">Thread</span>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close thread">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Original message */}
      <div className="p-3 border-b bg-muted/30">
        <div className="flex items-start gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={sender.avatar || "/placeholder.svg"} alt={sender.name} />
            <AvatarFallback>{sender.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{sender.name}</p>
              <p className="text-xs text-muted-foreground">{formatTimeAgo(new Date(parentMessage.timestamp))}</p>
            </div>
            <div className="mt-1">
              {parentMessage.type === "text" ? (
                <p>{parentMessage.content}</p>
              ) : parentMessage.type === "image" ? (
                <div>
                  <img
                    src={parentMessage.fileUrl || "/placeholder.svg"}
                    alt="Shared image"
                    className="max-h-40 rounded object-cover"
                  />
                </div>
              ) : (
                <p>File: {parentMessage.content}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Thread replies */}
      <div className="flex-1 overflow-auto p-3" ref={scrollRef}>
        {threadMessages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <p>No replies yet</p>
            <p className="text-sm">Be the first to reply to this message</p>
          </div>
        ) : (
          <div className="space-y-4">
            {threadMessages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.senderId === currentUser.id ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`flex items-start gap-2 max-w-[80%] ${message.senderId === currentUser.id ? "flex-row-reverse" : ""}`}
                >
                  {message.senderId !== currentUser.id && (
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={sender.avatar || "/placeholder.svg"} alt={sender.name} />
                      <AvatarFallback>{sender.name[0]}</AvatarFallback>
                    </Avatar>
                  )}
                  <div>
                    <div
                      className={`rounded-lg p-2 ${message.senderId === currentUser.id ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                    >
                      {message.content}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{formatTimeAgo(new Date(message.timestamp))}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reply input */}
      <div className="p-3 border-t">
        <div className="flex gap-2">
          <Input
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Reply to thread..."
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSendReply()
              }
            }}
          />
          <Button onClick={handleSendReply} disabled={!replyText.trim()} size="icon" aria-label="Send reply">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

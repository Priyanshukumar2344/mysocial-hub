"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Plus } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import type { Chat, UserData } from "@/lib/types"
import { db } from "@/lib/db"

const formatTimeAgo = (date: Date) => {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return "just now"
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d`
  return `${Math.floor(diffInSeconds / 2592000)}mo`
}

interface ChatListProps {
  chats: Chat[]
  selectedChat?: Chat
  onSelectChat: (chat: Chat) => void
  onNewChat: () => void
}

export function ChatList({ chats, selectedChat, onSelectChat, onNewChat }: ChatListProps) {
  const { user } = useAuth()
  const [search, setSearch] = useState("")
  const [users, setUsers] = useState<Record<string, UserData>>({})

  useEffect(() => {
    // Load all users for displaying names and avatars
    const allUsers = db.get("users") || []
    const usersMap = allUsers.reduce((acc: any, user: { id: any }) => ({ ...acc, [user.id]: user }), {})
    setUsers(usersMap)
  }, [])

  const filteredChats = chats.filter((chat) => {
    if (!search) return true
    if (chat.type === "group" && chat.groupName?.toLowerCase().includes(search.toLowerCase())) {
      return true
    }
    return chat.participants.some((id) => users[id]?.name.toLowerCase().includes(search.toLowerCase()))
  })

  const getChatName = (chat: Chat) => {
    if (chat.type === "group") return chat.groupName
    const otherParticipant = chat.participants.find((id) => id !== user?.id)
    return users[otherParticipant || ""]?.name || "Unknown User"
  }

  const getChatAvatar = (chat: Chat) => {
    if (chat.type === "group") return chat.groupAvatar
    const otherParticipant = chat.participants.find((id) => id !== user?.id)
    return users[otherParticipant || ""]?.avatar
  }

  return (
    <div className="w-80 border-r">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search chats..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button size="icon" onClick={onNewChat}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <ScrollArea className="h-[calc(100vh-10rem)]">
        {filteredChats.map((chat) => (
          <Button
            key={chat.id}
            variant="ghost"
            className={`w-full justify-start px-4 py-2 ${selectedChat?.id === chat.id ? "bg-muted" : ""}`}
            onClick={() => onSelectChat(chat)}
          >
            <div className="flex items-center gap-3 w-full">
              <Avatar>
                <AvatarImage src={getChatAvatar(chat) || "/placeholder.svg"} />
                <AvatarFallback>{getChatName(chat)[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <p className="font-medium">{getChatName(chat)}</p>
                {chat.lastMessage && (
                  <p className="text-sm text-muted-foreground truncate">{chat.lastMessage.content}</p>
                )}
              </div>
              {chat.lastMessage && (
                <p className="text-xs text-muted-foreground">{formatTimeAgo(new Date(chat.lastMessage.timestamp))}</p>
              )}
            </div>
          </Button>
        ))}
      </ScrollArea>
    </div>
  )
}

"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/AuthContext"
import { db } from "@/lib/db"
import { ProfileChat } from "@/components/ProfileChat"
import { Search, Users, UserPlus, MessageSquare, Filter, Settings, ArrowLeft } from "lucide-react"
import type { Chat, UserData } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { useMobileDetection } from "@/hooks/use-mobile-detection"

// Import the useSectionUpdate hook
import { useSectionUpdate } from "@/hooks/use-section-update"

export default function MessagesPage() {
  const { user } = useAuth()
  const [activeChat, setActiveChat] = useState<string | null>(null)
  const [activeChatType, setActiveChatType] = useState<"existing" | "new">("existing")
  const [chats, setChats] = useState<Chat[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [displayUsers, setDisplayUsers] = useState<UserData[]>([])
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [showSidebar, setShowSidebar] = useState(true)
  const [activeFilter, setActiveFilter] = useState<"all" | "unread" | "direct" | "groups">("all")
  const isMobile = useMobileDetection()
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Inside the component, after the messages state is defined
  // Add this line to use the hook
  useSectionUpdate("chat", [messages.length])

  // Load chats
  useEffect(() => {
    if (!user) return

    const allChats = db.get("chats") || []
    const userChats = allChats.filter((chat: Chat) => chat.participants.includes(user.id))

    // Sort by most recent message
    userChats.sort((a: Chat, b: Chat) => {
      const aDate = a.updatedAt || a.createdAt
      const bDate = b.updatedAt || b.createdAt
      return new Date(bDate).getTime() - new Date(aDate).getTime()
    })

    setChats(userChats)

    // If there's at least one chat, select it
    if (userChats.length > 0 && !activeChat) {
      setActiveChat(userChats[0].id)
    }
  }, [user, activeChat])

  // Load users for search
  useEffect(() => {
    if (!searchQuery.trim() || !user) {
      setDisplayUsers([])
      return
    }

    const allUsers = db.get("users") || []
    const filteredUsers = allUsers
      .filter(
        (u: UserData) =>
          u.id !== user.id &&
          (u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.collegeId.includes(searchQuery)),
      )
      .slice(0, 5) // Limit results

    setDisplayUsers(filteredUsers)
  }, [searchQuery, user])

  const getChatName = (chat: Chat): string => {
    if (chat.type === "group") return chat.groupName || "Group Chat"

    const otherParticipantId = chat.participants.find((id) => id !== user?.id)
    if (!otherParticipantId) return "Chat"

    const users = db.get("users") || []
    const otherUser = users.find((u: UserData) => u.id === otherParticipantId)

    return otherUser?.name || "User"
  }

  const getChatAvatar = (chat: Chat): string => {
    if (chat.type === "group") return chat.groupAvatar || "/placeholder.svg"

    const otherParticipantId = chat.participants.find((id) => id !== user?.id)
    if (!otherParticipantId) return "/placeholder.svg"

    const users = db.get("users") || []
    const otherUser = users.find((u: UserData) => u.id === otherParticipantId)

    return otherUser?.avatar || "/placeholder.svg"
  }

  const formatLastActivity = (chat: Chat): string => {
    const date = chat.updatedAt || chat.createdAt
    const now = new Date()
    const messageDate = new Date(date)

    // Today
    if (messageDate.toDateString() === now.toDateString()) {
      return messageDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }

    // This week
    const daysDiff = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60 * 60 * 24))
    if (daysDiff < 7) {
      return messageDate.toLocaleDateString([], { weekday: "short" })
    }

    // Older
    return messageDate.toLocaleDateString([], { month: "short", day: "numeric" })
  }

  const formatLastMessage = (chat: Chat): string => {
    if (!chat.lastMessage) return "No messages yet"

    if (chat.lastMessage.type === "text") {
      return chat.lastMessage.content.length > 30
        ? chat.lastMessage.content.substring(0, 30) + "..."
        : chat.lastMessage.content
    }

    if (chat.lastMessage.type === "image") {
      return "📷 Image"
    }

    if (chat.lastMessage.type === "video") {
      return "🎥 Video"
    }

    if (chat.lastMessage.type === "audio") {
      return "🎤 Voice message"
    }

    return "📎 File: " + chat.lastMessage.content
  }

  const handleUserSelect = (selectedUserId: string) => {
    // Find if chat already exists
    const existingChat = chats.find(
      (chat) =>
        chat.type === "direct" &&
        chat.participants.includes(selectedUserId) &&
        chat.participants.includes(user?.id || ""),
    )

    if (existingChat) {
      setActiveChat(existingChat.id)
      setActiveChatType("existing")
      setSearchQuery("")
      setDisplayUsers([])
      if (isMobile) setShowSidebar(false)
    } else {
      const users = db.get("users") || []
      const selectedUserObj = users.find((u) => u.id === selectedUserId)
      if (selectedUserObj) {
        setSelectedUser(selectedUserObj)
        setActiveChatType("new")
        setSearchQuery("")
        setDisplayUsers([])
        if (isMobile) setShowSidebar(false)
      }
    }
  }

  const filteredChats = chats.filter((chat) => {
    if (activeFilter === "all") return true
    if (activeFilter === "unread") {
      // In a real app, you would check for unread messages
      return Math.random() > 0.7 // Simulate some chats having unread messages
    }
    if (activeFilter === "direct") return chat.type === "direct"
    if (activeFilter === "groups") return chat.type === "group"
    return true
  })

  const focusSearch = () => {
    searchInputRef.current?.focus()
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8 max-w-6xl">
        <div className="text-center py-20">
          <p>Please log in to access messages</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-4 md:py-8 max-w-6xl">
      <Card className="h-[calc(100vh-8rem)]">
        <div className="flex h-full">
          {/* Sidebar */}
          {(showSidebar || !isMobile) && (
            <div className="w-full md:w-80 border-r h-full flex flex-col">
              <CardHeader className="p-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Messages
                  </CardTitle>
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="ghost" className="h-8 w-8" onClick={focusSearch} aria-label="Search">
                      <Search className="h-4 w-4" />
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="ghost" className="h-8 w-8" aria-label="Filter chats">
                          <Filter className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setActiveFilter("all")}>
                          All chats
                          {activeFilter === "all" && <Badge className="ml-2 bg-primary">Active</Badge>}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setActiveFilter("unread")}>
                          Unread
                          {activeFilter === "unread" && <Badge className="ml-2 bg-primary">Active</Badge>}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setActiveFilter("direct")}>
                          Direct messages
                          {activeFilter === "direct" && <Badge className="ml-2 bg-primary">Active</Badge>}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setActiveFilter("groups")}>
                          Groups
                          {activeFilter === "groups" && <Badge className="ml-2 bg-primary">Active</Badge>}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Settings className="h-4 w-4 mr-2" />
                          Chat settings
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => {
                        setActiveChatType("new")
                        setSelectedUser(null)
                      }}
                      aria-label="New chat"
                    >
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="mt-4 relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users or messages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                    ref={searchInputRef}
                  />

                  {/* Search Results */}
                  {displayUsers.length > 0 && (
                    <div className="absolute top-full left-0 right-0 z-10 bg-background border rounded-lg mt-1 shadow-lg">
                      {displayUsers.map((user) => (
                        <div
                          key={user.id}
                          className="p-2 hover:bg-accent flex items-center gap-2 cursor-pointer"
                          onClick={() => handleUserSelect(user.id)}
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                            <AvatarFallback>{user.name[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.collegeId}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardHeader>

              <Tabs defaultValue="chats" className="flex-1 flex flex-col">
                <TabsList className="grid grid-cols-2 mx-4">
                  <TabsTrigger value="chats" className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Chats
                  </TabsTrigger>
                  <TabsTrigger value="users" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Contacts
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="chats" className="flex-1 overflow-hidden m-0 p-0">
                  <ScrollArea className="h-full">
                    <div className="space-y-1 p-2">
                      {filteredChats.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground">
                          <p>No conversations yet</p>
                          <p className="text-sm">Search for users to start chatting</p>
                        </div>
                      ) : (
                        filteredChats.map((chat) => (
                          <div
                            key={chat.id}
                            className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-accent ${
                              activeChat === chat.id ? "bg-accent" : ""
                            }`}
                            onClick={() => {
                              setActiveChat(chat.id)
                              setActiveChatType("existing")
                              setSelectedUser(null)
                              if (isMobile) setShowSidebar(false)
                            }}
                          >
                            <div className="relative">
                              <Avatar>
                                <AvatarImage src={getChatAvatar(chat)} alt={getChatName(chat)} />
                                <AvatarFallback>{getChatName(chat)[0]}</AvatarFallback>
                              </Avatar>

                              {/* Online indicator - randomly show some users as online */}
                              {Math.random() > 0.7 && (
                                <span
                                  className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background"
                                  aria-label="Online"
                                />
                              )}

                              {/* Unread indicator - randomly show some chats with unread messages */}
                              {Math.random() > 0.7 && chat.id !== activeChat && (
                                <span
                                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center border-2 border-background"
                                  aria-label="Unread messages"
                                >
                                  {Math.floor(Math.random() * 5) + 1}
                                </span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-center">
                                <p className="font-medium truncate">{getChatName(chat)}</p>
                                <span className="text-xs text-muted-foreground">{formatLastActivity(chat)}</span>
                              </div>
                              <p className="text-sm text-muted-foreground truncate">{formatLastMessage(chat)}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="users" className="flex-1 overflow-hidden m-0 p-0">
                  <ScrollArea className="h-full">
                    <div className="p-4">
                      <div className="mb-4">
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Online Contacts</h3>
                        <div className="space-y-2">
                          {/* Simulate some online contacts */}
                          {Array.from({ length: 3 }).map((_, i) => {
                            const users = db.get("users") || []
                            const randomUser = users[Math.floor(Math.random() * users.length)]
                            if (!randomUser) return null

                            return (
                              <div
                                key={i}
                                className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent cursor-pointer"
                                onClick={() => handleUserSelect(randomUser.id)}
                              >
                                <div className="relative">
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={randomUser.avatar || "/placeholder.svg"} alt={randomUser.name} />
                                    <AvatarFallback>{randomUser.name[0]}</AvatarFallback>
                                  </Avatar>
                                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium">{randomUser.name}</p>
                                  <p className="text-xs text-green-500">Online</p>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">All Contacts</h3>
                        <div className="space-y-2">
                          {/* Show all users as contacts */}
                          {(db.get("users") || [])
                            .filter((u: UserData) => u.id !== user?.id)
                            .map((contact: UserData) => (
                              <div
                                key={contact.id}
                                className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent cursor-pointer"
                                onClick={() => handleUserSelect(contact.id)}
                              >
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={contact.avatar || "/placeholder.svg"} alt={contact.name} />
                                  <AvatarFallback>{contact.name[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-sm font-medium">{contact.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {contact.branch || contact.department}
                                  </p>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {/* Chat Area */}
          <div className="flex-1 flex flex-col h-full">
            {isMobile && !showSidebar && (
              <div className="p-2 border-b">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSidebar(true)}
                  className="flex items-center gap-1"
                  aria-label="Back to chat list"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back</span>
                </Button>
              </div>
            )}

            {activeChatType === "existing" && activeChat ? (
              <CardContent className="p-0 flex-1">
                {chats.map(
                  (chat) =>
                    chat.id === activeChat && (
                      <div key={chat.id} className="h-full">
                        <ProfileChat recipientId={chat.participants.find((id) => id !== user.id) || ""} />
                      </div>
                    ),
                )}
              </CardContent>
            ) : activeChatType === "new" ? (
              <CardContent className="p-0 flex-1">
                {selectedUser ? (
                  <ProfileChat recipientId={selectedUser.id} />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8">
                    <UserPlus className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">New Conversation</h3>
                    <p className="text-muted-foreground mt-2">Search for a user to start a new conversation</p>
                  </div>
                )}
              </CardContent>
            ) : (
              <CardContent className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">Select a chat</h3>
                  <p className="text-muted-foreground mt-2">Choose a conversation or start a new one</p>
                </div>
              </CardContent>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}

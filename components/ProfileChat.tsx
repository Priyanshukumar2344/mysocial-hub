"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, ImageIcon, Mic, MoreVertical, Reply, Video, FileText, Phone, Play } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { db } from "@/lib/db"
import { createNotification } from "@/lib/notifications"
import type { UserData, ChatMessage, Chat } from "@/lib/types"
import { MessageThread } from "@/components/chat/MessageThread"
import { MediaPreview } from "@/components/chat/MediaPreview"
import { TypingIndicator } from "@/components/chat/TypingIndicator"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Drawer, DrawerContent } from "@/components/ui/drawer"
import { useMobileDetection } from "@/hooks/use-mobile-detection"

type ProfileChatProps = {
  recipientId: string
}

// Define a new type for threaded messages
type ThreadedMessage = ChatMessage & {
  replies?: ChatMessage[]
}

export function ProfileChat({ recipientId }: ProfileChatProps) {
  const { user } = useAuth()
  const [messageText, setMessageText] = useState("")
  const [chatHistory, setChatHistory] = useState<ThreadedMessage[]>([])
  const [recipient, setRecipient] = useState<UserData | null>(null)
  const [chat, setChat] = useState<Chat | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const isMobile = useMobileDetection()

  // New states for enhanced features
  const [isTyping, setIsTyping] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState<ThreadedMessage | null>(null)
  const [mediaPreview, setMediaPreview] = useState<{
    type: "image" | "video" | "audio"
    url: string
    filename: string
  } | null>(null)
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [isOnline, setIsOnline] = useState(false)
  const [lastSeen, setLastSeen] = useState<string | null>(null)

  // Simulate real-time updates
  useEffect(() => {
    // Simulate recipient coming online
    const onlineTimeout = setTimeout(() => {
      setIsOnline(true)
    }, 3000)

    // Simulate typing indicators occasionally
    const typingInterval = setInterval(() => {
      if (Math.random() > 0.7 && !isTyping) {
        setIsTyping(true)
        setTimeout(() => setIsTyping(false), 3000)
      }
    }, 10000)

    return () => {
      clearTimeout(onlineTimeout)
      clearInterval(typingInterval)
    }
  }, [isTyping])

  useEffect(() => {
    if (!user) return

    // Get recipient info
    const users = db.get("users") || []
    const foundRecipient = users.find((u: UserData) => u.id === recipientId)
    if (foundRecipient) {
      setRecipient(foundRecipient)
      // Simulate last seen time
      setLastSeen(new Date(Date.now() - Math.floor(Math.random() * 24 * 60 * 60 * 1000)).toISOString())
    }

    // Find existing chat or create a new one
    const chats = db.get("chats") || []

    const existingChat = chats.find(
      (c: Chat) => c.type === "direct" && c.participants.includes(user.id) && c.participants.includes(recipientId),
    )

    if (existingChat) {
      setChat(existingChat)

      // Process messages to include thread replies
      const processedMessages = processThreadedMessages(existingChat.messages)
      setChatHistory(processedMessages)

      // Mark messages as read
      setUnreadCount(0)
    } else {
      // Create new chat
      const newChat: Chat = {
        id: Date.now().toString(),
        type: "direct",
        participants: [user.id, recipientId],
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      // Save to storage
      db.set("chats", [...chats, newChat])

      // Update users' chat lists
      users.forEach((u: { id: string; chats: any[] }) => {
        if (u.id === user.id || u.id === recipientId) {
          u.chats = [...(u.chats || []), newChat.id]
        }
      })
      db.set("users", users)

      setChat(newChat)
    }
  }, [user, recipientId])

  // Process messages to group threaded replies
  const processThreadedMessages = (messages: ChatMessage[]): ThreadedMessage[] => {
    const messageMap: Record<string, ThreadedMessage> = {}
    const rootMessages: ThreadedMessage[] = []

    // First pass: create all message objects
    messages.forEach((msg) => {
      messageMap[msg.id] = { ...msg, replies: [] }
    })

    // Second pass: organize into threads
    messages.forEach((msg) => {
      if (msg.parentId && messageMap[msg.parentId]) {
        // This is a reply, add to parent's replies
        messageMap[msg.parentId].replies?.push(messageMap[msg.id])
      } else {
        // This is a root message
        rootMessages.push(messageMap[msg.id])
      }
    })

    return rootMessages
  }

  useEffect(() => {
    // Scroll to bottom on new messages
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [chatHistory])

  // Handle typing indicator
  const handleTyping = () => {
    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout)
    }

    // Set a new timeout
    const timeout = setTimeout(() => {
      // Typing stopped
      console.log("User stopped typing")
      // In a real app, you would emit a "stopped typing" event
    }, 1000)

    setTypingTimeout(timeout)

    // In a real app, you would emit a "typing" event here
    console.log("User is typing...")
  }

  const sendMessage = useCallback(() => {
    if (!messageText.trim() || !user || !chat) return

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: user.id,
      content: messageText,
      timestamp: new Date().toISOString(),
      type: "text",
    }

    // Update local state with threaded structure
    setChatHistory((prev) => {
      const newHistory = [...prev, { ...newMessage, replies: [] }]
      return newHistory
    })

    // Update chat in storage
    const chats = db.get("chats") || []
    const updatedChats = chats.map((c: Chat) => {
      if (c.id === chat.id) {
        return {
          ...c,
          messages: [...c.messages, newMessage],
          lastMessage: newMessage,
          updatedAt: new Date().toISOString(),
        }
      }
      return c
    })
    db.set("chats", updatedChats)

    // Create notification for recipient
    createNotification(
      recipientId,
      "message",
      `New message from ${user.name}`,
      messageText,
      { id: user.id, name: user.name, avatar: user.avatar },
      `/chat`,
    )

    // Clear input and typing indicator
    setMessageText("")
    if (typingTimeout) {
      clearTimeout(typingTimeout)
    }

    // Simulate reply for demo purposes
    simulateReply()
  }, [messageText, user, chat, recipientId, typingTimeout])

  // Simulate a reply from the recipient
  const simulateReply = () => {
    if (!user || !chat || !recipient) return

    // Show typing indicator
    setTimeout(() => {
      setIsTyping(true)

      // Send reply after a delay
      setTimeout(() => {
        setIsTyping(false)

        const replies = [
          "That sounds great!",
          "I'll check and get back to you.",
          "When do you need this by?",
          "Can we meet to discuss this further?",
          "Thanks for letting me know!",
          "I'm not sure I understand. Could you explain more?",
          "Perfect! That works for me.",
          "Sorry for the late reply. Been busy with assignments.",
        ]

        const newReply: ChatMessage = {
          id: Date.now().toString(),
          senderId: recipient.id,
          content: replies[Math.floor(Math.random() * replies.length)],
          timestamp: new Date().toISOString(),
          type: "text",
        }

        // Update local state with threaded structure
        setChatHistory((prev) => {
          const newHistory = [...prev, { ...newReply, replies: [] }]
          return newHistory
        })

        // Update chat in storage
        const chats = db.get("chats") || []
        const updatedChats = chats.map((c: Chat) => {
          if (c.id === chat.id) {
            return {
              ...c,
              messages: [...c.messages, newReply],
              lastMessage: newReply,
              updatedAt: new Date().toISOString(),
            }
          }
          return c
        })
        db.set("chats", updatedChats)

        // Increment unread count
        setUnreadCount((prev) => prev + 1)
      }, 2000)
    }, 1000)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "file") => {
    const file = e.target.files?.[0]
    if (!file || !user || !chat) return

    const isImage = type === "image" || file.type.startsWith("image/")

    // In a real app, upload to storage service
    const fileUrl = URL.createObjectURL(file)

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: user.id,
      content: file.name,
      timestamp: new Date().toISOString(),
      type: isImage ? "image" : "file",
      fileUrl,
    }

    // Update local state with threaded structure
    setChatHistory((prev) => {
      const newHistory = [...prev, { ...newMessage, replies: [] }]
      return newHistory
    })

    // Update chat in storage
    const chats = db.get("chats") || []
    const updatedChats = chats.map((c: Chat) => {
      if (c.id === chat.id) {
        return {
          ...c,
          messages: [...c.messages, newMessage],
          lastMessage: newMessage,
          updatedAt: new Date().toISOString(),
        }
      }
      return c
    })
    db.set("chats", updatedChats)

    // Create notification for recipient
    createNotification(
      recipientId,
      "message",
      `New ${isImage ? "image" : "file"} from ${user.name}`,
      file.name,
      { id: user.id, name: user.name, avatar: user.avatar },
      `/chat`,
    )

    // Clear the input
    e.target.value = ""

    // Simulate reply
    simulateReply()
  }

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user || !chat) return

    // In a real app, upload to storage service
    const fileUrl = URL.createObjectURL(file)

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: user.id,
      content: file.name,
      timestamp: new Date().toISOString(),
      type: "video",
      fileUrl,
    }

    // Update local state with threaded structure
    setChatHistory((prev) => {
      const newHistory = [...prev, { ...newMessage, replies: [] }]
      return newHistory
    })

    // Update chat in storage
    const chats = db.get("chats") || []
    const updatedChats = chats.map((c: Chat) => {
      if (c.id === chat.id) {
        return {
          ...c,
          messages: [...c.messages, newMessage],
          lastMessage: newMessage,
          updatedAt: new Date().toISOString(),
        }
      }
      return c
    })
    db.set("chats", updatedChats)

    // Create notification for recipient
    createNotification(
      recipientId,
      "message",
      `New video from ${user.name}`,
      file.name,
      { id: user.id, name: user.name, avatar: user.avatar },
      `/chat`,
    )

    // Clear the input
    e.target.value = ""

    // Simulate reply
    simulateReply()
  }

  const handleReplyToMessage = (parentId: string, content: string) => {
    if (!content.trim() || !user || !chat) return

    const newReply: ChatMessage = {
      id: Date.now().toString(),
      senderId: user.id,
      content: content,
      timestamp: new Date().toISOString(),
      type: "text",
      parentId: parentId, // Reference to parent message
    }

    // Update local state with threaded structure
    setChatHistory((prev) => {
      return prev.map((msg) => {
        if (msg.id === parentId) {
          // Add reply to this message
          return {
            ...msg,
            replies: [...(msg.replies || []), newReply],
          }
        }
        return msg
      })
    })

    // Update chat in storage
    const chats = db.get("chats") || []
    const updatedChats = chats.map((c: Chat) => {
      if (c.id === chat.id) {
        return {
          ...c,
          messages: [...c.messages, newReply],
          lastMessage: newReply,
          updatedAt: new Date().toISOString(),
        }
      }
      return c
    })
    db.set("chats", updatedChats)

    // Create notification for recipient
    createNotification(
      recipientId,
      "message",
      `New reply from ${user.name}`,
      content,
      { id: user.id, name: user.name, avatar: user.avatar },
      `/chat`,
    )
  }

  const startRecording = () => {
    // In a real app, this would use the MediaRecorder API
    setIsRecording(true)

    // Simulate recording for 3 seconds
    setTimeout(() => {
      setIsRecording(false)

      // Simulate sending an audio message
      if (!user || !chat) return

      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        senderId: user.id,
        content: "Voice message",
        timestamp: new Date().toISOString(),
        type: "audio",
        fileUrl: "/placeholder.svg", // In a real app, this would be the audio URL
      }

      // Update local state with threaded structure
      setChatHistory((prev) => {
        const newHistory = [...prev, { ...newMessage, replies: [] }]
        return newHistory
      })

      // Update chat in storage
      const chats = db.get("chats") || []
      const updatedChats = chats.map((c: Chat) => {
        if (c.id === chat.id) {
          return {
            ...c,
            messages: [...c.messages, newMessage],
            lastMessage: newMessage,
            updatedAt: new Date().toISOString(),
          }
        }
        return c
      })
      db.set("chats", updatedChats)

      // Create notification for recipient
      createNotification(
        recipientId,
        "message",
        `New voice message from ${user.name}`,
        "Voice message",
        { id: user.id, name: user.name, avatar: user.avatar },
        `/chat`,
      )

      // Simulate reply
      simulateReply()
    }, 3000)
  }

  if (!recipient) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex flex-col h-[450px] md:h-[600px]">
      <div className="flex items-center justify-between gap-2 pb-2 border-b mb-2 p-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Avatar>
              <AvatarImage src={recipient.avatar || "/placeholder.svg"} alt={recipient.name} />
              <AvatarFallback>{recipient.name[0]}</AvatarFallback>
            </Avatar>
            {isOnline && (
              <span
                className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background"
                aria-label="Online"
              />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium">{recipient.name}</p>
              {recipient.verification === "blue" && (
                <Badge variant="secondary" className="text-xs bg-blue-500 text-white">
                  Verified
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {isOnline ? (
                <span className="text-green-500">Online</span>
              ) : lastSeen ? (
                `Last seen ${new Date(lastSeen).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
              ) : (
                `${recipient.year} • ${recipient.branch}`
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full" aria-label="Voice call">
                  <Phone className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Voice call</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full" aria-label="Video call">
                  <Video className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Video call</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full" aria-label="More options">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View profile</DropdownMenuItem>
              <DropdownMenuItem>Search in conversation</DropdownMenuItem>
              <DropdownMenuItem>Mute notifications</DropdownMenuItem>
              <DropdownMenuItem>Block user</DropdownMenuItem>
              <DropdownMenuItem>Clear chat</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
          {chatHistory.length === 0 ? (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Reply className="h-8 w-8 text-primary" />
                </div>
                <p>No messages yet</p>
                <p className="text-sm">Start the conversation with {recipient.name}!</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 p-4">
              {chatHistory.map((message) => (
                <div key={message.id}>
                  <div className={`flex ${message.senderId === user?.id ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`group relative max-w-[80%] ${
                        message.senderId === user?.id ? "flex flex-row-reverse items-end gap-2" : "flex items-end gap-2"
                      }`}
                    >
                      {message.senderId !== user?.id && (
                        <Avatar className="h-8 w-8 mb-1">
                          <AvatarImage src={recipient.avatar || "/placeholder.svg"} alt={recipient.name} />
                          <AvatarFallback>{recipient.name[0]}</AvatarFallback>
                        </Avatar>
                      )}

                      <div>
                        <div
                          className={`relative rounded-lg px-3 py-2 ${
                            message.senderId === user?.id ? "bg-primary text-primary-foreground" : "bg-muted"
                          }`}
                        >
                          {message.type === "text" ? (
                            <p>{message.content}</p>
                          ) : message.type === "image" ? (
                            <div>
                              <img
                                src={message.fileUrl || "/placeholder.svg"}
                                alt="Shared image"
                                className="max-h-60 rounded object-cover cursor-pointer"
                                onClick={() =>
                                  setMediaPreview({
                                    type: "image",
                                    url: message.fileUrl || "/placeholder.svg",
                                    filename: message.content,
                                  })
                                }
                              />
                              <p className="text-xs mt-1 opacity-70">{message.content}</p>
                            </div>
                          ) : message.type === "video" ? (
                            <div
                              className="relative cursor-pointer"
                              onClick={() =>
                                setMediaPreview({
                                  type: "video",
                                  url: message.fileUrl || "/placeholder.svg",
                                  filename: message.content,
                                })
                              }
                            >
                              <div className="bg-black/50 rounded overflow-hidden">
                                <div className="aspect-video flex items-center justify-center">
                                  <Play className="h-10 w-10 text-white" />
                                </div>
                              </div>
                              <p className="text-xs mt-1 opacity-70">{message.content}</p>
                            </div>
                          ) : message.type === "audio" ? (
                            <div className="flex items-center gap-2 min-w-[200px]">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() =>
                                  setMediaPreview({
                                    type: "audio",
                                    url: message.fileUrl || "/placeholder.svg",
                                    filename: "Voice message",
                                  })
                                }
                              >
                                <Play className="h-4 w-4" />
                              </Button>
                              <div className="flex-1">
                                <div className="h-1 bg-primary/30 rounded-full">
                                  <div className="h-full w-0 bg-primary rounded-full"></div>
                                </div>
                                <p className="text-xs mt-1">0:00</p>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              <a
                                href={message.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline underline-offset-2"
                              >
                                {message.content}
                              </a>
                            </div>
                          )}

                          {/* Reply button - visible on hover */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className={`absolute -top-3 ${
                              message.senderId === user?.id ? "-left-3" : "-right-3"
                            } h-6 w-6 rounded-full bg-background shadow opacity-0 group-hover:opacity-100 transition-opacity`}
                            onClick={() => setSelectedMessage(message)}
                            aria-label="Reply to message"
                          >
                            <Reply className="h-3 w-3" />
                          </Button>
                        </div>

                        <div
                          className={`flex items-center gap-1 mt-1 ${message.senderId === user?.id ? "justify-end" : "justify-start"}`}
                        >
                          <p className="text-xs text-muted-foreground">
                            {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>

                          {/* Thread indicator */}
                          {message.replies && message.replies.length > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 px-1 text-xs text-muted-foreground hover:text-foreground"
                              onClick={() => setSelectedMessage(message)}
                            >
                              {message.replies.length} {message.replies.length === 1 ? "reply" : "replies"}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-end gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={recipient.avatar || "/placeholder.svg"} alt={recipient.name} />
                      <AvatarFallback>{recipient.name[0]}</AvatarFallback>
                    </Avatar>
                    <TypingIndicator />
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Thread panel - for desktop */}
        {!isMobile && selectedMessage && (
          <div className="w-80 border-l">
            <MessageThread
              parentMessage={selectedMessage}
              threadMessages={selectedMessage.replies || []}
              sender={selectedMessage.senderId === user?.id ? user : recipient}
              currentUser={user as unknown as UserData}
              onSendReply={(content) => handleReplyToMessage(selectedMessage.id, content)}
              onClose={() => setSelectedMessage(null)}
            />
          </div>
        )}
      </div>

      <div className="pt-2 border-t mt-auto p-3">
        <div className="flex gap-2">
          {/* Media buttons */}
          <div className="flex gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    type="button"
                    aria-label="Send image"
                  >
                    <ImageIcon className="h-4 w-4" />
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, "image")}
                      accept="image/*"
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Send image</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => videoInputRef.current?.click()}
                    type="button"
                    aria-label="Send video"
                  >
                    <Video className="h-4 w-4" />
                    <input
                      type="file"
                      ref={videoInputRef}
                      className="hidden"
                      onChange={handleVideoUpload}
                      accept="video/*"
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Send video</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={isRecording ? "destructive" : "outline"}
                    size="icon"
                    onClick={startRecording}
                    type="button"
                    aria-label={isRecording ? "Recording..." : "Record voice message"}
                  >
                    <Mic className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{isRecording ? "Recording..." : "Record voice message"}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <Input
            placeholder="Type a message..."
            value={messageText}
            onChange={(e) => {
              setMessageText(e.target.value)
              handleTyping()
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                sendMessage()
              }
            }}
            className="flex-1"
            aria-label="Message input"
          />

          <Button onClick={sendMessage} disabled={!messageText.trim()} type="button" aria-label="Send message">
            <Send className="h-4 w-4 mr-2" />
            <span className="sr-only md:not-sr-only md:inline-block">Send</span>
          </Button>
        </div>
      </div>

      {/* Media preview modal */}
      {mediaPreview && (
        <MediaPreview
          type={mediaPreview.type}
          url={mediaPreview.url}
          filename={mediaPreview.filename}
          onClose={() => setMediaPreview(null)}
        />
      )}

      {/* Thread panel - for mobile */}
      {isMobile && selectedMessage && (
        <Drawer open={!!selectedMessage} onOpenChange={(open) => !open && setSelectedMessage(null)}>
          <DrawerContent className="h-[90vh]">
            <MessageThread
              parentMessage={selectedMessage}
              threadMessages={selectedMessage.replies || []}
              sender={selectedMessage.senderId === user?.id ? user : recipient}
              currentUser={user as unknown as UserData}
              onSendReply={(content) => handleReplyToMessage(selectedMessage.id, content)}
              onClose={() => setSelectedMessage(null)}
            />
          </DrawerContent>
        </Drawer>
      )}
    </div>
  )
}

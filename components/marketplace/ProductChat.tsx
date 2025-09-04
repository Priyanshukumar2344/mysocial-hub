"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, ImageIcon, Paperclip } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

interface ProductChatProps {
  product: {
    id: string
    title: string
    seller: {
      id: string
      name: string
      verification: "none" | "blue" | "golden"
    }
  }
  onClose: () => void
}

type Message = {
  id: string
  senderId: string
  senderName: string
  senderAvatar?: string
  content: string
  timestamp: Date
  isUser: boolean
}

export function ProductChat({ product, onClose }: ProductChatProps) {
  const { user } = useAuth()
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      senderId: product.seller.id,
      senderName: product.seller.name,
      content: `Hello! I'm interested in answering any questions you have about "${product.title}".`,
      timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
      isUser: false,
    },
  ])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const handleSendMessage = () => {
    if (!message.trim()) return

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: user?.id || "user",
      senderName: user?.name || "You",
      senderAvatar: user?.avatar,
      content: message,
      timestamp: new Date(),
      isUser: true,
    }

    setMessages([...messages, newMessage])
    setMessage("")

    // Simulate seller response after a delay
    setTimeout(() => {
      const responses = [
        "Yes, it's still available!",
        "I can meet on campus tomorrow if that works for you.",
        "The condition is exactly as described in the listing.",
        "I've used it for one semester only.",
        "Yes, the price is negotiable. What's your offer?",
      ]

      const sellerResponse: Message = {
        id: Date.now().toString(),
        senderId: product.seller.id,
        senderName: product.seller.name,
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date(),
        isUser: false,
      }

      setMessages((prev) => [...prev, sellerResponse])
    }, 1000)
  }

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <div className="flex flex-col h-[60vh]">
      <div className="flex items-center gap-2 pb-4 mb-4 border-b">
        <Avatar>
          <AvatarImage src={`/placeholder.svg?text=${product.seller.name[0]}`} />
          <AvatarFallback>{product.seller.name[0]}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{product.seller.name}</p>
          <p className="text-sm text-muted-foreground">Seller of {product.title}</p>
        </div>
      </div>

      <ScrollArea className="flex-1 pr-4">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.isUser ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  msg.isUser ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}
              >
                <p>{msg.content}</p>
                <p className="text-xs mt-1 opacity-70">
                  {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <div className="mt-4 flex gap-2">
        <Button variant="outline" size="icon" type="button">
          <ImageIcon className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" type="button">
          <Paperclip className="h-4 w-4" />
        </Button>
        <Input
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSendMessage()
            }
          }}
          className="flex-1"
        />
        <Button size="icon" onClick={handleSendMessage} disabled={!message.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

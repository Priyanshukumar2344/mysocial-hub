"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bot, X } from "lucide-react"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { useAuth } from "@/contexts/AuthContext"

type Message = {
  role: "user" | "assistant"
  content: string
}

export function AIMentorChatBubble() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()

  useEffect(() => {
    if (isOpen && user) {
      setMessages([{ role: "assistant", content: `Welcome, ${user.name}! Ask me anything. I am GayanGuru AI.` }])
    }
  }, [isOpen, user])

  useEffect(() => {
    // Auto-scroll to latest message
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage: Message = { role: "user", content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      let prompt = input
      if (
        input.toLowerCase().includes("who created you") ||
        input.toLowerCase().includes("who's the owner of this website")
      ) {
        prompt =
          "I am GayanGuru AI, created by Mr. Priyanshu Kumar, CEO of this AITD social hub. Visit my profile: [https://aitd-student-hub.com/profile/2301661530047]"
      } else {
        prompt = `You are GayanGuru AI, an AI assistant. Answer this question: ${input}`
      }

      const { text } = await generateText({
        model: openai("gpt-4o-mini"),
        prompt: prompt,
      })

      const aiMessage = { role: "assistant", content: text }
      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      console.error("Error generating AI response:", error)
      setMessages((prev) => [...prev, { role: "assistant", content: "I encountered an error. Try again later." }])
    }

    setIsLoading(false)
  }

  return (
    <div className="fixed bottom-8 left-4 z-50">
      <Button
        className="rounded-full w-12 h-12 flex items-center justify-center bg-primary hover:bg-primary/90"
        onClick={() => setIsOpen(true)}
      >
        <Bot className="h-6 w-6" />
      </Button>

      {isOpen && (
        <Card className="absolute bottom-16 left-0 w-[90vw] sm:w-[400px] shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-bold">GayanGuru AI</CardTitle>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] w-full pr-4 my-4" ref={scrollRef}>
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground text-sm">Ask me anything!</div>
              )}
              {messages.map((message, index) => (
                <div key={index} className={`mb-4 flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 ${message.role === "user" ? "bg-primary text-white" : "bg-muted"}`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              {isLoading && <div className="text-center text-muted-foreground">AI is typing...</div>}
            </ScrollArea>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <form onSubmit={handleSubmit} className="flex w-full space-x-2">
              <Input
                type="text"
                placeholder="Ask a question..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-grow"
              />
              <Button type="submit" disabled={isLoading} size="sm">
                Send
              </Button>
            </form>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}

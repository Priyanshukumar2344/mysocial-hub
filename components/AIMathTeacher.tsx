"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bot, Send, Calculator, BookOpen, History, Brain } from "lucide-react"
import { generateText } from "ai"
import { MathJax, MathJaxContext } from "better-react-mathjax"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey:
    "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",
})

const completion = openai.chat.completions.create({
  model: "gpt-4o-mini",
  store: true,
  messages: [{ role: "user", content: "write a haiku about ai" }],
})

completion.then((result) => console.log(result.choices[0].message))

type Message = {
  role: "user" | "assistant"
  content: string
  type?: "text" | "math" | "step-by-step"
}

type Step = {
  explanation: string
  formula?: string
}

export function AIMathTeacher() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<"chat" | "calculator" | "resources" | "history">("chat")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage: Message = { role: "user", content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const { text } = await generateText({
        model: openai("gpt-4o"),
        prompt: `You are an AI math teacher. Please provide a detailed, step-by-step solution to the following question. Use LaTeX for mathematical notation where appropriate. Format your response with clear steps, each containing an explanation and a formula (if applicable): ${input}`,
      })

      // Parse the response to extract steps
      const steps = text.split("\n\n").map((step) => {
        const [explanation, formula] = step.split("$$")
        return {
          explanation: explanation.trim(),
          formula: formula?.trim(),
        }
      })

      // Add each step as a separate message
      steps.forEach((step) => {
        if (step.explanation) {
          setMessages((prev) => [...prev, { role: "assistant", content: step.explanation, type: "text" }])
        }
        if (step.formula) {
          setMessages((prev) => [...prev, { role: "assistant", content: step.formula, type: "math" }])
        }
      })
    } catch (error) {
      console.error("Error generating AI response:", error)
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I'm sorry, I encountered an error. Please try again.",
          type: "text",
        },
      ])
    }

    setIsLoading(false)
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI Math Teacher
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="calculator" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Calculator
            </TabsTrigger>
            <TabsTrigger value="resources" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Resources
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat">
            <MathJax.Provider>
              <ScrollArea className="h-[400px] w-full pr-4 mb-4">
                <div className="space-y-4 p-4">
                  {messages.map((message, index) => (
                    <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[80%] rounded-lg px-4 py-2 ${
                          message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                        }`}
                      >
                        {message.type === "math" ? <MathJax.Node formula={message.content} /> : message.content}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="text-center text-muted-foreground">
                      <span className="animate-pulse">Thinking...</span>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </MathJax.Provider>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me any math question..."
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="calculator">
            <div className="p-4 text-center">
              <h3 className="text-lg font-semibold mb-4">Scientific Calculator</h3>
              {/* Add scientific calculator component here */}
              <p className="text-muted-foreground">Coming soon...</p>
            </div>
          </TabsContent>

          <TabsContent value="resources">
            <div className="p-4 space-y-4">
              <h3 className="text-lg font-semibold">Math Resources</h3>
              <div className="grid gap-4">
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium">Common Formulas</h4>
                    <MathJax.Provider>
                      <div className="space-y-2 mt-2">
                        <div>
                          <p className="text-sm text-muted-foreground">Quadratic Formula:</p>
                          <MathJax.Node formula="x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Pythagorean Theorem:</p>
                          <MathJax.Node formula="a^2 + b^2 = c^2" />
                        </div>
                      </div>
                    </MathJax.Provider>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-4">Learning History</h3>
              {messages.length > 0 ? (
                <div className="space-y-2">
                  {messages
                    .filter((m) => m.role === "user")
                    .map((message, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <p className="text-sm">{message.content}</p>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground">No history yet</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

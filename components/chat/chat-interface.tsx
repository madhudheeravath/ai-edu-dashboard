"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Send, Bot, User, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

type Message = {
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface ChatInterfaceProps {
  assignmentTitle?: string
  assignmentDescription?: string
  draftContent?: string
}

export function ChatInterface({ 
  assignmentTitle, 
  assignmentDescription,
  draftContent 
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        role: "assistant",
        content: `Hello! I'm your AI learning assistant. I'm here to help you think through your work on "${assignmentTitle}". 

I can help you:
• Brainstorm ideas
• Improve your arguments
• Refine your writing
• Think critically about your topic

What would you like to work on?`,
        timestamp: new Date(),
      }])
    }
  }, [])

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage.content,
          history: messages.map(m => ({
            role: m.role,
            content: m.content,
          })),
          assignmentContext: `Title: ${assignmentTitle}\nDescription: ${assignmentDescription}\n${draftContent ? `Student's Draft: ${draftContent.substring(0, 500)}...` : ""}`,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response")
      }

      const data = await response.json()

      const assistantMessage: Message = {
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, assistantMessage])

    } catch (error) {
      console.error("Chat error:", error)
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <Card className="flex flex-col h-[600px]">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          AI Learning Assistant
          <span className="text-xs font-normal text-gray-500 ml-auto">
            Powered by GPT-3.5 Turbo
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex gap-3 ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {message.role === "assistant" && (
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary" />
              </div>
            )}

            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-gray-100 text-gray-900"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <p className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            {message.role === "user" && (
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot className="h-4 w-4 text-primary" />
            </div>
            <div className="bg-gray-100 rounded-lg p-3">
              <Loader2 className="h-4 w-4 animate-spin text-gray-600" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </CardContent>

      <div className="border-t p-4">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about your assignment..."
            className="min-h-[60px] resize-none"
            disabled={loading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!input.trim() || loading}
            size="icon"
            className="h-[60px] w-[60px]"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </Card>
  )
}

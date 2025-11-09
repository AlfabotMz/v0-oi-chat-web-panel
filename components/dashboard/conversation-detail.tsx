"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { format } from "date-fns"
import { Send, Phone } from "lucide-react"

interface ConversationDetailProps {
  conversation: any
  messages: any[]
  agent: any
}

export function ConversationDetail({ conversation, messages: initialMessages, agent }: ConversationDetailProps) {
  const [messages, setMessages] = useState(initialMessages)
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    setIsLoading(true)
    const messageText = newMessage
    setNewMessage("")

    try {
      const supabase = createClient()

      // Add message to database
      const { error } = await supabase.from("messages").insert({
        conversation_id: conversation.id,
        sender_type: "agent",
        content: messageText,
      })

      if (error) throw error

      // Optimistically update UI
      setMessages([
        ...messages,
        {
          id: Date.now().toString(),
          conversation_id: conversation.id,
          sender_type: "agent",
          content: messageText,
          created_at: new Date().toISOString(),
        },
      ])

      // Update conversation last_message_at
      await supabase
        .from("conversations")
        .update({ last_message_at: new Date().toISOString() })
        .eq("id", conversation.id)
    } catch (err) {
      console.error("Error sending message:", err)
      // Re-add the message text if it failed
      setNewMessage(messageText)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl">
      <Card className="border-border/50 flex flex-col h-[600px]">
        <CardHeader className="border-b border-border/50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{conversation.contact_name || conversation.contact_phone}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{agent.name}</p>
            </div>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <Phone className="w-4 h-4" />
              Call
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender_type === "agent" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${
                  message.sender_type === "agent"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">{format(new Date(message.created_at), "HH:mm")}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </CardContent>

        <div className="border-t border-border/50 p-4">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading} size="sm">
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  )
}

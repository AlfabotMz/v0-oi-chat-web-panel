"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { MessageCircle, ChevronRight } from "lucide-react"

interface ConversationsListProps {
  conversations: any[]
  agentId: string
}

export function ConversationsList({ conversations, agentId }: ConversationsListProps) {
  return (
    <div className="space-y-4">
      {conversations.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="p-8 text-center">
            <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No conversations yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {conversations.map((conversation) => (
            <Link key={conversation.id} href={`/dashboard/conversations/${agentId}/${conversation.id}`}>
              <Card className="border-border/50 hover:border-border transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground">
                        {conversation.contact_name || conversation.contact_phone}
                      </h3>
                      <p className="text-sm text-muted-foreground">{conversation.contact_phone}</p>
                    </div>
                    <div className="flex items-center gap-3 text-right">
                      <div>
                        <Badge variant={conversation.status === "active" ? "default" : "secondary"}>
                          {conversation.status}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {conversation.last_message_at
                            ? format(new Date(conversation.last_message_at), "MMM dd, HH:mm")
                            : "No messages"}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

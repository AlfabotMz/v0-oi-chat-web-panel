"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Settings, MessageSquare } from "lucide-react"
import { CreateAgentDialog } from "./create-agent-dialog"

interface AgentsListProps {
  agents: any[]
}

export function AgentsList({ agents }: AgentsListProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Your Agents</h2>
        <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          New Agent
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.length === 0 ? (
          <Card className="col-span-full border-border/50">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground mb-4">No agents yet</p>
              <Button onClick={() => setIsCreateOpen(true)} variant="outline">
                Create Your First Agent
              </Button>
            </CardContent>
          </Card>
        ) : (
          agents.map((agent) => (
            <Card key={agent.id} className="border-border/50 hover:border-border transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{agent.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{agent.phone_number || "Sem número"}</p>
                  </div>
                  <Badge variant={agent.status === "active" ? "default" : "secondary"}>{agent.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {agent.description || "No description"}
                </p>
                <div className="flex gap-2">
                  <Link href={`/dashboard/agents/${agent.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full gap-2 bg-transparent">
                      <Settings className="w-4 h-4" />
                      Configure
                    </Button>
                  </Link>
                  <Link href={`/dashboard/conversations/${agent.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full gap-2 bg-transparent">
                      <MessageSquare className="w-4 h-4" />
                      Messages
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <CreateAgentDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </div>
  )
}

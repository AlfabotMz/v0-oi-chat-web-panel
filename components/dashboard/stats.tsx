"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageCircle, Zap, TrendingUp } from "lucide-react"

interface StatsProps {
  agents: any[]
  analytics: any[]
}

export function DashboardStats({ agents, analytics }: StatsProps) {
  const totalAgents = agents.length
  const totalMessages = analytics.reduce((sum, a) => sum + (a.total_messages || 0), 0)
  const totalConversations = analytics.reduce((sum, a) => sum + (a.total_conversations || 0), 0)

  const stats = [
    {
      label: "Total Agents",
      value: totalAgents,
      icon: Zap,
      color: "text-blue-500",
    },
    {
      label: "Total Messages",
      value: totalMessages,
      icon: MessageCircle,
      color: "text-purple-500",
    },
    {
      label: "Active Conversations",
      value: totalConversations,
      icon: TrendingUp,
      color: "text-green-500",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.label} className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              <Icon className={`w-4 h-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stat.value}</div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

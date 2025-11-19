"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { MessageCircle, Zap, TrendingUp, Trophy, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface StatsProps {
  agents: any[]
  analytics: any[]
}

export function DashboardStats({ agents, analytics }: StatsProps) {
  const totalAgents = agents.length
  const totalMessages = analytics.reduce((sum, a) => sum + (a.total_messages || 0), 0)
  const totalConversations = analytics.reduce((sum, a) => sum + (a.total_conversations || 0), 0)

  // Encontrar o melhor agente (mais conversões)
  const agentConversations = agents.map((agent) => {
    const agentAnalytics = analytics.filter((a) => a.agent_id === agent.id)
    const conversations = agentAnalytics.reduce((sum, a) => sum + (a.total_conversations || 0), 0)
    return { agent, conversations }
  })

  const bestAgent = agentConversations.length > 0
    ? agentConversations.reduce((best, current) =>
        current.conversations > best.conversations ? current : best
      )
    : null

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
    <div className="space-y-6">
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

      {bestAgent && bestAgent.conversations > 0 && (
        <Card className="border-border/50 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <CardTitle>Melhor Agente</CardTitle>
            </div>
            <CardDescription>Agente com mais conversões</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-foreground mb-1">{bestAgent.agent.name}</h3>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-green-500/10 text-green-700 dark:text-green-400">
                    {bestAgent.conversations} conversões
                  </Badge>
                  <Badge variant={bestAgent.agent.status === "active" ? "default" : "secondary"}>
                    {bestAgent.agent.status === "active" ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
              </div>
              <Link href={`/dashboard/agents/${bestAgent.agent.id}`}>
                <Button variant="outline" className="gap-2">
                  Ver Detalhes
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

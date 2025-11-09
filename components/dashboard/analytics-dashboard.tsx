"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts"
import { format, parseISO } from "date-fns"

interface AnalyticsDashboardProps {
  agents: any[]
  analytics: any[]
}

export function AnalyticsDashboard({ agents, analytics }: AnalyticsDashboardProps) {
  // Group analytics by date
  const chartData = analytics.reduce((acc: any, item: any) => {
    const date = format(parseISO(item.date), "MMM dd")
    const existing = acc.find((d: any) => d.date === date)
    if (existing) {
      existing.messages += item.total_messages || 0
      existing.conversations += item.total_conversations || 0
    } else {
      acc.push({
        date,
        messages: item.total_messages || 0,
        conversations: item.total_conversations || 0,
      })
    }
    return acc
  }, [])

  // Agent performance
  const agentStats = agents.map((agent) => {
    const agentAnalytics = analytics.filter((a) => a.agent_id === agent.id)
    const totalMessages = agentAnalytics.reduce((sum, a) => sum + (a.total_messages || 0), 0)
    const totalConversations = agentAnalytics.reduce((sum, a) => sum + (a.total_conversations || 0), 0)
    const avgResponseTime =
      agentAnalytics.reduce((sum, a) => sum + (a.avg_response_time || 0), 0) / agentAnalytics.length

    return {
      name: agent.name,
      messages: totalMessages,
      conversations: totalConversations,
      avgResponseTime: avgResponseTime || 0,
    }
  })

  // since CSS variables containing oklch() values cannot be used inside hsl()
  const primaryColor = "#6D28D9" // Purple primary
  const chartColor1 = "#FF8A5B" // Orange chart color

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Messages Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="messages" stroke={primaryColor} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Conversations Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="conversations" fill={chartColor1} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Agent Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border/50">
                <tr>
                  <th className="text-left py-2 px-4 font-medium text-muted-foreground">Agent</th>
                  <th className="text-right py-2 px-4 font-medium text-muted-foreground">Messages</th>
                  <th className="text-right py-2 px-4 font-medium text-muted-foreground">Conversations</th>
                  <th className="text-right py-2 px-4 font-medium text-muted-foreground">Avg Response Time</th>
                </tr>
              </thead>
              <tbody>
                {agentStats.map((stat) => (
                  <tr key={stat.name} className="border-b border-border/50 hover:bg-secondary/50">
                    <td className="py-2 px-4 text-foreground">{stat.name}</td>
                    <td className="py-2 px-4 text-right text-foreground font-medium">{stat.messages}</td>
                    <td className="py-2 px-4 text-right text-foreground font-medium">{stat.conversations}</td>
                    <td className="py-2 px-4 text-right text-foreground font-medium">
                      {stat.avgResponseTime.toFixed(0)}s
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

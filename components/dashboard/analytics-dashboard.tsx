"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import dynamic from "next/dynamic"

// Dynamically import Recharts to avoid SSR errors
const ResponsiveContainer = dynamic(() => import("recharts").then(mod => mod.ResponsiveContainer), { ssr: false })
const AreaChart = dynamic(() => import("recharts").then(mod => mod.AreaChart), { ssr: false })
const Area = dynamic(() => import("recharts").then(mod => mod.Area), { ssr: false })
const XAxis = dynamic(() => import("recharts").then(mod => mod.XAxis), { ssr: false })
const YAxis = dynamic(() => import("recharts").then(mod => mod.YAxis), { ssr: false })
const CartesianGrid = dynamic(() => import("recharts").then(mod => mod.CartesianGrid), { ssr: false })
const Tooltip = dynamic(() => import("recharts").then(mod => mod.Tooltip), { ssr: false })
const BarChart = dynamic(() => import("recharts").then(mod => mod.BarChart), { ssr: false })
const Bar = dynamic(() => import("recharts").then(mod => mod.Bar), { ssr: false })
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
  const primaryColor = "#8b5cf6" // Violet 500
  const chartColor1 = "#f97316" // Orange 500

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="glass border-0 overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base font-medium text-muted-foreground">Messages Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={primaryColor} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={primaryColor} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px', color: '#fff' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="messages"
                    stroke={primaryColor}
                    fillOpacity={1}
                    fill="url(#colorMessages)"
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-0 overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base font-medium text-muted-foreground">Conversations Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px', color: '#fff' }}
                  />
                  <Bar dataKey="conversations" fill={chartColor1} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass border-0">
        <CardHeader>
          <CardTitle>Agent Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-white/10">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Agent</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Messages</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Conversations</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Avg Response Time</th>
                </tr>
              </thead>
              <tbody>
                {agentStats.map((stat) => (
                  <tr key={stat.name} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 text-foreground font-medium">{stat.name}</td>
                    <td className="py-3 px-4 text-right text-foreground">{stat.messages}</td>
                    <td className="py-3 px-4 text-right text-foreground">{stat.conversations}</td>
                    <td className="py-3 px-4 text-right text-foreground">
                      {stat.avgResponseTime.toFixed(1)}s
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

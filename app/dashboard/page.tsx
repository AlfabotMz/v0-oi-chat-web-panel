import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/layout"
import { AgentsList } from "@/components/dashboard/agents-list"
import { DashboardStats } from "@/components/dashboard/stats"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) {
    redirect("/login")
  }

  // Por enquanto, assumir que usuários regulares acessam /dashboard e admins acessam /admin via proteção de rota

  // Fetch agents for this user
  const { data: agents, error: agentsError } = await supabase
    .from("agents")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  let analytics = []
  if (agents && agents.length > 0) {
    const agentIds = agents.map((a) => a.id)
    const { data: analyticsData, error: analyticsError } = await supabase
      .from("analytics")
      .select("*")
      .in("agent_id", agentIds)
      .order("date", { ascending: false })
      .limit(7)

    if (analyticsError) {
      console.log("[v0] Erro ao buscar analytics:", analyticsError.message)
    }

    if (analyticsData) {
      analytics = analyticsData
    }
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-8">
        <DashboardStats agents={agents || []} analytics={analytics} />
        <AgentsList agents={agents || []} />
      </div>
    </DashboardLayout>
  )
}

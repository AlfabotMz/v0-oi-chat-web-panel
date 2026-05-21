import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/layout"
import { AnalyticsDashboard } from "@/components/dashboard/analytics-dashboard"

export default async function AnalyticsPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) {
    redirect("/login")
  }

  // Fetch all agents for this user
  const { data: agents } = await supabase.from("agents").select("*").eq("user_id", user.id)

  let analytics = []
  const { data: analyticsData, error: analyticsError } = await supabase
    .from("analytics")
    .select("*")
    .in("agent_id", agents?.map((a) => a.id) || [])
    .order("date", { ascending: false })

  if (analyticsError?.code !== "PGRST205") {
    analytics = analyticsData || []
  }

  return (
    <DashboardLayout user={user}>
      <div>
        <h1 className="text-3xl font-bold mb-2">Análitica</h1>
        <p className="text-muted-foreground mb-8">Monitore o desempenho dos seus agentes</p>
        <AnalyticsDashboard agents={agents || []} analytics={analytics} />
      </div>
    </DashboardLayout>
  )
}

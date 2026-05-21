import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/layout"
import { AgentConfigForm } from "@/components/dashboard/agent-config-form"

interface AgentConfigPageProps {
  params: Promise<{ id: string }>
}

export default async function AgentConfigPage({ params }: AgentConfigPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) {
    redirect("/login")
  }

  const { data: agent, error: agentError } = await supabase
    .from("agents")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (agentError || !agent) {
    redirect("/dashboard")
  }

  return (
    <DashboardLayout user={user}>
      <div className="max-w-4xl">
        <AgentConfigForm agent={agent} />
      </div>
    </DashboardLayout>
  )
}

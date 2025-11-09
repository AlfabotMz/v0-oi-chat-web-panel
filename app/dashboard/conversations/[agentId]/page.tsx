import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/layout"
import { ConversationsList } from "@/components/dashboard/conversations-list"

interface ConversationsPageProps {
  params: Promise<{ agentId: string }>
}

export default async function ConversationsPage({ params }: ConversationsPageProps) {
  const { agentId } = await params
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) {
    redirect("/login")
  }

  // Verify agent belongs to user
  const { data: agent } = await supabase.from("agents").select("*").eq("id", agentId).eq("user_id", user.id).single()

  if (!agent) {
    redirect("/dashboard")
  }

  // Fetch conversations
  const { data: conversations } = await supabase
    .from("conversations")
    .select("*")
    .eq("agent_id", agentId)
    .order("last_message_at", { ascending: false })

  return (
    <DashboardLayout user={user}>
      <div>
        <div className="mb-6">
          <h1 className="text-3xl font-bold">{agent.name}</h1>
          <p className="text-muted-foreground">Manage conversations for this agent</p>
        </div>
        <ConversationsList conversations={conversations || []} agentId={agentId} />
      </div>
    </DashboardLayout>
  )
}

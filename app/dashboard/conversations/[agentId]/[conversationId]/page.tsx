import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/layout"
import { ConversationDetail } from "@/components/dashboard/conversation-detail"

interface ConversationDetailPageProps {
  params: Promise<{ agentId: string; conversationId: string }>
}

export default async function ConversationDetailPage({ params }: ConversationDetailPageProps) {
  const { agentId, conversationId } = await params
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

  // Fetch conversation
  const { data: conversation } = await supabase
    .from("conversations")
    .select("*")
    .eq("id", conversationId)
    .eq("agent_id", agentId)
    .single()

  if (!conversation) {
    redirect(`/dashboard/conversations/${agentId}`)
  }

  // Fetch messages
  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })

  return (
    <DashboardLayout user={user}>
      <ConversationDetail conversation={conversation} messages={messages || []} agent={agent} />
    </DashboardLayout>
  )
}

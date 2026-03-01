import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/layout"
import { AgentsList } from "@/components/dashboard/agents-list"
import { DashboardStats } from "@/components/dashboard/stats"
import { OnboardingTour } from "@/components/dashboard/onboarding-tour"
import { Suspense } from "react"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) {
    redirect("/login")
  }

  // Verificar acesso:
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_status, access_type, stripe_subscription_id, role, onboarding_completed")
    .eq("id", user.id)
    .single()

  if (profile) {
    // 1. Forçar Onboarding primeiro
    const hasActiveSubscription = !!profile.stripe_subscription_id
    if (!profile.onboarding_completed && profile.role !== 'admin' && !hasActiveSubscription) {
      redirect("/onboarding")
    }

    // 2. Bloquear apenas se o plano expirou ou não é trial/premium
    const isTrial = profile.subscription_status === 'trial'
    const isExpired = profile.plan_end_date && new Date(profile.plan_end_date) < new Date()
    const hasSubscription = !!profile.stripe_subscription_id

    // Se o trial expirou e não tem assinatura, manda pro checkout/pagamento
    if (profile.role === 'user' && !hasSubscription && isExpired) {
      redirect("/checkout")
    }

    // Se não for nem trial nem pro/premium, e não for admin, também manda pro checkout
    if (profile.role === 'user' && !isTrial && !hasSubscription && profile.plan === 'free') {
      redirect("/checkout")
    }
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
        <div data-tour="dashboard-stats">
          <DashboardStats agents={agents || []} analytics={analytics} />
        </div>
        <div data-tour="dashboard-agents">
          <AgentsList agents={agents || []} />
        </div>
      </div>
      <Suspense fallback={null}>
        <OnboardingTour />
      </Suspense>
    </DashboardLayout>
  )
}

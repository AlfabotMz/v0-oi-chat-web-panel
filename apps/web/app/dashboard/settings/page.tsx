import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/layout"
import { SettingsForm } from "@/components/dashboard/settings-form"
import { BackButton } from "@/components/ui/back-button"

export default async function SettingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) {
    redirect("/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  return (
    <DashboardLayout user={user}>
      <div className="max-w-2xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Configurações</h1>
            <p className="text-muted-foreground">Gerencie sua conta e preferências</p>
          </div>
          <BackButton href="/dashboard" />
        </div>
        <SettingsForm user={user} profile={profile} />
      </div>
    </DashboardLayout>
  )
}

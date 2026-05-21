import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/layout"
import { BackButton } from "@/components/ui/back-button"
import { PushcutForm } from "@/components/dashboard/pushcut-form"

export default async function PushcutIntegrationPage() {
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
                        <h1 className="text-3xl font-bold mb-2">Pushcut Notifications</h1>
                        <p className="text-muted-foreground">Configure notificações no iOS via Pushcut</p>
                    </div>
                    <BackButton href="/dashboard/integrations" />
                </div>
                <PushcutForm user={user} pushcutUrl={profile?.pushcut_url || ""} />
            </div>
        </DashboardLayout>
    )
}

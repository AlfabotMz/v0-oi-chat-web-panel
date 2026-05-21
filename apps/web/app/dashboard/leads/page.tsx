import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { LeadsManager } from "@/components/dashboard/leads-manager"

export default async function LeadsPage() {
    const supabase = await createClient()

    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
        redirect("/login")
    }

    // Fetch agents and their leads
    const { data: agents, error: agentsError } = await supabase
        .from("agents")
        .select(`
            id,
            name,
            leads (
                id,
                agent_id,
                user_id,
                user_number,
                form,
                status,
                is_read,
                date,
                created_at,
                updated_at
            )
        `)
        .eq("user_id", user.id)

    if (agentsError) {
        console.error("Erro ao buscar leads:", agentsError)
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2 mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div className="flex items-center gap-2">
                        <div className="relative w-8 h-8 overflow-hidden">
                            <Image src="/oichat-icon.jpg" alt="OiChat Logo" fill className="object-cover" />
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight text-white">Encomendas & Leads</h2>
                    </div>
                </div>
            </div>

            <LeadsManager initialAgents={agents as any || []} user={user} />
        </div>
    )
}

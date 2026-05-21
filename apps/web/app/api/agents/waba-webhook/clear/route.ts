import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })

        const { agent_id } = await request.json()

        // Valida se o agente pertence ao user
        const { data: agent } = await supabase.from("agents").select("id").eq("id", agent_id).eq("user_id", user.id).single()
        if (!agent) return NextResponse.json({ success: false, error: "Agente não encontrado" }, { status: 404 })

        // Instancia admin bypass RLS para limpar a tabela inteira do agente correspondente
        const { createClient: createAdminClient } = await import("@supabase/supabase-js")
        const supabaseAdmin = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

        await supabaseAdmin.from("waba_webhook_logs").delete().eq("agent_id", agent_id)

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}

import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()

        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser()

        if (userError || !user) {
            return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 })
        }

        const { agent_id, pin = "123456" } = await request.json()

        // Extrair token e phone_number_id
        const { data: agent } = await supabase
            .from("agents")
            .select("waba_phone_number_id, waba_access_token")
            .eq("id", agent_id)
            .eq("user_id", user.id)
            .single()

        if (!agent || !agent.waba_phone_number_id || !agent.waba_access_token) {
            return NextResponse.json({ success: false, error: "Agente ou Número WABA não configurado." }, { status: 400 })
        }

        // Graph API URL para registrar o número
        const url = `https://graph.facebook.com/v19.0/${agent.waba_phone_number_id}/register`

        const payload = {
            messaging_product: "whatsapp",
            pin: pin
        }

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${agent.waba_access_token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        })

        const data = await response.json()

        if (!response.ok) {
            console.error("Meta Register Error:", data.error)
            return NextResponse.json({ success: false, error: data.error?.message || "Erro ao registrar número" }, { status: response.status })
        }

        return NextResponse.json({ success: true, data })

    } catch (error: any) {
        console.error("waba-register erro:", error)
        return NextResponse.json({ success: false, error: error.message || "Internal server error" }, { status: 500 })
    }
}

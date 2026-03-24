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

        const { agent_id, template_name, template_text, category = "UTILITY" } = await request.json()

        // Pegar token e waba_id do agente
        const { data: agent } = await supabase
            .from("agents")
            .select("waba_id, waba_access_token")
            .eq("id", agent_id)
            .eq("user_id", user.id)
            .single()

        if (!agent || !agent.waba_id || !agent.waba_access_token) {
            return NextResponse.json({ success: false, error: "Agente ou WABA Access Token não configurado." }, { status: 400 })
        }

        // Criar o template usando a Graph API
        // Na Sandbox, templates novos devem aderir a sintaxes simples.
        // O nome precisa estar em minusculas e sem espacos (letras, numeros e underscores)
        const formattedName = template_name.toLowerCase().replace(/[^a-z0-9_]/g, '_')

        const url = `https://graph.facebook.com/v19.0/${agent.waba_id}/message_templates`
        const payload = {
            name: formattedName,
            language: "pt_BR", // Fixo PT-BR para simplificar o teste
            category: category,
            components: [
                {
                    type: "BODY",
                    text: template_text
                }
            ]
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
            console.error("Meta Template Creation Error:", data.error)
            return NextResponse.json({ success: false, error: data.error?.message || "Erro ao criar template" }, { status: response.status })
        }

        return NextResponse.json({ success: true, data: { ...data, formatted_name: formattedName } })

    } catch (error: any) {
        console.error("waba-templates erro:", error)
        return NextResponse.json({ success: false, error: error.message || "Internal server error" }, { status: 500 })
    }
}

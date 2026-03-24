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

        const { agent_id, to_phone, template_name, language_code = "en_US", text_message } = await request.json()

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

        // Limpar o telefone +55 11 9999-9999 -> 551199999999
        const cleanPhone = to_phone.replace(/\D/g, '')

        // Graph API URL para enviar mensagens WABA
        const url = `https://graph.facebook.com/v19.0/${agent.waba_phone_number_id}/messages`

        // Payload do WhatsApp Cloud API para Templates ou Texto
        const payload: any = {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: cleanPhone,
        }

        if (template_name) {
            payload.type = "template"
            payload.template = {
                name: template_name,
                language: {
                    code: language_code // Pega da request, padrão "en_US" p/ hello_world
                }
            }
        } else if (text_message) {
            payload.type = "text"
            payload.text = { body: text_message }
        } else {
            return NextResponse.json({ success: false, error: "Defina template_name ou text_message" }, { status: 400 })
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
            console.error("Meta Send Message Error:", data.error)
            return NextResponse.json({ success: false, error: data.error?.message || "Erro ao enviar mensagem" }, { status: response.status })
        }

        // Salvar mensagem enviada no log para o Chat UI ler!
        if (data.messages && data.messages.length > 0) {
            await supabase.from("waba_webhook_logs").insert({
                agent_id: agent_id,
                event_type: "message_sent_api",
                phone_number: cleanPhone,
                payload: {
                    sent_text: text_message || `[Template Disparado: ${template_name}]`,
                    message_id: data.messages[0].id,
                    api_response: data
                }
            })
        }

        return NextResponse.json({ success: true, data })

    } catch (error: any) {
        console.error("waba-messages erro:", error)
        return NextResponse.json({ success: false, error: error.message || "Internal server error" }, { status: 500 })
    }
}

import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

// Usamos o Service Role Key porque Webhooks chegam deslogados (sem usuário autenticado)
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// O GET é chamado pela Meta APENAS na hora de cadastrar/validar o Webhook no painel deles
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const mode = searchParams.get("hub.mode")
    const token = searchParams.get("hub.verify_token")
    const challenge = searchParams.get("hub.challenge")

    const verifyToken = process.env.META_WEBHOOK_VERIFY_TOKEN

    if (mode && token) {
        if (mode === "subscribe" && token === verifyToken) {
            console.log("WEBHOOK_VERIFIED")
            return new NextResponse(challenge, { status: 200 })
        } else {
            return new NextResponse("Forbidden - Token Incorreto", { status: 403 })
        }
    }

    return new NextResponse("Bad Request", { status: 400 })
}

// O POST recebe todas as mensagens, respostas de clientes, recibos de entrega ou leitura
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        console.log("=== Webhook Meta Recebido ===")

        if (body.object) {
            if (body.entry && body.entry[0].changes && body.entry[0].changes[0] && body.entry[0].changes[0].value) {
                const change = body.entry[0].changes[0].value
                const waba_phone_number_id = change.metadata?.phone_number_id

                if (waba_phone_number_id) {
                    // Acha de qual Agente (chatbot/cliente) é esse número
                    const { data: agents } = await supabaseAdmin
                        .from("agents")
                        .select("id")
                        .eq("waba_phone_number_id", waba_phone_number_id)
                        .limit(1)

                    const agent = agents?.[0]

                    if (agent) {
                        let eventType = "unknown"

                        if (change.messages && change.messages.length > 0) {
                            eventType = "message_received"
                        } else if (change.statuses && change.statuses.length > 0) {
                            const status = change.statuses[0].status // 'sent', 'delivered', 'read', 'failed'
                            eventType = `status_${status}`
                        }

                        // Descobre o número do cliente (quem enviou para nós ou quem leu)
                        const contactPhone = change.contacts?.[0]?.wa_id || change.statuses?.[0]?.recipient_id || "desconhecido"

                        // Salva o log no banco de dados para mostrarmos na tela de Testes WABA em tempo real!
                        await supabaseAdmin.from("waba_webhook_logs").insert({
                            agent_id: agent.id,
                            event_type: eventType,
                            payload: body,
                            phone_number: contactPhone
                        })

                        // === INTEGRAÇÃO n8n NO FUTURO ===
                        // Se o evento for "message_received", o painel forwardaria a msg para o webhook de produção do n8n:
                        // if (eventType === "message_received") {
                        //    fetch("https://seu-n8n/webhook/waba-incoming", { method: "POST", body: JSON.stringify(body) })
                        // }
                    }
                }
            }
            // Sempre retorne 200 OK para o WhatsApp, se não eles tentam entregar novamente em loop
            return NextResponse.json({ success: true }, { status: 200 })
        } else {
            return new NextResponse("Not Found", { status: 404 })
        }
    } catch (error) {
        console.error("Webhook error:", error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}

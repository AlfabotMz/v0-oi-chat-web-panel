import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

// Função helper para obter a URL do webhook n8n
function getN8nOnboardingWebhookUrl(): string {
    const envUrl = process.env.N8N_WEBHOOK_URL || process.env.N8N_URL || "https://n8n.myoichat.online"

    // Se a URL contém /webhook/, extrair apenas a base
    let baseUrl = envUrl
    if (envUrl.includes("/webhook/")) {
        baseUrl = envUrl.split("/webhook/")[0]
    }
    // Remove barras no final
    baseUrl = baseUrl.replace(/\/$/, "")

    return `${baseUrl}/webhook/onboarding`
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Verificar autenticação
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser()

        if (userError || !user) {
            return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 })
        }

        // Ler dados do corpo da requisição
        const body = await request.json()

        // Salvar no Supabase primeiro (já feito pelo endpoint profile/update, mas o usuário pediu para enviar para n8n aqui)
        // O frontend chama profile/update e DEPOIS chama este endpoint ou este endpoint faz ambos?
        // O usuário disse: "essas informcoes que ele capta no final deve enviar para n8n no endpoint /onboarding"
        // Vou assumir que o frontend vai chamar este endpoint APÓS salvar no perfil, ou eu posso fazer tudo aqui.
        // Para manter consistência, vou deixar o frontend chamar profile/update (que já existe e funciona) 
        // e vou modificar o frontend para chamar este endpoint TAMBÉM ou modificar o profile/update para chamar o n8n.
        // Modificar o profile/update parece mais robusto, mas o usuário pediu "enviar para n8n no endpoint /onboarding".
        // Vou criar este endpoint dedicado para o n8n e chamar no frontend.

        const webhookUrl = getN8nOnboardingWebhookUrl()
        console.log("Chamando webhook n8n onboarding:", webhookUrl)

        // Fazer requisição para o webhook n8n
        const n8nResponse = await fetch(webhookUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                user_id: user.id,
                email: user.email,
                ...body
            }),
        })

        if (!n8nResponse.ok) {
            console.error("Erro ao enviar para n8n:", await n8nResponse.text())
            // Não falhar a requisição do usuário se o n8n falhar, apenas logar
        }

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error("Erro no endpoint de onboarding:", error)
        return NextResponse.json({ success: false, error: "Erro interno" }, { status: 500 })
    }
}

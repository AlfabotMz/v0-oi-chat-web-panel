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

        const body = await request.json()
        const { agent_id, code } = body

        if (!agent_id || !code) {
            return NextResponse.json({ success: false, error: "agent_id e code são obrigatórios" }, { status: 400 })
        }

        const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID
        const appSecret = process.env.FACEBOOK_APP_SECRET

        if (!appId || !appSecret) {
            return NextResponse.json({ success: false, error: "Credenciais do App do Facebook não configuradas (.env)" }, { status: 500 })
        }

        // 1. Trocar o código (code) por um Access Token do Sistema usando a Graph API
        const tokenUrl = `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${appId}&client_secret=${appSecret}&code=${code}`
        const tokenResponse = await fetch(tokenUrl)
        const tokenData = await tokenResponse.json()

        if (!tokenResponse.ok || !tokenData.access_token) {
            console.error("Erro ao trocar código por token:", tokenData)
            return NextResponse.json({ success: false, error: "Falha na autenticação do Facebook: Não foi possível obter o token" }, { status: 500 })
        }

        const access_token = tokenData.access_token

        // 2. Extrair informações do WhatsApp usando o token (para capturar o WABA ID selecionado pelo usuário)
        const debugUrl = `https://graph.facebook.com/v19.0/debug_token?input_token=${access_token}&access_token=${appId}|${appSecret}`
        const debugResponse = await fetch(debugUrl)
        const debugData = await debugResponse.json()

        let wabaId = null
        // A API de debug retorna em granular_scopes os target_ids onde o token tem permissão
        if (debugData.data?.granular_scopes) {
            const whatsappScope = debugData.data.granular_scopes.find((s: any) => s.scope === 'whatsapp_business_management')
            if (whatsappScope && whatsappScope.target_ids && whatsappScope.target_ids.length > 0) {
                wabaId = whatsappScope.target_ids[0]
            }
        }

        // Fallback: se não achar no debug_token, busca da rota client_whatsapp_business_accounts
        if (!wabaId) {
            const wabaListResponse = await fetch(`https://graph.facebook.com/v19.0/me/client_whatsapp_business_accounts?access_token=${access_token}`)
            const wabaListData = await wabaListResponse.json()
            if (wabaListData.data && wabaListData.data.length > 0) {
                wabaId = wabaListData.data[0].id
            }
        }

        let phoneNumberId = null
        let displayPhoneNumber = null

        // 3. Obter o Phone Number ID a partir do WABA ID
        if (wabaId) {
            const phoneResponse = await fetch(`https://graph.facebook.com/v19.0/${wabaId}/phone_numbers?access_token=${access_token}`)
            const phoneData = await phoneResponse.json()

            if (phoneData.data && phoneData.data.length > 0) {
                phoneNumberId = phoneData.data[0].id
                displayPhoneNumber = phoneData.data[0].display_phone_number
            }
        }

        // 4. Atualiza o banco de dados do agente com o token e informações detalhadas
        const updateData: any = {
            waba_access_token: access_token,
            waba_id: wabaId,
            waba_phone_number_id: phoneNumberId,
            waba_business_account_id: wabaId,
            status: "active" // Marca como ativo/conectado
        }

        if (displayPhoneNumber) {
            updateData.phone_number = displayPhoneNumber
        }

        const { error: updateError } = await supabase
            .from("agents")
            .update(updateData)
            .eq("id", agent_id)
            .eq("user_id", user.id)

        if (updateError) {
            console.error("Erro ao atualizar WABA no banco: ", updateError)
            return NextResponse.json({ success: false, error: "Erro ao atualizar banco de dados com credenciais WABA" }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            message: "Configuração Oficial do WhatsApp concluída com sucesso"
        })
    } catch (error: any) {
        console.error("Erro no waba-callback:", error)
        return NextResponse.json(
            {
                success: false,
                error: error.message || "Erro interno do servidor",
            },
            { status: 500 }
        )
    }
}

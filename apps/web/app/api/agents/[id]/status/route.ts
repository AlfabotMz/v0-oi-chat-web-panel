import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

import { getWebhookUrl } from "@/lib/webhook-utils"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
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

    // Extrair agentId - suporta tanto Promise quanto objeto direto
    let agentId: string
    if (params instanceof Promise) {
      const resolvedParams = await params
      agentId = resolvedParams.id
    } else {
      agentId = params.id
    }

    // Se ainda não tiver agentId, tentar extrair da URL
    if (!agentId) {
      const url = new URL(request.url)
      const pathParts = url.pathname.split('/')
      const idIndex = pathParts.indexOf('agents') + 1
      if (idIndex > 0 && pathParts[idIndex]) {
        agentId = pathParts[idIndex]
      }
    }

    if (!agentId) {
      console.error("Erro: agent_id não encontrado. URL:", request.url, "Params:", params)
      return NextResponse.json({ success: false, error: "agent_id é obrigatório" }, { status: 400 })
    }

    console.log("Agent ID extraído:", agentId)

    // Verificar se o agente pertence ao usuário
    const { data: agent, error: agentError } = await supabase
      .from("agents")
      .select("*")
      .eq("id", agentId)
      .eq("user_id", user.id)
      .single()

    if (agentError || !agent) {
      return NextResponse.json({ success: false, error: "Agente não encontrado" }, { status: 404 })
    }

    // Verificação via Meta Graph API (oficial)
    const token = agent.waba_access_token
    const phoneId = agent.waba_phone_number_id

    if (!token || !phoneId) {
      return NextResponse.json({
        success: true,
        status: { meta_status: "disconnected" },
        connected: false,
        message: "Credenciais da API Oficial não configuradas para este agente.",
      })
    }

    try {
      console.log(`Verificando status na Meta API para o Phone ID: ${phoneId} e WABA ID: ${agent.waba_id}`)

      // Tentar primeiro pelo Phone ID
      let metaResponse = await fetch(`https://graph.facebook.com/v19.0/${phoneId}?fields=status,quality_rating`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      })

      let metaData = await metaResponse.json()

      // Se falhar pelo Phone ID, tentar pelo WABA ID (Fallback)
      if (!metaResponse.ok && agent.waba_id) {
        console.log(`Falha no Phone ID, tentando pelo WABA ID: ${agent.waba_id}`)
        metaResponse = await fetch(`https://graph.facebook.com/v19.0/${agent.waba_id}?fields=name,status`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        })
        metaData = await metaResponse.json()
      }

      if (metaResponse.ok) {
        // Se qualquer uma das chamadas funcionou, o token é válido e a conta existe
        const metaStatus = metaData.status || "connected"

        return NextResponse.json({
          success: true,
          status: {
            meta_status: metaStatus.toLowerCase(),
            waba_id: agent.waba_id,
            phone_number_id: phoneId,
            display_phone_number: agent.phone_number || metaData.display_phone_number || "",
          },
          connected: true,
          message: `WhatsApp conectado (via ${metaData.id === phoneId ? 'Phone ID' : 'WABA ID'})`,
          details: {
            id: metaData.id,
            status: metaStatus,
            quality_rating: metaData.quality_rating,
          }
        })
      } else {
        console.error("Erro final na Meta API:", metaData)
        return NextResponse.json({
          success: true,
          status: { meta_status: "disconnected" },
          connected: false,
          message: "O número ou a conta WABA não foram encontrados ou o acesso foi revogado. Isso pode ocorrer se o usuário desconectou o número ou removeu as permissões do aplicativo.",
          error: metaData.error,
        })
      }
    } catch (metaError: any) {
      console.error("Erro de rede com Meta API:", metaError)
      return NextResponse.json({
        success: false,
        status: { meta_status: "error" },
        connected: false,
        error: metaError.message || "Erro de rede ao verificar status na Meta",
      })
    }
  } catch (error: any) {
    console.error("Erro no check-status:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Erro interno do servidor",
        status: { meta_status: "disconnected" },
        connected: false,
      },
      { status: 500 }
    )
  }
}

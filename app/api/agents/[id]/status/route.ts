import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

// Função helper para obter a URL base do n8n
function getN8nBaseUrl(): string {
  const envUrl = process.env.N8N_WEBHOOK_URL || process.env.N8N_URL || "https://n8n.myoichat.online"
  
  // Se a URL contém /webhook/, extrair apenas a base
  if (envUrl.includes("/webhook/")) {
    return envUrl.split("/webhook/")[0]
  }
  
  // Remove barras no final se existirem
  return envUrl.replace(/\/$/, "")
}

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

    try {
      const n8nBaseUrl = getN8nBaseUrl()
      const n8nWebhookUrl = `${n8nBaseUrl}/webhook/check-status`
      
      console.log("Chamando webhook n8n para verificar status:", n8nWebhookUrl)
      console.log("Dados enviados:", { agent_id: agentId })
      
      // Fazer requisição para o webhook n8n
      const n8nResponse = await fetch(n8nWebhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agent_id: agentId,
        }),
      })

      console.log("Status da resposta n8n:", n8nResponse.status)
      
      // Verificar se a resposta é JSON
      const contentType = n8nResponse.headers.get("content-type")
      let n8nData
      
      if (contentType && contentType.includes("application/json")) {
        n8nData = await n8nResponse.json()
      } else {
        const text = await n8nResponse.text()
        console.error("Resposta do n8n não é JSON:", text)
        throw new Error(`Resposta inválida do webhook n8n: ${text.substring(0, 100)}`)
      }
      
      console.log("Dados recebidos do n8n:", n8nData)

      // A resposta do n8n pode vir em dois formatos (similar ao create)
      let responseData = n8nData
      if (n8nData?.data) {
        responseData = n8nData.data
      }

      // Extrair status da resposta
      const status = responseData?.status || responseData?.connection_status || "disconnected"
      const isConnected = status === "connected" || status === "open" || status === "ready"

      // Retornar resposta com status
      return NextResponse.json({
        success: true,
        status: status,
        connected: isConnected,
        message: responseData?.message || (isConnected ? "WhatsApp conectado" : "WhatsApp desconectado"),
      })
    } catch (n8nError: any) {
      console.error("Erro no webhook n8n:", n8nError)
      // Se o n8n não responder, retornar status desconectado
      return NextResponse.json({
        success: false,
        status: "disconnected",
        connected: false,
        error: n8nError.message || "Erro ao verificar status",
      })
    }
  } catch (error: any) {
    console.error("Erro no check-status:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Erro interno do servidor",
        status: "disconnected",
        connected: false,
      },
      { status: 500 }
    )
  }
}


import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

import { getWebhookUrl } from "@/lib/webhook-utils"

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

    // Ler body da requisição
    const body = await request.json()
    const { agent_id } = body

    if (!agent_id) {
      return NextResponse.json({ success: false, error: "agent_id é obrigatório" }, { status: 400 })
    }

    // Verificar se o agente pertence ao usuário
    const { data: agent, error: agentError } = await supabase
      .from("agents")
      .select("*")
      .eq("id", agent_id)
      .eq("user_id", user.id)
      .single()

    if (agentError || !agent) {
      return NextResponse.json({ success: false, error: "Agente não encontrado" }, { status: 404 })
    }

    try {
      const webhookUrl = getWebhookUrl("api/agents/connect-whatsapp")
      console.log("Chamando backend:", webhookUrl)
      console.log("Dados enviados:", { agent_id })

      // Fazer requisição para o backend
      const n8nResponse = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agent_id,
        }),
      })

      console.log("Status da resposta n8n:", n8nResponse.status)

      // Verificar se a resposta é JSON
      const contentType = n8nResponse.headers.get("content-type")
      let n8nData

      if (contentType && contentType.includes("application/json")) {
        n8nData = await n8nResponse.json()
      } else {
        // Se não for JSON, tentar ler como texto
        const text = await n8nResponse.text()
        console.error("Resposta do n8n não é JSON:", text)
        throw new Error(`Resposta inválida do webhook n8n: ${text.substring(0, 100)}`)
      }

      console.log("Dados recebidos do n8n:", n8nData)

      if (!n8nResponse.ok || !n8nData.success) {
        return NextResponse.json(
          {
            success: false,
            error: n8nData.message || n8nData.error || "Erro ao conectar com WhatsApp",
          },
          { status: n8nResponse.status || 500 }
        )
      }

      // Retornar resposta com QR code
      return NextResponse.json({
        success: true,
        qr: n8nData.qr || null,
        status: n8nData.status || "pending",
        message: n8nData.message || "Escaneie o QR code para conectar seu número de WhatsApp.",
      })
    } catch (n8nError: any) {
      console.error("Erro no webhook n8n:", n8nError)
      return NextResponse.json(
        {
          success: false,
          error: n8nError.message || "Erro ao conectar com webhook n8n",
        },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error("Erro no connect-whatsapp:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Erro interno do servidor",
      },
      { status: 500 }
    )
  }
}

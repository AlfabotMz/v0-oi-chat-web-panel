import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

import { getWebhookUrl } from "@/lib/webhook-utils"

export async function DELETE(
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

    // Deletar o agente no Supabase diretamente (n8n depreciado)
    const { error: deleteError } = await supabase
      .from("agents")
      .delete()
      .eq("id", agentId)
      .eq("user_id", user.id)

    if (deleteError) {
      console.error("Erro ao deletar agente no Supabase:", deleteError)
      return NextResponse.json(
        {
          success: false,
          error: deleteError.message || "Erro ao deletar agente no banco de dados",
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Agente deletado com sucesso!",
    })
  } catch (error: any) {
    console.error("Erro no delete-agent:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Erro interno do servidor",
      },
      { status: 500 }
    )
  }
}

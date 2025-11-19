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

    try {
      const n8nBaseUrl = getN8nBaseUrl()
      const n8nWebhookUrl = `${n8nBaseUrl}/webhook/delete-agent`
      
      console.log("Chamando webhook n8n para deletar agente:", n8nWebhookUrl)
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
        // Mesmo se não for JSON, continuar com a deleção no Supabase
      }
      
      console.log("Dados recebidos do n8n:", n8nData)

      // A resposta do n8n pode vir em dois formatos (similar ao create)
      let responseData = n8nData
      if (n8nData?.data) {
        responseData = n8nData.data
      }

      // Verificar sucesso (similar ao create)
      const hasPositiveMessage = responseData?.message && 
        (responseData.message.toLowerCase().includes("sucesso") || 
         responseData.message.toLowerCase().includes("success") ||
         responseData.message.toLowerCase().includes("deletado") ||
         responseData.message.toLowerCase().includes("removido"))
      
      const isSuccess = responseData?.success === true || 
                       (n8nResponse.ok && hasPositiveMessage) ||
                       (n8nResponse.ok && !responseData?.error)

      // Mesmo se o n8n falhar, tentar deletar no Supabase
      // (pode ser que o agente não exista no n8n mas exista no Supabase)
      if (!isSuccess && n8nResponse.status !== 404) {
        console.warn("n8n retornou erro, mas continuando com deleção no Supabase:", responseData)
      }

      // Deletar o agente no Supabase
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

      // Retornar resposta de sucesso
      return NextResponse.json({
        success: true,
        message: "Agente deletado com sucesso!",
      })
    } catch (n8nError: any) {
      console.error("Erro no webhook n8n:", n8nError)
      // Mesmo se o n8n falhar, tentar deletar no Supabase
      const { error: deleteError } = await supabase
        .from("agents")
        .delete()
        .eq("id", agentId)
        .eq("user_id", user.id)

      if (deleteError) {
        return NextResponse.json(
          {
            success: false,
            error: "Erro ao deletar agente",
          },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: "Agente deletado com sucesso! (n8n não respondeu, mas foi deletado do banco)",
      })
    }
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

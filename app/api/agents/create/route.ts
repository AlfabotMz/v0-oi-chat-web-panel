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
    const { nome, prompt, phone_number, product, contact_owner, contact_delivery, custom_message } = body

    if (!nome || !prompt) {
      return NextResponse.json(
        { success: false, error: "nome e prompt são obrigatórios" },
        { status: 400 }
      )
    }

    try {
      const n8nBaseUrl = getN8nBaseUrl()
      const n8nWebhookUrl = `${n8nBaseUrl}/webhook/create-agent`

      console.log("Chamando webhook n8n para criar agente:", n8nWebhookUrl)
      console.log("Dados enviados:", { user_id: user.id, nome, prompt, product })

      // Fazer requisição para o webhook n8n
      const n8nResponse = await fetch(n8nWebhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user.id,
          nome,
          prompt,
          product,
          contact_owner,
          contact_delivery,
          custom_message,
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

      // A resposta do n8n pode vir em dois formatos:
      // 1. { success: true, agent: {...} } - formato direto
      // 2. { data: { success: false, message: "...", agent: {...}, nome: "...", prompt: "...", status: "..." } } - formato com wrapper
      let responseData = n8nData

      // Se a resposta tem um wrapper "data", extrair de lá
      if (n8nData.data) {
        responseData = n8nData.data
      }

      // Verificar sucesso
      // O n8n pode retornar success: false mas com mensagem positiva, então verificamos ambos
      const hasPositiveMessage = responseData.message &&
        (responseData.message.toLowerCase().includes("sucesso") ||
          responseData.message.toLowerCase().includes("success") ||
          responseData.message.toLowerCase().includes("criado"))

      const isSuccess = responseData.success === true ||
        (n8nResponse.ok && hasPositiveMessage) ||
        (n8nResponse.ok && !responseData.error)

      if (!n8nResponse.ok || (!isSuccess && !hasPositiveMessage)) {
        return NextResponse.json(
          {
            success: false,
            error: responseData.message || responseData.error || n8nData.message || n8nData.error || "Erro ao criar agente no n8n",
          },
          { status: n8nResponse.status || 500 }
        )
      }

      // O n8n é responsável por criar o agente no Supabase
      // Não devemos criar manualmente aqui para evitar duplicação

      // Extrair o agent_id retornado pelo n8n
      const agentData = responseData.agent || {}
      const agentId = agentData.agent_id || responseData.agent_id

      // Se o n8n retornou um UUID válido, buscar o agente no Supabase
      // Caso contrário, retornar apenas os dados do n8n
      let agent = null

      if (agentId) {
        // Verificar se é um UUID válido (formato: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
        if (uuidRegex.test(agentId)) {
          // Buscar o agente criado pelo n8n no Supabase
          const { data: foundAgent, error: findError } = await supabase
            .from("agents")
            .select("*")
            .eq("id", agentId)
            .eq("user_id", user.id)
            .single()

          if (!findError && foundAgent) {
            agent = foundAgent
            console.log("Agente encontrado no Supabase:", foundAgent.id)
          } else {
            console.warn("Agente não encontrado no Supabase com ID:", agentId, findError)
            // Se não encontrou, pode ser que o n8n ainda não tenha criado
            // ou o agent_id não seja o UUID do Supabase
          }
        } else {
          console.log("agent_id não é um UUID válido, pode ser um ID interno do n8n:", agentId)
        }
      }

      // Se não encontrou o agente no Supabase, retornar os dados do n8n
      if (!agent) {
        const agentName = agentData.nome || responseData.nome || nome
        const agentPrompt = agentData.prompt || responseData.prompt || prompt
        const agentStatus = agentData.status || responseData.status || "disconnected"

        agent = {
          id: agentId || null,
          user_id: user.id,
          name: agentName,
          prompt: agentPrompt,
          phone_number: phone_number || null,
          status: agentStatus,
        }
      }

      // Retornar resposta com o agente criado pelo n8n
      return NextResponse.json({
        success: true,
        message: responseData.message || "Agente criado com sucesso!",
        agent: agent,
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
    console.error("Erro no create-agent:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Erro interno do servidor",
      },
      { status: 500 }
    )
  }
}

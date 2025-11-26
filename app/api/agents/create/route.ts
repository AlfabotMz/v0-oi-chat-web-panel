import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

// Função helper para obter a URL do webhook n8n
function getN8nWebhookUrl(): string {
  const envUrl = process.env.N8N_WEBHOOK_URL || process.env.N8N_URL || "https://n8n.myoichat.online"

  // Se a URL contém /webhook/, extrair apenas a base
  let baseUrl = envUrl
  if (envUrl.includes("/webhook/")) {
    baseUrl = envUrl.split("/webhook/")[0]
  }
  // Remove barras no final
  baseUrl = baseUrl.replace(/\/$/, "")

  return `${baseUrl}/webhook/create-agent`
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

    // Verificar plano do usuário
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan, subscription_status")
      .eq("id", user.id)
      .single()

    const plan = profile?.plan || "free"
    const status = profile?.subscription_status || "free"

    // Permitir apenas se for Pro, Business ou estiver em Trial
    const canCreateAgent = plan === "pro" || plan === "business" || status === "trial"

    if (!canCreateAgent) {
      return NextResponse.json({
        success: false,
        error: "Seu período de teste expirou ou você está no plano gratuito. Faça upgrade para criar agentes.",
        requires_upgrade: true
      }, { status: 403 })
    }

    // Ler dados do corpo da requisição
    const body = await request.json()
    const { nome, prompt, phone_number } = body

    if (!nome || !prompt) {
      return NextResponse.json({ success: false, error: "Nome e Prompt são obrigatórios" }, { status: 400 })
    }

    const webhookUrl = getN8nWebhookUrl()
    console.log("Chamando webhook n8n:", webhookUrl)

    // Fazer requisição para o webhook n8n
    let n8nData = null
    let n8nError = null

    try {
      const n8nResponse = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user.id,
          nome,
          prompt,
          phone_number,
          action: "create_agent"
        }),
      })

      const contentType = n8nResponse.headers.get("content-type")

      if (contentType && contentType.includes("application/json")) {
        n8nData = await n8nResponse.json()
      } else {
        const text = await n8nResponse.text()
        console.warn("Resposta do n8n não é JSON:", text)
        n8nError = `Resposta inválida do webhook n8n: ${text.substring(0, 100)}`
      }
    } catch (err: any) {
      console.error("Erro ao chamar webhook n8n:", err)
      n8nError = err.message
    }

    console.log("Dados recebidos do n8n:", n8nData)

    // Se o n8n falhou ou não retornou sucesso, criar localmente
    // A resposta do n8n pode vir em dois formatos:
    // 1. { success: true, agent: {...} } - formato direto
    // 2. { data: { success: false, message: "...", agent: {...}, ... } } - formato com wrapper

    let responseData = n8nData || {}
    if (n8nData?.data) {
      responseData = n8nData.data
    }

    const hasPositiveMessage = responseData.message &&
      (responseData.message.toLowerCase().includes("sucesso") ||
        responseData.message.toLowerCase().includes("success") ||
        responseData.message.toLowerCase().includes("criado"))

    const isSuccess = responseData.success === true || hasPositiveMessage

    // Se o n8n funcionou e retornou um agente, ótimo.
    // Se falhou, vamos criar localmente no Supabase como fallback.

    let agent = null
    const agentId = responseData.agent?.agent_id || responseData.agent_id || responseData.id

    if (isSuccess && agentId) {
      // Tentar buscar o agente criado pelo n8n
      const { data: foundAgent } = await supabase
        .from("agents")
        .select("*")
        .eq("id", agentId)
        .eq("user_id", user.id)
        .single()

      if (foundAgent) {
        agent = foundAgent
      }
    }

    // Fallback: Criar localmente se não existe ainda
    if (!agent) {
      console.log("Criando agente localmente (Fallback)...")
      const { data: newAgent, error: createError } = await supabase
        .from("agents")
        .insert({
          user_id: user.id,
          name: nome,
          welcome_message: prompt, // Usando prompt como welcome message ou description
          status: "active", // Criar como ativo por padrão
          phone_number: phone_number || null
        })
        .select()
        .single()

      if (createError) {
        console.error("Erro ao criar agente localmente:", createError)
        throw new Error("Falha ao criar agente: " + createError.message)
      }

      agent = newAgent
    }

    // Retornar resposta com o agente (seja do n8n ou local)
    return NextResponse.json({
      success: true,
      message: "Agente criado com sucesso!",
      agent: agent,
      warning: n8nError ? "Nota: Houve um erro na integração com n8n, mas o agente foi salvo localmente." : undefined
    })

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

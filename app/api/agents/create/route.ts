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

    // Verificar plano do usuário
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan, subscription_status")
      .eq("id", user.id)
      .single()

    const plan = profile?.plan || "free"
    const subStatus = profile?.subscription_status || "free"

    // Permitir apenas se for Pro, Business ou estiver em Trial
    const canCreateAgent = plan === "pro" || plan === "business" || subStatus === "trial"

    if (!canCreateAgent) {
      return NextResponse.json({
        success: false,
        error: "Seu período de teste expirou ou você está no plano gratuito. Faça upgrade para criar agentes.",
        requires_upgrade: true
      }, { status: 403 })
    }

    // Ler dados do corpo da requisição
    const body = await request.json()
    const {
      name,
      prompt,
      phone_number,
      product,
      amount,
      // Structured prompt fields
      prompt_type = 'dropshipper',
      audience,
      tone,
      product_description,
      contact_owner,
      contact_delivery,
      prompt_generated
    } = body

    if (!name || !prompt) {
      return NextResponse.json({ success: false, error: "Name e Prompt são obrigatórios" }, { status: 400 })
    }

    // Validação 1: Limite de Agentes Ativos para Free/Trial
    if (plan === "free" || subStatus === "trial") {
      const { count: activeAgentsCount } = await supabase
        .from("agents")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("status", "active")

      if (activeAgentsCount && activeAgentsCount >= 1) {
        // Bloquear criação se já tem um ativo ou definir como inativo (escolhemos criar como inativo se exceder?)
        // O pedido original era "so pode ter um unico agente ativo".
      }
    }

    const webhookUrl = getWebhookUrl("api/agents/create-agent")
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
          name,
          prompt,
          product,
          amount,
          phone_number,
          prompt_type,
          audience,
          tone,
          product_description,
          contact_owner,
          contact_delivery,
          prompt_generated,
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

    let responseData = n8nData || {}
    if (n8nData?.data) {
      responseData = n8nData.data
    }

    const isSuccess = responseData.success === true || (responseData.message && responseData.message.toLowerCase().includes("sucesso"))

    let agent = null
    const agentId = responseData.agent?.agent_id || responseData.agent_id || responseData.id

    if (isSuccess && agentId) {
      const { data: foundAgent } = await supabase
        .from("agents")
        .select("*")
        .eq("id", agentId)
        .eq("user_id", user.id)
        .single()
      if (foundAgent) agent = foundAgent
    }

    // Determine initial status
    let initialStatus = "active"
    if (plan === "free" || subStatus === "trial") {
      const { count: activeCount } = await supabase
        .from("agents")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("status", "active")
      if (activeCount && activeCount >= 1) initialStatus = "inactive"
    }

    // Fallback: Criar localmente se não existe ainda
    if (!agent) {
      console.log("Criando agente localmente (Fallback)...")
      const { data: newAgent, error: createError } = await supabase
        .from("agents")
        .insert({
          user_id: user.id,
          name: name,
          prompt: prompt,
          product: product,
          amount: amount,
          status: initialStatus,
          phone_number: phone_number || null,
          prompt_type,
          audience,
          tone,
          product_description,
          contact_owner: contact_owner || null,
          contact_delivery: contact_delivery || null,
          prompt_generated,
          message_delay: 5 // Default delay to 5 seconds
        })
        .select()
        .single()

      if (createError) throw createError
      agent = newAgent
    }

    return NextResponse.json({
      success: true,
      message: "Agente criado com sucesso!",
      agent: agent,
      warning: n8nError ? "Nota: Erro na integração n8n, agente salvo localmente." : undefined
    })

  } catch (error: any) {
    console.error("Erro no create-agent:", error)
    return NextResponse.json({ success: false, error: error.message || "Erro interno" }, { status: 500 })
  }
}

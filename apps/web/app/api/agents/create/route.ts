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

    // Permitir apenas se for Pro, Business, Premium ou estiver em Trial
    const canCreateAgent = plan === "pro" || plan === "business" || plan === "premium" || subStatus === "trial"

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

    // Validação 1: Limite de Agentes Ativos para Free/Trial/Premium/Pro
    const limit = (plan === "premium" || plan === "pro") ? 2 : 1
    if (plan === "free" || subStatus === "trial" || plan === "premium" || plan === "pro") {
      const { count: activeAgentsCount } = await supabase
        .from("agents")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("status", "active")

      if (activeAgentsCount && activeAgentsCount >= limit) {
        // Bloquear criação se já excedeu o limite ou definir como inativo
      }
    }

    // Determine initial status based on plan limits
    let initialStatus = "active"
    if (plan === "free" || subStatus === "trial" || plan === "premium" || plan === "pro") {
      const { count: activeCount } = await supabase
        .from("agents")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("status", "active")

      const activeLimit = (plan === "premium" || plan === "pro") ? 2 : 1
      if (activeCount && activeCount >= activeLimit) initialStatus = "inactive"
    }

    // Criar agente localmente
    const insertData: any = {
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
      message_delay: 5, // Default delay to 5 seconds
      custom_message: "🚀 Nova Encomenda Recebida!\n\n💸 Produto: {{product}}\n\n💸 Quantidade: {{quantity}}\n\n💸 Valor: {{price}}\n\n💸 Número: {{phone}}\n\n💸 Local: {{location}}\n\n💸 Data: {{date}}"
    }

    const { data: newAgent, error: createError } = await supabase
      .from("agents")
      .insert(insertData)
      .select()
      .single()

    if (createError) throw createError

    return NextResponse.json({
      success: true,
      message: "Agente criado com sucesso!",
      agent: newAgent
    })

  } catch (error: any) {
    console.error("Erro no create-agent:", error)
    return NextResponse.json({ success: false, error: error.message || "Erro interno" }, { status: 500 })
  }
}

"use server"

import { createClient } from "@/lib/supabase/server"

export async function getAgents() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Não autenticado")

    const { data: agents, error } = await supabase
        .from("agents")
        .select("id, name, waba_id, waba_access_token, waba_phone_number_id, waba_business_account_id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

    if (error) throw error
    return agents
}

async function apiCall(url: string, method: string, token: string, body?: any) {
    const options: RequestInit = {
        method,
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    }

    if (body) {
        options.body = JSON.stringify(body)
    }

    const response = await fetch(url, options)
    const data = await response.json()

    if (!response.ok) {
        return { success: false, error: data.error || data }
    }

    return { success: true, data }
}

export async function fetchWabaNumbers(agentId: string) {
    const supabase = await createClient()
    const { data: agent } = await supabase.from("agents").select("waba_id, waba_access_token, waba_business_account_id").eq("id", agentId).single()

    if (!agent || !agent.waba_access_token) throw new Error("Agente sem token de acesso")

    const wabaId = agent.waba_id || agent.waba_business_account_id
    if (!wabaId) throw new Error("WABA ID não configurado para este agente")

    const url = `https://graph.facebook.com/v19.0/${wabaId}/phone_numbers`
    return apiCall(url, "GET", agent.waba_access_token)
}

export async function fetchPhoneNumberDetails(agentId: string, phoneNumberId: string) {
    const supabase = await createClient()
    const { data: agent } = await supabase.from("agents").select("waba_access_token").eq("id", agentId).single()

    if (!agent || !agent.waba_access_token) throw new Error("Agente sem token de acesso")

    const url = `https://graph.facebook.com/v19.0/${phoneNumberId}`
    return apiCall(url, "GET", agent.waba_access_token)
}

export async function fetchWabaTemplates(agentId: string) {
    const supabase = await createClient()
    const { data: agent } = await supabase.from("agents").select("waba_id, waba_access_token, waba_business_account_id").eq("id", agentId).single()

    if (!agent || !agent.waba_access_token) throw new Error("Agente sem token de acesso")

    const wabaId = agent.waba_id || agent.waba_business_account_id
    if (!wabaId) throw new Error("WABA ID não configurado para este agente")

    const url = `https://graph.facebook.com/v19.0/${wabaId}/message_templates`
    return apiCall(url, "GET", agent.waba_access_token)
}

export async function createWabaTemplate(agentId: string, templateData: { name: string, text: string, category: string }) {
    const supabase = await createClient()
    const { data: agent } = await supabase.from("agents").select("waba_id, waba_access_token, waba_business_account_id").eq("id", agentId).single()

    if (!agent || !agent.waba_access_token) throw new Error("Agente sem token de acesso")

    const wabaId = agent.waba_id || agent.waba_business_account_id
    if (!wabaId) throw new Error("WABA ID não configurado para este agente")

    const url = `https://graph.facebook.com/v19.0/${wabaId}/message_templates`
    const payload = {
        name: templateData.name.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
        language: "pt_BR",
        category: templateData.category,
        components: [
            {
                type: "BODY",
                text: templateData.text
            }
        ]
    }
    return apiCall(url, "POST", agent.waba_access_token, payload)
}

export async function fetchWabaAccounts(agentId: string) {
    const supabase = await createClient()
    const { data: agent } = await supabase.from("agents").select("waba_access_token").eq("id", agentId).single()

    if (!agent || !agent.waba_access_token) throw new Error("Agente sem token de acesso")

    // Nota: Tentar assigned_whatsapp_business_accounts que é comum para tokens de usuário
    const url = `https://graph.facebook.com/v19.0/me/assigned_whatsapp_business_accounts`
    let res = await apiCall(url, "GET", agent.waba_access_token)

    // Se falhar, tentar o endpoint de debug que estava no código antes
    if (!res.success) {
        const fallbackUrl = `https://graph.facebook.com/v19.0/me/client_whatsapp_business_accounts`
        res = await apiCall(fallbackUrl, "GET", agent.waba_access_token)
    }

    return res
}

export async function fetchWabaSettings(agentId: string) {
    const supabase = await createClient()
    const { data: agent } = await supabase.from("agents").select("waba_id, waba_access_token, waba_business_account_id").eq("id", agentId).single()

    if (!agent || !agent.waba_access_token) throw new Error("Agente sem token de acesso")

    const wabaId = agent.waba_id || agent.waba_business_account_id
    if (!wabaId) throw new Error("WABA ID não configurado para este agente")

    const url = `https://graph.facebook.com/v19.0/${wabaId}`
    return apiCall(url, "GET", agent.waba_access_token)
}

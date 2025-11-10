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
    const { nome, prompt, phone_number } = body

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
      console.log("Dados enviados:", { user_id: user.id, nome, prompt })
      
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
            error: n8nData.message || n8nData.error || "Erro ao criar agente no n8n",
          },
          { status: n8nResponse.status || 500 }
        )
      }

      // Salvar o agente no Supabase com os dados retornados pelo n8n
      const agentData = n8nData.agent
      
      // O n8n retorna agent_id como string (ex: "agente_1234")
      // Mas a tabela agents usa UUID como id. Vamos gerar um UUID novo para o Supabase
      // O agent_id do n8n será usado apenas internamente pelo n8n
      
      const { data: insertedAgent, error: insertError } = await supabase
        .from("agents")
        .insert({
          // Não especificar id, deixar o Supabase gerar um UUID automaticamente
          user_id: user.id,
          name: agentData.nome,
          prompt: agentData.prompt,
          phone_number: phone_number || null,
          status: agentData.status || "disconnected",
        })
        .select()
        .single()

      if (insertError) {
        console.error("Erro ao salvar agente no Supabase:", insertError)
        return NextResponse.json(
          {
            success: false,
            error: insertError.message || "Erro ao salvar agente no banco de dados",
          },
          { status: 500 }
        )
      }

      // Retornar resposta com o agente criado
      return NextResponse.json({
        success: true,
        message: "Agente criado com sucesso!",
        agent: insertedAgent,
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


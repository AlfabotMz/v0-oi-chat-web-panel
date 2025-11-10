import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

// URL da Evolution API - deve ser configurada como variável de ambiente
const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || "https://api.evolution.com.br"

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

    // Criar instância na Evolution API
    const instanceName = `agente_${agent_id.replace(/-/g, "_")}`
    
    try {
      const evolutionResponse = await fetch(`${EVOLUTION_API_URL}/instance/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": process.env.EVOLUTION_API_KEY || "",
        },
        body: JSON.stringify({
          instanceName,
        }),
      })

      if (!evolutionResponse.ok) {
        const errorData = await evolutionResponse.json().catch(() => ({}))
        throw new Error(errorData.message || "Erro ao criar instância na Evolution API")
      }

      const evolutionData = await evolutionResponse.json()

      // Obter QR code
      let qrCode = null
      if (evolutionData.qrcode) {
        qrCode = evolutionData.qrcode.base64 || evolutionData.qrcode.code || evolutionData.qrcode
      } else {
        // Se não veio no create, tentar obter via endpoint de QR
        const qrResponse = await fetch(`${EVOLUTION_API_URL}/instance/connect/${instanceName}`, {
          method: "GET",
          headers: {
            "apikey": process.env.EVOLUTION_API_KEY || "",
          },
        })

        if (qrResponse.ok) {
          const qrData = await qrResponse.json()
          qrCode = qrData.qrcode?.base64 || qrData.qrcode?.code || qrData.qrcode
        }
      }

      // Atualizar agente com instance_id e status
      const { error: updateError } = await supabase
        .from("agents")
        .update({
          instance_id: instanceName,
          whatsapp_status: "pending",
        })
        .eq("id", agent_id)

      if (updateError) {
        console.error("Erro ao atualizar agente:", updateError)
      }

      return NextResponse.json({
        success: true,
        qr: qrCode ? `data:image/png;base64,${qrCode}` : null,
        status: "pending",
        instance_id: instanceName,
        message: qrCode 
          ? "Escaneie o QR code para conectar seu número de WhatsApp."
          : "Instância criada. Aguardando conexão...",
      })
    } catch (evolutionError: any) {
      console.error("Erro na Evolution API:", evolutionError)

      // Atualizar status para error
      await supabase
        .from("agents")
        .update({
          whatsapp_status: "error",
        })
        .eq("id", agent_id)

      return NextResponse.json(
        {
          success: false,
          error: evolutionError.message || "Erro ao conectar com Evolution API",
        },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error("Erro no webhook connect-whatsapp:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Erro interno do servidor",
      },
      { status: 500 }
    )
  }
}


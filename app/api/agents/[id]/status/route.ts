import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Verificar autenticação
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    // Buscar agente
    const { data: agent, error: agentError } = await supabase
      .from("agents")
      .select("whatsapp_status, instance_id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (agentError || !agent) {
      return NextResponse.json({ error: "Agente não encontrado" }, { status: 404 })
    }

    return NextResponse.json({
      status: agent.whatsapp_status || "disconnected",
      instance_id: agent.instance_id,
    })
  } catch (error: any) {
    console.error("Erro ao buscar status do agente:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}


import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> | { id: string } }
) {
    try {
        const supabase = await createClient()

        // 1. Autenticação
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser()

        if (userError || !user) {
            return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 })
        }

        // 2. Extrair ID do agente
        let agentId: string
        if (params instanceof Promise) {
            const resolvedParams = await params
            agentId = resolvedParams.id
        } else {
            agentId = params.id
        }

        if (!agentId) {
            return NextResponse.json({ success: false, error: "ID do agente obrigatório" }, { status: 400 })
        }

        // 3. Ler corpo da requisição
        const body = await request.json()
        const { status, phone_number, ...otherUpdates } = body

        // 4. Verificar plano do usuário
        const { data: profile } = await supabase
            .from("profiles")
            .select("plan, subscription_status")
            .eq("id", user.id)
            .single()

        const plan = profile?.plan || "free"
        const subStatus = profile?.subscription_status || "free"

        // 5. Se estiver tentando ativar o agente (status = 'active')
        if (status === "active") {
            // 5.1 Verificar limite de agentes ativos para Free/Trial
            if (plan === "free" || subStatus === "trial") {
                // Contar agentes ativos (excluindo o atual)
                const { count: activeCount } = await supabase
                    .from("agents")
                    .select("*", { count: "exact", head: true })
                    .eq("user_id", user.id)
                    .eq("status", "active")
                    .neq("id", agentId) // Excluir o próprio agente se ele já estiver ativo (embora se estiver ativo, não mudaria nada, mas por segurança)

                if (activeCount && activeCount >= 1) {
                    return NextResponse.json({
                        success: false,
                        error: "Limite atingido: Usuários Free/Trial podem ter apenas 1 agente ativo.",
                        requires_upgrade: true
                    }, { status: 403 })
                }
            }

            // 5.2 Verificar unicidade do telefone (se houver telefone associado)
            // Se o update inclui phone_number, usa ele. Se não, busca o atual do banco.
            let phoneToCheck = phone_number
            if (phoneToCheck === undefined) {
                const { data: currentAgent } = await supabase
                    .from("agents")
                    .select("phone_number")
                    .eq("id", agentId)
                    .single()
                phoneToCheck = currentAgent?.phone_number
            }

            if (phoneToCheck) {
                const { data: existingActive } = await supabase
                    .from("agents")
                    .select("id")
                    .eq("phone_number", phoneToCheck)
                    .eq("status", "active")
                    .neq("id", agentId)
                    .single()

                if (existingActive) {
                    // Auto-deactivate the other agent
                    await supabase
                        .from("agents")
                        .update({ status: "inactive" })
                        .eq("id", existingActive.id)
                }
            }
        }

        // 6. Executar atualização
        const updates: any = { ...otherUpdates }
        if (status !== undefined) updates.status = status
        if (phone_number !== undefined) updates.phone_number = phone_number

        const { data: updatedAgent, error: updateError } = await supabase
            .from("agents")
            .update(updates)
            .eq("id", agentId)
            .eq("user_id", user.id) // Garantir que pertence ao usuário
            .select()
            .single()

        if (updateError) {
            throw updateError
        }

        return NextResponse.json({
            success: true,
            agent: updatedAgent,
            message: "Agente atualizado com sucesso"
        })

    } catch (error: any) {
        console.error("Erro ao atualizar agente:", error)

        // Handle unique constraint violation
        if (error.code === '23505' || error.message?.includes('unique_active_agent_phone')) {
            return NextResponse.json({
                success: false,
                error: "Este número de WhatsApp já está ativo em outro agente (possivelmente em outra conta)."
            }, { status: 409 }) // 409 Conflict
        }

        return NextResponse.json({
            success: false,
            error: error.message || "Erro interno ao atualizar agente"
        }, { status: 500 })
    }
}

import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

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

        // Verificar se já usou o trial
        const { data: profile } = await supabase
            .from("profiles")
            .select("trial_used, subscription_status")
            .eq("id", user.id)
            .single()

        if (profile?.trial_used) {
            return NextResponse.json({ success: false, error: "Você já utilizou seu período de teste gratuito." }, { status: 400 })
        }

        // Ativar Trial
        const now = new Date()
        const trialEndDate = new Date()
        trialEndDate.setDate(now.getDate() + 7) // 7 dias de trial

        const { error: updateError } = await supabase
            .from("profiles")
            .update({
                subscription_status: "trial",
                plan_start_date: now.toISOString(),
                plan_end_date: trialEndDate.toISOString(),
                trial_used: true
            })
            .eq("id", user.id)

        if (updateError) {
            throw updateError
        }

        return NextResponse.json({
            success: true,
            message: "Período de teste ativado com sucesso!",
            plan_end_date: trialEndDate.toISOString()
        })

    } catch (error: any) {
        console.error("Erro ao ativar trial:", error)
        return NextResponse.json({ success: false, error: error.message || "Erro interno" }, { status: 500 })
    }
}

import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-12-15.clover",
})

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()

        // 1. Verificar autenticação
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser()

        if (userError || !user) {
            return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 })
        }

        // 2. Buscar perfil para pegar o stripe_subscription_id
        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("stripe_subscription_id")
            .eq("id", user.id)
            .single()

        if (profileError || !profile?.stripe_subscription_id) {
            return NextResponse.json({ success: false, error: "Assinatura não encontrada" }, { status: 404 })
        }

        // 3. Cancelar no Stripe (ao final do período)
        await stripe.subscriptions.update(profile.stripe_subscription_id, {
            cancel_at_period_end: true,
        })

        // 4. Atualizar status no banco de dados
        const { error: updateError } = await supabase
            .from("profiles")
            .update({
                subscription_status: "cancelled",
            })
            .eq("id", user.id)

        if (updateError) throw updateError

        return NextResponse.json({ success: true, message: "Assinatura cancelada com sucesso" })
    } catch (error: any) {
        console.error("Erro ao cancelar assinatura:", error)
        return NextResponse.json(
            { success: false, error: error.message || "Erro interno ao cancelar assinatura" },
            { status: 500 }
        )
    }
}

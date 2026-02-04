import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-12-15.clover",
})

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()

        // 1. Authenticate user
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser()

        if (userError || !user) {
            return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 })
        }

        const email = user.email
        if (!email) {
            return NextResponse.json({ success: false, error: "Email não encontrado" }, { status: 400 })
        }

        // 2. Search for Customer in Stripe by Email
        const customers = await stripe.customers.list({
            email: email,
            limit: 1,
        })

        if (customers.data.length === 0) {
            return NextResponse.json({ success: false, message: "Nenhum cliente Stripe encontrado para este email." })
        }

        const customer = customers.data[0]

        // 3. List Subscriptions for this Customer
        const subscriptions = await stripe.subscriptions.list({
            customer: customer.id,
            status: "all",
            limit: 1,
        })

        if (subscriptions.data.length === 0) {
            return NextResponse.json({ success: false, message: "Nenhuma assinatura encontrada no Stripe." })
        }

        const subscription = subscriptions.data[0]
        const status = subscription.status // 'active', 'trialing', etc.
        const planEndDate = new Date((subscription as any).current_period_end * 1000)

        // 4. Update Database
        const { error: updateError } = await supabase
            .from("profiles")
            .update({
                subscription_status: status === "trialing" ? "trial" : status,
                stripe_customer_id: customer.id,
                stripe_subscription_id: subscription.id,
                plan_end_date: planEndDate.toISOString(),
                onboarding_completed: true, // Failsafe: if they have a sub, they finished onboarding
                trial_used: true,
                plan: "pro", // Default plan for paid subscribers
                status: (status === "active" || status === "trialing") ? "active" : "inactive",
            })
            .eq("id", user.id)

        if (updateError) {
            console.error("Erro ao atualizar perfil durante sync:", updateError)
            return NextResponse.json({ success: false, error: "Erro ao atualizar banco de dados" }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            synced: true,
            status: status,
            plan_end_date: planEndDate.toISOString(),
        })

    } catch (error: any) {
        console.error("Erro no sync de subscrição:", error)
        return NextResponse.json(
            { success: false, error: error.message || "Erro interno" },
            { status: 500 }
        )
    }
}

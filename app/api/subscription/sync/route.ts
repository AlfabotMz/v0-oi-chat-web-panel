import { createClient as createAdminClient } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import Stripe from "stripe"

export async function POST(request: Request) {
    console.log("[Sync] Recebida requisição de sincronização")

    try {
        // 1. Verificar Variáveis de Ambiente
        const stripeKey = process.env.STRIPE_SECRET_KEY
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

        if (!stripeKey || !supabaseUrl || !supabaseServiceKey) {
            const missing = []
            if (!stripeKey) missing.push("STRIPE_SECRET_KEY")
            if (!supabaseUrl) missing.push("NEXT_PUBLIC_SUPABASE_URL")
            if (!supabaseServiceKey) missing.push("SUPABASE_SERVICE_ROLE_KEY")

            console.error("[Sync] Erro: Faltando variáveis:", missing)
            return NextResponse.json({
                success: false,
                error: "Configuração do servidor incompleta.",
                missing: missing
            }, { status: 500 })
        }

        // 2. Inicializar Clients
        const stripe = new Stripe(stripeKey, {
            apiVersion: "2025-12-15.clover" as any,
        })

        const supabaseAdmin = createAdminClient(supabaseUrl, supabaseServiceKey, {
            auth: { autoRefreshToken: false, persistSession: false },
        })

        const supabase = await createClient()

        // 3. Autenticação
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser()

        if (userError || !user) {
            console.error("[Sync] Erro de autenticação:", userError)
            return NextResponse.json({ success: false, error: "Usuário não autenticado." }, { status: 401 })
        }

        const email = user.email
        if (!email) {
            return NextResponse.json({ success: false, error: "Email não encontrado na sessão." }, { status: 400 })
        }

        console.log(`[Sync] Sincronizando: ${email}`)

        // 4. Stripe: Buscar Cliente
        const customers = await stripe.customers.list({
            email: email,
            limit: 1,
        })

        if (customers.data.length === 0) {
            return NextResponse.json({ success: false, message: "Nenhum cliente Stripe encontrado para este email." })
        }

        const customer = customers.data[0]

        // 5. Stripe: Buscar Assinaturas
        const subscriptions = await stripe.subscriptions.list({
            customer: customer.id,
            status: "all",
            limit: 1,
        })

        if (subscriptions.data.length === 0) {
            return NextResponse.json({ success: false, message: "Nenhuma assinatura ativa encontrada." })
        }

        const subscription = subscriptions.data[0]
        const status = subscription.status
        const planEndDate = new Date((subscription as any).current_period_end * 1000)

        // 6. Supabase: Atualizar Perfil via Admin
        const { error: updateError } = await supabaseAdmin
            .from("profiles")
            .update({
                subscription_status: status === "trialing" ? "trial" : status,
                stripe_customer_id: customer.id,
                stripe_subscription_id: subscription.id,
                plan_end_date: planEndDate.toISOString(),
                onboarding_completed: true,
                trial_used: true,
                plan: "pro",
                status: (status === "active" || status === "trialing" || status === "past_due") ? "active" : "inactive",
            })
            .eq("id", user.id)

        if (updateError) {
            console.error("[Sync] Erro no database:", updateError)
            return NextResponse.json({ success: false, error: "Erro ao atualizar banco de dados." }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            synced: true,
            status: status,
            plan_end_date: planEndDate.toISOString(),
        })

    } catch (error: any) {
        console.error("[Sync] Erro fatal:", error)
        return NextResponse.json(
            { success: false, error: error.message || "Erro interno do servidor" },
            { status: 500 }
        )
    }
}

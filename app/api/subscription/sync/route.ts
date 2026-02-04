import { createClient as createAdminClient } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-12-15.clover",
})

const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
    try {
        console.log("[Sync] Iniciando sync de subscrição...")

        // Diagnóstico de variáveis de ambiente
        console.log("[Sync] Verificando variáveis de ambiente...")
        if (!process.env.STRIPE_SECRET_KEY) console.error("[Sync] STRIPE_SECRET_KEY ausente")
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL) console.error("[Sync] NEXT_PUBLIC_SUPABASE_URL ausente")
        if (!process.env.SUPABASE_SERVICE_ROLE_KEY) console.error("[Sync] SUPABASE_SERVICE_ROLE_KEY ausente")

        const supabase = await createClient()

        // 1. Authenticate user
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser()

        if (userError || !user) {
            console.error("[Sync] Erro de autenticação:", userError)
            return NextResponse.json({ success: false, error: "Acesso não autorizado. Por favor, faça login novamente." }, { status: 401 })
        }

        const email = user.email
        console.log("[Sync] Usuário autenticado:", email)

        if (!email) {
            return NextResponse.json({ success: false, error: "Email do usuário não encontrado na sessão." }, { status: 400 })
        }

        // 2. Search for Customer in Stripe by Email
        console.log("[Sync] Buscando cliente no Stripe por email:", email)
        let customers;
        try {
            customers = await stripe.customers.list({
                email: email,
                limit: 1,
            })
        } catch (err: any) {
            console.error("[Sync] Erro ao listar clientes no Stripe:", err)
            return NextResponse.json({ success: false, error: `Erro na API do Stripe: ${err.message}` }, { status: 500 })
        }

        if (customers.data.length === 0) {
            console.log("[Sync] Nenhum cliente encontrado no Stripe para:", email)
            return NextResponse.json({ success: false, message: "Nenhum cliente Stripe encontrado para este email." })
        }

        const customer = customers.data[0]
        console.log("[Sync] Cliente encontrado:", customer.id)

        // 3. List Subscriptions for this Customer
        console.log("[Sync] Buscando assinaturas no Stripe para o cliente:", customer.id)
        let subscriptions;
        try {
            subscriptions = await stripe.subscriptions.list({
                customer: customer.id,
                status: "all",
                limit: 1,
            })
        } catch (err: any) {
            console.error("[Sync] Erro ao listar assinaturas no Stripe:", err)
            return NextResponse.json({ success: false, error: `Erro ao buscar assinaturas no Stripe: ${err.message}` }, { status: 500 })
        }

        if (subscriptions.data.length === 0) {
            console.log("[Sync] Nenhuma assinatura encontrada para o cliente.")
            return NextResponse.json({ success: false, message: "Nenhuma assinatura encontrada no Stripe para este cliente." })
        }

        const subscription = subscriptions.data[0]
        const status = subscription.status // 'active', 'trialing', etc.
        const planEndDate = new Date((subscription as any).current_period_end * 1000)
        console.log("[Sync] Assinatura encontrada:", subscription.id, "Status:", status)

        // 4. Update Database using Admin Client to bypass RLS
        console.log("[Sync] Atualizando banco de dados local via Admin...")
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
            console.error("[Sync] Erro ao atualizar perfil no Supabase Admin:", updateError)
            return NextResponse.json({ success: false, error: `Erro ao salvar dados no banco: ${updateError.message}` }, { status: 500 })
        }

        console.log("[Sync] Sincronização concluída com sucesso para:", email)
        return NextResponse.json({
            success: true,
            synced: true,
            status: status,
            plan_end_date: planEndDate.toISOString(),
        })

    } catch (error: any) {
        console.error("[Sync] Erro fatal inesperado:", error)
        return NextResponse.json(
            { success: false, error: `Erro interno inesperado: ${error.message}` },
            { status: 500 }
        )
    }
}

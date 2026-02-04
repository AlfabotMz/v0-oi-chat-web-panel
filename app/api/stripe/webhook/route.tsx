import { createClient as createAdminClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { Resend } from "resend"
import { PaymentSuccessEmail } from "@/components/emails/PaymentSuccessEmail"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-12-15.clover",
})

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "OiChat <onboarding@resend.dev>"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
    const body = await request.text()
    const signature = request.headers.get("stripe-signature") as string

    let event: Stripe.Event

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        )
    } catch (err: any) {
        console.error("Erro na assinatura do webhook:", err.message)
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
    }

    const supabaseAdmin = createAdminClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: { autoRefreshToken: false, persistSession: false },
    })

    // 1. Checkout Completo (Primeira Assinatura ou Trial)
    if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId

        if (!userId) {
            console.error("UserId não encontrado nos metadados da sessão")
            return NextResponse.json({ error: "UserId missing" }, { status: 400 })
        }

        try {
            let subscriptionStatus = "active"
            let planEndDate: Date

            if (session.subscription) {
                const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
                subscriptionStatus = subscription.status // 'trialing', 'active', etc.
                planEndDate = new Date((subscription as any).current_period_end * 1000)
            } else {
                planEndDate = new Date()
                planEndDate.setDate(planEndDate.getDate() + 30)
            }

            // Registrar pagamento
            const { data: payment } = await supabaseAdmin
                .from("payments")
                .insert({
                    user_id: userId,
                    amount: session.amount_total ? session.amount_total / 100 : 0,
                    currency: session.currency,
                    status: "completed",
                    payment_method: "stripe",
                    transaction_id: session.id,
                })
                .select()
                .single()

            const { data: profile } = await supabaseAdmin
                .from("profiles")
                .select("full_name, email")
                .eq("id", userId)
                .single()

            await supabaseAdmin
                .from("profiles")
                .update({
                    subscription_status: subscriptionStatus === "trialing" ? "trial" : "active",
                    status: "active",
                    plan: "pro",
                    access_type: "subscription",
                    stripe_customer_id: session.customer as string,
                    stripe_subscription_id: session.subscription as string,
                    plan_end_date: planEndDate.toISOString(),
                    trial_used: true,
                    onboarding_completed: true,
                })
                .eq("id", userId)

            if (profile?.email && session.amount_total! > 0) {
                await resend.emails.send({
                    from: FROM_EMAIL,
                    to: profile.email,
                    subject: "Fatura OiChat - Pagamento Confirmado",
                    react: (
                        <PaymentSuccessEmail
                            userName={profile.full_name || "Cliente"}
                            transactionId={session.id}
                            date={new Date().toLocaleDateString("pt-BR")}
                            amount={`${session.amount_total ? session.amount_total / 100 : 0} ${session.currency?.toUpperCase()}`}
                            planName="Plano Business"
                            duration="1 Mês"
                        />
                    ),
                })
            }
        } catch (error) {
            console.error("Erro ao processar checkout.session.completed:", error)
        }
    }

    // 2. Sincronização Geral de Assinatura (Update ou Delete)
    if (event.type === "customer.subscription.deleted" || event.type === "customer.subscription.updated") {
        const subscription = event.data.object as Stripe.Subscription

        const statusMap: Record<string, string> = {
            active: "active",
            trialing: "trial",
            past_due: "past_due",
            canceled: "cancelled",
            unpaid: "unpaid",
            incomplete: "incomplete"
        }

        const newStatus = statusMap[subscription.status] || subscription.status

        await supabaseAdmin
            .from("profiles")
            .update({
                subscription_status: newStatus,
                status: (newStatus === "active" || newStatus === "trial") ? "active" : "inactive",
                plan_end_date: new Date((subscription as any).current_period_end * 1000).toISOString()
            })
            .eq("stripe_subscription_id", subscription.id)
    }

    // 3. Falha de Pagamento
    if (event.type === "invoice.payment_failed") {
        const invoice = event.data.object as any
        const subscriptionId = invoice.subscription as string

        if (subscriptionId) {
            await supabaseAdmin
                .from("profiles")
                .update({
                    subscription_status: "past_due",
                    status: "inactive"
                })
                .eq("stripe_subscription_id", subscriptionId)
        }
    }

    // 4. Pagamento de Renovação bem sucedido
    if (event.type === "invoice.paid") {
        const invoice = event.data.object as any
        const subscriptionId = invoice.subscription as string

        if (subscriptionId && invoice.billing_reason === 'subscription_cycle') {
            const { data: profile } = await supabaseAdmin
                .from("profiles")
                .select("id, plan_end_date")
                .eq("stripe_subscription_id", subscriptionId)
                .single()

            if (profile) {
                const now = new Date()
                let currentEndDate = profile.plan_end_date ? new Date(profile.plan_end_date) : now
                if (currentEndDate < now) currentEndDate = now

                const newEndDate = new Date(currentEndDate)
                newEndDate.setDate(newEndDate.getDate() + 30)

                await supabaseAdmin
                    .from("profiles")
                    .update({
                        subscription_status: "active",
                        status: "active",
                        plan_end_date: newEndDate.toISOString()
                    })
                    .eq("id", profile.id)
            }
        }
    }

    return NextResponse.json({ received: true })
}

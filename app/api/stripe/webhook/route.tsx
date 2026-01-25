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

    if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId

        if (!userId) {
            console.error("UserId não encontrado nos metadados da sessão")
            return NextResponse.json({ error: "UserId missing" }, { status: 400 })
        }

        const supabaseAdmin = createAdminClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        })

        try {
            // 1. Registrar pagamento
            const { data: payment, error: paymentError } = await supabaseAdmin
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

            if (paymentError) throw paymentError

            // 2. Verificar histórico para bônus
            const { count } = await supabaseAdmin
                .from("payments")
                .select("*", { count: "exact", head: true })
                .eq("user_id", userId)
                .eq("status", "completed")

            // Se count for 1, é o primeiro pagamento (o que acabamos de inserir)
            // Mas para segurança, vamos considerar "primeiro pagamento" se count <= 1
            const isFirstPayment = (count || 0) <= 1

            const { data: profile } = await supabaseAdmin
                .from("profiles")
                .select("trial_used, full_name, email, plan_end_date")
                .eq("id", userId)
                .single()

            const trialUsed = profile?.trial_used || false

            // Lógica de Bônus:
            // Se for primeiro pagamento E não usou trial = 60 dias
            // Caso contrário = 30 dias
            const daysToAdd = isFirstPayment && !trialUsed ? 60 : 30
            const durationText = isFirstPayment && !trialUsed ? "2 Meses (Oferta Especial)" : "1 Mês"

            // Calcular nova data
            const now = new Date()
            let currentEndDate = profile?.plan_end_date ? new Date(profile.plan_end_date) : now
            if (currentEndDate < now) currentEndDate = now

            const newEndDate = new Date(currentEndDate)
            newEndDate.setDate(newEndDate.getDate() + daysToAdd)

            // 3. Atualizar perfil
            await supabaseAdmin
                .from("profiles")
                .update({
                    subscription_status: "active",
                    status: "active",
                    plan: "pro",
                    access_type: "subscription",
                    plan_end_date: newEndDate.toISOString(),
                    last_payment_id: payment.id,
                    trial_used: true,
                })
                .eq("id", userId)

            // 4. Enviar Email
            if (profile?.email) {
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
                            duration={durationText}
                        />
                    ),
                })
            }

            console.log(`Pagamento processado com sucesso para user ${userId}`)
        } catch (error) {
            console.error("Erro ao processar webhook:", error)
            return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
        }
    }

    return NextResponse.json({ received: true })
}

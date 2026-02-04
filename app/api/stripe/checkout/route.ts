import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-12-15.clover", // Use latest or compatible version
})

export async function POST(request: NextRequest) {
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

        // 2. Criar Sessão de Checkout
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price: process.env.STRIPE_PRICE_ID,
                    quantity: 1,
                },
            ],
            mode: "subscription",
            subscription_data: {
                trial_period_days: 7,
            },
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/onboarding?payment=success`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout?payment=cancelled`,
            metadata: {
                userId: user.id,
                email: user.email || "",
            },
            customer_email: user.email,
        })

        return NextResponse.json({ success: true, url: session.url })
    } catch (error: any) {
        console.error("Erro ao criar sessão do Stripe:", error)
        return NextResponse.json(
            { success: false, error: error.message || "Erro ao iniciar pagamento" },
            { status: 500 }
        )
    }
}

import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import Stripe from "stripe"

export async function POST(request: Request) {
    try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
            apiVersion: "2024-11-20.acacia" as any,
        })

        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            console.error("[Portal] Usuário não encontrado na sessão")
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
        }

        // Buscar stripe_customer_id do perfil
        const { data: profile } = await supabase
            .from("profiles")
            .select("stripe_customer_id")
            .eq("id", user.id)
            .single()

        console.log(`[Portal] User: ${user.email}, CustomerID: ${profile?.stripe_customer_id}`)

        if (!profile?.stripe_customer_id) {
            return NextResponse.json({ error: "ID de cliente Stripe não encontrado. Você possui uma assinatura ativa?" }, { status: 400 })
        }

        let baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
        if (!baseUrl.startsWith('http')) {
            baseUrl = `http://${baseUrl}`
        }

        const returnUrl = `${baseUrl}/dashboard/settings`
        console.log(`[Portal] Creating session with returnUrl: ${returnUrl}`)

        // Criar sessão do portal
        const session = await stripe.billingPortal.sessions.create({
            customer: profile.stripe_customer_id,
            return_url: returnUrl,
        })

        return NextResponse.json({ url: session.url })
    } catch (error: any) {
        console.error("[Stripe Portal Error]:", error)
        return NextResponse.json({
            error: "Erro ao criar sessão do portal",
            details: error.message
        }, { status: 500 })
    }
}

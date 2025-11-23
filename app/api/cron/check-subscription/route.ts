import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import { TrialEndedEmail } from "@/components/emails/TrialEndedEmail"
import { ExpiringSoonEmail } from "@/components/emails/ExpiringSoonEmail"

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "OiChat <onboarding@resend.dev>"
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://oichat.com"

export async function GET(request: NextRequest) {
    // Verificar chave de segurança para o Cron (opcional, mas recomendado)
    const authHeader = request.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        // return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        // Para facilitar testes manuais agora, vamos deixar passar ou logar
        console.log("Cron executado sem chave secreta ou chave inválida")
    }

    try {
        const supabase = await createClient()
        const now = new Date()

        // 1. Verificar assinaturas expiradas (hoje)
        // Buscar usuários ativos/trial cujo plan_end_date < agora
        const { data: expiredUsers, error: expiredError } = await supabase
            .from("profiles")
            .select("id, email, full_name, plan, subscription_status")
            .lt("plan_end_date", now.toISOString())
            .in("subscription_status", ["active", "trial"])

        if (expiredError) throw expiredError

        console.log(`Encontrados ${expiredUsers?.length || 0} usuários expirados`)

        for (const user of expiredUsers || []) {
            // Atualizar status para expired
            await supabase
                .from("profiles")
                .update({ subscription_status: "expired" })
                .eq("id", user.id)

            // Enviar email
            if (user.email) {
                await resend.emails.send({
                    from: FROM_EMAIL,
                    to: user.email,
                    subject: "Sua assinatura do OiChat expirou",
                    react: TrialEndedEmail({
                        userName: user.full_name || "Usuário",
                        planName: user.plan === "free" ? "Teste Grátis" : "Plano Business",
                        checkoutUrl: `${APP_URL}/checkout`
                    })
                })
                console.log(`Email de expiração enviado para ${user.email}`)
            }
        }

        // 2. Verificar assinaturas expirando em 5 dias
        const fiveDaysFromNow = new Date()
        fiveDaysFromNow.setDate(fiveDaysFromNow.getDate() + 5)
        // Ajustar para comparar apenas o dia (ignorar hora exata para pegar todos do dia)
        const startOfDay = new Date(fiveDaysFromNow.setHours(0, 0, 0, 0)).toISOString()
        const endOfDay = new Date(fiveDaysFromNow.setHours(23, 59, 59, 999)).toISOString()

        const { data: expiringUsers, error: expiringError } = await supabase
            .from("profiles")
            .select("id, email, full_name, plan_end_date")
            .gte("plan_end_date", startOfDay)
            .lte("plan_end_date", endOfDay)
            .in("subscription_status", ["active", "trial"])

        if (expiringError) throw expiringError

        console.log(`Encontrados ${expiringUsers?.length || 0} usuários expirando em 5 dias`)

        for (const user of expiringUsers || []) {
            if (user.email) {
                await resend.emails.send({
                    from: FROM_EMAIL,
                    to: user.email,
                    subject: "Sua assinatura do OiChat expira em 5 dias",
                    react: ExpiringSoonEmail({
                        userName: user.full_name || "Usuário",
                        daysLeft: 5,
                        checkoutUrl: `${APP_URL}/checkout`
                    })
                })
                console.log(`Email de aviso enviado para ${user.email}`)
            }
        }

        return NextResponse.json({
            success: true,
            processed: {
                expired: expiredUsers?.length || 0,
                expiring_soon: expiringUsers?.length || 0
            }
        })

    } catch (error: any) {
        console.error("Erro no Cron Job:", error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}

import { createClient } from "@/lib/supabase/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import { PaymentSuccessEmail } from "@/components/emails/PaymentSuccessEmail"

// Configuração da API PayMoz
const PAYMOZ_API_URL = "https://paymoz.tech/api/v1/pagamentos/processar/"
const PAYMOZ_API_KEY = process.env.PAYMOZ_API_KEY
const RESEND_API_KEY = process.env.RESEND_API_KEY
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "OiChat <onboarding@resend.dev>"
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const resend = new Resend(RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verificar autenticação (usando cliente normal)
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 })
    }

    // Criar cliente Admin para operações de banco (bypassing RLS)
    const supabaseAdmin = createAdminClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    const body = await request.json()
    const { metodo, numero_celular } = body

    if (!metodo || !numero_celular) {
      return NextResponse.json({ success: false, error: "Método e número de celular são obrigatórios" }, { status: 400 })
    }

    // Valor fixo para o plano Business: 960 MT
    const AMOUNT = "960.00"

    // 1. Registrar tentativa de pagamento no banco (status pending)
    const { data: payment, error: paymentError } = await supabaseAdmin
      .from("payments")
      .insert({
        user_id: user.id,
        amount: parseFloat(AMOUNT),
        currency: "MZN",
        status: "pending",
        payment_method: metodo,
        phone_number: numero_celular
      })
      .select()
      .single()

    if (paymentError) {
      console.error("Erro ao criar registro de pagamento:", paymentError)
      return NextResponse.json({ success: false, error: "Erro ao iniciar pagamento" }, { status: 500 })
    }

    // 2. Chamar API da PayMoz
    if (!PAYMOZ_API_KEY) {
      console.error("PAYMOZ_API_KEY não configurada")
      return NextResponse.json({ success: false, error: "Erro de configuração do servidor" }, { status: 500 })
    }

    const paymozPayload = {
      metodo: metodo, // "mpesa" ou "emola"
      valor: AMOUNT,
      numero_celular: numero_celular
    }

    console.log("Enviando requisição para PayMoz:", paymozPayload)

    const response = await fetch(PAYMOZ_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `ApiKey ${PAYMOZ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(paymozPayload)
    })

    const data = await response.json()
    console.log("Resposta PayMoz:", data)

    // 3. Verificar sucesso da PayMoz
    if (response.ok) {
      // 4. Atualizar pagamento para completed
      await supabaseAdmin
        .from("payments")
        .update({
          status: "completed",
          transaction_id: data.transaction_id || data.id || `TX-${Date.now()}`
        })
        .eq("id", payment.id)

      // 5. Calcular tempo de acesso
      // Verificar se é o primeiro pagamento
      const { count } = await supabaseAdmin
        .from("payments")
        .select("*", { count: 'exact', head: true })
        .eq("user_id", user.id)
        .eq("status", "completed")

      const isFirstPayment = count === 1

      // Verificar se já usou trial
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("trial_used, full_name, email, plan_end_date")
        .eq("id", user.id)
        .single()

      const trialUsed = profile?.trial_used || false

      // Lógica de Bônus:
      // Se for primeiro pagamento E não usou trial = 60 dias (2 meses)
      // Caso contrário (renovação ou já usou trial) = 30 dias (1 mês)
      const daysToAdd = (isFirstPayment && !trialUsed) ? 60 : 30
      const durationText = (isFirstPayment && !trialUsed) ? "2 Meses (Oferta Especial)" : "1 Mês"

      // Calcular nova data de fim
      const now = new Date()
      let currentEndDate = profile?.plan_end_date ? new Date(profile.plan_end_date) : now

      if (currentEndDate < now) {
        currentEndDate = now
      }

      const newEndDate = new Date(currentEndDate)
      newEndDate.setDate(newEndDate.getDate() + daysToAdd)

      // 6. Atualizar perfil do usuário
      await supabaseAdmin
        .from("profiles")
        .update({
          subscription_status: "active",
          plan: "pro", // Define explicitamente o plano Pro (antigo Business)
          plan_end_date: newEndDate.toISOString(),
          last_payment_id: payment.id,
          trial_used: true // Marca como true pois agora é assinante
        })
        .eq("id", user.id)

      // 7. Enviar Email de Fatura
      if (profile?.email) {
        try {
          await resend.emails.send({
            from: FROM_EMAIL,
            to: profile.email,
            subject: "Fatura OiChat - Pagamento Confirmado",
            react: <PaymentSuccessEmail
              userName={profile.full_name || "Cliente"}
              transactionId={data.transaction_id || payment.id}
              date={new Date().toLocaleDateString('pt-BR')}
              amount={`${AMOUNT} MT`}
              planName="Plano Business"
              duration={durationText}
            />
          })

          return NextResponse.json({
            success: true,
            message: (isFirstPayment && !trialUsed)
              ? "Pagamento confirmado! Você ganhou 2 meses de acesso."
              : "Pagamento confirmado! Assinatura renovada por 1 mês.",
            plan_end_date: newEndDate.toISOString()
          })

        } else {
          // Pagamento falhou na PayMoz
          await supabaseAdmin
            .from("payments")
            .update({ status: "failed" })
            .eq("id", payment.id)

          return NextResponse.json({
            success: false,
            error: data.message || "Falha no processamento do pagamento"
          }, { status: 400 })
        }

      } catch (error: any) {
        console.error("Erro no processamento de pagamento:", error)
        return NextResponse.json({ success: false, error: error.message || "Erro interno" }, { status: 500 })
      }
    }

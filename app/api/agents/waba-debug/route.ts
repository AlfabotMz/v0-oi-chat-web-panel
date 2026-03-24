import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
    try {
        const { code } = await request.json()

        if (!code) return NextResponse.json({ success: false, error: "Code missing" }, { status: 400 })

        // 1. Trocar OAuth Code por Access Token
        const tokenUrl = `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${process.env.NEXT_PUBLIC_FACEBOOK_APP_ID}&client_secret=${process.env.FACEBOOK_APP_SECRET}&code=${code}`
        const tokenRes = await fetch(tokenUrl)
        const tokenData = await tokenRes.json()

        if (tokenData.error) {
            return NextResponse.json({ success: false, error: tokenData.error }, { status: 400 })
        }

        const access_token = tokenData.access_token

        // 2. Fetch contas WABA conectadas ao usuário
        const wabaRes = await fetch(`https://graph.facebook.com/v19.0/me/client_whatsapp_business_accounts?access_token=${access_token}`)
        const wabaData = await wabaRes.json()

        let fullData: any[] = []

        // 3. Para cada Conta WABA, buscar detalhes aprofundados e seus números
        if (wabaData.data) {
            for (const account of wabaData.data) {
                const wabaId = account.id

                // Detalhes da conta (moeda, timezone, nome, etc)
                const detailsRes = await fetch(`https://graph.facebook.com/v19.0/${wabaId}?fields=name,currency,timezone_id,message_template_namespace&access_token=${access_token}`)
                const detailsData = await detailsRes.json()

                // Números de telefone com status e quality
                const phoneRes = await fetch(`https://graph.facebook.com/v19.0/${wabaId}/phone_numbers?fields=display_phone_number,quality_rating,verified_name,status&access_token=${access_token}`)
                const phoneData = await phoneRes.json()

                fullData.push({
                    waba_id: wabaId,
                    details: detailsData,
                    phone_numbers: phoneData.data || []
                })
            }
        }

        return NextResponse.json({
            success: true,
            access_token,
            accounts: fullData,
            raw_token_data: tokenData
        })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}

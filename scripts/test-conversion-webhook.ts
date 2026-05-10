import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"

dotenv.config({ path: ".env.local" })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase environment variables")
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testWebhook() {
    const agentId = "0c0a4a82-1af3-4466-8633-1b6e71ff933e"

    console.log(`Pinging local webhook for agent ${agentId}...`)

    const randomId = Math.floor(Math.random() * 1000)
    const payload = {
        date: new Date().toISOString().split('T')[0],
        agentId: agentId,
        userNumber: `55119999${randomId}`,
        form: `🚀 Nova Encomenda Recebida (Teste #${randomId})!\n\n💸 Produto: Teste API Local\n💸 Quantidade: 1\n💸 Valor: 50.00\n💸 Número: 55119999${randomId}\n💸 Local: Rua Teste, 123`
    }

    try {
        const res = await fetch("http://localhost:3000/api/webhooks/conversion", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const json = await res.json()
        console.log("Webhook Response:", json)
    } catch (e) {
        console.error("Local server might not be running (http://localhost:3000).", e)
    }
}

testWebhook()

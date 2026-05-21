import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"
import * as path from "path"

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("❌ Missing Supabase credentials in .env.local")
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function getTestAgent() {
    console.log("🔍 Fetching an agent with WABA credentials...")
    const { data: agents, error } = await supabase
        .from("agents")
        .select("waba_id, waba_access_token, waba_phone_number_id, waba_business_account_id")
        .not("waba_access_token", "is", null)
        .limit(1)

    if (error || !agents || agents.length === 0) {
        console.error("❌ No agent found with WABA credentials in the database.")
        return null
    }

    return agents[0]
}

async function apiCall(url: string, method: string, token: string, body?: any) {
    const options: RequestInit = {
        method,
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    }

    if (body) {
        options.body = JSON.stringify(body)
    }

    const response = await fetch(url, options)
    const data = await response.json()

    if (!response.ok) {
        console.error(`❌ API Call Failed: ${method} ${url}`)
        console.error(JSON.stringify(data, null, 2))
        return null
    }

    return data
}

async function runTests() {
    let waba_id = process.env.WABA_ID
    let waba_access_token = process.env.WABA_ACCESS_TOKEN
    let waba_phone_number_id = process.env.WABA_PHONE_NUMBER_ID
    let waba_business_account_id = process.env.WABA_ID

    if (!waba_access_token || !waba_id) {
        const agent = await getTestAgent()
        if (agent) {
            waba_id = waba_id || agent.waba_id || agent.waba_business_account_id
            waba_access_token = waba_access_token || agent.waba_access_token
            waba_phone_number_id = waba_phone_number_id || agent.waba_phone_number_id
        }
    }

    if (!waba_access_token || !waba_id) {
        console.error("❌ No WABA ID or Access Token provided.")
        console.log("💡 Use: WABA_ID=xxx WABA_ACCESS_TOKEN=yyy pnpm dlx tsx scripts/test-waba-mgmt.ts")
        process.exit(1)
    }

    const actualWabaId = waba_id

    console.log(`🚀 Starting WABA Management Tests for WABA ID: ${actualWabaId}`)

    // 1. Manage Numbers - List Numbers
    console.log("\n--- 📱 Gerenciar números: Listar números do WhatsApp Business ---")
    const numbersUrl = `https://graph.facebook.com/v19.0/${actualWabaId}/phone_numbers`
    const numbers = await apiCall(numbersUrl, "GET", waba_access_token)
    if (numbers) {
        console.log("✅ Numbers List:", JSON.stringify(numbers, null, 2))
    }

    // 2. Manage Numbers - Show details
    if (waba_phone_number_id) {
        console.log("\n--- 📱 Gerenciar números: Mostrar detalhes ---")
        const detailsUrl = `https://graph.facebook.com/v19.0/${waba_phone_number_id}`
        const details = await apiCall(detailsUrl, "GET", waba_access_token)
        if (details) {
            console.log("✅ Phone Number Details:", JSON.stringify(details, null, 2))
        }
    }

    // 3. Manage Templates - List Templates
    console.log("\n--- 📝 Gerenciar templates: Listar templates ---")
    const templatesUrl = `https://graph.facebook.com/v19.0/${actualWabaId}/message_templates`
    const templates = await apiCall(templatesUrl, "GET", waba_access_token)
    if (templates) {
        console.log("✅ Templates List count:", templates.data?.length || 0)
        // Show status of the first few
        templates.data?.slice(0, 3).forEach((t: any) => {
            console.log(`- ${t.name}: ${t.status}`)
        })
    }

    // 4. Manage Templates - Create template
    console.log("\n--- 📝 Gerenciar templates: Criar template ---")
    const createUrl = `https://graph.facebook.com/v19.0/${actualWabaId}/message_templates`
    const timestamp = Date.now()
    const templateName = `test_template_${timestamp}`
    const templatePayload = {
        name: templateName,
        language: "pt_BR",
        category: "UTILITY",
        components: [
            {
                type: "BODY",
                text: "Olá, este é um template de teste criado automaticamente."
            }
        ]
    }
    const newTemplate = await apiCall(createUrl, "POST", waba_access_token, templatePayload)
    if (newTemplate) {
        console.log("✅ Template created successfully:", newTemplate.id)
    }

    // 5. Manage WABA - List accounts
    console.log("\n--- 🏢 Gerenciar WABA: Listar contas de WhatsApp Business ---")
    // Note: To list WABAs, we usually need a Business ID or use 'me' if the token is for a business user
    const accountsUrl = `https://graph.facebook.com/v19.0/me/whatsapp_business_accounts`
    const accounts = await apiCall(accountsUrl, "GET", waba_access_token)
    if (accounts) {
        console.log("✅ WABA Accounts List:", JSON.stringify(accounts, null, 2))
    }

    // 6. Manage WABA - Show settings
    console.log("\n--- 🏢 Gerenciar WABA: Mostrar configurações ---")
    const settingsUrl = `https://graph.facebook.com/v19.0/${actualWabaId}`
    const settings = await apiCall(settingsUrl, "GET", waba_access_token)
    if (settings) {
        console.log("✅ WABA Settings:", JSON.stringify(settings, null, 2))
    }

    console.log("\n✨ All tests completed!")
    process.exit(0)
}

runTests().catch(err => {
    console.error("❌ Test script failed:", err)
    process.exit(1)
})

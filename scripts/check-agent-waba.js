const { createClient } = require("@supabase/supabase-js")
require("dotenv").config({ path: ".env.local" })

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

async function checkAgent() {
    const { data, error } = await supabase
        .from("agents")
        .select("waba_id, waba_phone_number_id, waba_business_account_id, waba_access_token")
        .eq("id", "0c0a4a82-1af3-4466-8633-1b6e71ff933e")
        .single()

    if (error) {
        console.error("Error fetching agent:", error)
        return
    }
    console.log("Agent data:", JSON.stringify(data, null, 2))
}

checkAgent()

import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"
dotenv.config({ path: ".env.local" })

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

async function checkAgent() {
    const { data, error } = await supabase
        .from("agents")
        .select("waba_id, waba_phone_number_id, waba_business_account_id")
        .eq("id", "0c0a4a82-1af3-4466-8633-1b6e71ff933e")
        .single()

    console.log("Agent data:", data)
}

checkAgent()

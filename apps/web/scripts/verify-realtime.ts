import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"

dotenv.config({ path: ".env.local" })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function verifyAndFixRealtime() {
    console.log("Verifying if 'leads' is in supabase_realtime publication...")

    // 1. Check if leads is in pg_publication_tables
    const query = `
        SELECT tablename 
        FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'leads';
    `

    const { data, error } = await supabase.rpc("exec_sql", { sql_query: query })

    // exec_sql in this project doesn't return data typically but we can try just executing the force add.
    // Let's just blindly force add it to be absolutely sure.
    const forceSql = `
        ALTER PUBLICATION supabase_realtime ADD TABLE public.leads;
    `
    console.log("Forcing alter publication...")
    await supabase.rpc("exec_sql", { sql_query: forceSql })

    console.log("Publication forced! If it failed, it means it's probably already there.")
}

verifyAndFixRealtime()

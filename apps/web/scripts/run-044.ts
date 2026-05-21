import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"
import fs from "fs"
import path from "path"
import { dirname } from 'path'
import { fileURLToPath } from 'url'

dotenv.config({ path: ".env.local" })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase environment variables")
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)
const __filename = typeof __filename !== 'undefined' ? __filename : fileURLToPath(import.meta.url)
const __dirname = typeof __dirname !== 'undefined' ? __dirname : dirname(__filename)

async function runMigration() {
    console.log("Running migration: 044_add_user_id_to_leads.sql")

    const sqlPath = path.join(__dirname, "044_add_user_id_to_leads.sql")
    const sql = fs.readFileSync(sqlPath, "utf8")

    const { error } = await supabase.rpc("exec_sql", { sql_query: sql })

    if (error) {
        console.error("Error executing migration:", error)
    } else {
        console.log("Migration executed successfully: Added user_id to leads and simplified RLS.")
    }
}

runMigration()

import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"
import fs from "fs"
import path from "path"

dotenv.config({ path: ".env.local" })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase environment variables")
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration() {
    console.log("Running migration: 029_add_stripe_ids_to_profiles.sql")

    const sqlPath = path.join(__dirname, "029_add_stripe_ids_to_profiles.sql")
    const sql = fs.readFileSync(sqlPath, "utf8")

    const { error } = await supabase.rpc("exec_sql", { sql_query: sql })

    if (error) {
        console.error("Error running migration:", error)
        console.log("Please run the SQL manually in Supabase SQL Editor if needed.")
    } else {
        console.log("Migration executed successfully!")
    }
}

runMigration()

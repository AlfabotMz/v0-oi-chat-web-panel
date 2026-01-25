import { createClient } from "@supabase/supabase-js"
import * as fs from "fs"
import * as path from "path"
import * as dotenv from "dotenv"

// Load env vars
dotenv.config({ path: path.resolve(__dirname, "../.env") })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase credentials in environment variables")
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration() {
    try {
        console.log("Starting migration 024...")

        const sql = fs.readFileSync(path.join(__dirname, "024_unique_active_agent_phone.sql"), "utf-8")

        console.log("Executing SQL...")

        // Try using the exec_sql RPC if it exists
        const { error } = await supabase.rpc("exec_sql", { sql })

        if (error) {
            console.error("Error executing migration via RPC:", error)
            console.log("Attempting direct SQL execution is not supported via JS client without RPC.")
            process.exit(1)
        } else {
            console.log("✓ Migration 024 executed successfully")
        }

        process.exit(0)
    } catch (error) {
        console.error("Migration failed:", error)
        process.exit(1)
    }
}

runMigration()

import { createClient } from "@supabase/supabase-js"
import fs from "fs"
import path from "path"
import dotenv from "dotenv"

// Load environment variables from .env.local
dotenv.config({ path: ".env.local" })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase environment variables (URL or Service Role Key)")
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration() {
    const sqlPath = path.join(process.cwd(), "scripts", "025_ensure_rls_policies.sql")
    const sql = fs.readFileSync(sqlPath, "utf8")

    console.log("Running migration: 025_ensure_rls_policies.sql")

    // Split into statements
    const statements = sql
        .split(";")
        .map((s) => s.trim())
        .filter((s) => s.length > 0)

    for (const statement of statements) {
        const { error } = await supabase.rpc("exec_sql", { sql: statement + ";" })
        if (error) {
            console.error("Error executing statement:", error)
        } else {
            console.log("Statement executed successfully")
        }
    }

    console.log("Migration finished.")
}

runMigration()

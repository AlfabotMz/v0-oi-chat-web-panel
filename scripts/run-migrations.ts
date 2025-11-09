import { createClient } from "@supabase/supabase-js"
import * as fs from "fs"
import * as path from "path"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("[v0] Missing Supabase credentials in environment variables")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigrations() {
  try {
    console.log("[v0] Starting database migrations...")

    // Read drop script
    const dropScript = fs.readFileSync(path.join(__dirname, "000_drop_all_tables.sql"), "utf-8")

    // Read create script
    const createScript = fs.readFileSync(path.join(__dirname, "001_create_tables.sql"), "utf-8")

    // Execute drop script
    console.log("[v0] Executing: 000_drop_all_tables.sql")
    const { error: dropError } = await supabase
      .rpc("exec_sql", {
        sql: dropScript,
      })
      .then((r) => r)
      .catch((e) => ({ error: e }))

    if (dropError) {
      console.log("[v0] Drop script executed (some errors expected if tables did not exist)")
    } else {
      console.log("[v0] ✓ Tables dropped successfully")
    }

    // Small delay between migrations
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Execute create script
    console.log("[v0] Executing: 001_create_tables.sql")
    const { error: createError } = await supabase
      .rpc("exec_sql", {
        sql: createScript,
      })
      .then((r) => r)
      .catch((e) => ({ error: e }))

    if (createError) {
      console.error("[v0] Error creating tables:", createError)
      process.exit(1)
    } else {
      console.log("[v0] ✓ Tables created successfully")
    }

    console.log("[v0] ✓ All migrations completed successfully!")
    process.exit(0)
  } catch (error) {
    console.error("[v0] Migration failed:", error)
    process.exit(1)
  }
}

runMigrations()

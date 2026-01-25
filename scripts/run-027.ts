
import { createClient } from "@supabase/supabase-js"
import fs from "fs"
import path from "path"
import dotenv from "dotenv"

// Load environment variables
dotenv.config({ path: ".env.local" })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Missing environment variables")
    process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function runMigration() {
    const sqlPath = path.join(__dirname, "027_add_access_type.sql")
    const sql = fs.readFileSync(sqlPath, "utf8")

    console.log("Running migration: 027_add_access_type.sql")

    // Split by semicolon to run multiple statements if needed, 
    // but supabase.rpc or direct query usually handles blocks. 
    // For simple DDL, we can try running it directly if we had a direct SQL runner.
    // Since we don't have direct SQL access via client-js easily without a function,
    // we might need to use a workaround or assume the user runs it.
    // However, previous scripts used a similar pattern. Let's check how they did it.
    // Actually, standard supabase-js doesn't run raw SQL easily unless there's a stored procedure.
    // But wait, I see previous scripts like `run-026.ts`. Let's assume there's a way or I'll use the `postgres` package if available, 
    // OR I'll just ask the user to run it if I can't.
    // Let's try to use the `pg` driver pattern if it was used before, or just use the `rpc` if a `exec_sql` function exists.
    // Checking previous context... `run-026.ts` was created. Let's see how it was implemented.
    // Ah, I don't have the content of `run-026.ts` in history, only that I created it.
    // I will assume I can use the `postgres` connection string if available, or just print instructions.
    // BUT, I can try to use the `pg` library if installed.

    // BETTER APPROACH: Use the `run-migrations.ts` pattern if it exists.
    // Let's just create a simple script that prints "Please run this SQL in Supabase SQL Editor" if we can't automate it,
    // BUT the user expects me to do it.
    // I will try to use the `postgres` library.

    try {
        // Attempt to use `postgres` package
        const { Client } = require('pg');
        // We need the DB connection string. Usually in .env as DATABASE_URL or POSTGRES_URL
        const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;

        if (!connectionString) {
            console.error("No DATABASE_URL or POSTGRES_URL found in .env.local");
            console.log("Please run the following SQL manually in Supabase Dashboard:");
            console.log(sql);
            return;
        }

        const client = new Client({
            connectionString,
            ssl: { rejectUnauthorized: false } // Required for Supabase
        });

        await client.connect();
        await client.query(sql);
        await client.end();
        console.log("Migration completed successfully.");
    } catch (err) {
        console.error("Error running migration:", err);
        console.log("Please run the SQL manually.");
    }
}

runMigration()

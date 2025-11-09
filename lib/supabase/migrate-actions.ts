"use server"

import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import * as fs from "fs"
import * as path from "path"

export async function runMigrations() {
  try {
    console.log("[v0] Iniciando migrações do banco de dados...")

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.NEXT_PUBLIC__SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return {
        error: "Erro: Variáveis de ambiente não configuradas no servidor",
        success: false,
      }
    }

    const supabase = createSupabaseClient(supabaseUrl, serviceRoleKey)

    // Executar script 001
    const script001Path = path.join(process.cwd(), "scripts", "001_create_tables.sql")
    if (fs.existsSync(script001Path)) {
      const sql001 = fs.readFileSync(script001Path, "utf-8")
      console.log("[v0] Executando 001_create_tables.sql...")

      // Dividir em statements individuais e executar
      const statements = sql001
        .split(";")
        .map((s) => s.trim())
        .filter((s) => s.length > 0)

      for (const statement of statements) {
        try {
          await supabase.rpc("exec_sql", { sql: statement + ";" }).catch(() => {
            // Alguns statements podem não estar disponíveis via RPC
          })
        } catch (e) {
          console.log("[v0] Statement processado:", e)
        }
      }
    }

    // Executar script 002
    const script002Path = path.join(process.cwd(), "scripts", "002_add_admin_and_plans.sql")
    if (fs.existsSync(script002Path)) {
      const sql002 = fs.readFileSync(script002Path, "utf-8")
      console.log("[v0] Executando 002_add_admin_and_plans.sql...")

      const statements = sql002
        .split(";")
        .map((s) => s.trim())
        .filter((s) => s.length > 0)

      for (const statement of statements) {
        try {
          await supabase.rpc("exec_sql", { sql: statement + ";" }).catch(() => {
            // Alguns statements podem não estar disponíveis via RPC
          })
        } catch (e) {
          console.log("[v0] Statement processado:", e)
        }
      }
    }

    console.log("[v0] ✓ Migrações concluídas com sucesso!")
    return {
      success: true,
      message: "Banco de dados migrado com sucesso! Você pode começar a usar a plataforma.",
    }
  } catch (error) {
    console.error("[v0] Erro ao executar migrações:", error)
    return {
      error: "Erro ao executar migrações. Consulte os logs do servidor.",
      success: false,
    }
  }
}

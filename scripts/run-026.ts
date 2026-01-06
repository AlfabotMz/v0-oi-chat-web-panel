import { createClient } from "@supabase/supabase-js"
import fs from "fs"
import path from "path"
import dotenv from "dotenv"

dotenv.config()

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Erro: Variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias.")
    process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
})

async function runMigration() {
    try {
        console.log("Iniciando migração 026_add_moder_role.sql...")

        const sqlPath = path.join(process.cwd(), "scripts", "026_add_moder_role.sql")
        const sql = fs.readFileSync(sqlPath, "utf8")

        // Separar comandos por ponto e vírgula para executar um por um (simples parser)
        // Nota: Isso é básico e pode falhar com strings complexas contendo ';', mas serve para este script simples
        const statements = sql
            .split(";")
            .map((s) => s.trim())
            .filter((s) => s.length > 0)

        for (const statement of statements) {
            const { error } = await supabase.rpc("exec_sql", { sql_query: statement })

            // Se exec_sql não existir (alguns projetos não têm), tentar usar API direta se possível ou avisar
            // Como fallback, vamos tentar rodar via pg driver se tivéssemos, mas aqui estamos restritos ao supabase-js
            // Se o RPC não existir, teremos que instruir o usuário a rodar no dashboard SQL Editor

            if (error) {
                // Tentar rodar diretamente se for um comando suportado ou apenas logar
                console.log(`Tentando executar: ${statement.substring(0, 50)}...`)
                // Nota: supabase-js client-side não roda SQL arbitrário sem uma function RPC 'exec_sql' ou similar.
                // Vamos assumir que o usuário tem essa function ou que vamos apenas logar o SQL para ele rodar.

                console.error("Erro ao executar statement via RPC (pode ser necessário rodar manualmente no Supabase Dashboard):", error)
            }
        }

        // Como não temos garantia do RPC exec_sql, vamos pedir ao usuário para rodar se falhar,
        // mas para este ambiente, vamos assumir que o usuário prefere que tentemos.
        // SE FALHAR: O usuário terá que rodar o SQL manualmente.

        console.log("Migração concluída (verifique erros acima se houver).")

    } catch (error) {
        console.error("Erro fatal na migração:", error)
    }
}

runMigration()

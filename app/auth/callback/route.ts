import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const next = requestUrl.searchParams.get("next") || "/dashboard"

  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Se o usuário acabou de se registrar, redirecionar para onboarding
  // Verificar se é um novo usuário verificando se tem agentes
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const { data: agents } = await supabase
      .from("agents")
      .select("id")
      .eq("user_id", user.id)
      .limit(1)

    // Se não tem agentes, é um novo usuário - redirecionar para onboarding
    if (!agents || agents.length === 0) {
      return NextResponse.redirect(new URL("/onboarding", request.url))
    }
  }

  return NextResponse.redirect(new URL(next, request.url))
}


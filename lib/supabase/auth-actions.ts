import { createClient } from "./client"

async function countAdmins() {
  const supabase = createClient()
  const { count } = await supabase.from("profiles").select("*", { count: "exact" }).eq("role", "admin")

  return count || 0
}

export async function signUp(email: string, password: string, isAdmin = false) {
  const supabase = createClient()

  if (isAdmin) {
    const adminCount = await countAdmins()
    if (adminCount > 0) {
      return { data: null, error: new Error("Já existe uma conta de administrador") }
    }
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo:
        process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
        `${typeof window !== "undefined" ? window.location.origin : ""}/dashboard`,
    },
  })

  if (data?.user && !error) {
    const role = isAdmin ? "admin" : "user"
    const status = isAdmin ? "active" : "inactive"
    const plan = isAdmin ? "premium" : "free"

    // Usar UPSERT para evitar conflito com o trigger
    // O trigger cria o profile primeiro, então fazemos UPDATE
    await supabase
      .from("profiles")
      .upsert(
        {
          id: data.user.id,
          email: data.user.email || email,
          full_name: email.split("@")[0],
          role,
          status,
          plan,
        },
        {
          onConflict: "id",
        }
      )
  }

  return { data, error }
}

export async function signIn(email: string, password: string) {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  return { data, error }
}

export async function signOut() {
  const supabase = createClient()
  return await supabase.auth.signOut()
}

export async function getUser() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function getUserProfile() {
  const supabase = createClient()
  const user = await getUser()

  if (!user) return null

  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  return data
}

export async function changePlan(userId: string, newPlan: "free" | "pro" | "premium") {
  const supabase = createClient()

  // Verificar se quem está fazendo é admin
  const adminProfile = await getUserProfile()
  if (adminProfile?.role !== "admin") {
    return { error: new Error("Apenas administradores podem alterar planos") }
  }

  // Se mudando para pro ou premium, ativar a conta
  const newStatus = newPlan === "pro" || newPlan === "premium" ? "active" : "inactive"

  const { data, error } = await supabase.from("profiles").update({ plan: newPlan, status: newStatus }).eq("id", userId)

  // Registrar no histórico
  if (!error) {
    const { data: oldProfile } = await supabase.from("profiles").select("plan").eq("id", userId).single()

    await supabase.from("plan_history").insert([
      {
        user_id: userId,
        old_plan: oldProfile?.plan,
        new_plan: newPlan,
        changed_by: adminProfile.id,
      },
    ])
  }

  return { data, error }
}

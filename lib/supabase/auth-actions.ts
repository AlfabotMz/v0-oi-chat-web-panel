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

  // Preparar valores para role, status e plan
  const userRole = isAdmin ? "admin" : "user"
  const userStatus = isAdmin ? "active" : "inactive"
  const userPlan = isAdmin ? "premium" : "free"
  const userFullName = email.split("@")[0]

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo:
        process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
        `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback?next=/onboarding`,
      data: {
        role: userRole,
        status: userStatus,
        plan: userPlan,
        full_name: userFullName,
      },
    },
  })

  if (data?.user && !error) {
    // Aguardar um pouco para garantir que o trigger executou
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Verificar e garantir que o profile foi criado com os valores corretos
    // Tentar até 3 vezes para garantir que o profile está correto
    let attempts = 0
    let profileCorrect = false

    while (attempts < 3 && !profileCorrect) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single()

      if (profile) {
        // Verificar se os valores estão corretos
        if (profile.role === userRole && profile.plan === userPlan && profile.status === userStatus) {
          profileCorrect = true
        } else {
          // Atualizar com os valores corretos
          const { error: updateError } = await supabase
            .from("profiles")
            .update({
              role: userRole,
              status: userStatus,
              plan: userPlan,
              email: data.user.email || email,
              full_name: userFullName,
            })
            .eq("id", data.user.id)

          if (updateError) {
            console.error("Erro ao atualizar profile (tentativa", attempts + 1, "):", updateError)
          } else {
            profileCorrect = true
          }
        }
      } else {
        // Se o profile não existe, criar manualmente
        const { error: insertError } = await supabase.from("profiles").insert({
          id: data.user.id,
          email: data.user.email || email,
          full_name: userFullName,
          role: userRole,
          status: userStatus,
          plan: userPlan,
        })

        if (insertError) {
          console.error("Erro ao criar profile (tentativa", attempts + 1, "):", insertError)
        } else {
          profileCorrect = true
        }
      }

      attempts++
      if (!profileCorrect && attempts < 3) {
        // Aguardar um pouco antes de tentar novamente
        await new Promise((resolve) => setTimeout(resolve, 500))
      }
    }

    if (!profileCorrect) {
      console.error("Não foi possível garantir que o profile foi criado corretamente após", attempts, "tentativas")
    }
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

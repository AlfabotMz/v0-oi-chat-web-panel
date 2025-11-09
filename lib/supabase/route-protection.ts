import { getUserProfile } from "./auth-actions"

export async function requireAuth() {
  const profile = await getUserProfile()
  if (!profile) {
    throw new Error("Not authenticated")
  }
  return profile
}

export async function requireAdmin() {
  const profile = await requireAuth()
  if (profile.role !== "admin") {
    throw new Error("Admin access required")
  }
  return profile
}

export async function requireActiveUser() {
  const profile = await requireAuth()
  if (profile.status !== "active") {
    throw new Error("Account is inactive")
  }
  return profile
}

export async function requirePlan(minPlan: "free" | "pro" | "premium") {
  const profile = await requireActiveUser()

  const planHierarchy = { free: 0, pro: 1, premium: 2 }
  if (planHierarchy[profile.plan] < planHierarchy[minPlan]) {
    throw new Error(`${minPlan} plan required`)
  }

  return profile
}

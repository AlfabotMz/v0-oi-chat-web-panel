"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getUserProfile, changePlan } from "@/lib/supabase/auth-actions"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, LogOut, Crown } from "lucide-react"

interface UserProfile {
  id: string
  full_name: string
  email?: string
  plan: "free" | "pro" | "premium"
  status: "active" | "inactive"
  created_at: string
}

export default function AdminPage() {
  const router = useRouter()
  const [adminProfile, setAdminProfile] = useState<any>(null)
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [newPlan, setNewPlan] = useState<"free" | "pro" | "premium" | "">("")

  useEffect(() => {
    const checkAdmin = async () => {
      const profile = await getUserProfile()
      if (!profile || profile.role !== "admin") {
        router.push("/dashboard")
        return
      }
      setAdminProfile(profile)
      await loadUsers()
    }
    checkAdmin()
  }, [router])

  const loadUsers = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "user")
      .order("created_at", { ascending: false })

    setUsers(data || [])
    setLoading(false)
  }

  const handlePlanChange = async () => {
    if (!selectedUser || !newPlan) return

    await changePlan(selectedUser, newPlan as "free" | "pro" | "premium")
    setNewPlan("")
    setSelectedUser(null)
    await loadUsers()
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
  }

  if (!adminProfile) return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      {/* Header */}
      <header className="border-b border-purple-200/20 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Painel de Administrador</h1>
              <p className="text-sm text-muted-foreground">OiChat</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="border-purple-200/20 hover:bg-purple-50/5 bg-transparent"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-purple-200/20 bg-gradient-to-br from-purple-50/50 to-purple-50/20 dark:from-purple-950/20 dark:to-purple-950/10">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Total de Usuários</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{users.length}</div>
            </CardContent>
          </Card>

          <Card className="border-purple-200/20 bg-gradient-to-br from-purple-50/50 to-purple-50/20 dark:from-purple-950/20 dark:to-purple-950/10">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Contas Ativas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {users.filter((u) => u.status === "active").length}
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200/20 bg-gradient-to-br from-purple-50/50 to-purple-50/20 dark:from-purple-950/20 dark:to-purple-950/10">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Planos Pro/Premium</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {users.filter((u) => u.plan === "pro" || u.plan === "premium").length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Management */}
        <Card className="border-purple-200/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              Gerenciar Usuários
            </CardTitle>
            <CardDescription>Visualize e altere os planos dos usuários</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground">Carregando...</p>
            ) : users.length === 0 ? (
              <p className="text-muted-foreground">Nenhum usuário cadastrado ainda</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-purple-200/20">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Usuário</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Plano Atual</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Data de Criação</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr
                        key={user.id}
                        className="border-b border-purple-100/20 hover:bg-purple-50/5 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-foreground">{user.full_name}</p>
                            <p className="text-sm text-muted-foreground">{user.id.slice(0, 8)}...</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              user.status === "active"
                                ? "bg-green-100/50 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                                : "bg-red-100/50 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                            }`}
                          >
                            {user.status === "active" ? "Ativo" : "Inativo"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              user.plan === "premium"
                                ? "bg-purple-100/50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400"
                                : user.plan === "pro"
                                  ? "bg-blue-100/50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400"
                                  : "bg-gray-100/50 text-gray-700 dark:bg-gray-950/30 dark:text-gray-400"
                            }`}
                          >
                            {user.plan === "free" ? "Grátis" : user.plan === "pro" ? "Pro" : "Premium"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {new Date(user.created_at).toLocaleDateString("pt-BR")}
                        </td>
                        <td className="py-3 px-4">
                          {selectedUser === user.id ? (
                            <div className="flex gap-2">
                              <Select value={newPlan} onValueChange={setNewPlan}>
                                <SelectTrigger className="w-32 h-8 border-purple-200/30">
                                  <SelectValue placeholder="Selecionar plano" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="free">Grátis</SelectItem>
                                  <SelectItem value="pro">Pro</SelectItem>
                                  <SelectItem value="premium">Premium</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button
                                size="sm"
                                onClick={handlePlanChange}
                                className="bg-purple-600 hover:bg-purple-700"
                              >
                                OK
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedUser(user.id)}
                              className="border-purple-200/30 hover:bg-purple-50/5"
                            >
                              Mudar Plano
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

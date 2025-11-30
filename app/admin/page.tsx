"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getUserProfile, changePlan } from "@/lib/supabase/auth-actions"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Users, LogOut, Crown, HelpCircle, MessageCircle, Phone } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

interface UserProfile {
  id: string
  full_name: string
  email?: string
  plan: "free" | "pro" | "premium"
  status: "active" | "inactive"
  created_at: string
  whatsapp?: string
  phone?: string
  subscription_status?: string
  role?: string
  community_link?: string
  support_whatsapp_link?: string
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function AdminPage() {
  const router = useRouter()
  const [adminProfile, setAdminProfile] = useState<any>(null)
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(true)
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [newPlan, setNewPlan] = useState<"free" | "pro" | "premium" | "">("")
  const [communityLink, setCommunityLink] = useState("")
  const [supportWhatsAppLink, setSupportWhatsAppLink] = useState("")
  const [savingSupport, setSavingSupport] = useState(false)

  // Filters
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "user">("all")
  const [planFilter, setPlanFilter] = useState<"all" | "free" | "pro" | "premium">("all")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "trial" | "inactive">("all")

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        setChecking(true)

        const profile = await getUserProfile()

        if (!profile) {
          router.push("/login")
          return
        }

        if (profile.role !== "admin") {
          router.push("/dashboard")
          return
        }

        setAdminProfile(profile)
        setCommunityLink(profile.community_link || "")
        setSupportWhatsAppLink(profile.support_whatsapp_link || "")
        await loadUsers()
        setChecking(false)
      } catch (error) {
        console.error("Erro ao verificar admin:", error)
        setTimeout(() => {
          router.push("/dashboard")
        }, 500)
      }
    }
    checkAdmin()
  }, [router])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const supabase = createClient()

      const { data: userData, error: userError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })

      if (userError) {
        console.error("Erro ao carregar usuários:", userError)
        setUsers([])
      } else if (userData) {
        setUsers(userData as UserProfile[])
      } else {
        setUsers([])
      }
    } catch (err) {
      console.error("Erro ao carregar usuários:", err)
      setUsers([])
    } finally {
      setLoading(false)
    }
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

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = (user.full_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (user.email?.toLowerCase() || "").includes(searchTerm.toLowerCase())

    const matchesRole = roleFilter === "all" || user.role === roleFilter
    const matchesPlan = planFilter === "all" || user.plan === planFilter

    let matchesStatus = true
    if (statusFilter === "active") matchesStatus = user.subscription_status === "active"
    else if (statusFilter === "trial") matchesStatus = user.subscription_status === "trial"
    else if (statusFilter === "inactive") matchesStatus = user.subscription_status !== "active" && user.subscription_status !== "trial"

    return matchesSearch && matchesRole && matchesPlan && matchesStatus
  })

  // Prepare chart data
  const planData = [
    { name: 'Free', value: users.filter(u => u.plan === 'free').length },
    { name: 'Pro', value: users.filter(u => u.plan === 'pro').length },
    { name: 'Premium', value: users.filter(u => u.plan === 'premium').length },
  ].filter(d => d.value > 0);

  const financialStatusData = [
    { name: 'Pagantes', value: users.filter(u => u.subscription_status === 'active').length, color: '#10b981' }, // Green
    { name: 'Trial', value: users.filter(u => u.subscription_status === 'trial').length, color: '#f59e0b' }, // Amber
    { name: 'Outros', value: users.filter(u => u.subscription_status !== 'active' && u.subscription_status !== 'trial').length, color: '#94a3b8' }, // Slate
  ].filter(d => d.value > 0);

  const statusData = [
    { name: 'Ativo', value: users.filter(u => u.status === 'active').length },
    { name: 'Inativo', value: users.filter(u => u.status === 'inactive').length },
  ].filter(d => d.value > 0);

  // Group users by created_at date (last 7 days)
  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  const growthData = last7Days.map(date => {
    return {
      date: date.split('-').slice(1).join('/'),
      users: users.filter(u => u.created_at.startsWith(date)).length
    };
  });

  if (checking || !adminProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background/80 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando permissões de administrador...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <header className="sticky top-0 z-50 border-b border-purple-200/20 bg-card/60 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-purple-700">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground sm:text-2xl">Painel de Administrador</h1>
              <p className="text-sm text-muted-foreground">OiChat</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="w-full bg-transparent border-purple-200/20 hover:bg-purple-50/10 sm:w-auto"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 space-y-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-purple-200/20 bg-purple-50/50 dark:bg-purple-900/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total de Usuários</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
            </CardContent>
          </Card>
          <Card className="border-green-200/20 bg-green-50/50 dark:bg-green-900/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Usuários Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.filter(u => u.status === 'active').length}</div>
            </CardContent>
          </Card>
          <Card className="border-blue-200/20 bg-blue-50/50 dark:bg-blue-900/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pagantes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.filter(u => u.subscription_status === 'active').length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
          <Card className="border-purple-200/20">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Novos Usuários (7 dias)</CardTitle>
            </CardHeader>
            <CardContent className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={growthData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Bar dataKey="users" fill="#8884d8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-purple-200/20">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Distribuição de Planos</CardTitle>
            </CardHeader>
            <CardContent className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={planData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {planData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-purple-200/20">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Status Financeiro</CardTitle>
            </CardHeader>
            <CardContent className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={financialStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {financialStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-purple-200/20">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Status dos Usuários</CardTitle>
            </CardHeader>
            <CardContent className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#ef4444'} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Support Links Configuration */}
        <Card className="border-purple-200/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-purple-600" />
              Configurações de Suporte
            </CardTitle>
            <CardDescription>Configure os links de suporte e comunidade</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="communityLink">Link da Comunidade</Label>
                <Input
                  id="communityLink"
                  placeholder="https://chat.whatsapp.com/..."
                  value={communityLink}
                  onChange={(e) => setCommunityLink(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supportWhatsAppLink">Link do WhatsApp de Suporte</Label>
                <Input
                  id="supportWhatsAppLink"
                  placeholder="https://wa.me/5511999999999"
                  value={supportWhatsAppLink}
                  onChange={(e) => setSupportWhatsAppLink(e.target.value)}
                />
              </div>
            </div>
            <Button
              onClick={async () => {
                setSavingSupport(true)
                try {
                  const supabase = createClient()
                  const profile = await getUserProfile()
                  if (!profile) return

                  const { error } = await supabase
                    .from("profiles")
                    .update({
                      community_link: communityLink || null,
                      support_whatsapp_link: supportWhatsAppLink || null,
                    })
                    .eq("id", profile.id)

                  if (error) throw error
                  alert("Links de suporte salvos com sucesso!")
                } catch (err: any) {
                  alert("Erro ao salvar: " + err.message)
                } finally {
                  setSavingSupport(false)
                }
              }}
              disabled={savingSupport}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {savingSupport ? "Salvando..." : "Salvar Links"}
            </Button>
          </CardContent>
        </Card>

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
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <Input
                  placeholder="Buscar por nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-purple-200/30"
                />
              </div>
              <div className="flex gap-2">
                <Select value={roleFilter} onValueChange={(v: any) => setRoleFilter(v)}>
                  <SelectTrigger className="w-[130px] border-purple-200/30">
                    <SelectValue placeholder="Função" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas Funções</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="user">Usuário</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={planFilter} onValueChange={(v: any) => setPlanFilter(v)}>
                  <SelectTrigger className="w-[130px] border-purple-200/30">
                    <SelectValue placeholder="Plano" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos Planos</SelectItem>
                    <SelectItem value="free">Grátis</SelectItem>
                    <SelectItem value="pro">Pro</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
                  <SelectTrigger className="w-[140px] border-purple-200/30">
                    <SelectValue placeholder="Status Fin." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos Status</SelectItem>
                    <SelectItem value="active">Pagante</SelectItem>
                    <SelectItem value="trial">Trial</SelectItem>
                    <SelectItem value="inactive">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-muted-foreground">Carregando usuários...</p>
                </div>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-muted-foreground">Nenhum usuário encontrado</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-purple-200/20">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Usuário</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Contato</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Plano</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Data</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="border-b border-purple-100/20 hover:bg-purple-50/5 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-foreground">{user.full_name}</p>
                              {user.role === 'admin' && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300">
                                  ADMIN
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            {user.whatsapp || user.phone ? (
                              <>
                                <Phone className="w-3 h-3" />
                                {user.whatsapp || user.phone}
                              </>
                            ) : (
                              <span className="text-xs italic">Sem número</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.status === "active"
                                ? "bg-green-100/50 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                                : "bg-red-100/50 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                              }`}
                          >
                            {user.status === "active" ? "Ativo" : "Inativo"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-col gap-1">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium w-fit ${user.plan === "premium"
                                  ? "bg-purple-100/50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400"
                                  : user.plan === "pro"
                                    ? "bg-blue-100/50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400"
                                    : "bg-gray-100/50 text-gray-700 dark:bg-gray-950/30 dark:text-gray-400"
                                }`}
                            >
                              {user.plan === "free" ? "Grátis" : user.plan === "pro" ? "Pro" : "Premium"}
                            </span>
                            {user.plan !== "free" && (
                              <span className={`text-[10px] uppercase font-bold tracking-wider ${user.subscription_status === 'active'
                                  ? "text-green-600 dark:text-green-400"
                                  : user.subscription_status === 'trial'
                                    ? "text-orange-500 dark:text-orange-400"
                                    : "text-muted-foreground"
                                }`}>
                                {user.subscription_status === 'active' ? 'Pago' : user.subscription_status === 'trial' ? 'Trial' : user.subscription_status}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {new Date(user.created_at).toLocaleDateString("pt-BR")}
                        </td>
                        <td className="py-3 px-4">
                          {selectedUser === user.id ? (
                            <div className="flex gap-2">
                              <Select value={newPlan} onValueChange={setNewPlan}>
                                <SelectTrigger className="w-32 h-8 border-purple-200/30">
                                  <SelectValue placeholder="Plano" />
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
                              variant="ghost"
                              onClick={() => setSelectedUser(user.id)}
                              className="h-8 px-2"
                            >
                              Editar
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

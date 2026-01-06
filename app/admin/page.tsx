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
  access_type?: "subscription" | "manual"
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

  // Subscription Management State
  const [isExtendTrialOpen, setIsExtendTrialOpen] = useState(false)
  const [isManageSubOpen, setIsManageSubOpen] = useState(false)
  const [extendDays, setExtendDays] = useState(7)
  const [manageAction, setManageAction] = useState<"add_days" | "set_date" | "cancel">("add_days")
  const [manageValue, setManageValue] = useState("")
  const [processingAction, setProcessingAction] = useState(false)

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

        if (profile.role !== "admin" && profile.role !== "moder") {
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

  const handleExtendTrial = async () => {
    if (!selectedUser) return
    setProcessingAction(true)
    try {
      const supabase = createClient()
      const user = users.find(u => u.id === selectedUser)
      if (!user) return

      const currentEndDate = user.plan_end_date ? new Date(user.plan_end_date) : new Date()
      const newEndDate = new Date(currentEndDate)
      newEndDate.setDate(newEndDate.getDate() + extendDays)

      const { error } = await supabase
        .from("profiles")
        .update({
          plan_end_date: newEndDate.toISOString(),
          subscription_status: 'trial'
        })
        .eq("id", selectedUser)

      if (error) throw error
      alert(`Trial estendido por ${extendDays} dias!`)
      setIsExtendTrialOpen(false)
      setSelectedUser(null)
      await loadUsers()
    } catch (err: any) {
      alert("Erro ao estender trial: " + err.message)
    } finally {
      setProcessingAction(false)
    }
  }

  const handleManageSubscription = async () => {
    if (!selectedUser) return
    setProcessingAction(true)
    try {
      const supabase = createClient()
      const user = users.find(u => u.id === selectedUser)
      if (!user) return

      let updates: any = {}

      if (manageAction === "cancel") {
        updates = {
          subscription_status: 'cancelled',
          // Optionally clear plan_end_date or keep it until it expires
        }
      } else if (manageAction === "add_days") {
        const days = parseInt(manageValue)
        if (isNaN(days)) throw new Error("Dias inválidos")

        const currentEndDate = user.plan_end_date ? new Date(user.plan_end_date) : new Date()
        // If expired, start from now
        const baseDate = currentEndDate < new Date() ? new Date() : currentEndDate

        const newEndDate = new Date(baseDate)
        newEndDate.setDate(newEndDate.getDate() + days)
        updates = { plan_end_date: newEndDate.toISOString(), subscription_status: 'active' }
      } else if (manageAction === "set_date") {
        if (!manageValue) throw new Error("Data inválida")
        updates = { plan_end_date: new Date(manageValue).toISOString(), subscription_status: 'active' }
      }

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", selectedUser)

      if (error) throw error
      alert("Assinatura atualizada com sucesso!")
      setIsManageSubOpen(false)
      setSelectedUser(null)
      setManageValue("")
      await loadUsers()
    } catch (err: any) {
      alert("Erro ao gerenciar assinatura: " + err.message)
    } finally {
      setProcessingAction(false)
    }
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

  // Prepare chart data (exclude admin users from statistics)
  const nonAdminUsers = users.filter(u => u.role !== 'admin');

  const planData = [
    { name: 'Free', value: nonAdminUsers.filter(u => u.plan === 'free').length },
    { name: 'Pro', value: nonAdminUsers.filter(u => u.plan === 'pro').length },
    { name: 'Premium', value: nonAdminUsers.filter(u => u.plan === 'premium').length },
  ].filter(d => d.value > 0);

  const financialStatusData = [
    { name: 'Pagantes', value: nonAdminUsers.filter(u => u.subscription_status === 'active').length, color: '#10b981' }, // Green
    { name: 'Trial', value: nonAdminUsers.filter(u => u.subscription_status === 'trial').length, color: '#f59e0b' }, // Amber
    { name: 'Outros', value: nonAdminUsers.filter(u => u.subscription_status !== 'active' && u.subscription_status !== 'trial').length, color: '#94a3b8' }, // Slate
  ].filter(d => d.value > 0);

  const statusData = [
    { name: 'Ativo', value: nonAdminUsers.filter(u => u.status === 'active').length },
    { name: 'Inativo', value: nonAdminUsers.filter(u => u.status === 'inactive').length },
  ].filter(d => d.value > 0);

  // Calculate MRR
  // Only count users with plan 'pro' or 'premium', status 'active', and access_type 'subscription' (or null/undefined which defaults to subscription)
  const payingUsersCount = nonAdminUsers.filter(u =>
    (u.plan === 'pro' || u.plan === 'premium') &&
    u.subscription_status === 'active' &&
    (u.access_type === 'subscription' || !u.access_type)
  ).length;

  const mrrValue = payingUsersCount * 960; // 960 MT per user
  const mrrFormatted = new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(mrrValue);
  const mrrUsdFormatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(payingUsersCount * 15); // $15 approx

  // Group users by created_at date (last 7 days)
  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  const growthData = last7Days.map(date => {
    return {
      date: date.split('-').slice(1).join('/'),
      users: nonAdminUsers.filter(u => u.created_at.startsWith(date)).length
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
              <CardTitle className="text-sm font-medium">MRR (Receita Recorrente)</CardTitle>
            </CardHeader>
            <CardContent className="h-[200px] flex flex-col items-center justify-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                {mrrFormatted}
              </div>
              <div className="text-sm text-muted-foreground">
                {mrrUsdFormatted} / mês
              </div>
              <div className="mt-4 text-xs text-muted-foreground text-center">
                Baseado em {payingUsersCount} clientes pagantes
                <br />(960 MT ou $15 / cliente)
              </div>
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
            {/* Dialogs for Subscription Management */}
            {isExtendTrialOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <Card className="w-full max-w-md border-purple-200/20 bg-card">
                  <CardHeader>
                    <CardTitle>Estender Período de Teste</CardTitle>
                    <CardDescription>Adicione mais dias ao trial do usuário.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Dias Adicionais</Label>
                      <Select value={extendDays.toString()} onValueChange={(v) => setExtendDays(parseInt(v))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione os dias" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">3 Dias</SelectItem>
                          <SelectItem value="7">7 Dias</SelectItem>
                          <SelectItem value="15">15 Dias</SelectItem>
                          <SelectItem value="30">30 Dias</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <Button variant="outline" onClick={() => { setIsExtendTrialOpen(false); setSelectedUser(null) }}>Cancelar</Button>
                      <Button onClick={handleExtendTrial} disabled={processingAction} className="bg-purple-600 hover:bg-purple-700">
                        {processingAction ? "Processando..." : "Confirmar"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {isManageSubOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <Card className="w-full max-w-md border-purple-200/20 bg-card">
                  <CardHeader>
                    <CardTitle>Gerenciar Assinatura</CardTitle>
                    <CardDescription>Modifique a assinatura do usuário.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Ação</Label>
                      <Select value={manageAction} onValueChange={(v: any) => setManageAction(v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a ação" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="add_days">Adicionar Dias</SelectItem>
                          <SelectItem value="set_date">Definir Data Final</SelectItem>
                          <SelectItem value="cancel">Cancelar Assinatura</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {manageAction === "add_days" && (
                      <div className="space-y-2">
                        <Label>Quantidade de Dias</Label>
                        <Input
                          type="number"
                          value={manageValue}
                          onChange={(e) => setManageValue(e.target.value)}
                          placeholder="Ex: 30"
                        />
                      </div>
                    )}

                    {manageAction === "set_date" && (
                      <div className="space-y-2">
                        <Label>Nova Data Final</Label>
                        <Input
                          type="date"
                          value={manageValue}
                          onChange={(e) => setManageValue(e.target.value)}
                        />
                      </div>
                    )}

                    {manageAction === "cancel" && (
                      <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md text-red-500 text-sm">
                        A assinatura será cancelada imediatamente. O usuário perderá acesso aos recursos premium.
                      </div>
                    )}

                    <div className="flex justify-end gap-2 mt-4">
                      <Button variant="outline" onClick={() => { setIsManageSubOpen(false); setSelectedUser(null) }}>Cancelar</Button>
                      <Button
                        onClick={handleManageSubscription}
                        disabled={processingAction}
                        className={manageAction === 'cancel' ? "bg-red-600 hover:bg-red-700" : "bg-purple-600 hover:bg-purple-700"}
                      >
                        {processingAction ? "Processando..." : "Confirmar"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
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
                              {user.role === 'moder' && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                                  MODER
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
                          <div className="flex gap-2">
                            {/* Actions for Admin Only */}
                            {adminProfile?.role === 'admin' ? (
                              selectedUser === user.id ? (
                                <>
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
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setSelectedUser(null)}
                                  >
                                    X
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setSelectedUser(user.id)}
                                    className="h-8 px-2"
                                  >
                                    Editar
                                  </Button>

                                  {/* Subscription Management Buttons */}
                                  {user.subscription_status === 'trial' && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        setSelectedUser(user.id)
                                        setIsExtendTrialOpen(true)
                                      }}
                                      className="h-8 px-2 text-orange-500 border-orange-500/20 hover:bg-orange-500/10"
                                    >
                                      + Trial
                                    </Button>
                                  )}

                                  {(user.subscription_status === 'active' || user.plan !== 'free') && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        setSelectedUser(user.id)
                                        setIsManageSubOpen(true)
                                      }}
                                      className="h-8 px-2 text-blue-500 border-blue-500/20 hover:bg-blue-500/10"
                                    >
                                      Gerenciar
                                    </Button>
                                  )}
                                </>
                              )
                            ) : (
                              // Read-only view for Moder
                              <span className="text-xs text-muted-foreground italic">Visualização</span>
                            )}

                            {/* Advanced Actions (Admin Only) */}
                            {adminProfile?.role === 'admin' && selectedUser === user.id && (
                              <div className="mt-2 pt-2 border-t border-purple-100/20 flex flex-col gap-2">
                                {/* Role Management */}
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-medium">Função:</span>
                                  <Select
                                    value={user.role || 'user'}
                                    onValueChange={async (newRole) => {
                                      if (!confirm(`Tem certeza que deseja alterar a função para ${newRole}?`)) return;
                                      try {
                                        const supabase = createClient()
                                        const { error } = await supabase
                                          .from('profiles')
                                          .update({ role: newRole })
                                          .eq('id', user.id)

                                        if (error) throw error
                                        alert("Função atualizada com sucesso!")
                                        await loadUsers()
                                      } catch (err: any) {
                                        alert("Erro ao alterar função: " + err.message)
                                      }
                                    }}
                                  >
                                    <SelectTrigger className="h-6 w-24 text-xs">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="user">User</SelectItem>
                                      <SelectItem value="moder">Moder</SelectItem>
                                      <SelectItem value="admin">Admin</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                {/* Access Type Management */}
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-medium">Acesso:</span>
                                  {user.access_type === 'manual' ? (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-6 text-xs border-green-500/30 text-green-600 hover:bg-green-500/10"
                                      onClick={async () => {
                                        if (!confirm("Tornar este usuário um pagante (contará no MRR)?")) return;
                                        try {
                                          const supabase = createClient()
                                          const { error } = await supabase
                                            .from('profiles')
                                            .update({ access_type: 'subscription' })
                                            .eq('id', user.id)

                                          if (error) throw error
                                          alert("Usuário agora é um pagante!")
                                          await loadUsers()
                                        } catch (err: any) {
                                          alert("Erro: " + err.message)
                                        }
                                      }}
                                    >
                                      Manual (Grátis)
                                    </Button>
                                  ) : (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-6 text-xs border-blue-500/30 text-blue-600 hover:bg-blue-500/10"
                                      onClick={async () => {
                                        if (!confirm("Remover este usuário do MRR (manter acesso gratuito)?")) return;
                                        try {
                                          const supabase = createClient()
                                          const { error } = await supabase
                                            .from('profiles')
                                            .update({ access_type: 'manual' })
                                            .eq('id', user.id)

                                          if (error) throw error
                                          alert("Usuário removido do MRR (Acesso Manual)!")
                                          await loadUsers()
                                        } catch (err: any) {
                                          alert("Erro: " + err.message)
                                        }
                                      }}
                                    >
                                      Assinatura (Pago)
                                    </Button>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
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
    </div >
  )
}

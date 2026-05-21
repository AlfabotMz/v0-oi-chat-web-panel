import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, TrendingUp, Users, MessageSquare, ArrowLeft, Calendar, User, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export default async function PerformancePage() {
    const supabase = await createClient()

    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
        redirect("/login")
    }

    // Fetch agents and their conversions (conversations)
    const { data: agents, error: agentsError } = await supabase
        .from("agents")
        .select(`
            id,
            name,
            conversations (
                id,
                contact_name,
                contact_phone,
                created_at,
                last_message_at
            )
        `)
        .eq("user_id", user.id)

    if (agentsError) {
        console.error("Erro ao buscar performance:", agentsError)
    }

    const totalAgents = agents?.length || 0
    const totalConversions = agents?.reduce((sum, agent) => sum + (agent.conversations?.length || 0), 0) || 0

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div className="flex items-center gap-2">
                        <div className="relative w-8 h-8 overflow-hidden">
                            <Image src="/oichat-icon.jpg" alt="OiChat Logo" fill className="object-cover" />
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight text-white">Performance</h2>
                    </div>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-[#121215] border-white/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">
                            Total de Conversões
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{totalConversions}</div>
                        <p className="text-xs text-zinc-500">
                            Contatos captados por todos os agentes
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-[#121215] border-white/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">
                            Agentes Ativos
                        </CardTitle>
                        <Zap className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{totalAgents}</div>
                        <p className="text-xs text-zinc-500">
                            Agentes configurados em sua conta
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4">
                <h3 className="text-xl font-bold text-white">Detalhamento por Agente</h3>
                <div className="grid gap-6 text-white">
                    {agents && agents.length > 0 ? (
                        agents.map((agent) => (
                            <Card key={agent.id} className="overflow-hidden bg-[#121215] border-white/5">
                                <CardHeader className="bg-white/5">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-lg text-white">{agent.name}</CardTitle>
                                            <CardDescription className="text-zinc-400">
                                                Total de {agent.conversations?.length || 0} conversões realizadas por este agente
                                            </CardDescription>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-primary">
                                                {agent.conversations?.length || 0}
                                            </div>
                                            <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Leads Totais</div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="divide-y divide-white/5">
                                        {agent.conversations && agent.conversations.length > 0 ? (
                                            agent.conversations.map((conv: any) => (
                                                <div key={conv.id} className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                            <User className="w-5 h-5 text-primary" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-white">{conv.contact_name || "Contato Sem Nome"}</p>
                                                            <p className="text-sm text-zinc-500">{conv.contact_phone}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="flex items-center gap-1 text-sm text-zinc-400 justify-end">
                                                            <Calendar className="w-3 h-3" />
                                                            {format(new Date(conv.created_at), "dd 'de' MMMM", { locale: ptBR })}
                                                        </div>
                                                        <p className="text-xs text-zinc-500">
                                                            {format(new Date(conv.created_at), "HH:mm", { locale: ptBR })}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-8 text-center text-zinc-500 italic">
                                                Nenhuma conversão registrada para este agente ainda.
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-xl">
                            <p className="text-zinc-500">Você ainda não possui agentes configurados.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors border ${className}`}>
            {children}
        </span>
    )
}

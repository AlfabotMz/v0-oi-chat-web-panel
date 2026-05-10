"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { User, Calendar, MessageSquareText, Copy, Trash2, CheckCircle2, XCircle, Clock } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { toast } from "sonner"
import type { User as SupabaseUser } from "@supabase/supabase-js"

interface Lead {
    id: string
    agent_id: string
    user_id: string
    user_number: string
    form: string
    date: string
    created_at: string
    updated_at: string
    status: 'pending' | 'completed' | 'failed'
    is_read: boolean
}

interface Agent {
    id: string
    name: string
    leads: Lead[]
}

interface LeadsManagerProps {
    initialAgents: Agent[]
    user: SupabaseUser
}

export function LeadsManager({ initialAgents, user }: LeadsManagerProps) {
    const supabase = createClient()
    const [agents, setAgents] = useState<Agent[]>(initialAgents)
    const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set())
    const [maximizedLead, setMaximizedLead] = useState<Lead | null>(null)
    const [isSaving, setIsSaving] = useState(false)

    // Helper functions

    const handleSelectLead = (leadId: string, checked: boolean) => {
        const newSelected = new Set(selectedLeads)
        if (checked) {
            newSelected.add(leadId)
        } else {
            newSelected.delete(leadId)
        }
        setSelectedLeads(newSelected)
    }

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            const allIds = new Set<string>()
            agents.forEach(a => a.leads.forEach(l => allIds.add(l.id)))
            setSelectedLeads(allIds)
        } else {
            setSelectedLeads(new Set())
        }
    }

    const markAsRead = async (leadId: string) => {
        const { error } = await supabase.from('leads').update({ is_read: true }).eq('id', leadId)
        if (!error) {
            setAgents(agents.map(agent => ({
                ...agent,
                leads: agent.leads.map(lead => lead.id === leadId ? { ...lead, is_read: true } : lead)
            })))
        }
    }

    const openLead = (lead: Lead) => {
        setMaximizedLead(lead)
        if (!lead.is_read) {
            markAsRead(lead.id)
        }
    }

    const updateLeadStatus = async (leadId: string, status: 'pending' | 'completed' | 'failed') => {
        setIsSaving(true)
        const { error } = await supabase.from('leads').update({ status }).eq('id', leadId)
        if (error) {
            toast.error("Erro ao atualizar o status.")
            console.error(error)
        } else {
            setAgents(agents.map(agent => ({
                ...agent,
                leads: agent.leads.map(lead => lead.id === leadId ? { ...lead, status } : lead)
            })))
            if (maximizedLead?.id === leadId) {
                setMaximizedLead({ ...maximizedLead, status })
            }
            toast.success("Status atualizado com sucesso.")
        }
        setIsSaving(false)
    }

    const copyForm = (form: string) => {
        navigator.clipboard.writeText(form)
        toast.success("Copiado para a área de transferência!")
    }

    const deleteSelected = async () => {
        if (selectedLeads.size === 0) return
        if (!confirm(`Certeza que deseja deletar ${selectedLeads.size} encomenda(s)?`)) return

        setIsSaving(true)
        const idsToDelete = Array.from(selectedLeads)
        const { error } = await supabase.from('leads').delete().in('id', idsToDelete)

        if (error) {
            toast.error("Erro ao deletar encomendas.")
            console.error(error)
        } else {
            toast.success(`${idsToDelete.length} encomendas apagadas.`)
            setAgents(agents.map(agent => ({
                ...agent,
                leads: agent.leads.filter(l => !idsToDelete.includes(l.id))
            })))
            setSelectedLeads(new Set())
        }
        setIsSaving(false)
    }

    const deleteLead = async (leadId: string) => {
        if (!confirm("Certeza que deseja deletar permanentemente esta encomenda?")) return
        setIsSaving(true)
        const { error } = await supabase.from('leads').delete().eq('id', leadId)
        if (error) {
            toast.error("Erro ao deletar encomenda.")
            console.error(error)
        } else {
            toast.success("Encomenda apagada com sucesso.")
            setAgents(agents.map(agent => ({
                ...agent,
                leads: agent.leads.filter(l => l.id !== leadId)
            })))
            setMaximizedLead(null)
        }
        setIsSaving(false)
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed': return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20"><CheckCircle2 className="w-3 h-3 mr-1" /> Concluído</Badge>
            case 'failed': return <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20"><XCircle className="w-3 h-3 mr-1" /> Falha</Badge>
            default: return <Badge className="bg-orange-500/10 text-orange-500 hover:bg-orange-500/20"><Clock className="w-3 h-3 mr-1" /> Pendente</Badge>
        }
    }

    // Calcular estatísticas num total
    const leadsList = agents.flatMap(a => a.leads)
    const hasUnread = leadsList.some(l => !l.is_read)

    return (
        <div className="space-y-6">
            {/* Header / Actions toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#121215] p-4 rounded-xl border border-white/5">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Checkbox
                            checked={selectedLeads.size > 0 && selectedLeads.size === leadsList.length}
                            id="select-all"
                            onCheckedChange={handleSelectAll}
                            disabled={leadsList.length === 0}
                        />
                        <label htmlFor="select-all" className="text-sm cursor-pointer text-zinc-300">
                            Selecionar Todos ({selectedLeads.size})
                        </label>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {selectedLeads.size > 0 && (
                        <Button variant="destructive" size="sm" onClick={deleteSelected} disabled={isSaving} className="gap-2">
                            <Trash2 className="w-4 h-4" />
                            Apagar Selecionados
                        </Button>
                    )}
                </div>
            </div>

            {/* Listagem de Agentes -> Grid Leads */}
            <div className="space-y-8">
                {agents && agents.length > 0 ? (
                    agents.map((agent) => {
                        const agentLeads = agent.leads.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

                        if (agentLeads.length === 0) return null

                        return (
                            <div key={agent.id} className="space-y-4">
                                <h3 className="text-xl font-bold flex items-center gap-2 text-white">
                                    {agent.name}
                                    <Badge variant="outline" className="text-zinc-400 bg-black/40 border-white/5">
                                        {agentLeads.length} Encomendas
                                    </Badge>
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {agentLeads.map((lead) => (
                                        <Card
                                            key={lead.id}
                                            className={`relative overflow-hidden bg-[#121215] border-white/5 transition-all hover:border-primary/50 group cursor-pointer ${!lead.is_read ? 'shadow-[0_0_15px_rgba(168,85,247,0.15)] ring-1 ring-primary/20' : ''}`}
                                            onClick={() => openLead(lead)}
                                        >
                                            {!lead.is_read && (
                                                <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-primary animate-pulse" />
                                            )}
                                            <CardHeader className="bg-white/[0.02] p-4 flex flex-row items-start justify-between space-y-0">
                                                <div className="flex items-start gap-3 w-full" onClick={(e) => e.stopPropagation()}>
                                                    <Checkbox
                                                        checked={selectedLeads.has(lead.id)}
                                                        onCheckedChange={(checked: boolean) => handleSelectLead(lead.id, checked)}
                                                        className="mt-1"
                                                    />
                                                    <div className="w-full truncate" onClick={() => openLead(lead)}>
                                                        <CardTitle className="text-base text-white flex items-center gap-2 truncate">
                                                            <User className="w-4 h-4 text-primary shrink-0" />
                                                            {lead.user_number || "Número Desconhecido"}
                                                        </CardTitle>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            {getStatusBadge(lead.status)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="p-4" onClick={() => openLead(lead)}>
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex items-center justify-between text-xs text-zinc-500">
                                                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {format(new Date(lead.created_at), "dd/MM/yyyy")}</span>
                                                        <span>{format(new Date(lead.created_at), "HH:mm")}</span>
                                                    </div>

                                                    <div className="bg-black/40 rounded p-3 mt-2">
                                                        <p className="text-zinc-400 text-xs line-clamp-3 font-mono whitespace-pre-wrap">
                                                            {lead.form}
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )
                    })
                ) : (
                    <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-xl">
                        <p className="text-zinc-500">Você ainda não possui agentes ou não há encomendas.</p>
                    </div>
                )}
            </div>

            {/* Modal de Maximização */}
            {maximizedLead && (
                <Dialog open={!!maximizedLead} onOpenChange={(open) => !open && setMaximizedLead(null)}>
                    <DialogContent className="bg-[#121215] border-white/10 text-white max-w-2xl max-h-[85vh] overflow-y-auto w-[90vw]">
                        <DialogHeader>
                            <DialogTitle className="flex items-center justify-between gap-4 text-xl">
                                <div className="flex items-center gap-2">
                                    <User className="w-5 h-5 text-primary" />
                                    {maximizedLead.user_number}
                                </div>
                                {getStatusBadge(maximizedLead.status)}
                            </DialogTitle>
                            <DialogDescription className="text-zinc-400">
                                Recebida em {format(new Date(maximizedLead.created_at), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="mt-4 space-y-6">
                            {/* Actions / Status changers */}
                            <div className="flex flex-wrap items-center gap-2 p-3 bg-black/20 rounded-lg border border-white/5">
                                <span className="text-xs font-semibold text-zinc-500 uppercase mr-2 tracking-wider">Ações:</span>

                                <Button size="sm" variant={maximizedLead.status === 'completed' ? 'default' : 'outline'} className={maximizedLead.status === 'completed' ? 'bg-green-600 hover:bg-green-700' : 'border-green-600/30 text-green-500 hover:bg-green-600/10'} onClick={() => updateLeadStatus(maximizedLead.id, 'completed')} disabled={isSaving}>
                                    <CheckCircle2 className="w-4 h-4 mr-1" /> Confirmar / Concluída
                                </Button>

                                <Button size="sm" variant={maximizedLead.status === 'failed' ? 'destructive' : 'outline'} className={maximizedLead.status === 'failed' ? '' : 'border-red-600/30 text-red-500 hover:bg-red-600/10'} onClick={() => updateLeadStatus(maximizedLead.id, 'failed')} disabled={isSaving}>
                                    <XCircle className="w-4 h-4 mr-1" /> Falha / Cancelado
                                </Button>

                                <Button size="sm" variant={maximizedLead.status === 'pending' ? 'secondary' : 'ghost'} className="text-zinc-400 hover:text-white" onClick={() => updateLeadStatus(maximizedLead.id, 'pending')} disabled={isSaving}>
                                    <Clock className="w-4 h-4 mr-1" /> Mover p/ Pendente
                                </Button>
                            </div>

                            {/* Payload (Form) */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-sm font-semibold flex items-center gap-2 text-zinc-300">
                                        <MessageSquareText className="w-4 h-4 text-primary" />
                                        Conteúdo
                                    </h4>
                                    <Button size="sm" variant="ghost" onClick={() => copyForm(maximizedLead.form)} className="gap-2 text-zinc-400 hover:text-white hover:bg-white/5 h-8">
                                        <Copy className="w-3.5 h-3.5" /> Copiar Tudo
                                    </Button>
                                </div>
                                <div className="bg-black/50 p-6 rounded-lg border border-white/5 overflow-x-auto">
                                    <pre className="text-zinc-300 font-mono text-sm whitespace-pre-wrap leading-relaxed">{maximizedLead.form}</pre>
                                </div>
                            </div>

                            {/* Delete specific */}
                            <div className="pt-4 border-t border-white/5 flex justify-end">
                                <Button variant="ghost" className="text-red-500 hover:text-red-400 hover:bg-red-500/10" onClick={() => deleteLead(maximizedLead.id)} disabled={isSaving}>
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Apagar Encomenda
                                </Button>
                            </div>
                        </div>

                    </DialogContent>
                </Dialog>
            )}
        </div>
    )
}

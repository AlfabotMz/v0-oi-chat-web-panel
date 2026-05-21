"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { User, Calendar, Copy, Trash2, CheckCircle2, XCircle, Clock, ShoppingBag, ArrowRight } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { toast } from "sonner"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { cn } from "@/lib/utils"

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

    const handleSelectLead = (leadId: string, checked: boolean) => {
        const newSelected = new Set(selectedLeads)
        if (checked) newSelected.add(leadId)
        else newSelected.delete(leadId)
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
        } else {
            setAgents(agents.map(agent => ({
                ...agent,
                leads: agent.leads.map(lead => lead.id === leadId ? { ...lead, status } : lead)
            })))
            if (maximizedLead?.id === leadId) {
                setMaximizedLead({ ...maximizedLead, status })
            }
            toast.success("Status atualizado!")
        }
        setIsSaving(false)
    }

    const copyForm = (form: string) => {
        navigator.clipboard.writeText(form)
        toast.success("Pedido copiado!")
    }

    const deleteSelected = async () => {
        if (selectedLeads.size === 0) return
        if (!confirm(`Deletar ${selectedLeads.size} encomenda(s)?`)) return

        setIsSaving(true)
        const idsToDelete = Array.from(selectedLeads)
        const { error } = await supabase.from('leads').delete().in('id', idsToDelete)

        if (!error) {
            toast.success(`${idsToDelete.length} apagadas.`)
            setAgents(agents.map(agent => ({ ...agent, leads: agent.leads.filter(l => !idsToDelete.includes(l.id)) })))
            setSelectedLeads(new Set())
        }
        setIsSaving(false)
    }

    const deleteLead = async (leadId: string) => {
        if (!confirm("Deletar encomenda permanentemente?")) return
        setIsSaving(true)
        const { error } = await supabase.from('leads').delete().eq('id', leadId)
        if (!error) {
            toast.success("Encomenda apagada.")
            setAgents(agents.map(agent => ({ ...agent, leads: agent.leads.filter(l => l.id !== leadId) })))
            setMaximizedLead(null)
        }
        setIsSaving(false)
    }

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'completed': return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
            case 'failed': return "bg-rose-500/10 text-rose-500 border-rose-500/20"
            default: return "bg-orange-500/10 text-orange-500 border-orange-500/20"
        }
    }

    const getStatusIcon = (status: string, className?: string) => {
        switch (status) {
            case 'completed': return <CheckCircle2 className={cn("w-3.5 h-3.5", className)} />
            case 'failed': return <XCircle className={cn("w-3.5 h-3.5", className)} />
            default: return <Clock className={cn("w-3.5 h-3.5", className)} />
        }
    }

    const leadsList = agents.flatMap(a => a.leads)

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Minimalist Toolbar */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-md">
                <div className="flex items-center gap-3 px-2">
                    <Checkbox
                        checked={selectedLeads.size > 0 && selectedLeads.size === leadsList.length}
                        id="select-all"
                        onCheckedChange={handleSelectAll}
                        disabled={leadsList.length === 0}
                        className="rounded-[4px] border-zinc-500 data-[state=checked]:border-primary"
                    />
                    <label htmlFor="select-all" className="text-sm font-medium text-zinc-400 select-none cursor-pointer">
                        {selectedLeads.size > 0 ? `${selectedLeads.size} selecionadas` : "Selecionar Todas"}
                    </label>
                </div>

                {selectedLeads.size > 0 && (
                    <Button variant="ghost" size="sm" onClick={deleteSelected} disabled={isSaving} className="text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 h-8 rounded-xl px-4">
                        <Trash2 className="w-4 h-4 mr-2" /> Apagar
                    </Button>
                )}
            </div>

            {/* Content Grid */}
            <div className="space-y-12">
                {agents && agents.length > 0 ? (
                    agents.map((agent) => {
                        const agentLeads = agent.leads.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                        if (agentLeads.length === 0) return null

                        return (
                            <div key={agent.id} className="space-y-4">
                                <div className="flex items-center gap-3 mb-2 px-1">
                                    <h3 className="text-lg font-semibold text-white tracking-tight">{agent.name}</h3>
                                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-white/5 text-zinc-400 border border-white/5">
                                        {agentLeads.length} pedido{agentLeads.length !== 1 ? 's' : ''}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {agentLeads.map((lead) => (
                                        <Card
                                            key={lead.id}
                                            className={cn(
                                                "group relative overflow-hidden bg-white/[0.015] border-white/5 hover:bg-white/[0.03] transition-all duration-300 cursor-pointer rounded-2xl flex flex-col",
                                                !lead.is_read ? "ring-1 ring-primary/30 shadow-[0_4px_20px_rgba(168,85,247,0.1)]" : "hover:border-white/10 hover:shadow-lg hover:shadow-black/20"
                                            )}
                                            onClick={() => openLead(lead)}
                                        >
                                            {!lead.is_read && (
                                                <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
                                            )}

                                            <CardContent className="p-5 flex-1 flex flex-col h-full">
                                                {/* Card Header Info */}
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div onClick={(e) => e.stopPropagation()} className="pt-0.5">
                                                            <Checkbox
                                                                checked={selectedLeads.has(lead.id)}
                                                                onCheckedChange={(checked: boolean) => handleSelectLead(lead.id, checked)}
                                                                className="border-zinc-600 data-[state=checked]:border-primary"
                                                            />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
                                                                {lead.user_number || "Desconhecido"}
                                                            </p>
                                                            <p className="text-[11px] text-zinc-500 flex items-center gap-1.5 mt-0.5">
                                                                <Calendar className="w-3 h-3" />
                                                                {format(new Date(lead.created_at), "dd/MM 'às' HH:mm")}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Text Snippet minimal */}
                                                <div className="bg-black/20 rounded-xl p-3 mb-4 flex-1">
                                                    <p className="text-xs text-zinc-400 line-clamp-3 font-sans leading-relaxed">
                                                        {lead.form}
                                                    </p>
                                                </div>

                                                {/* Footer Status */}
                                                <div className="flex items-center justify-between mt-auto pt-2">
                                                    <span className={cn("text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-md border flex items-center gap-1.5", getStatusStyle(lead.status))}>
                                                        {getStatusIcon(lead.status)}
                                                        {lead.status === 'completed' ? 'Concluída' : lead.status === 'failed' ? 'Falhou' : 'Pendente'}
                                                    </span>

                                                    <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100">
                                                        <ArrowRight className="w-3 h-3 text-zinc-400" />
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
                    <div className="py-24 flex flex-col items-center justify-center text-center bg-white/[0.01] rounded-3xl border border-white/5 border-dashed">
                        <ShoppingBag className="w-12 h-12 text-zinc-700 mb-4" />
                        <h3 className="text-lg font-medium text-zinc-300">Nenhuma Encomenda</h3>
                        <p className="text-sm text-zinc-500 max-w-sm mt-1">Os pedidos dos seus clientes aparecerão organizados aqui.</p>
                    </div>
                )}
            </div>

            {/* Clean Receipt Dialog */}
            {maximizedLead && (
                <Dialog open={!!maximizedLead} onOpenChange={(open) => !open && setMaximizedLead(null)}>
                    <DialogContent className="bg-[#0f0f12]/95 backdrop-blur-xl border-white/10 text-white max-w-xl p-0 overflow-hidden shadow-2xl rounded-3xl sm:rounded-[2rem]">

                        {/* Elegant Header */}
                        <DialogHeader className="p-6 md:p-8 pb-4">
                            <div className="flex items-center justify-between mb-4">
                                <span className={cn("text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border flex items-center gap-1.5 w-fit", getStatusStyle(maximizedLead.status))}>
                                    {getStatusIcon(maximizedLead.status, "w-4 h-4")}
                                    {maximizedLead.status === 'completed' ? 'Aprovada / Concluída' : maximizedLead.status === 'failed' ? 'Falha / Cancelada' : 'Aguardando Processamento'}
                                </span>
                            </div>

                            <DialogTitle className="text-2xl font-semibold flex items-center gap-3">
                                {maximizedLead.user_number}
                            </DialogTitle>

                            <DialogDescription className="text-sm text-zinc-400 flex items-center gap-2 mt-2">
                                Recebida em {format(new Date(maximizedLead.created_at), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                            </DialogDescription>
                        </DialogHeader>

                        {/* Content Area */}
                        <div className="px-6 md:px-8 pb-6">
                            <div className="relative group">
                                <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button size="icon" variant="secondary" onClick={() => copyForm(maximizedLead.form)} className="w-8 h-8 bg-zinc-800 hover:bg-zinc-700 rounded-full shadow-lg">
                                        <Copy className="w-3.5 h-3.5 text-zinc-300" />
                                    </Button>
                                </div>
                                <div className="bg-black/40 p-6 rounded-2xl border border-white/[0.05] shadow-inner font-sans text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap max-h-[40vh] overflow-y-auto">
                                    {maximizedLead.form}
                                </div>
                            </div>
                        </div>

                        {/* Control Actions Base */}
                        <div className="bg-white/[0.02] border-t border-white/5 p-4 md:p-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">

                            {/* Status Changers */}
                            <div className="flex items-center gap-2">
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className={cn("h-10 rounded-xl px-4", maximizedLead.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : 'text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10')}
                                    onClick={() => updateLeadStatus(maximizedLead.id, 'completed')}
                                    disabled={isSaving}
                                >
                                    <CheckCircle2 className="w-4 h-4 mr-2" /> Marcar Concluída
                                </Button>

                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className={cn("h-10 rounded-xl px-4", maximizedLead.status === 'failed' ? 'bg-rose-500/20 text-rose-400' : 'text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10')}
                                    onClick={() => updateLeadStatus(maximizedLead.id, 'failed')}
                                    disabled={isSaving}
                                >
                                    <XCircle className="w-4 h-4 mr-2" /> Falhou
                                </Button>
                            </div>

                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 rounded-xl text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 self-end sm:self-auto ml-auto"
                                onClick={() => deleteLead(maximizedLead.id)}
                                disabled={isSaving}
                                title="Apagar Encomenda"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    )
}

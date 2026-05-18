"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Plus, Settings, Trash2, Loader2 } from "lucide-react"
import { CreateAgentDialog } from "./create-agent-dialog"

interface AgentsListProps {
  agents: any[]
}

export function AgentsList({ agents }: AgentsListProps) {
  const router = useRouter()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [deletingAgentId, setDeletingAgentId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [agentToDelete, setAgentToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeleteClick = (agentId: string) => {
    setAgentToDelete(agentId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!agentToDelete) return

    setIsDeleting(true)
    setDeletingAgentId(agentToDelete)

    try {
      const response = await fetch(`/api/agents/${agentToDelete}/delete`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Erro ao deletar agente")
      }

      // Atualizar a lista
      router.refresh()
      setDeleteDialogOpen(false)
      setAgentToDelete(null)
    } catch (err: any) {
      console.error("Erro ao deletar agente:", err)
      alert(err.message || "Erro ao deletar agente")
    } finally {
      setIsDeleting(false)
      setDeletingAgentId(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold text-foreground">Your Agents</h2>
        <Button onClick={() => setIsCreateOpen(true)} className="gap-2 sm:w-auto w-full sm:self-auto" data-tour="create-agent-button">
          <Plus className="w-4 h-4" />
          New Agent
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {agents.length === 0 ? (
          <Card className="col-span-full border-border/50">
            <CardContent className="p-6 text-center sm:p-8">
              <p className="text-muted-foreground mb-4">No agents yet</p>
              <Button onClick={() => setIsCreateOpen(true)} variant="outline" className="w-full sm:w-auto" data-tour="create-agent-button">
                Create Your First Agent
              </Button>
            </CardContent>
          </Card>
        ) : (
          agents.map((agent) => (
            <Card
              key={agent.id}
              className="glass glass-hover border-0 group relative overflow-hidden transition-all duration-300 hover:-translate-y-1"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <CardHeader className="relative z-10">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg font-semibold tracking-tight">{agent.name}</CardTitle>
                    <p className="text-sm text-muted-foreground font-mono">{agent.phone_number || "Sem número"}</p>
                  </div>
                  <Badge
                    variant={agent.status === "active" ? "default" : "secondary"}
                    className={agent.status === "active" ? "bg-green-500/20 text-green-500 hover:bg-green-500/30 border-green-500/20" : ""}
                  >
                    {agent.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Link href={`/dashboard/agents/${agent.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full gap-2 bg-white/5 border-white/10 hover:bg-white/10 hover:text-primary transition-colors justify-center">
                      <Settings className="w-4 h-4" />
                      Configure
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto gap-2 bg-white/5 border-white/10 text-red-500 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all"
                    onClick={() => handleDeleteClick(agent.id)}
                    disabled={deletingAgentId === agent.id}
                  >
                    {deletingAgentId === agent.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <CreateAgentDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar este agente? Esta ação não pode ser desfeita.
              O agente será removido do banco de dados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deletando...
                </>
              ) : (
                "Deletar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

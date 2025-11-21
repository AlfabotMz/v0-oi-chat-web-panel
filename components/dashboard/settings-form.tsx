"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { createClient } from "@/lib/supabase/client"
import { signOut } from "@/lib/supabase/auth-actions"
import { Crown, Trash2, Loader2, CheckCircle2 } from "lucide-react"

interface SettingsFormProps {
  user: User
  profile: any
}

const planLabels: Record<string, string> = {
  free: "Gratuito",
  pro: "Pro",
  premium: "Premium",
}

const planColors: Record<string, string> = {
  free: "bg-gray-500",
  pro: "bg-blue-500",
  premium: "bg-purple-500",
}

export function SettingsForm({ user, profile }: SettingsFormProps) {
  const router = useRouter()
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteStep, setDeleteStep] = useState(1)

  const [phone, setPhone] = useState(profile?.phone || "")
  const [isSaving, setIsSaving] = useState(false)

  const plan = profile?.plan || "free"
  const planLabel = planLabels[plan] || plan
  const planColor = planColors[plan] || "bg-gray-500"

  const handleUpdateProfile = async () => {
    setIsSaving(true)
    setMessage(null)

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("profiles")
        .update({ phone })
        .eq("id", user.id)

      if (error) throw error

      setMessage({ type: "success", text: "Perfil atualizado com sucesso!" })
      router.refresh()
    } catch (err: any) {
      console.error("Erro ao atualizar perfil:", err)
      setMessage({
        type: "error",
        text: err.message || "Erro ao atualizar perfil. Tente novamente.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteStep === 1) {
      if (deleteConfirmText.toLowerCase() !== "deletar") {
        setMessage({ type: "error", text: "Por favor, digite 'DELETAR' para confirmar" })
        return
      }
      setDeleteStep(2)
      return
    }

    setIsDeleting(true)
    try {
      const supabase = createClient()

      // Deletar todos os agentes do usuário primeiro
      const { data: agents } = await supabase
        .from("agents")
        .select("id")
        .eq("user_id", user.id)

      if (agents && agents.length > 0) {
        for (const agent of agents) {
          await fetch(`/api/agents/${agent.id}/delete`, { method: "DELETE" })
        }
      }

      // Deletar o profile
      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", user.id)

      if (profileError) throw profileError

      // Fazer logout
      await signOut()
      router.push("/")
    } catch (err: any) {
      console.error("Erro ao deletar conta:", err)
      setMessage({
        type: "error",
        text: err.message || "Erro ao deletar conta. Tente novamente.",
      })
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setDeleteStep(1)
      setDeleteConfirmText("")
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Informações da Conta</CardTitle>
          <CardDescription>Dados básicos da sua conta</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <div className="flex items-center gap-2">
              <Input disabled value={user.email || ""} />
              <Badge variant={user.email_confirmed_at ? "default" : "secondary"}>
                {user.email_confirmed_at ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Verificado
                  </>
                ) : (
                  "Pendente"
                )}
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Telefone</Label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+258 84 123 4567"
            />
            <p className="text-xs text-muted-foreground">
              Adicione seu número para receber notificações.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Plano Atual</Label>
            <div className="flex items-center gap-2">
              <Badge className={`${planColor} text-white`}>
                {plan === "premium" && <Crown className="w-3 h-3 mr-1" />}
                {planLabel}
              </Badge>
            </div>
          </div>

          <div className="pt-2">
            <Button onClick={handleUpdateProfile} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Alterações"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50 border-red-200 dark:border-red-900">
        <CardHeader>
          <CardTitle className="text-red-600 dark:text-red-400">Zona de Perigo</CardTitle>
          <CardDescription>Essas ações são irreversíveis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Deletar Conta</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Ao deletar sua conta, todos os seus agentes, conversas e dados serão permanentemente removidos.
                Esta ação não pode ser desfeita.
              </p>
              <Button
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
                className="gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Deletar Conta
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {message && (
        <div
          className={`p-4 rounded-lg text-sm ${message.type === "success" ? "bg-green-500/10 text-green-700 dark:text-green-400" : "bg-red-500/10 text-red-700 dark:text-red-400"
            }`}
        >
          {message.text}
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600 dark:text-red-400">
              {deleteStep === 1 ? "Confirmar Exclusão" : "Última Confirmação"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteStep === 1 ? (
                <>
                  Esta ação é <strong>permanente e irreversível</strong>. Todos os seus agentes, conversas e dados serão deletados.
                  <div className="mt-4 space-y-2">
                    <Label>Digite <strong>DELETAR</strong> para confirmar:</Label>
                    <Input
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      placeholder="DELETAR"
                      className="font-mono"
                    />
                  </div>
                </>
              ) : (
                <>
                  Você tem certeza absoluta? Esta é a última chance de cancelar. Todos os seus dados serão perdidos permanentemente.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting} onClick={() => {
              setDeleteStep(1)
              setDeleteConfirmText("")
            }}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={isDeleting || (deleteStep === 1 && deleteConfirmText.toLowerCase() !== "deletar")}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deletando...
                </>
              ) : deleteStep === 1 ? (
                "Continuar"
              ) : (
                "Sim, Deletar Conta"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

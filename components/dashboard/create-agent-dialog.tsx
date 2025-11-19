"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface CreateAgentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateAgentDialog({ open, onOpenChange }: CreateAgentDialogProps) {
  const router = useRouter()
  const [nome, setNome] = useState("")
  const [prompt, setPrompt] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      // Chamar a API que usa o webhook n8n
      const response = await fetch("/api/agents/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome,
          prompt,
          phone_number: phoneNumber || null,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Erro ao criar agente")
      }

      router.refresh()
      onOpenChange(false)
      setNome("")
      setPrompt("")
      setPhoneNumber("")
    } catch (err: unknown) {
      console.error("Erro ao criar agente:", err)
      setError(err instanceof Error ? err.message : "Erro ao criar agente")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Criar Novo Agente</DialogTitle>
          <DialogDescription>
            Configure um novo agente virtual para WhatsApp. O agente será criado através do n8n.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome do Agente</Label>
            <Input
              id="nome"
              placeholder="Ex: Suporte Moz"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="prompt">Prompt do Agente</Label>
            <Textarea
              id="prompt"
              placeholder="Ex: Olá! Sou o atendente virtual OiChat. Como posso ajudá-lo hoje?"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              required
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              Instruções iniciais que o agente seguirá ao conversar com os clientes
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Número de Telefone (Opcional)</Label>
            <Input
              id="phone"
              placeholder="+258 84 123 4567"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Número associado ao WhatsApp do agente (opcional)
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Criando..." : "Criar Agente"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

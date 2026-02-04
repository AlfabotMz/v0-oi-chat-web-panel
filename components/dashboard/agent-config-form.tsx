"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { AttachmentsManager } from "./attachments-manager"
import { WhatsAppConnect } from "./whatsapp-connect"
import { Badge } from "@/components/ui/badge"
import { BackButton } from "@/components/ui/back-button"
import { PromptEditor } from "./prompt-editor"
import { toast } from "sonner"

interface AgentConfigFormProps {
  agent: any
}

export function AgentConfigForm({ agent }: AgentConfigFormProps) {
  const router = useRouter()
  const [name, setName] = useState(agent.name)
  const [prompt, setPrompt] = useState(agent.prompt || "")
  const [status, setStatus] = useState(agent.status)
  const [webhookUrl, setWebhookUrl] = useState(agent.n8n_webhook_url || "")
  const [attachments, setAttachments] = useState<Record<string, string[]>>(agent.anexos || {})
  const [product, setProduct] = useState(agent.product || "")
  const [amount, setAmount] = useState(agent.amount || "")
  const [contactOwner, setContactOwner] = useState(agent.contact_owner || "")
  const [contactDelivery, setContactDelivery] = useState(agent.contact_delivery || "")
  const [customMessage, setCustomMessage] = useState(
    agent.custom_message ||
    "🚀 Nova Encomenda Recebida!\n\n💸 Produto: {{produto}}\n\n💸 Quantidade: {{quantidade}}\n\n💸 Valor: {{valor}}\n\n💸 Número: {{numero}}\n\n💸 Local: {{localizacao}}"
  )
  const [messageDelay, setMessageDelay] = useState(agent.message_delay || 0)
  const [isLoading, setIsLoading] = useState(false)

  const isActive = status === "active"

  useEffect(() => {
    // Atualizar anexos quando o agente mudar
    if (agent.anexos) {
      setAttachments(agent.anexos)
    }
    if (agent.prompt) {
      setPrompt(agent.prompt)
    }
  }, [agent])

  const handleToggleStatus = async (checked: boolean) => {
    const newStatus = checked ? "active" : "inactive"
    setStatus(newStatus) // Optimistic update

    try {
      const response = await fetch(`/api/agents/${agent.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Falha ao atualizar status")
      }

      toast.success(`Agente ${checked ? "ativado" : "desativado"} com sucesso`)
      router.refresh()
    } catch (err: unknown) {
      // Revert on error
      setStatus(agent.status)
      toast.error("Erro ao atualizar status do agente")
      console.error(err)
    }
  }

  const handleSave = async () => {
    setIsLoading(true)

    try {
      const response = await fetch(`/api/agents/${agent.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          prompt,
          status,
          product,
          amount,
          n8n_webhook_url: webhookUrl,
          anexos: attachments,
          contact_owner: contactOwner || null,
          contact_delivery: contactDelivery || null,
          custom_message: customMessage,
          message_delay: messageDelay,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Falha ao atualizar agente")
      }

      toast.success("Agente atualizado com sucesso")
      router.refresh()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Falha ao atualizar agente")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Configurar Agente</h1>
          <p className="text-muted-foreground mt-1">Gerencie as configurações do seu agente</p>
        </div>
        <BackButton href="/dashboard" />
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Status do Agente</CardTitle>
              <CardDescription>Ative ou desative o agente</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Badge
                variant={isActive ? "default" : "secondary"}
                className={isActive ? "bg-green-500 hover:bg-green-600" : ""}
              >
                {isActive ? "Ativo" : "Inativo"}
              </Badge>
              <Switch checked={isActive} onCheckedChange={handleToggleStatus} />
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Configurações do Agente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Agente</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="product">Produto</Label>
              <Input
                id="product"
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                placeholder="Ex: Consultoria"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Valor (Amount)</Label>
              <Input
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Ex: 960 MT"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Configure o produto e o valor que aparecerão nas notificações.
          </p>



          <div className="space-y-2">
            <Label htmlFor="prompt">Prompt do Agente</Label>
            <PromptEditor
              value={prompt}
              onChange={setPrompt}
              placeholder="Digite as instruções para o agente de IA... Use / para ver funções disponíveis."
              className="min-h-[200px] bg-background/50"
            />
            <p className="text-xs text-muted-foreground">
              Instruções que definem como o agente deve se comportar e responder
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="messageDelay">Delay da Mensagem (segundos)</Label>
              <span className="text-sm font-medium">{messageDelay}s</span>
            </div>
            <div className="pt-2">
              <input
                type="range"
                id="messageDelay"
                min="0"
                max="30"
                step="1"
                value={messageDelay}
                onChange={(e) => setMessageDelay(parseInt(e.target.value))}
                className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Tempo de espera antes do agente responder (0-30 segundos)
            </p>
          </div>




          <Button onClick={handleSave} disabled={isLoading} className="w-full">
            {isLoading ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </CardContent>
      </Card>

      {/* Notificações WhatsApp */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Notificações de Conversões</CardTitle>
          <CardDescription>
            Configure contatos para receber notificações quando houver uma conversão
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="contactOwner">Número a Receber Formulário (WhatsApp)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">+258</span>
              <Input
                id="contactOwner"
                placeholder="84 123 4567"
                value={contactOwner}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 9)
                  setContactOwner(value)
                }}
                className="pl-14"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Este número receberá os formulários preenchidos
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactDelivery">Número do Delivery (WhatsApp - Opcional)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">+258</span>
              <Input
                id="contactDelivery"
                placeholder="84 123 4567"
                value={contactDelivery}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 9)
                  setContactDelivery(value)
                }}
                className="pl-14"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Este número receberá notificações de entrega/logística
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="customMessage">Mensagem de Notificação</Label>
            <PromptEditor
              value={customMessage}
              onChange={setCustomMessage}
              placeholder="Mensagem que será enviada quando houver uma conversão... Use / para ver variáveis."
              className="min-h-[150px] bg-background/50"
              mode="variables-only"
              variables={[
                { label: "produto", value: "{{produto}}", description: "Nome do produto" },
                { label: "quantidade", value: "{{quantidade}}", description: "Quantidade de itens" },
                { label: "valor", value: "{{valor}}", description: "Valor total/unidade" },
                { label: "numero", value: "{{numero}}", description: "Número do cliente" },
                { label: "localizacao", value: "{{localizacao}}", description: "Localização do cliente" },
                { label: "date", value: "{{date}}", description: "Data da conversão" },
              ]}
            />
            <p className="text-xs text-muted-foreground">
              Use variáveis para personalizar a mensagem.
            </p>
            <div className="mt-2 p-3 bg-muted rounded-md">
              <p className="text-xs font-medium mb-1">Preview:</p>
              <pre className="text-xs whitespace-pre-wrap text-muted-foreground">
                {customMessage
                  .replace("{{produto}}", product || "Produto Exemplo")
                  .replace("{{quantidade}}", "1")
                  .replace("{{valor}}", amount || "960 MT")
                  .replace("{{numero}}", "+258 84 123 4567")
                  .replace("{{localizacao}}", "Maputo, Moçambique")
                  .replace("{{date}}", new Date().toLocaleDateString("pt-PT", { day: 'numeric', month: 'long', year: 'numeric' }))}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Anexos */}
      <AttachmentsManager
        attachments={attachments}
        onAttachmentsChange={setAttachments}
        onSave={handleSave}
        isSaving={isLoading}
      />

      {/* Conexão WhatsApp */}
      <WhatsAppConnect agentId={agent.id} />
    </div>
  )
}

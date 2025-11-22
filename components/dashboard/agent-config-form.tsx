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
  const [contactOwner, setContactOwner] = useState(agent.contact_owner || "")
  const [contactDelivery, setContactDelivery] = useState(agent.contact_delivery || "")
  const [customMessage, setCustomMessage] = useState(
    agent.custom_message ||
    "🚀 Nova Encomenda Recebida!\n\n💸 Produto: {{product}}\n\n💸 Número: {{number}}\n\n💸 Local: {{location}}"
  )
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

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

  const handleToggleStatus = (checked: boolean) => {
    setStatus(checked ? "active" : "inactive")
  }

  const handleSave = async () => {
    setIsLoading(true)
    setMessage(null)

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("agents")
        .update({
          name,
          prompt,
          status,
          product,
          n8n_webhook_url: webhookUrl,
          anexos: attachments,
          contact_owner: contactOwner || null,
          contact_delivery: contactDelivery || null,
          custom_message: customMessage,
        })
        .eq("id", agent.id)

      if (error) throw error
      setMessage({ type: "success", text: "Agente atualizado com sucesso" })
      router.refresh()
    } catch (err: unknown) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Falha ao atualizar agente",
      })
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

          <div className="space-y-2">
            <Label htmlFor="product">Produto</Label>
            <Input
              id="product"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              placeholder="Ex: Consultoria de Marketing"
            />
            <p className="text-xs text-muted-foreground">
              O produto ou serviço que este agente está vendendo
            </p>
          </div>



          <div className="space-y-2">
            <Label htmlFor="prompt">Prompt do Agente</Label>
            <PromptEditor
              value={prompt}
              onChange={setPrompt}
              placeholder="Digite as instruções para o agente de IA... Use / para ver funções disponíveis."
              className="min-h-[200px]"
            />
            <p className="text-xs text-muted-foreground">
              Instruções que definem como o agente deve se comportar e responder
            </p>
          </div>


          {message && (
            <div
              className={`p-3 rounded-lg text-sm ${message.type === "success"
                ? "bg-green-500/10 text-green-700"
                : "bg-red-500/10 text-red-700"
                }`}
            >
              {message.text}
            </div>
          )}

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
            <Label htmlFor="contactOwner">Contact Owner (WhatsApp)</Label>
            <Input
              id="contactOwner"
              placeholder="+258 84 123 4567"
              value={contactOwner}
              onChange={(e) => setContactOwner(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Número do dono/responsável que receberá notificações
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactDelivery">Contact Delivery (WhatsApp - Opcional)</Label>
            <Input
              id="contactDelivery"
              placeholder="+258 84 123 4567"
              value={contactDelivery}
              onChange={(e) => setContactDelivery(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Número do entregador/logística para receber notificações
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="customMessage">Mensagem de Notificação</Label>
            <Textarea
              id="customMessage"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              rows={8}
              placeholder="Mensagem que será enviada quando houver uma conversão"
            />
            <p className="text-xs text-muted-foreground">
              Use variáveis: {"{{product}}"}, {"{{number}}"}, {"{{location}}"}
            </p>
            <div className="mt-2 p-3 bg-muted rounded-md">
              <p className="text-xs font-medium mb-1">Preview:</p>
              <pre className="text-xs whitespace-pre-wrap text-muted-foreground">
                {customMessage
                  .replace("{{product}}", product || "Produto Exemplo")
                  .replace("{{number}}", "+55 11 99999-9999")
                  .replace("{{location}}", "São Paulo, SP")}
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

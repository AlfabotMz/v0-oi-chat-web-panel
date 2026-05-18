"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { ChevronRight, Bot, Sparkles, Zap, Check, AlertCircle, Smartphone, Info, Shield, Laugh, MoveRight, Save, Wand2, Settings2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
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
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { generatePrompt, PromptType, PromptVariables } from "@/lib/prompt-templates"

interface AgentConfigFormProps {
  agent: any
}

export function AgentConfigForm({ agent }: AgentConfigFormProps) {
  const router = useRouter()
  const [name, setName] = useState(agent.name)
  const [prompt, setPrompt] = useState(agent.prompt || "")
  const [status, setStatus] = useState(agent.status)
  // n8n_webhook_url deprecated
  const [attachments, setAttachments] = useState<Record<string, string[]>>(agent.anexos || {})
  const [product, setProduct] = useState(agent.product || "")
  const [amount, setAmount] = useState(agent.amount || "")
  const [contactOwner, setContactOwner] = useState(agent.contact_owner || "")
  const [contactDelivery, setContactDelivery] = useState(agent.contact_delivery || "")
  const [customMessage, setCustomMessage] = useState(
    agent.custom_message ||
    "🚀 Nova Encomenda Recebida!\n\n💸 Produto: {{product}}\n\n💸 Quantidade: {{quantity}}\n\n💸 Valor: {{price}}\n\n💸 Número: {{phone}}\n\n💸 Local: {{location}}\n\n💸 Data: {{date}}"
  )
  const [messageDelay, setMessageDelay] = useState(agent.message_delay ?? 5)

  // Structured fields (metadata for generation)
  const [promptType, setPromptType] = useState<PromptType>(agent.prompt_type || "dropshipper")
  const [audience, setAudience] = useState(agent.audience || "Ambos")
  const [tone, setTone] = useState(agent.tone || "Direto")
  const [productDescription, setProductDescription] = useState(agent.product_description || "")
  const [promptGenerated, setPromptGenerated] = useState(agent.prompt_generated || "")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

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

  const hasChanges =
    name !== agent.name ||
    prompt !== agent.prompt ||
    status !== agent.status ||
    // webhookUrl !== (agent.n8n_webhook_url || "") ||
    product !== (agent.product || "") ||
    amount !== (agent.amount || "") ||
    contactOwner !== (agent.contact_owner || "") ||
    contactDelivery !== (agent.contact_delivery || "") ||
    customMessage !== agent.custom_message ||
    messageDelay !== agent.message_delay ||
    promptType !== (agent.prompt_type || "dropshipper") ||
    audience !== (agent.audience || "Ambos") ||
    tone !== (agent.tone || "Direto") ||
    productDescription !== (agent.product_description || "")

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

  const handleGeneratePrompt = () => {
    const vars: PromptVariables = {
      product_name: product,
      product_price: amount,
      audience: audience,
      tone: tone,
      product_description: productDescription
    }

    const newPrompt = generatePrompt(promptType, vars, prompt)
    setPromptGenerated(newPrompt)
    setPrompt(newPrompt)
    setIsDialogOpen(false)
    toast.success("Prompt mesclado com sucesso!")
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
          product: product,
          amount: amount,
          // n8n_webhook_url: webhookUrl,
          anexos: attachments,
          contact_owner: contactOwner || null,
          contact_delivery: contactDelivery || null,
          custom_message: customMessage,
          message_delay: messageDelay,
          // New structured data
          prompt_type: promptType,
          audience: audience,
          tone: tone,
          product_description: productDescription,
          prompt_generated: promptGenerated
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
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <BackButton href="/dashboard" />
          <div>
            <h1 className="text-2xl font-bold">{name}</h1>
            <p className="text-sm text-muted-foreground">ID: {agent.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border/50">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</span>
            <Switch
              checked={isActive}
              onCheckedChange={handleToggleStatus}
              className="scale-75 data-[state=checked]:bg-green-500"
            />
            <Badge variant={isActive ? "default" : "secondary"} className={cn("text-[10px] h-5", isActive && "bg-green-500/20 text-green-500 border-green-500/20")}>
              {isActive ? "Ativo" : "Inativo"}
            </Badge>
          </div>
          <Button onClick={handleSave} disabled={isLoading || !hasChanges}>
            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Salvar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Inteligência do Agente */}
        <Card className="glass border-border/50">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Inteligência e Prompt</CardTitle>
            </div>
            <CardDescription>Configure como seu agente interage com os clientes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-secondary/20 p-4 rounded-xl border border-border/50">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-semibold">Gerador de Instruções</p>
                  <p className="text-xs text-muted-foreground">Deixe a IA estruturar o melhor prompt para você</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full sm:w-auto h-10 border-primary/20 hover:bg-primary/5">
                      <Wand2 className="w-4 h-4 mr-2 text-primary" />
                      Configurar Geração
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Bot className="w-5 h-5 text-primary" />
                        Gerador de Prompt
                      </DialogTitle>
                      <DialogDescription>
                        Forneça os detalhes e criaremos as instruções ideais.
                      </DialogDescription>
                    </DialogHeader>

                    <Tabs value={promptType} onValueChange={(v: string) => setPromptType(v as PromptType)} className="mt-4">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="dropshipper">Vendas</TabsTrigger>
                        <TabsTrigger value="support">Suporte</TabsTrigger>
                        <TabsTrigger value="personalizado">Custom</TabsTrigger>
                      </TabsList>

                      <div className="mt-6 space-y-4">
                        {promptType !== "personalizado" ? (
                          <>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label className="text-xs font-semibold text-muted-foreground uppercase">Produto</Label>
                                <Input value={product} onChange={(e) => setProduct(e.target.value)} placeholder="Ex: iPhone 15" />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-xs font-semibold text-muted-foreground uppercase">Preço</Label>
                                <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Ex: 99.000 MT" />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label className="text-xs font-semibold text-muted-foreground uppercase">Público</Label>
                                <Select value={audience} onValueChange={setAudience}>
                                  <SelectTrigger><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Ambos">Ambos</SelectItem>
                                    <SelectItem value="Feminino">Feminino</SelectItem>
                                    <SelectItem value="Masculino">Masculino</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-xs font-semibold text-muted-foreground uppercase">Tom</Label>
                                <Select value={tone} onValueChange={setTone}>
                                  <SelectTrigger><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Direto">Direto</SelectItem>
                                    <SelectItem value="Sério">Sério</SelectItem>
                                    <SelectItem value="Engraçado">Engraçado</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs font-semibold text-muted-foreground uppercase">Descrição</Label>
                              <Textarea
                                value={productDescription}
                                onChange={(e) => setProductDescription(e.target.value)}
                                placeholder="Dores, benefícios e diferenciais..."
                                className="min-h-[100px]"
                              />
                            </div>
                          </>
                        ) : (
                          <div className="text-center py-8 text-muted-foreground text-sm">
                            No modo customizado, edite o prompt diretamente na tela principal.
                          </div>
                        )}
                      </div>
                    </Tabs>

                    <DialogFooter className="mt-8">
                      <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                      {promptType !== 'personalizado' && (
                        <Button onClick={handleGeneratePrompt}>Gerar Prompt Agora</Button>
                      )}
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-xs font-semibold text-muted-foreground uppercase flex items-center justify-between">
                <span>Prompt Final</span>
                {promptType !== 'personalizado' && (
                  <span className="text-[10px] text-primary lowercase tracking-normal">Gerado automaticamente via {promptType}</span>
                )}
              </Label>
              <PromptEditor
                value={prompt}
                onChange={setPrompt}
                placeholder="Defina o comportamento do agente..."
                className="min-h-[350px] border-border/50 shadow-inner"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border/50">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-semibold text-muted-foreground uppercase">Nome do Agente</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase">Atraso de Resposta</Label>
                  <Badge variant="outline" className="font-mono">{messageDelay}s</Badge>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={messageDelay}
                  onChange={(e) => setMessageDelay(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notificações e Canais */}
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          <Card className="glass border-border/50">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">Conversões e Notificações</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <Label className="text-xs font-semibold text-muted-foreground uppercase">Mensagem de Notificação</Label>
                <PromptEditor
                  value={customMessage}
                  onChange={setCustomMessage}
                  mode="variables-only"
                  className="min-h-[150px]"
                  variables={[
                    { label: "product", value: "{{product}}", description: "Produto" },
                    { label: "price", value: "{{price}}", description: "Valor" },
                    { label: "phone", value: "{{phone}}", description: "Cliente" },
                    { label: "location", value: "{{location}}", description: "Local" },
                  ]}
                />
                <div className="bg-[#e5ddd5] dark:bg-[#0b141a]/60 p-4 rounded-xl border border-border/50 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat bg-[length:150px]">
                  <div className="bg-white dark:bg-[#1f2c33] p-2.5 rounded-lg shadow-sm text-[12px] max-w-[90%] border border-black/5">
                    {customMessage.replace(/{{product}}/g, product || "Exemplo").slice(0, 150)}...
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-xs font-semibold text-muted-foreground uppercase">Integração WhatsApp</Label>
                <WhatsAppConnect agentId={agent.id} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gestão de Arquivos */}
        <AttachmentsManager
          attachments={attachments}
          onAttachmentsChange={setAttachments}
          onSave={handleSave}
          isSaving={isLoading}
        />
      </div>
    </div>
  )
}

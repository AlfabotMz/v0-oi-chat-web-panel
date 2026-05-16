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
  const [webhookUrl, setWebhookUrl] = useState(agent.n8n_webhook_url || "")
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
    webhookUrl !== (agent.n8n_webhook_url || "") ||
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
          n8n_webhook_url: webhookUrl,
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Configurar Agente</h1>
          <p className="text-muted-foreground mt-1">Gerencie as configurações do seu agente</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleSave}
            disabled={isLoading || !hasChanges}
            size="icon"
            className={cn(
              "rounded-full w-12 h-12 transition-all duration-500",
              hasChanges
                ? "bg-purple-600 hover:bg-purple-700 shadow-[0_0_20px_rgba(168,85,247,0.4)] animate-pulse"
                : "bg-zinc-800 text-zinc-500 opacity-50 cursor-not-allowed"
            )}
          >
            <Save className="w-5 h-5" />
          </Button>
          <BackButton href="/dashboard" />
        </div>
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
                variant={isActive ? "default" : "destructive"}
                className={cn(
                  "font-bold px-3 py-1",
                  isActive ? "bg-green-500 hover:bg-green-600" : "bg-red-600 text-white hover:bg-red-700 border-none shadow-lg"
                )}
              >
                {isActive ? "Ativo" : "Inativo"}
              </Badge>
              <Switch
                checked={isActive}
                onCheckedChange={handleToggleStatus}
                className={cn(
                  !isActive && "data-[state=unchecked]:bg-zinc-800 border border-white/5"
                )}
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card className="border-border/50 overflow-hidden relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent pointer-events-none" />
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <Sparkles className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <CardTitle className="text-lg">Prompt Inteligente</CardTitle>
                <CardDescription>Geração automática baseada em dados</CardDescription>
              </div>
            </div>
            {promptType !== "personalizado" && (
              <Badge className="bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 border-purple-500/20 px-3">
                Ativo: {promptType === 'dropshipper' ? 'Vendas' : 'Suporte'}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex-1 h-12 border-purple-500/20 hover:bg-purple-500/5 hover:border-purple-500/40 text-sm font-semibold rounded-xl">
                  <Settings2 className="w-4 h-4 mr-2" />
                  Configurar Geração
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] bg-zinc-950 border-white/10 text-white">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                    <Wand2 className="w-6 h-6 text-purple-400" />
                    Gerador de Prompt
                  </DialogTitle>
                  <DialogDescription className="text-zinc-400">
                    Preencha os dados e o sistema criará o prompt ideal para sua IA.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 pt-4">
                  <Tabs value={promptType} onValueChange={(v: string) => setPromptType(v as PromptType)} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 bg-zinc-900">
                      <TabsTrigger value="dropshipper">Vendas</TabsTrigger>
                      <TabsTrigger value="support">Suporte</TabsTrigger>
                      <TabsTrigger value="personalizado">Custom</TabsTrigger>
                    </TabsList>

                    <div className="mt-6 space-y-4">
                      {promptType !== "personalizado" ? (
                        <>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-xs uppercase font-bold text-zinc-500">PRODUTO</Label>
                              <Input
                                value={product}
                                onChange={(e) => setProduct(e.target.value)}
                                placeholder="Nome do produto"
                                className="h-11 bg-zinc-900 border-zinc-800"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs uppercase font-bold text-zinc-500">PREÇO</Label>
                              <Input
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="Ex: 990 MT"
                                className="h-11 bg-zinc-900 border-zinc-800"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-xs uppercase font-bold text-zinc-500">PÚBLICO</Label>
                              <Select value={audience} onValueChange={setAudience}>
                                <SelectTrigger className="h-11 bg-zinc-900 border-zinc-800">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-900 border-zinc-800">
                                  <SelectItem value="Ambos">Ambos</SelectItem>
                                  <SelectItem value="Feminino">Feminino</SelectItem>
                                  <SelectItem value="Masculino">Masculino</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs uppercase font-bold text-zinc-500">TOM</Label>
                              <Select value={tone} onValueChange={setTone}>
                                <SelectTrigger className="h-11 bg-zinc-900 border-zinc-800">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-900 border-zinc-800">
                                  <SelectItem value="Sério">
                                    <div className="flex items-center gap-2">
                                      <Shield className="w-4 h-4 text-blue-400" />
                                      <span>Sério</span>
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="Engraçado">
                                    <div className="flex items-center gap-2">
                                      <Laugh className="w-4 h-4 text-yellow-400" />
                                      <span>Engraçado</span>
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="Direto">
                                    <div className="flex items-center gap-2">
                                      <MoveRight className="w-4 h-4 text-green-400" />
                                      <span>Direto</span>
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-xs uppercase font-bold text-zinc-500">DESCRIÇÃO DETALHADA</Label>
                            <Textarea
                              value={productDescription}
                              onChange={(e) => setProductDescription(e.target.value)}
                              placeholder="Fale sobre dores, benefícios e garantias..."
                              className="min-h-[120px] bg-zinc-900 border-zinc-800"
                            />
                            <p className="text-[10px] text-zinc-500 italic">Dica: Use um exemplo real para melhores resultados.</p>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-xs uppercase font-bold text-zinc-500">WHATSAPP SUPORTE (DDD)</Label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 text-xs font-bold">+258</span>
                                <Input
                                  value={contactOwner}
                                  onChange={(e) => setContactOwner(e.target.value.replace(/\D/g, "").slice(0, 9))}
                                  className="h-11 pl-12 bg-zinc-900 border-zinc-800"
                                  placeholder="841234567"
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs uppercase font-bold text-zinc-500">NÚMERO DELIVERY (DDD)</Label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 text-xs font-bold">+258</span>
                                <Input
                                  value={contactDelivery}
                                  onChange={(e) => setContactDelivery(e.target.value.replace(/\D/g, "").slice(0, 9))}
                                  className="h-11 pl-12 bg-zinc-900 border-zinc-800"
                                  placeholder="847654321"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-500/5 border border-blue-500/10">
                            <Info className="w-3.5 h-3.5 text-blue-400" />
                            <p className="text-[10px] text-zinc-400 leading-tight">Estes números são usados para as notificações automáticas e formulários.</p>
                          </div>
                        </>
                      ) : (
                        <div className="py-10 text-center space-y-3">
                          <Bot className="w-12 h-12 text-zinc-700 mx-auto" />
                          <p className="text-sm text-zinc-400">No modo customizado, você edita o prompt diretamente na tela principal.</p>
                        </div>
                      )}
                    </div>
                  </Tabs>
                </div>

                <DialogFooter className="mt-8">
                  <Button
                    variant="ghost"
                    onClick={() => setIsDialogOpen(false)}
                    className="hover:bg-zinc-900"
                  >
                    Cancelar
                  </Button>
                  {promptType !== 'personalizado' && (
                    <Button
                      onClick={handleGeneratePrompt}
                      className="bg-purple-600 hover:bg-purple-700 shadow-[0_0_20px_rgba(168,85,247,0.4)]"
                    >
                      Fundir e Gerar Prompt
                    </Button>
                  )}
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {promptType !== "personalizado" && (
              <Button
                onClick={handleGeneratePrompt}
                className="flex-1 h-12 bg-purple-600 hover:bg-purple-700 shadow-lg text-white font-bold rounded-xl transition-all active:scale-95"
              >
                <Zap className="w-4 h-4 mr-2" />
                Regerar Prompt
              </Button>
            )}
          </div>
          <p className="text-[10px] text-muted-foreground mt-3 text-center">
            {promptType === 'personalizado'
              ? "Você está operando no modo manual."
              : "As informações de suporte e entrega são gerenciadas separadamente na aba de notificações."}
          </p>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Prompt Final</CardTitle>
            {promptType !== "personalizado" && (
              <Badge variant="outline" className="text-purple-400 border-purple-400 capitalize">
                Gerado: {promptType}
              </Badge>
            )}
          </div>
          <CardDescription>
            {promptType === "personalizado"
              ? "Edite manualmente as instruções do seu agente"
              : "Este é o prompt que será usado pelo agente (gerado automaticamente)"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <PromptEditor
              value={prompt}
              onChange={setPrompt}
              placeholder="Digite as instruções para o agente de IA... Use / para ver funções disponíveis."
              className="min-h-[300px] bg-background/50"
            />
            <p className="text-xs text-muted-foreground">
              Instruções que definem como o agente deve se comportar e responder
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nome Interno do Agente</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
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

          <Button onClick={handleSave} disabled={isLoading} className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
            {isLoading ? "Salvando..." : "Salvar Configurações"}
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
                { label: "product", value: "{{product}}", description: "Nome do produto" },
                { label: "quantity", value: "{{quantity}}", description: "Quantidade de itens" },
                { label: "price", value: "{{price}}", description: "Valor total/unidade" },
                { label: "phone", value: "{{phone}}", description: "Número do cliente" },
                { label: "location", value: "{{location}}", description: "Localização do cliente" },
                { label: "date", value: "{{date}}", description: "Data da conversão" },
              ]}
            />
            <p className="text-xs text-muted-foreground">
              Use variáveis para personalizar a mensagem.
            </p>
            <div className="mt-4 space-y-2">
              <Label>Aparência no WhatsApp (Preview)</Label>
              <div className="bg-[#e5ddd5] dark:bg-[#0b141a] p-6 rounded-xl relative overflow-hidden border border-border/50 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat">
                <div className="flex flex-col gap-1 max-w-[85%]">
                  <div className="bg-white dark:bg-[#1f2c33] p-3 rounded-lg rounded-tl-none shadow-sm relative ml-2">
                    {/* Triangle tail */}
                    <div className="absolute top-0 left-[-8px] w-0 h-0 border-t-[10px] border-t-white dark:border-t-[#1f2c33] border-l-[10px] border-l-transparent" />

                    <div className="text-sm whitespace-pre-wrap break-words text-zinc-800 dark:text-zinc-100">
                      {customMessage
                        .replace(/{{produto}}|{{product}}/g, product || "Consultoria de IA")
                        .replace(/{{quantidade}}|{{quantity}}/g, "1")
                        .replace(/{{valor}}|{{price}}|{{amount}}/g, amount || "960 MT")
                        .replace(/{{numero}}|{{phone}}|{{number}}/g, "+258 84 123 4567")
                        .replace(/{{localizacao}}|{{location}}/g, "Maputo, Moçambique")
                        .replace(/{{date}}/g, mounted ? new Date().toLocaleDateString("pt-PT", { day: 'numeric', month: 'long' }) : "Data")}
                    </div>

                    <div className="flex justify-end mt-1 gap-1">
                      <span className="text-[10px] text-muted-foreground/70">
                        {mounted ? new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }) : "--:--"}
                      </span>
                      <div className="flex">
                        <svg width="16" height="11" viewBox="0 0 16 11" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-blue-400">
                          <path d="M4.5 9L1.5 6L0.5 7L4.5 11L13.5 2L12.5 1L4.5 9Z" fill="currentColor" />
                          <path d="M15.5 2L6.5 11L6 10.5L14.5 2L15.5 2Z" fill="currentColor" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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

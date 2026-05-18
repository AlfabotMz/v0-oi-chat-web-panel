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
    <div className="max-w-[1400px] mx-auto space-y-8 pb-20">
      {/* Header Sticky / Glass */}
      <div className="sticky top-0 z-30 flex items-center justify-between py-4 bg-background/80 backdrop-blur-md border-b border-border/50 -mx-4 px-4 sm:-mx-8 sm:px-8 mb-6">
        <div className="flex items-center gap-4">
          <BackButton href="/dashboard" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{name}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge
                variant={isActive ? "outline" : "secondary"}
                className={cn(
                  "text-[10px] uppercase tracking-wider font-bold h-5 px-2",
                  isActive ? "border-green-500/50 text-green-500 bg-green-500/5" : "bg-red-500/10 text-red-500 border-red-500/20"
                )}
              >
                {isActive ? "Ativo" : "Inativo"}
              </Badge>
              <div className="flex items-center gap-2 ml-2">
                <Switch
                  checked={isActive}
                  onCheckedChange={handleToggleStatus}
                  className="scale-75 data-[state=checked]:bg-green-500"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleSave}
            disabled={isLoading || !hasChanges}
            className={cn(
              "h-10 px-6 font-semibold rounded-full transition-all duration-300",
              hasChanges
                ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_20px_rgba(var(--primary),0.3)]"
                : "bg-secondary text-muted-foreground opacity-50"
            )}
          >
            {isLoading ? (
              <Bot className="w-4 h-4 mr-2 animate-bounce" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {isLoading ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Coluna Esquerda - Principal */}
        <div className="lg:col-span-8 space-y-8">
          {/* Card de Prompt Inteligente - Premium */}
          <Card className="glass relative overflow-hidden group border-primary/20 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-colors duration-700" />

            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 shadow-inner">
                    <Sparkles className="w-6 h-6 text-primary animate-pulse" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Prompt Inteligente</CardTitle>
                    <CardDescription>Use IA para gerar instruções perfeitas para seu agente</CardDescription>
                  </div>
                </div>
                {promptType !== "personalizado" && (
                  <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-primary/20 capitalize font-mono text-[10px]">
                    {promptType} mode
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex-1 h-14 border-primary/20 hover:bg-primary/5 hover:border-primary/40 text-sm font-bold rounded-2xl transition-all hover:scale-[1.02] active:scale-95 shadow-sm">
                      <Settings2 className="w-5 h-5 mr-2 text-primary" />
                      Configurar Geração de Prompt
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[550px] bg-zinc-950/95 backdrop-blur-xl border-white/10 text-white shadow-2xl rounded-3xl">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-black flex items-center gap-3 tracking-tighter">
                        <div className="p-2 rounded-lg bg-primary/20">
                          <Wand2 className="w-6 h-6 text-primary" />
                        </div>
                        GERADOR DE PROMPT
                      </DialogTitle>
                      <DialogDescription className="text-zinc-400 text-sm">
                        Nossa IA transformará esses dados em um prompt de alta conversão.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 pt-6">
                      <Tabs value={promptType} onValueChange={(v: string) => setPromptType(v as PromptType)} className="w-full">
                        <TabsList className="grid w-full grid-cols-3 bg-zinc-900/50 p-1 rounded-xl border border-white/5">
                          <TabsTrigger value="dropshipper" className="data-[state=active]:bg-primary rounded-lg transition-all">Vendas</TabsTrigger>
                          <TabsTrigger value="support" className="data-[state=active]:bg-primary rounded-lg transition-all">Suporte</TabsTrigger>
                          <TabsTrigger value="personalizado" className="data-[state=active]:bg-primary rounded-lg transition-all">Custom</TabsTrigger>
                        </TabsList>

                        <div className="mt-8 space-y-5">
                          {promptType !== "personalizado" ? (
                            <>
                              <div className="grid grid-cols-2 gap-5">
                                <div className="space-y-2">
                                  <Label className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest pl-1">PRODUTO</Label>
                                  <Input
                                    value={product}
                                    onChange={(e) => setProduct(e.target.value)}
                                    placeholder="Ex: iPhone 15 Pro"
                                    className="h-12 bg-zinc-900/80 border-white/5 focus:border-primary/50 transition-all rounded-xl"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest pl-1">PREÇO</Label>
                                  <Input
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="Ex: 99.000 MT"
                                    className="h-12 bg-zinc-900/80 border-white/5 focus:border-primary/50 transition-all rounded-xl"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-5">
                                <div className="space-y-2">
                                  <Label className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest pl-1">PÚBLICO ALVO</Label>
                                  <Select value={audience} onValueChange={setAudience}>
                                    <SelectTrigger className="h-12 bg-zinc-900/80 border-white/5 rounded-xl focus:ring-primary/20">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-900 border-white/10 rounded-xl">
                                      <SelectItem value="Ambos">Unissex / Geral</SelectItem>
                                      <SelectItem value="Feminino">Feminino</SelectItem>
                                      <SelectItem value="Masculino">Masculino</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest pl-1">TOM DE VOZ</Label>
                                  <Select value={tone} onValueChange={setTone}>
                                    <SelectTrigger className="h-12 bg-zinc-900/80 border-white/5 rounded-xl focus:ring-primary/20">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-900 border-white/10 rounded-xl">
                                      <SelectItem value="Sério">
                                        <div className="flex items-center gap-2">
                                          <Shield className="w-4 h-4 text-blue-400" />
                                          <span>Profissional / Sério</span>
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="Engraçado">
                                        <div className="flex items-center gap-2">
                                          <Laugh className="w-4 h-4 text-yellow-400" />
                                          <span>Amigável / Descontraído</span>
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="Direto">
                                        <div className="flex items-center gap-2">
                                          <MoveRight className="w-4 h-4 text-green-400" />
                                          <span>Pragmático / Direto</span>
                                        </div>
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest pl-1">O QUE A IA DEVE SABER?</Label>
                                <Textarea
                                  value={productDescription}
                                  onChange={(e) => setProductDescription(e.target.value)}
                                  placeholder="Detalhes técnicos, garantias, prazos de entrega..."
                                  className="min-h-[140px] bg-zinc-900/80 border-white/5 focus:border-primary/50 rounded-2xl resize-none p-4"
                                />
                                <div className="flex items-center gap-2 mt-2 px-1">
                                  <Info className="w-3 h-3 text-zinc-500" />
                                  <p className="text-[10px] text-zinc-500 font-medium">Quanto mais dados, mais persuasiva será a resposta.</p>
                                </div>
                              </div>
                            </>
                          ) : (
                            <div className="py-14 text-center space-y-4 bg-zinc-900/30 rounded-3xl border border-dashed border-white/5">
                              <div className="w-16 h-16 bg-zinc-800/50 rounded-full flex items-center justify-center mx-auto border border-white/5">
                                <Bot className="w-8 h-8 text-zinc-600" />
                              </div>
                              <div className="space-y-1">
                                <p className="text-sm font-bold text-zinc-300">Modo Customizado</p>
                                <p className="text-xs text-zinc-500 max-w-[250px] mx-auto">Você tem total liberdade para editar o prompt final na tela principal.</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </Tabs>
                    </div>

                    <DialogFooter className="mt-10 gap-3">
                      <Button
                        variant="ghost"
                        onClick={() => setIsDialogOpen(false)}
                        className="h-12 rounded-2xl hover:bg-white/5 hover:text-white transition-all font-bold px-8"
                      >
                        Descartar
                      </Button>
                      {promptType !== 'personalizado' && (
                        <Button
                          onClick={handleGeneratePrompt}
                          className="h-12 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black tracking-tight px-10 shadow-xl shadow-primary/20 transition-all hover:scale-[1.03] active:scale-95"
                        >
                          GERAR MASTER PROMPT
                        </Button>
                      )}
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {promptType !== "personalizado" && (
                  <Button
                    onClick={handleGeneratePrompt}
                    className="flex-1 h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-2xl transition-all active:scale-95 shadow-[0_4px_20px_rgba(var(--primary),0.2)]"
                  >
                    <Zap className="w-5 h-5 mr-3 fill-current" />
                    REGERAR AGORA
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Card do Prompt Final */}
          <Card className="glass shadow-xl border-border/40 min-h-[500px]">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-white/5 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-border/50">
                  <Zap className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                </div>
                <div>
                  <CardTitle className="text-base uppercase tracking-widest font-black">Instruções do Agente</CardTitle>
                  <CardDescription className="text-xs">O cérebro por trás de cada interação</CardDescription>
                </div>
              </div>
              {promptType !== "personalizado" && (
                <Badge variant="outline" className="border-primary/40 text-primary text-[9px] font-bold py-1">
                  MODO SUGERIDO ATIVO
                </Badge>
              )}
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="relative group rounded-2xl overflow-hidden bg-zinc-950/20 border border-white/5 focus-within:border-primary/40 transition-colors">
                <PromptEditor
                  value={prompt}
                  onChange={setPrompt}
                  placeholder="Escreva como o agente deve agir..."
                  className="min-h-[450px] p-6 text-sm leading-relaxed"
                />
              </div>

              <div className="flex flex-col gap-6 pt-4 border-t border-white/5">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="messageDelay" className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <ChevronRight className="w-3 h-3 text-primary" />
                      Atraso de Resposta
                    </Label>
                    <Badge variant="secondary" className="font-mono text-primary bg-primary/5">{messageDelay}s</Badge>
                  </div>
                  <div className="px-1">
                    <input
                      type="range"
                      id="messageDelay"
                      min="0"
                      max="30"
                      step="1"
                      value={messageDelay}
                      onChange={(e) => setMessageDelay(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-primary hover:accent-primary/80 transition-all"
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground/60 italic pl-1">
                    Simula o tempo de digitação humana para maior naturalidade.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coluna Direita - Sidebar de Configurações */}
        <div className="lg:col-span-4 space-y-8">

          {/* Identidade / Stats */}
          <Card className="glass border-border/40 shadow-lg group overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
              <Bot className="w-12 h-12 rotate-12" />
            </div>
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">Identidade do Agente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[10px] font-bold text-zinc-500 uppercase ml-1">NOME DE EXIBIÇÃO</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11 bg-zinc-900/50 border-white/5 rounded-xl focus:border-primary/30"
                />
              </div>
              <div className="pt-2">
                <div className="flex flex-col gap-1 p-3 rounded-xl bg-zinc-950/40 border border-white/5">
                  <span className="text-[9px] uppercase font-bold text-zinc-600 tracking-tighter">ID Único do Sistema</span>
                  <code className="text-[11px] font-mono text-primary/70 break-all">{agent.id}</code>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Conexão WhatsApp */}
          <Card className="glass border-border/40 shadow-lg">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-green-500" />
                  WhatsApp
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <WhatsAppConnect agentId={agent.id} />
            </CardContent>
          </Card>

          {/* Notificações WhatsApp */}
          <Card className="glass border-border/40 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">Notificações</CardTitle>
              <CardDescription className="text-[11px]">Personalize os alertas de novos leads</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="customMessage" className="text-[10px] font-bold text-zinc-500 uppercase ml-1">Template de Mensagem</Label>
                <div className="rounded-xl border border-white/5 bg-zinc-950/30 overflow-hidden">
                  <PromptEditor
                    value={customMessage}
                    onChange={setCustomMessage}
                    placeholder="Sua mensagem de notificação..."
                    className="min-h-[130px] p-4 text-[13px]"
                    mode="variables-only"
                    variables={[
                      { label: "product", value: "{{product}}", description: "Produto" },
                      { label: "price", value: "{{price}}", description: "Valor" },
                      { label: "phone", value: "{{phone}}", description: "Cliente" },
                      { label: "location", value: "{{location}}", description: "Local" },
                    ]}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-bold text-zinc-500 uppercase ml-1">Simulação de Notificação</Label>
                <div className="bg-[#e5ddd5] dark:bg-[#0b141a]/60 p-4 rounded-xl relative border border-white/5 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat bg-[length:200px]">
                  <div className="flex flex-col gap-1 max-w-full">
                    <div className="bg-white dark:bg-[#1f2c33] p-3 rounded-lg rounded-tl-none shadow-sm relative ml-1 border border-black/5 dark:border-white/5">
                      <div className="absolute top-0 left-[-6px] w-0 h-0 border-t-[8px] border-t-white dark:border-t-[#1f2c33] border-l-[8px] border-l-transparent" />
                      <div className="text-[12px] whitespace-pre-wrap leading-relaxed text-zinc-800 dark:text-zinc-100">
                        {customMessage
                          .replace(/{{produto}}|{{product}}/g, product || "Exemplo")
                          .replace(/{{quantidade}}|{{quantity}}/g, "1")
                          .replace(/{{valor}}|{{price}}|{{amount}}/g, amount || "0 MT")
                          .replace(/{{numero}}|{{phone}}|{{number}}/g, "+258 84 ...")
                          .replace(/{{localizacao}}|{{location}}/g, "Moçambique")
                          .replace(/{{date}}/g, mounted ? new Date().toLocaleDateString("pt-PT", { day: 'numeric', month: 'short' }) : "Hoje")}
                      </div>
                      <div className="flex justify-end mt-1 gap-1 items-center opacity-60">
                        <span className="text-[9px] uppercase">{mounted ? new Date().getHours() + ":" + new Date().getMinutes() : "--:--"}</span>
                        <svg width="12" height="12" viewBox="0 0 16 11" fill="none" className="text-blue-400"><path d="M4.5 9L1.5 6L0.5 7L4.5 11L13.5 2L12.5 1L4.5 9Z" fill="currentColor" /><path d="M15.5 2L6.5 11L6 10.5L14.5 2L15.5 2Z" fill="currentColor" /></svg>
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
        </div>
      </div>
    </div>
  )
}

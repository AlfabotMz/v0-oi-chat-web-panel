"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { ChevronRight, Bot, Sparkles, Zap, Check, AlertCircle, Smartphone, Info, Shield, Laugh, MoveRight, Save, Wand2, Settings2, Loader2, RefreshCw, FolderOpen, CheckCircle2 } from "lucide-react"
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
    setStatus(newStatus)

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
          anexos: attachments,
          contact_owner: contactOwner || null,
          contact_delivery: contactDelivery || null,
          custom_message: customMessage,
          message_delay: messageDelay,
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
    <div className="flex-1 space-y-6 md:space-y-8 p-4 md:p-8 pt-4 md:pt-6 max-w-7xl mx-auto pb-32">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <BackButton href="/dashboard" />
          <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 overflow-hidden">
            <h2 className="text-xl md:text-3xl font-bold tracking-tight text-foreground truncate max-w-[220px] md:max-w-none leading-none">
              {name || "Configurar Agente"}
            </h2>
            <p className="text-[10px] md:text-sm text-muted-foreground font-mono opacity-60 truncate">ID: {agent.id}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Row 1: Intelligence (Full Width Top) */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="glass border-0">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <CardTitle>Personalidade e Comportamento</CardTitle>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2 font-bold">
                      <Wand2 className="w-4 h-4" />
                      Gerador Automático
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px] w-[95vw] rounded-3xl p-4 md:p-6 overflow-hidden">
                    <DialogHeader>
                      <div className="flex items-center gap-2 md:gap-3 mb-2">
                        <div className="p-1.5 md:p-2 rounded-xl bg-primary/10 shrink-0">
                          <Wand2 className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <DialogTitle className="text-lg md:text-xl truncate">Engenharia de Prompt</DialogTitle>
                          <DialogDescription className="text-[10px] md:text-xs truncate">
                            IA inteligente com apenas alguns cliques.
                          </DialogDescription>
                        </div>
                      </div>
                    </DialogHeader>

                    <Tabs value={promptType} onValueChange={(v: string) => setPromptType(v as PromptType)} className="mt-2 md:mt-4 overflow-hidden">
                      <TabsList className="flex w-full h-9 md:h-10 bg-secondary/50 p-1 rounded-xl">
                        <TabsTrigger value="dropshipper" className="flex-1 text-[10px] md:text-xs min-w-0">Vendas</TabsTrigger>
                        <TabsTrigger value="support" className="flex-1 text-[10px] md:text-xs min-w-0">Suporte</TabsTrigger>
                        <TabsTrigger value="personalizado" className="flex-1 text-[10px] md:text-xs min-w-0 truncate">Expert</TabsTrigger>
                      </TabsList>

                      <div className="mt-6 space-y-4">
                        {promptType !== "personalizado" ? (
                          <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                              <div className="space-y-1.5 md:space-y-2">
                                <Label className="text-xs font-bold uppercase text-muted-foreground tracking-tight">Produto Principal</Label>
                                <Input value={product} onChange={(e) => setProduct(e.target.value)} placeholder="Ex: iPhone 15" className="h-9 md:h-10 text-xs md:text-sm bg-background/50" />
                              </div>
                              <div className="space-y-1.5 md:space-y-2">
                                <Label className="text-xs font-bold uppercase text-muted-foreground tracking-tight">Preço/Oferta</Label>
                                <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Ex: 99.000 MT" className="h-9 md:h-10 text-xs md:text-sm bg-background/50" />
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                              <div className="space-y-1.5 md:space-y-2">
                                <Label className="text-xs font-bold uppercase text-muted-foreground tracking-tight">Público Alvo</Label>
                                <Select value={audience} onValueChange={setAudience}>
                                  <SelectTrigger className="h-9 md:h-10 text-xs bg-background/50"><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Ambos">Ambos</SelectItem>
                                    <SelectItem value="Feminino">Feminino</SelectItem>
                                    <SelectItem value="Masculino">Masculino</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-1.5 md:space-y-2">
                                <Label className="text-xs font-bold uppercase text-muted-foreground tracking-tight">Tom de Voz</Label>
                                <Select value={tone} onValueChange={setTone}>
                                  <SelectTrigger className="h-9 md:h-10 text-xs bg-background/50"><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Direto">Direto</SelectItem>
                                    <SelectItem value="Amigável">Amigável</SelectItem>
                                    <SelectItem value="Profissional">Profissional</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <div className="space-y-1.5 md:space-y-2">
                              <Label className="text-xs font-bold uppercase text-muted-foreground tracking-tight pl-1">Diferenciais (Contexto)</Label>
                              <Textarea
                                value={productDescription}
                                onChange={(e) => setProductDescription(e.target.value)}
                                placeholder="Descreva os pontos fortes do seu atendimento..."
                                className="text-xs bg-background/50 min-h-[80px]"
                              />
                            </div>
                          </>
                        ) : (
                          <div className="py-8 text-center text-muted-foreground border-2 border-dashed rounded-lg bg-secondary/20 font-medium">
                            No modo Expert as instruções são editadas diretamente no campo principal.
                          </div>
                        )}
                      </div>
                    </Tabs>

                    <DialogFooter className="mt-6 flex flex-col-reverse sm:flex-row gap-2">
                      <Button variant="ghost" className="w-full sm:w-auto h-9 text-xs" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                      {promptType !== 'personalizado' && (
                        <Button className="w-full sm:w-auto h-9 text-xs font-bold" onClick={handleGeneratePrompt}>Gerar e Salvar</Button>
                      )}
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <CardDescription>Defina como seu agente deve interagir com os clientes no WhatsApp.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label className="text-[10px] font-bold text-primary uppercase tracking-wider">Instruções do Sistema (Prompt)</Label>
                <div className="border rounded-xl overflow-hidden bg-background/50 border-border/50">
                  <PromptEditor
                    value={prompt}
                    onChange={setPrompt}
                    placeholder="Defina as regras de negócio aqui..."
                    className="min-h-[500px] border-0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 pt-4 border-t border-border/50">
                <div className="space-y-1.5 md:space-y-2">
                  <Label htmlFor="name" className="text-[10px] md:text-xs font-bold uppercase text-muted-foreground">Nome Administrativo</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="bg-background/50 h-9 md:h-10 text-xs md:text-sm" />
                </div>
                <div className="space-y-1.5 md:space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] md:text-xs font-bold uppercase text-muted-foreground">Delay de Resposta</Label>
                    <Badge variant="secondary" className="font-mono text-[10px] md:text-xs h-5">{messageDelay}s</Badge>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    value={messageDelay}
                    onChange={(e) => setMessageDelay(parseInt(e.target.value))}
                    className="w-full accent-primary h-1.5 mt-1 md:mt-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Row 2: Knowledge Base (Full Width Middle) */}
          <Card className="glass border-0">
            <CardHeader className="p-4 md:p-6 pb-2 md:pb-4">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                <CardTitle className="text-base md:text-lg">Conhecimento</CardTitle>
              </div>
              <CardDescription className="text-xs">Arquivos e manuais de treinamento para o seu agente.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
              <AttachmentsManager
                attachments={attachments}
                onAttachmentsChange={setAttachments}
                onSave={handleSave}
                isSaving={isLoading}
              />
            </CardContent>
          </Card>
        </div>

        {/* Row 3: Bottom Cards (Side by Side) */}
        <div className="lg:col-span-1">
          <WhatsAppConnect agentId={agent.id} />
        </div>

        <div className="lg:col-span-1">
          <Card className="glass border-0 h-full">
            <CardHeader className="p-4 md:p-6 pb-2 md:pb-4">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                <CardTitle className="text-base md:text-lg">Prévia de Notificação</CardTitle>
              </div>
              <CardDescription className="text-[10px] md:text-xs">Visualize como você receberá os alertas.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6 space-y-6">
              <div className="space-y-2">
                <Label className="text-[9px] md:text-[10px] font-bold uppercase text-muted-foreground tracking-wider pl-1">Personalizar Mensagem</Label>
                <PromptEditor
                  value={customMessage}
                  onChange={setCustomMessage}
                  mode="variables-only"
                  className="min-h-[80px] md:min-h-[100px]"
                  variables={[
                    { label: "product", value: "{{product}}", description: "Produto" }
                  ]}
                />
              </div>

              {/* WhatsApp UI Mockup */}
              <div className="bg-[#e5ddd5] dark:bg-[#0b141a] p-4 md:p-6 rounded-2xl border border-border/30 relative overflow-hidden min-h-[140px] shadow-inner">
                <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat bg-[length:120px]" />

                <div className="relative flex flex-col items-start gap-1">
                  <div className="bg-white dark:bg-[#1f2c33] p-3 md:p-4 rounded-2xl rounded-tl-none shadow-md max-w-[90%] md:max-w-[85%] border border-black/5 dark:border-white/5 animate-in fade-in slide-in-from-left-2 duration-500 relative z-10">
                    <p className="text-[11px] md:text-[13px] leading-[1.6] text-foreground font-sans font-medium whitespace-pre-wrap break-words">
                      {customMessage
                        .replace(/{{product}}/g, product || "iPhone 15 Pro Max")
                        .replace(/{{price}}/g, amount || "95.000 MT")
                        .replace(/{{quantity}}/g, "1")
                        .replace(/{{phone}}/g, "+258 84 123 4567")
                        .replace(/{{location}}/g, "Maputo, MZ")
                        .replace(/{{date}}/g, new Date().toLocaleDateString('pt-MZ'))
                      }
                    </p>
                    <div className="flex items-center justify-end gap-1 mt-1.5 opacity-40">
                      <span className="text-[9px] md:text-[10px] font-medium">
                        {new Date().toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <CheckCircle2 className="w-2.5 h-2.5" />
                    </div>
                  </div>
                  {/* Bubble Tail - Better implementation */}
                  <div className="absolute -left-1 top-0 w-3 h-3 bg-white dark:bg-[#1f2c33] -rotate-45 -translate-x-1/2 border-l border-t border-black/5 dark:border-white/5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Barra de Ações Fixa (Botão de Salvar) */}
      <div className="fixed bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-4">
        <div className="glass border border-primary/20 rounded-2xl p-3 md:p-4 shadow-2xl flex items-center justify-between gap-4 backdrop-blur-xl bg-background/80">
          <div className="flex items-center gap-2 md:gap-3 pl-1 md:pl-2">
            <div className={cn("w-2 h-2 md:w-2.5 md:h-2.5 rounded-full", isActive ? "bg-green-500 animate-pulse" : "bg-muted")} />
            <div className="flex flex-col">
              <span className="hidden md:block text-[10px] font-bold uppercase text-muted-foreground tracking-tighter">Status</span>
              <span className={cn("text-[10px] md:text-xs font-bold whitespace-nowrap", isActive ? "text-green-500" : "text-muted-foreground")}>
                {isActive ? "ON" : "OFF"}
              </span>
            </div>
            <Switch
              checked={isActive}
              onCheckedChange={handleToggleStatus}
              className="scale-75 md:scale-90"
            />
          </div>

          <Button
            onClick={handleSave}
            disabled={isLoading || !hasChanges}
            className={cn(
              "shadow-lg font-bold h-10 md:h-12 px-6 md:px-10 rounded-xl transition-all duration-300 min-w-[120px] md:min-w-[180px] text-xs md:text-sm",
              hasChanges ? "bg-primary shadow-primary/30 animate-in fade-in slide-in-from-bottom-2" : "opacity-60 grayscale-[0.5]"
            )}
          >
            {isLoading ? <Loader2 className="w-4 h-4 md:w-5 md:h-5 mr-2 animate-spin" /> : <Save className="w-4 h-4 md:w-5 md:h-5 mr-2" />}
            {hasChanges ? (
              <span className="flex items-center">
                Salvar <span className="hidden md:inline ml-1">Alterações</span>
              </span>
            ) : "Salvo"}
          </Button>
        </div>
      </div>
    </div>
  )
}

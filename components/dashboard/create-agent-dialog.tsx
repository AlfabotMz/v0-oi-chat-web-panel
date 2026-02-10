"use client"

import type React from "react"
import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ChevronRight, ChevronLeft, Bot, Sparkles, Zap, Check, QrCode, Loader2, AlertCircle, Smartphone } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface CreateAgentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type ConnectionStatus = "disconnected" | "pending" | "connected" | "checking"

export function CreateAgentDialog({ open, onOpenChange }: CreateAgentDialogProps) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [nome, setNome] = useState("")
  const [product, setProduct] = useState("")
  const [amount, setAmount] = useState("")
  const [prompt, setPrompt] = useState("")
  const [createdAgentId, setCreatedAgentId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // WhatsApp Connection State
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [connectStatus, setConnectStatus] = useState<ConnectionStatus>("disconnected")
  const [isCheckingStatus, setIsCheckingStatus] = useState(false)
  const [connectError, setConnectError] = useState<string | null>(null)

  // Polling Refs
  const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const pollingStartTimeRef = useRef<number | null>(null)
  const isMountedRef = useRef(true)

  // Constantes
  const POLLING_INTERVAL = 15000 // 15 segundos
  const MAX_POLLING_TIME = 5 * 60 * 1000
  const INITIAL_DELAY = 10000

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
      if (pollingTimeoutRef.current) clearTimeout(pollingTimeoutRef.current)
    }
  }, [])

  const stopPolling = useCallback(() => {
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current)
      pollingTimeoutRef.current = null
    }
    pollingStartTimeRef.current = null
  }, [])

  const checkStatus = useCallback(async (agentId: string, autoPoll = false) => {
    if (!isMountedRef.current) return

    setIsCheckingStatus(true)
    try {
      const response = await fetch(`/api/agents/${agentId}/status`, { method: "GET" })
      const data = await response.json()

      if (!isMountedRef.current) return

      if (data.success && data.connected) {
        setConnectStatus("connected")
        setQrCode(null)
        stopPolling()
      } else if (autoPoll) {
        const elapsedTime = Date.now() - (pollingStartTimeRef.current || 0)
        if (elapsedTime < MAX_POLLING_TIME) {
          pollingTimeoutRef.current = setTimeout(() => checkStatus(agentId, true), POLLING_INTERVAL)
        } else {
          stopPolling()
          setConnectStatus("disconnected")
        }
      }
    } catch (err) {
      console.error("Erro ao verificar status:", err)
    } finally {
      if (isMountedRef.current) setIsCheckingStatus(false)
    }
  }, [stopPolling])

  const startPolling = useCallback((agentId: string) => {
    stopPolling()
    pollingStartTimeRef.current = Date.now()
    pollingTimeoutRef.current = setTimeout(() => checkStatus(agentId, true), INITIAL_DELAY)
  }, [checkStatus, stopPolling])

  const connectWhatsApp = async (agentId: string) => {
    setIsLoading(true)
    setConnectError(null)
    setQrCode(null)
    setConnectStatus("pending")
    stopPolling()

    try {
      const response = await fetch("/api/agents/connect-whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agent_id: agentId }),
      })

      const data = await response.json()
      if (!response.ok || !data.success) throw new Error(data.error || "Erro ao conectar WhatsApp")

      if (data.qr) {
        setQrCode(data.qr)
        setConnectStatus("pending")
        startPolling(agentId)
      } else {
        throw new Error("QR code não disponível")
      }
    } catch (err: any) {
      setConnectError(err.message)
      setConnectStatus("disconnected")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = async () => {
    setError(null)
    setIsLoading(true)

    try {
      const response = await fetch("/api/agents/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, prompt, product, amount }),
      })

      const data = await response.json()
      if (!response.ok || !data.success) throw new Error(data.error || "Erro ao criar agente")

      setCreatedAgentId(data.agent.id)
      setStep(4)
      connectWhatsApp(data.agent.id)
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao criar agente")
    } finally {
      setIsLoading(false)
    }
  }

  const nextStep = () => {
    if (step === 1 && !nome) return
    if (step === 2 && !prompt) return
    if (step < 3) setStep(step + 1)
    else handleCreate()
  }

  const prevStep = () => {
    if (step > 1 && step < 4) setStep(step - 1)
  }

  return (
    <Dialog open={open} onOpenChange={(val) => {
      onOpenChange(val)
      if (!val) {
        setTimeout(() => {
          setStep(1)
          setNome("")
          setPrompt("")
          setProduct("")
          setAmount("")
          setCreatedAgentId(null)
          setQrCode(null)
          setConnectStatus("disconnected")
          stopPolling()
        }, 300)
      }
    }}>
      <DialogContent className="max-w-md w-[95vw] max-h-fit bg-zinc-950/60 border-white/10 text-white p-0 backdrop-blur-3xl shadow-[0_0_80px_rgba(0,0,0,0.8)] rounded-[2.5rem] overflow-hidden">
        <div className="relative h-1.5 w-full bg-white/5 sticky top-0 z-[100]">
          <div
            className="absolute h-full bg-primary shadow-[0_0_20px_rgba(168,85,247,0.8)] transition-all duration-1000 ease-in-out"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        <div className="p-6 sm:p-10 pt-10 sm:pt-12">
          <DialogHeader className="mb-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3.5 rounded-[1.2rem] bg-white/5 border border-white/10 backdrop-blur-2xl text-primary shadow-2xl">
                {step === 1 && <Bot className="w-7 h-7" />}
                {step === 2 && <Sparkles className="w-7 h-7" />}
                {step === 3 && <Zap className="w-7 h-7" />}
                {step === 4 && <Smartphone className="w-7 h-7" />}
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] uppercase tracking-[0.3em] font-black text-primary/70">Fluxo de Criação</span>
                <DialogTitle className="text-2xl sm:text-3xl font-black tracking-tighter">
                  {step === 1 && "Identidade"}
                  {step === 2 && "Personalidade"}
                  {step === 3 && "Revisão"}
                  {step === 4 && "WhatsApp"}
                </DialogTitle>
              </div>
            </div>
          </DialogHeader>

          <div className="min-h-[320px] flex flex-col justify-center">
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-10 duration-700" data-tour="agent-dialog-step-1">
                <div className="space-y-2.5">
                  <Label htmlFor="nome" className="text-[11px] font-black text-zinc-500 uppercase tracking-widest ml-1">Nome do Agente</Label>
                  <Input
                    id="nome"
                    placeholder="Ex: Consultor OiChat"
                    className="bg-white/5 border-white/10 text-white focus:ring-primary focus:border-primary/50 h-14 sm:h-16 rounded-2xl text-lg sm:text-xl font-medium backdrop-blur-md transition-all placeholder:text-zinc-700 px-6 shadow-inner"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2.5">
                    <Label htmlFor="product" className="text-[11px] font-black text-zinc-500 uppercase tracking-widest ml-1">Produto</Label>
                    <Input
                      id="product"
                      placeholder="Ex: Vendas"
                      className="bg-white/5 border-white/10 text-white focus:ring-primary h-12 sm:h-14 rounded-2xl backdrop-blur-md placeholder:text-zinc-700 px-4"
                      value={product}
                      onChange={(e) => setProduct(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2.5">
                    <Label htmlFor="amount" className="text-[11px] font-black text-zinc-500 uppercase tracking-widest ml-1">Preço</Label>
                    <Input
                      id="amount"
                      placeholder="Ex: 990 MT"
                      className="bg-white/5 border-white/10 text-white focus:ring-primary h-12 sm:h-14 rounded-2xl backdrop-blur-md placeholder:text-zinc-700 px-4"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-10 duration-700" data-tour="agent-dialog-step-2">
                <div className="space-y-3">
                  <Label htmlFor="prompt" className="text-[11px] font-black text-zinc-500 uppercase tracking-widest ml-1">Prompt de Instrução</Label>
                  <Textarea
                    id="prompt"
                    placeholder="Descreva como o agente deve agir..."
                    className="bg-white/5 border-white/10 text-white focus:ring-primary min-h-[160px] sm:min-h-[220px] rounded-3xl backdrop-blur-md text-base leading-relaxed p-6 placeholder:text-zinc-700 shadow-inner"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-10 duration-700" data-tour="agent-dialog-step-3">
                <div className="rounded-[2.5rem] border border-white/10 bg-white/5 p-8 sm:p-10 space-y-8 backdrop-blur-2xl shadow-inner relative overflow-hidden group">
                  <div className="absolute -top-6 -right-6 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Bot className="w-40 h-40" />
                  </div>

                  <div className="space-y-6 relative z-10">
                    <div className="space-y-1 text-center sm:text-left">
                      <span className="text-[10px] uppercase tracking-[0.3em] text-primary font-black">Identidade Confirmada</span>
                      <h3 className="text-3xl font-black bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent break-words">{nome}</h3>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
                        <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Produto</span>
                        <span className="text-sm font-bold text-zinc-200">{product || "Geral"}</span>
                      </div>
                      <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
                        <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Preço</span>
                        <span className="text-sm font-bold text-primary">{amount || "N/A"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/5 relative z-10 flex items-center justify-center sm:justify-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                      <Check className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-bold text-zinc-200">Pronto para Lançamento</span>
                      <span className="text-[10px] text-zinc-500">IA assumirá este perfil imediatamente</span>
                    </div>
                  </div>
                </div>
                {error && <p className="text-sm text-red-400 bg-red-400/10 p-4 rounded-2xl border border-red-400/20">{error}</p>}
              </div>
            )}

            {step === 4 && (
              <div className="space-y-8 animate-in fade-in zoom-in-95 duration-700" data-tour="agent-dialog-step-4">
                {connectStatus === "connected" ? (
                  <div className="flex flex-col items-center justify-center py-10 space-y-6">
                    <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/50 shadow-[0_0_40px_rgba(168,85,247,0.3)]">
                      <Check className="w-12 h-12 text-primary" />
                    </div>
                    <div className="text-center space-y-2">
                      <h3 className="text-2xl font-black">Conectado!</h3>
                      <p className="text-zinc-400 text-sm">Seu agente já está online e operando no WhatsApp.</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-8">
                    {qrCode ? (
                      <div className="flex flex-col items-center gap-6">
                        <div className="relative p-6 rounded-[2.5rem] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.5)] scale-105 transition-transform">
                          <Image src={qrCode} alt="QR Code" width={240} height={240} className="rounded-2xl" />
                          <div className="absolute -top-3 -right-3 bg-primary text-white p-2.5 rounded-2xl shadow-xl animate-bounce">
                            <Smartphone className="w-5 h-5" />
                          </div>
                        </div>
                        <div className="text-center space-y-3">
                          <p className="text-sm font-bold text-zinc-300">Escaneie com seu WhatsApp</p>
                          <div className="flex justify-center gap-1.5 opacity-50">
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse delay-150" />
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse delay-300" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="h-[280px] w-full flex flex-col items-center justify-center space-y-6 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-3xl shadow-inner">
                        {isLoading ? (
                          <>
                            <div className="relative">
                              <Loader2 className="w-16 h-16 text-primary animate-spin" />
                              <QrCode className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-zinc-700" />
                            </div>
                            <p className="text-xs uppercase tracking-[0.2em] font-black text-zinc-500">Gerando QR em tempo real...</p>
                          </>
                        ) : (
                          <>
                            <QrCode className="w-20 h-20 text-zinc-800" />
                            <Button onClick={() => createdAgentId && connectWhatsApp(createdAgentId)} variant="outline" className="rounded-2xl border-white/10 h-14 px-8 hover:bg-white/5">
                              Gerar QR Code de Conexão
                            </Button>
                          </>
                        )}
                      </div>
                    )}
                    {connectError && (
                      <div className="p-4 bg-red-400/10 border border-red-400/20 rounded-2xl flex items-center gap-3 text-red-400 text-xs font-bold">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <span>{connectError}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-4 mt-12">
            {step > 1 && step < 4 && (
              <Button
                type="button"
                variant="ghost"
                onClick={prevStep}
                disabled={isLoading}
                className="flex-1 rounded-2xl h-14 sm:h-16 border border-white/5 hover:bg-white/5 text-zinc-500 font-black uppercase tracking-widest text-[10px]"
              >
                Voltar
              </Button>
            )}
            <Button
              onClick={step === 4 ? () => onOpenChange(false) : nextStep}
              disabled={isLoading || (step === 1 && !nome) || (step === 2 && !prompt)}
              className={cn(
                "flex-[3] h-14 sm:h-16 rounded-[1.2rem] sm:rounded-[1.5rem] text-white font-black tracking-[0.1em] text-base sm:text-lg transition-all duration-500 shadow-[0_15px_35px_rgba(168,85,247,0.4)] hover:shadow-[0_20px_45px_rgba(168,85,247,0.6)]",
                step === 3 ? "bg-green-600 hover:bg-green-700 shadow-green-500/20" : "bg-primary hover:bg-primary/90",
                step === 4 && connectStatus !== "connected" && "bg-zinc-800 hover:bg-zinc-700 shadow-none border border-white/5"
              )}
            >
              {isLoading ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="text-sm">Aguarde...</span>
                </div>
              ) : step === 3 ? (
                <>Criar e Conectar <Check className="w-6 h-6 ml-2" /></>
              ) : step === 4 ? (
                connectStatus === "connected" ? "Finalizar Setup" : "Pular por agora"
              ) : (
                <>Continuar <ChevronRight className="w-6 h-6 ml-2" /></>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

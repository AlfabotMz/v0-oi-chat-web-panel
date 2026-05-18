"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, AlertCircle, CheckCircle2, RefreshCw, Smartphone } from "lucide-react"
import Image from "next/image"
import Script from "next/script"
import { cn } from "@/lib/utils"

declare global {
  interface Window {
    FB: any;
  }
}

interface WhatsAppConnectProps {
  agentId: string
}

type ConnectionStatus = "disconnected" | "pending" | "connected" | "checking"

export function WhatsAppConnect({ agentId }: WhatsAppConnectProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [status, setStatus] = useState<ConnectionStatus>("disconnected")
  const [isCheckingStatus, setIsCheckingStatus] = useState(false)
  const [isFbLoading, setIsFbLoading] = useState(false)

  // Refs para controle do polling
  const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const pollingStartTimeRef = useRef<number | null>(null)
  const isMountedRef = useRef(true)

  // Constantes
  const POLLING_INTERVAL = 30000 // 30 segundos
  const MAX_POLLING_TIME = 5 * 60 * 1000 // 5 minutos
  const INITIAL_DELAY = 45000 // 45 segundos

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current)
      }
    }
  }, [])

  const stopPolling = useCallback(() => {
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current)
      pollingTimeoutRef.current = null
    }
    pollingStartTimeRef.current = null
  }, [])

  const checkStatus = useCallback(async (autoPoll = false) => {
    if (!isMountedRef.current) return

    setIsCheckingStatus(true)
    try {
      const response = await fetch(`/api/agents/${agentId}/status`, {
        method: "GET",
      })

      const data = await response.json()

      if (!isMountedRef.current) return

      if (data.success && data.connected) {
        setStatus("connected")
        setMessage("WhatsApp conectado com sucesso!")
        stopPolling()
      } else {
        // Se não conectado e for autoPoll, agendar próxima verificação
        if (autoPoll) {
          const elapsedTime = Date.now() - (pollingStartTimeRef.current || 0)

          if (elapsedTime < MAX_POLLING_TIME) {
            pollingTimeoutRef.current = setTimeout(() => {
              checkStatus(true)
            }, POLLING_INTERVAL)
          } else {
            stopPolling()
            setMessage("Tempo limite de verificação excedido. Por favor, tente novamente.")
            setStatus("disconnected")
          }
        } else {
          setStatus("disconnected")
        }
      }
    } catch (err: any) {
      console.error("Erro ao verificar status:", err)
      if (isMountedRef.current) {
        // Em caso de erro, paramos o polling automático para evitar flood
        if (autoPoll) {
          stopPolling()
          setError("Erro ao verificar status automaticamente. Tente manualmente.")
        }
        setStatus("disconnected")
      }
    } finally {
      if (isMountedRef.current) {
        setIsCheckingStatus(false)
      }
    }
  }, [agentId, stopPolling])

  const startPolling = useCallback(() => {
    stopPolling()
    pollingStartTimeRef.current = Date.now()

    // Primeira verificação após delay inicial
    pollingTimeoutRef.current = setTimeout(() => {
      checkStatus(true)
    }, INITIAL_DELAY)
  }, [checkStatus, stopPolling])

  const connectWhatsApp = async () => {
    // Deprecated n8n connection
    setError("A conexão via QR Code foi desativada. Use o Facebook Login.")
    setStatus("disconnected")
  }

  const handleTestConnection = async () => {
    await checkStatus(false)
  }

  const handleFacebookLogin = () => {
    if (typeof window === "undefined" || !window.FB) {
      setError("Facebook SDK não carregado. Tente novamente em alguns segundos.")
      return
    }

    setIsFbLoading(true)
    setError(null)

    const configId = process.env.NEXT_PUBLIC_FACEBOOK_CONFIG_ID
    if (!configId) {
      setIsFbLoading(false)
      setError("A variável de ambiente NEXT_PUBLIC_FACEBOOK_CONFIG_ID não está configurada.")
      return
    }

    window.FB.login((response: any) => {
      if (response.authResponse && response.authResponse.code) {
        const code = response.authResponse.code;

        fetch('/api/agents/waba-callback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ agent_id: agentId, code: code })
        })
          .then(res => res.json())
          .then(data => {
            setIsFbLoading(false)
            if (data.success) {
              setMessage("Conta Oficial WABA conectada com sucesso!")
              setStatus("connected")
            } else {
              setError(data.error || "Erro ao conectar conta WABA no servidor")
              setStatus("disconnected")
            }
          })
          .catch(err => {
            setIsFbLoading(false)
            setError("Erro na requisição. Verifique o console ou tente novamente.")
          })
      } else {
        setIsFbLoading(false)
        setError('Login com Facebook incompleto ou cancelado pelo usuário.')
      }
    }, {
      config_id: configId,
      response_type: 'code',
      override_default_response_type: true,
      extras: {
        featureType: 'whatsapp_business_app_onboarding',
        sessionInfoVersion: '3'
      }
    });
  }
  return (
    <>
      <Script
        strategy="lazyOnload"
        src="https://connect.facebook.net/pt_BR/sdk.js"
        onLoad={() => {
          if (window.FB) {
            window.FB.init({
              appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || '',
              cookie: true,
              xfbml: true,
              version: 'v19.0'
            });
          }
        }}
      />
      <Card className="glass border-border/40 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                <Smartphone className="w-4 h-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">Status da Conexão</CardTitle>
                <CardDescription className="text-[10px]">Gerencie a integração com o Meta Cloud API</CardDescription>
              </div>
            </div>
            {status === "connected" && (
              <Badge className="bg-green-500/10 text-green-500 border-green-500/20 px-3 py-1 font-bold text-[10px] uppercase tracking-wider">
                <CheckCircle2 className="w-3 h-3 mr-1.5 fill-current" />
                Online
              </Badge>
            )}
            {status === "pending" && (
              <Badge variant="secondary" className="bg-zinc-800 text-zinc-400 border-white/5 px-3 py-1 font-bold text-[10px] uppercase tracking-wider animate-pulse">
                <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                Sincronizando
              </Badge>
            )}
            {status === "disconnected" && (
              <Badge variant="outline" className="border-red-500/20 text-red-500 bg-red-500/5 px-3 py-1 font-bold text-[10px] uppercase tracking-wider">
                Desconectado
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {status === "connected" ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle2 className="w-5 h-5" />
                <p className="text-sm font-medium">WhatsApp está conectado</p>
              </div>
              <p className="text-sm text-muted-foreground">
                Seu número do WhatsApp está conectado e pronto para receber mensagens.
              </p>
              <Button onClick={handleTestConnection} variant="outline" className="w-full" disabled={isCheckingStatus}>
                {isCheckingStatus ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Testar Conexão
                  </>
                )}
              </Button>
            </div>
          ) : (
            <>
              {!error && (
                <div className="flex flex-col gap-3">
                  <Button
                    onClick={handleFacebookLogin}
                    disabled={isLoading || isFbLoading}
                    variant="outline"
                    className="w-full bg-[#1877F2] text-white hover:bg-[#1877F2]/90 border-transparent hover:text-white"
                  >
                    {isFbLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path></svg>
                    )}
                    Conectar com Facebook
                  </Button>
                </div>
              )}

              {error && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-red-500">
                    <AlertCircle className="w-4 h-4" />
                    <p className="text-sm font-medium">Erro</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{error}</p>
                  <Button onClick={handleTestConnection} variant="outline" className="w-full" disabled={isCheckingStatus}>
                    {isCheckingStatus ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Tentando...
                      </>
                    ) : (
                      "Tentar Novamente"
                    )}
                  </Button>
                </div>
              )}

              {status === "disconnected" && !error && (
                <Button onClick={handleTestConnection} variant="outline" className="w-full" disabled={isCheckingStatus}>
                  {isCheckingStatus ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verificando...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Testar Conexão
                    </>
                  )}
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </>
  )
}

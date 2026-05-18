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
      <Card className="border-border">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-secondary">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-base">Status da Conexão</CardTitle>
              <CardDescription className="text-xs">Gerencie a integração com o Meta Cloud API</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {status === "connected" ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
                <p className="text-sm font-medium">WhatsApp conectado</p>
              </div>
              <Button onClick={handleTestConnection} variant="outline" className="w-full" disabled={isCheckingStatus}>
                {isCheckingStatus ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Verificar status
                  </>
                )}
              </Button>
            </div>
          ) : (
            <>
              {!error && (
                <Button
                  onClick={handleFacebookLogin}
                  disabled={isLoading || isFbLoading}
                  className="w-full"
                >
                  {isFbLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    "Conectar com Facebook"
                  )}
                </Button>
              )}

              {error && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="w-4 h-4" />
                    <p className="text-sm font-medium">Erro na conexão</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{error}</p>
                  <Button onClick={handleTestConnection} variant="outline" className="w-full" disabled={isCheckingStatus}>
                    {isCheckingStatus ? "Verificando..." : "Tentar novamente"}
                  </Button>
                </div>
              )}

              {status === "disconnected" && !error && (
                <Button onClick={handleTestConnection} variant="outline" className="w-full" disabled={isCheckingStatus}>
                  {isCheckingStatus ? (
                    "Verificando..."
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

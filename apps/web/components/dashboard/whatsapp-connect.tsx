"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Smartphone, CheckCircle2, AlertCircle, Loader2, Link2, ExternalLink, RefreshCw, XCircle, Settings2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import Script from "next/script"

interface WhatsAppConnectProps {
  agentId: string
}

export function WhatsAppConnect({ agentId }: WhatsAppConnectProps) {
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isConnecting, setIsConnecting] = useState(false)

  const fetchStatus = async () => {
    try {
      const response = await fetch(`/api/agents/${agentId}/status`)
      const data = await response.json()
      if (data.success) {
        setStatus(data.status)
      }
    } catch (error) {
      console.error("Erro ao buscar status WABA:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 30000)
    return () => clearInterval(interval)
  }, [agentId])

  const handleConnect = async () => {
    setIsConnecting(true)
    try {
      const configId = process.env.NEXT_PUBLIC_FACEBOOK_CONFIG_ID
      const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID

      if (!configId || !appId) {
        toast.error("Configurações do Meta não encontradas")
        return
      }

      // @ts-ignore
      if (typeof window === 'undefined' || !window.FB) {
        toast.error("Carregando o sistema do Facebook... Tente novamente em alguns segundos.")
        setIsConnecting(false)
        return
      }

      // @ts-ignore
      window.FB.login((response: any) => {
        if (response.authResponse) {
          window.postMessage({ type: 'FB_LOGIN_SUCCESS', authResponse: response.authResponse }, '*')
          toast.success("Conectando ao WhatsApp...")
        } else {
          toast.error("Login cancelado ou não autorizado")
          setIsConnecting(false)
        }
      }, {
        config_id: configId,
        response_type: 'code',
        override_default_response_type: true,
        extras: {
          featureType: 'whatsapp_business_app_onboarding',
          sessionInfoVersion: '3',
          setup: {
            // prefill if needed
          }
        }
      })
    } catch (error) {
      console.error("Erro ao iniciar login FB:", error)
      toast.error("Falha ao iniciar conexão")
      setIsConnecting(false)
    }
  }

  if (loading) {
    return (
      <Card className="glass border-0">
        <CardContent className="p-8 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Sincronizando com Meta...</p>
        </CardContent>
      </Card>
    )
  }

  const isConnected = status?.waba_id && status?.phone_number_id

  return (
    <Card className="glass border-0 overflow-hidden">
      <CardHeader className="p-4 md:p-6 pb-2 md:pb-4">
        <div className="flex items-center justify-between gap-2 overflow-hidden">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 md:p-2 rounded-lg bg-primary/10 shrink-0">
              <Smartphone className="w-4 h-4 md:w-5 md:h-5 text-primary" />
            </div>
            <CardTitle className="text-base md:text-lg truncate">WhatsApp</CardTitle>
          </div>
          {isConnected ? (
            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 gap-1.5 px-2 text-[10px] md:text-xs shrink-0">
              <div className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-green-500 animate-pulse" />
              ON
            </Badge>
          ) : (
            <Badge variant="secondary" className="gap-1 md:gap-1.5 px-1.5 md:px-2 text-[10px] md:text-xs shrink-0 whitespace-nowrap">
              <AlertCircle className="w-2.5 h-2.5 md:w-3 md:h-3" />
              Off
            </Badge>
          )}
        </div>
        <CardDescription className="text-xs">
          {isConnected
            ? "Conectado e operacional."
            : "Conecte sua conta Meta."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isConnected ? (
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-1.5">
              <div className="flex items-center justify-between p-2.5 md:p-3 rounded-lg bg-background/50 border border-border/50">
                <span className="text-[9px] md:text-[10px] font-bold uppercase text-muted-foreground">Número</span>
                <span className="text-xs md:text-sm font-mono font-bold truncate ml-4">{status.display_phone_number || "---"}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 md:p-3 rounded-lg bg-background/50 border border-border/50">
                <span className="text-[9px] md:text-[10px] font-bold uppercase text-muted-foreground">API</span>
                <span className="text-[9px] md:text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/20 text-primary">Operacional</span>
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <Button variant="ghost" className="flex-1 gap-2 h-8 md:h-9 text-[10px] md:text-xs font-semibold" onClick={handleConnect}>
                <Settings2 className="w-3.5 h-3.5" />
                Configurar
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-2">
              <div className="flex items-center gap-2 text-primary">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-xs font-bold uppercase">Meta Cloud API</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Utilizamos a API oficial para garantir estabilidade máxima e conformidade com os termos do WhatsApp.
              </p>
            </div>
            <Button
              className="w-full py-6 font-bold shadow-lg shadow-primary/20 group relative overflow-hidden"
              onClick={handleConnect}
              disabled={isConnecting}
            >
              {isConnecting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Link2 className="w-5 h-5 mr-2 group-hover:rotate-45 transition-transform" />
                  Conectar ao Facebook
                </>
              )}
            </Button>
          </div>
        )}
        {/* Connection Tool / Test Button */}
        <div className="pt-4 border-t border-border/50">
          <Button variant="outline" className="w-full gap-2 text-xs font-bold" onClick={() => {
            setLoading(true)
            fetchStatus().then(() => toast.success("Sincronização concluída"))
          }}>
            <RefreshCw className={cn("w-3 h-3", loading && "animate-spin")} />
            Testar Conexão
          </Button>
        </div>
      </CardContent>
      <Script 
        src="https://connect.facebook.net/en_US/sdk.js" 
        strategy="lazyOnload" 
        onLoad={() => {
          if (window.FB) {
            window.FB.init({
              appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID!,
              cookie: true,
              xfbml: true,
              version: "v19.0"
            })
          }
        }} 
      />
    </Card>
  )
}

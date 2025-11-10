"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { QrCode, Loader2, AlertCircle, CheckCircle2, RefreshCw } from "lucide-react"
import Image from "next/image"

interface WhatsAppConnectProps {
  agentId: string
}

type ConnectionStatus = "disconnected" | "pending" | "connected" | "checking"

export function WhatsAppConnect({ agentId }: WhatsAppConnectProps) {
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [status, setStatus] = useState<ConnectionStatus>("disconnected")
  const [isCheckingStatus, setIsCheckingStatus] = useState(false)
  const [statusCheckInterval, setStatusCheckInterval] = useState<NodeJS.Timeout | null>(null)

  // Limpar intervalo ao desmontar ou quando status mudar para connected
  useEffect(() => {
    return () => {
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval)
        setStatusCheckInterval(null)
      }
    }
  }, [statusCheckInterval])

  // Limpar intervalo quando status mudar para connected
  useEffect(() => {
    if (status === "connected" && statusCheckInterval) {
      clearInterval(statusCheckInterval)
      setStatusCheckInterval(null)
    }
  }, [status, statusCheckInterval])

  const checkStatus = async () => {
    setIsCheckingStatus(true)
    try {
      const response = await fetch(`/api/agents/${agentId}/status`, {
        method: "GET",
      })

      const data = await response.json()

      if (data.success && data.connected) {
        setStatus("connected")
        setQrCode(null) // Remover QR code se conectado
        setMessage("WhatsApp conectado com sucesso!")
        // Limpar intervalo se conectado
        if (statusCheckInterval) {
          clearInterval(statusCheckInterval)
          setStatusCheckInterval(null)
        }
      } else {
        setStatus("disconnected")
      }
    } catch (err: any) {
      console.error("Erro ao verificar status:", err)
      setStatus("disconnected")
    } finally {
      setIsCheckingStatus(false)
    }
  }

  const connectWhatsApp = async () => {
    setIsLoading(true)
    setError(null)
    setMessage(null)
    setQrCode(null)
    setStatus("pending")

    try {
      const response = await fetch("/api/agents/connect-whatsapp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ agent_id: agentId }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Erro ao conectar WhatsApp")
      }

      if (data.qr) {
        setQrCode(data.qr)
        setMessage(data.message || "Escaneie o QR code para conectar seu número de WhatsApp.")
        setStatus("pending")
        
        // Após 45 segundos, verificar se está conectado
        setTimeout(() => {
          checkStatus()
          
          // Se ainda não conectado, verificar a cada 10 segundos
          const interval = setInterval(() => {
            checkStatus()
          }, 10000)
          
          setStatusCheckInterval(interval)
        }, 45000)
      } else {
        setError(data.error || "QR code não foi retornado pela API")
        setStatus("disconnected")
      }
    } catch (err: any) {
      console.error("Erro ao conectar WhatsApp:", err)
      if (err.message.includes("fetch")) {
        setError("Erro ao conectar com o servidor n8n. Verifique se a URL está configurada corretamente no arquivo .env")
      } else {
        setError(err.message || "Erro ao conectar WhatsApp. Verifique os logs do servidor.")
      }
      setStatus("disconnected")
    } finally {
      setIsLoading(false)
    }
  }

  const handleTestConnection = async () => {
    await checkStatus()
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Conexão WhatsApp</CardTitle>
            <CardDescription>Conecte seu número do WhatsApp para começar a receber mensagens</CardDescription>
          </div>
          {status === "connected" && (
            <Badge className="bg-green-500 hover:bg-green-600">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Conectado
            </Badge>
          )}
          {status === "pending" && (
            <Badge variant="secondary">
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              Aguardando
            </Badge>
          )}
          {status === "disconnected" && (
            <Badge variant="outline">
              Desconectado
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
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
            {!qrCode && !error && (
              <Button onClick={connectWhatsApp} disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Conectando...
                  </>
                ) : (
                  <>
                    <QrCode className="w-4 h-4 mr-2" />
                    Conectar WhatsApp
                  </>
                )}
              </Button>
            )}

            {qrCode && status === "pending" && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">{message}</p>
                <div className="flex justify-center">
                  <div className="border-2 border-border rounded-lg p-4 bg-white">
                    <Image src={qrCode} alt="QR Code WhatsApp" width={256} height={256} className="rounded" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  O sistema verificará automaticamente se você conectou após 45 segundos.
                </p>
                <Button onClick={connectWhatsApp} variant="outline" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <QrCode className="w-4 h-4 mr-2" />
                      Gerar Novo QR Code
                    </>
                  )}
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
                <Button onClick={connectWhatsApp} variant="outline" className="w-full" disabled={isLoading}>
                  {isLoading ? (
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

            {status === "disconnected" && !qrCode && !error && (
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
  )
}

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { QrCode, CheckCircle2, XCircle, Loader2 } from "lucide-react"
import Image from "next/image"

interface WhatsAppConnectProps {
  agentId: string
  currentStatus?: string
  onStatusChange?: (status: string) => void
}

export function WhatsAppConnect({ agentId, currentStatus, onStatusChange }: WhatsAppConnectProps) {
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [status, setStatus] = useState(currentStatus || "disconnected")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [polling, setPolling] = useState(false)

  const connectWhatsApp = async () => {
    setIsLoading(true)
    setError(null)
    setQrCode(null)

    try {
      const response = await fetch("/webhook/connect-whatsapp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ agent_id: agentId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao conectar WhatsApp")
      }

      if (data.success) {
        setQrCode(data.qr)
        setStatus("pending")
        onStatusChange?.("pending")
        
        // Iniciar polling para verificar status
        setPolling(true)
        startPolling()
      }
    } catch (err: any) {
      setError(err.message || "Erro ao conectar WhatsApp")
      setStatus("error")
      onStatusChange?.("error")
    } finally {
      setIsLoading(false)
    }
  }

  const startPolling = () => {
    const interval = setInterval(async () => {
      try {
        // Verificar status do agente
        const response = await fetch(`/api/agents/${agentId}/status`)
        if (response.ok) {
          const data = await response.json()
          if (data.status === "connected") {
            setStatus("connected")
            setQrCode(null)
            setPolling(false)
            onStatusChange?.("connected")
            clearInterval(interval)
          }
        }
      } catch (err) {
        console.error("Erro ao verificar status:", err)
      }
    }, 5000) // Verificar a cada 5 segundos

    // Parar polling após 5 minutos
    setTimeout(() => {
      clearInterval(interval)
      setPolling(false)
    }, 300000)
  }

  const getStatusBadge = () => {
    switch (status) {
      case "connected":
        return (
          <Badge variant="default" className="bg-green-500">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Conectado
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="default" className="bg-yellow-500">
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            Aguardando
          </Badge>
        )
      case "error":
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Erro
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary">
            <XCircle className="w-3 h-3 mr-1" />
            Desconectado
          </Badge>
        )
    }
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>WhatsApp Connection</CardTitle>
            <CardDescription>Conecte seu número do WhatsApp para começar</CardDescription>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {status === "disconnected" && (
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

        {status === "pending" && qrCode && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Escaneie o QR code com seu WhatsApp para conectar
            </p>
            <div className="flex justify-center">
              <div className="border-2 border-border rounded-lg p-4 bg-white">
                <Image src={qrCode} alt="QR Code" width={256} height={256} className="rounded" />
              </div>
            </div>
            {polling && (
              <p className="text-xs text-muted-foreground text-center">
                Aguardando conexão... (atualizando automaticamente)
              </p>
            )}
          </div>
        )}

        {status === "connected" && (
          <div className="text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
            <p className="text-sm font-medium">WhatsApp conectado com sucesso!</p>
            <p className="text-xs text-muted-foreground">
              Seu agente está pronto para receber mensagens
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-2">
            <p className="text-sm text-red-500">{error || "Erro ao conectar WhatsApp"}</p>
            <Button onClick={connectWhatsApp} variant="outline" className="w-full">
              Tentar Novamente
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}


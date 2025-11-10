"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { QrCode, Loader2, AlertCircle } from "lucide-react"
import Image from "next/image"

interface WhatsAppConnectProps {
  agentId: string
}

export function WhatsAppConnect({ agentId }: WhatsAppConnectProps) {
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const connectWhatsApp = async () => {
    setIsLoading(true)
    setError(null)
    setMessage(null)
    setQrCode(null)

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
      } else {
        setError(data.error || "QR code não foi retornado pela API")
      }
    } catch (err: any) {
      console.error("Erro ao conectar WhatsApp:", err)
      // Melhorar mensagem de erro
      if (err.message.includes("fetch")) {
        setError("Erro ao conectar com o servidor n8n. Verifique se a URL está configurada corretamente no arquivo .env")
      } else {
        setError(err.message || "Erro ao conectar WhatsApp. Verifique os logs do servidor.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle>Conexão WhatsApp</CardTitle>
        <CardDescription>Conecte seu número do WhatsApp para começar a receber mensagens</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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

        {qrCode && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">{message}</p>
            <div className="flex justify-center">
              <div className="border-2 border-border rounded-lg p-4 bg-white">
                <Image src={qrCode} alt="QR Code WhatsApp" width={256} height={256} className="rounded" />
              </div>
            </div>
            <Button onClick={connectWhatsApp} variant="outline" className="w-full">
              Gerar Novo QR Code
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
            <Button onClick={connectWhatsApp} variant="outline" className="w-full">
              Tentar Novamente
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}


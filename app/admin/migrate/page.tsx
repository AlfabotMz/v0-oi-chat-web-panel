"use client"

import { runMigrations } from "@/lib/supabase/migrate-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { useState } from "react"

export default function MigratePage() {
  const [isRunning, setIsRunning] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    message?: string
    error?: string
  } | null>(null)

  const handleMigrate = async () => {
    setIsRunning(true)
    setResult(null)

    try {
      const response = await runMigrations()
      setResult(response)
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      })
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-background to-background/80 p-4">
      <Card className="w-full max-w-md border-purple-200/30">
        <CardHeader>
          <CardTitle>Configurar Banco de Dados</CardTitle>
          <CardDescription>Criar todas as tabelas e estruturas necessárias</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 rounded-lg bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/30 space-y-2">
            <p className="text-sm font-medium text-foreground">O que será criado:</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Tabelas de usuários e perfis</li>
              <li>• Sistema de planos e administração</li>
              <li>• Tabelas de agentes e conversas</li>
              <li>• Tabelas de analytics e histórico</li>
            </ul>
          </div>

          {result && (
            <div
              className={`p-4 rounded-lg border flex gap-3 ${
                result.success
                  ? "bg-green-50/50 dark:bg-green-950/20 border-green-200/30"
                  : "bg-red-50/50 dark:bg-red-950/20 border-red-200/30"
              }`}
            >
              {result.success ? (
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">{result.success ? "Sucesso!" : "Erro"}</p>
                <p className="text-xs text-muted-foreground">{result.message || result.error}</p>
              </div>
            </div>
          )}

          <Button onClick={handleMigrate} disabled={isRunning} className="w-full bg-purple-600 hover:bg-purple-700">
            {isRunning ? "Executando..." : "Executar Migrações"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

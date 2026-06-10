"use client" // Error boundaries must be Client Components

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, RefreshCcw } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application Error (caught by error boundary):", error)
  }, [error])

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-background">
      <Card className="max-w-md w-full glass border-red-500/20">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6 text-red-500" />
          </div>
          <CardTitle className="text-xl">Ops! Algo deu errado.</CardTitle>
          <CardDescription>
            Ocorreu um erro inesperado na aplicação.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="bg-muted/50 p-4 rounded-lg text-sm font-mono text-muted-foreground overflow-auto max-h-32">
            {error.message || "Erro desconhecido"}
          </div>
          <div className="flex gap-3 mt-2">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => window.location.href = '/'}
            >
              Voltar ao Início
            </Button>
            <Button 
              className="w-full gap-2"
              onClick={() => reset()}
            >
              <RefreshCcw className="w-4 h-4" />
              Tentar Novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

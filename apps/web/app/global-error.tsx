"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Global Application Error:", error)
  }, [error])

  return (
    <html lang="pt-BR">
      <body>
        <div className="min-h-screen w-full flex items-center justify-center p-4 bg-zinc-950 text-zinc-50">
          <div className="max-w-md w-full p-6 border border-zinc-800 rounded-xl bg-zinc-900/50 flex flex-col items-center text-center gap-4">
            <h2 className="text-xl font-bold text-red-400">Erro Crítico</h2>
            <p className="text-zinc-400 text-sm">
              Nossa aplicação encontrou um erro grave e não pôde se recuperar automaticamente.
            </p>
            <Button 
              onClick={() => window.location.reload()}
              className="mt-4"
            >
              Recarregar Página
            </Button>
          </div>
        </div>
      </body>
    </html>
  )
}

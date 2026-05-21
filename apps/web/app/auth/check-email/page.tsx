"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Mail } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

function CheckEmailContent() {
  const searchParams = useSearchParams()
  const redirectToOnboarding = searchParams.get("redirect") === "onboarding"

  return (
    <CardContent className="space-y-4">
      <p className="text-sm text-muted-foreground text-center">
        {redirectToOnboarding
          ? "Após confirmar, você será redirecionado para criar seu primeiro agente."
          : "Após confirmar, você poderá acessar seu dashboard."}
      </p>
      <Link href="/login" className="block">
        <Button variant="outline" className="w-full bg-transparent">
          Voltar para Login
        </Button>
      </Link>
    </CardContent>
  )
}

export default function CheckEmailPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <Card className="border-border/50">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-primary/10 p-4">
                <Mail className="w-8 h-8 text-primary" />
              </div>
            </div>
            <CardTitle>Verifique seu Email</CardTitle>
            <CardDescription>
              Enviamos um email de confirmação. Verifique sua caixa de entrada e clique no link para verificar sua conta.
            </CardDescription>
          </CardHeader>
          <Suspense fallback={<div className="p-4 text-center text-sm text-muted-foreground">Carregando...</div>}>
            <CheckEmailContent />
          </Suspense>
        </Card>
      </div>
    </div>
  )
}

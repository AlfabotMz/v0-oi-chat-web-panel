"use client"

import type React from "react"
import { signIn, signUp } from "@/lib/supabase/auth-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Crown } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [isSignUp, setIsSignUp] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [phone, setPhone] = useState("+258 ")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Função para formatar o número de telefone
  const formatPhoneNumber = (value: string) => {
    // Remove tudo exceto números
    const numbers = value.replace(/\D/g, "")

    // Se começar com 258, mantém, senão adiciona 258
    let formatted = numbers.startsWith("258") ? numbers : "258" + numbers

    // Limita a 11 dígitos (258 + 8 dígitos)
    formatted = formatted.slice(0, 11)

    // Formata como +258 XX XXX XXXX
    if (formatted.length > 3) {
      const countryCode = formatted.slice(0, 3)
      const firstPart = formatted.slice(3, 5)
      const secondPart = formatted.slice(5, 8)
      const thirdPart = formatted.slice(8, 11)

      let result = `+${countryCode}`
      if (firstPart) result += ` ${firstPart}`
      if (secondPart) result += ` ${secondPart}`
      if (thirdPart) result += ` ${thirdPart}`

      return result
    }

    return `+${formatted}`
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value

    // Se apagar tudo, volta para +258
    if (input.length === 0 || input === "+") {
      setPhone("+258 ")
      return
    }

    // Não permite apagar o +258
    if (!input.startsWith("+258")) {
      setPhone("+258 ")
      return
    }

    const formatted = formatPhoneNumber(input)
    setPhone(formatted)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, phone, isAdmin)
        if (error) throw error
        // Se não for admin, redirecionar para onboarding após verificar email
        if (!isAdmin) {
          router.push("/auth/check-email?redirect=onboarding")
        } else {
          router.push("/auth/check-email")
        }
      } else {
        const { error } = await signIn(email, password)
        if (error) throw error
        router.push("/dashboard")
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Ocorreu um erro")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4 bg-gradient-to-b from-background to-background/80">
      <div className="w-full max-w-sm">
        <Card className="border-purple-200/30 bg-card/50 backdrop-blur-sm">
          <CardHeader className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">OiChat</h1>
            </div>
            <CardTitle className="text-xl">{isSignUp ? "Criar Conta" : "Entrar"}</CardTitle>
            <CardDescription>
              {isSignUp ? "Crie uma nova conta para começar" : "Acesse sua conta OiChat"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-purple-200/30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-purple-200/30"
                />
              </div>

              {isSignUp && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <Label htmlFor="phone">Número de Celular</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+258 84 123 4567"
                    value={phone}
                    onChange={handlePhoneChange}
                    required
                    className="border-purple-200/30"
                  />
                  <p className="text-xs text-muted-foreground">Obrigatório para notificações.</p>
                </div>
              )}

              {/* Admin option removed */}

              {error && (
                <p className="text-sm text-red-500 bg-red-50/50 dark:bg-red-950/20 p-2 rounded border border-red-200/30">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? "Carregando..." : isSignUp ? "Criar Conta" : "Entrar"}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm text-muted-foreground">
              {isSignUp ? "Já tem uma conta?" : "Não tem uma conta?"}{" "}
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp)
                  setIsSignUp(!isSignUp)
                  // setIsAdmin(false) // Admin option removed
                  setError(null)
                }}
                className="text-purple-600 hover:underline font-medium"
              >
                {isSignUp ? "Entrar" : "Criar conta"}
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Info Box */}
        {/* Info Box Removed */}
      </div>
    </div>
  )
}

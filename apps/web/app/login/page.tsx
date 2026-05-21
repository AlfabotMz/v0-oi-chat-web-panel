"use client"

import type React from "react"
import { signIn, signUp, signInWithGoogle } from "@/lib/supabase/auth-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Crown } from "lucide-react"

import { PhoneInput } from "@/components/ui/phone-input"

export default function LoginPage() {
  const router = useRouter()
  const [isSignUp, setIsSignUp] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [phone, setPhone] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

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
            <Button
              type="button"
              className="w-full bg-white text-black border border-purple-100 hover:bg-zinc-50 shadow-sm h-11 transition-all rounded-lg font-medium"
              onClick={async () => {
                setError(null)
                setIsLoading(true)
                try {
                  const { error } = await signInWithGoogle()
                  if (error) throw error
                } catch (err: any) {
                  setError(err.message || "Erro ao entrar com Google")
                  setIsLoading(false)
                }
              }}
              disabled={isLoading}
            >
              <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                <path fill="#4285F4" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
              </svg>
              {isSignUp ? "Criar conta com Google" : "Entrar com Google"}
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-purple-200/30"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Ou continue com email</span>
              </div>
            </div>

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
                  <PhoneInput
                    value={phone}
                    onChange={setPhone}
                    className="w-full"
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

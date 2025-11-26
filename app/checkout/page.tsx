"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Loader2, CheckCircle2, ShieldCheck, ArrowLeft } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { ThemeProvider } from "next-themes"

export default function CheckoutPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState(false)
    const [user, setUser] = useState<any>(null)
    const [paymentMethod, setPaymentMethod] = useState("mpesa")
    const [phoneNumber, setPhoneNumber] = useState("")
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState("")
    const [trialUsed, setTrialUsed] = useState(false)

    useEffect(() => {
        const checkUser = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                router.push("/login?redirect=/checkout")
                return
            }

            // Buscar dados do perfil para preencher telefone se houver
            const { data: profile } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single()

            setUser(user)
            if (profile?.phone_number) {
                setPhoneNumber(profile.phone_number)
            }
            if (profile?.trial_used) {
                setTrialUsed(true)
            }
            setLoading(false)
        }

        checkUser()
    }, [router])

    const handlePayment = async () => {
        if (!phoneNumber) {
            setError("Por favor, insira seu número de telefone")
            return
        }

        setProcessing(true)
        setError("")

        try {
            const response = await fetch("/api/payments/process", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    metodo: paymentMethod,
                    numero_celular: phoneNumber,
                }),
            })

            const data = await response.json()

            if (!response.ok || !data.success) {
                throw new Error(data.error || "Erro ao processar pagamento")
            }

            setSuccess(true)
            // Redirecionar após 3 segundos
            setTimeout(() => {
                router.push("/dashboard")
            }, 3000)

        } catch (err: any) {
            console.error("Erro no checkout:", err)
            setError(err.message || "Ocorreu um erro ao processar o pagamento. Tente novamente.")
        } finally {
            setProcessing(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
            </div>
        )
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4 animate-in fade-in duration-500">
                <Card className="w-full max-w-md border-zinc-800 bg-zinc-900 shadow-2xl">
                    <CardContent className="pt-6 text-center space-y-4">
                        <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center animate-in zoom-in duration-500">
                            <CheckCircle2 className="h-8 w-8 text-green-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Pagamento Confirmado!</h2>
                        <p className="text-zinc-400">
                            Sua assinatura foi ativada com sucesso. Verifique seu email para a fatura.
                        </p>
                        <Button
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white mt-4"
                            onClick={() => router.push("/dashboard")}
                        >
                            Ir para o Dashboard
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-50 selection:bg-purple-500/30">
            <div className="max-w-6xl mx-auto px-4 py-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                {/* Header Simples */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/" className="text-zinc-400 hover:text-white transition-colors">
                        <ArrowLeft className="h-6 w-6" />
                    </Link>
                    <div className="flex items-center gap-2">
                        <div className="relative w-8 h-8 overflow-hidden rounded-lg">
                            <Image src="/oichat-icon.jpg" alt="OiChat" fill className="object-cover" />
                        </div>
                        <span className="text-xl font-bold text-white">OiChat Checkout</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Coluna da Esquerda - Detalhes do Pagamento */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm shadow-xl">
                            <CardHeader>
                                <CardTitle className="text-white">Informações da Conta</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-zinc-400">Email</Label>
                                        <Input value={user?.email} disabled className="bg-zinc-950 border-zinc-800 text-zinc-300" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-zinc-400">ID do Usuário</Label>
                                        <Input value={user?.id} disabled className="bg-zinc-950 border-zinc-800 text-zinc-300" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm shadow-xl">
                            <CardHeader>
                                <CardTitle className="text-white">Método de Pagamento</CardTitle>
                                <CardDescription className="text-zinc-400">Escolha como deseja pagar. Transação segura e instantânea.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <RadioGroupItem value="mpesa" id="mpesa" className="peer sr-only" />
                                        <Label
                                            htmlFor="mpesa"
                                            className="flex flex-col items-center justify-between rounded-xl border-2 border-zinc-800 bg-zinc-950 p-4 hover:bg-zinc-900 hover:border-zinc-700 peer-data-[state=checked]:border-red-600 peer-data-[state=checked]:bg-red-600/5 cursor-pointer transition-all duration-300"
                                        >
                                            <span className="text-lg font-semibold mb-2 text-white">M-Pesa</span>
                                            <div className="w-full h-12 relative bg-red-600/10 rounded flex items-center justify-center">
                                                <span className="text-red-500 font-bold">M-Pesa</span>
                                            </div>
                                        </Label>
                                    </div>
                                    <div>
                                        <RadioGroupItem value="emola" id="emola" className="peer sr-only" />
                                        <Label
                                            htmlFor="emola"
                                            className="flex flex-col items-center justify-between rounded-xl border-2 border-zinc-800 bg-zinc-950 p-4 hover:bg-zinc-900 hover:border-zinc-700 peer-data-[state=checked]:border-orange-600 peer-data-[state=checked]:bg-orange-600/5 cursor-pointer transition-all duration-300"
                                        >
                                            <span className="text-lg font-semibold mb-2 text-white">e-Mola</span>
                                            <div className="w-full h-12 relative bg-orange-600/10 rounded flex items-center justify-center">
                                                <span className="text-orange-500 font-bold">e-Mola</span>
                                            </div>
                                        </Label>
                                    </div>
                                </RadioGroup>

                                <div className="space-y-2">
                                    <Label htmlFor="phone" className="text-zinc-400">Número de Celular (M-Pesa/e-Mola)</Label>
                                    <Input
                                        id="phone"
                                        placeholder="84 123 4567"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        className="text-lg py-6 bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-purple-500"
                                    />
                                    <p className="text-sm text-zinc-500">
                                        Você receberá um prompt no seu celular para confirmar o pagamento.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Coluna da Direita - Resumo do Pedido */}
                    <div className="lg:col-span-1 hidden lg:block">
                        <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm shadow-xl sticky top-8">
                            <CardHeader>
                                <CardTitle className="text-white">Resumo do Pedido</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-start gap-4 py-4 border-b border-zinc-800">
                                    <div className="relative w-16 h-16 bg-purple-900/20 rounded-lg flex items-center justify-center overflow-hidden border border-purple-500/20">
                                        <Image src="/oichat-icon.jpg" alt="Plano" width={64} height={64} className="object-cover" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-white">Plano Business</h3>
                                        <p className="text-sm text-zinc-400">Automação completa + IA</p>
                                        {!trialUsed && (
                                            <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                                                Oferta Especial
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-zinc-400">Subtotal</span>
                                        <span className="font-medium text-white">960 MT</span>
                                    </div>
                                    {!trialUsed && (
                                        <div className="flex justify-between text-green-400">
                                            <span>Bônus (1 Mês Extra)</span>
                                            <span>Grátis</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between pt-2 border-t border-zinc-800 text-base font-bold text-white">
                                        <span>Total</span>
                                        <span>960 MT</span>
                                    </div>
                                </div>

                                <div className="bg-purple-900/10 p-3 rounded-md text-xs text-purple-300 border border-purple-500/20">
                                    <p className="font-semibold mb-1">Incluso:</p>
                                    <ul className="list-disc list-inside space-y-1 text-purple-200/70">
                                        <li>
                                            {trialUsed ? "1 Mês de Acesso (30 dias)" : "2 Meses de Acesso (60 dias)"}
                                        </li>
                                        <li>Suporte Prioritário</li>
                                        <li>Configuração Assistida</li>
                                    </ul>
                                </div>
                            </CardContent>
                            <CardFooter className="flex flex-col gap-4">
                                {error && (
                                    <div className="w-full p-3 bg-red-900/10 text-red-400 text-sm rounded-md border border-red-900/20">
                                        {error}
                                    </div>
                                )}
                                <Button
                                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white py-6 text-lg font-semibold shadow-lg shadow-purple-500/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                                    onClick={handlePayment}
                                    disabled={processing}
                                >
                                    {processing ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Processando...
                                        </>
                                    ) : (
                                        "Pagar Agora"
                                    )}
                                </Button>
                                <div className="flex items-center justify-center gap-2 text-xs text-zinc-500">
                                    <ShieldCheck className="h-4 w-4" />
                                    <span>Pagamento 100% Seguro</span>
                                </div>
                            </div>
                    </div>
                    )
}

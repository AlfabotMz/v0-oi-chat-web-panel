"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, CheckCircle2, ShieldCheck, ArrowLeft, CreditCard, XCircle } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

function CheckoutContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState(false)
    const [user, setUser] = useState<any>(null)
    const [trialUsed, setTrialUsed] = useState(false)
    const [paymentStatus, setPaymentStatus] = useState<"success" | "cancelled" | null>(null)

    useEffect(() => {
        const status = searchParams.get("payment")
        if (status === "success") setPaymentStatus("success")
        if (status === "cancelled") setPaymentStatus("cancelled")

        const checkUser = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                router.push("/login?redirect=/checkout")
                return
            }

            const { data: profile } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single()

            setUser(user)
            if (profile?.trial_used) {
                setTrialUsed(true)
            }
            setLoading(false)
        }

        checkUser()
    }, [router, searchParams])

    const handlePayment = async () => {
        setProcessing(true)
        try {
            const response = await fetch("/api/stripe/checkout", {
                method: "POST",
            })
            const data = await response.json()

            if (data.success && data.url) {
                window.location.href = data.url
            } else {
                throw new Error(data.error || "Erro ao iniciar pagamento")
            }
        } catch (error) {
            console.error("Erro:", error)
            alert("Erro ao iniciar o checkout. Tente novamente.")
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

    if (paymentStatus === "success") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4 animate-in fade-in duration-500">
                <Card className="w-full max-w-md border-zinc-800 bg-zinc-900 shadow-2xl glass">
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
                            onClick={() => router.push("/onboarding")}
                        >
                            Começar Agora
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

                {paymentStatus === "cancelled" && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-400">
                        <XCircle className="h-5 w-5" />
                        <p>O pagamento foi cancelado. Nenhuma cobrança foi realizada.</p>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Coluna da Esquerda - Detalhes do Pagamento */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="glass border-0">
                            <CardHeader>
                                <CardTitle className="text-white">Informações da Conta</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-zinc-400">Email</Label>
                                        <Input value={user?.email} disabled className="bg-zinc-950/50 border-zinc-800 text-zinc-300" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-zinc-400">ID do Usuário</Label>
                                        <Input value={user?.id} disabled className="bg-zinc-950/50 border-zinc-800 text-zinc-300" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="glass border-0">
                            <CardHeader>
                                <CardTitle className="text-white">Inicie seu Teste de 7 Dias</CardTitle>
                                <CardDescription className="text-zinc-400">
                                    Você não será cobrado hoje. O teste termina em 7 dias, após o qual a assinatura será ativada automaticamente.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center gap-4 p-4 rounded-lg bg-zinc-950/50 border border-zinc-800">
                                    <CreditCard className="h-8 w-8 text-purple-500" />
                                    <div>
                                        <p className="font-medium text-white">Cartão de Crédito / Débito</p>
                                        <p className="text-sm text-zinc-500">Checkout Seguro via Stripe</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Botão de Pagamento Mobile */}
                        <Card className="glass border-0 lg:hidden">
                            <CardContent className="pt-6 space-y-4">
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-zinc-400">Plano Pro (7 Dias Grátis)</span>
                                        <span className="font-medium text-white">0 MT</span>
                                    </div>
                                    <div className="flex justify-between pt-2 border-t border-zinc-800 text-base font-bold text-white">
                                        <span>Total Hoje</span>
                                        <span>0 MT</span>
                                    </div>
                                </div>

                                <Button
                                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white py-6 text-lg font-semibold shadow-lg shadow-purple-500/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                                    onClick={handlePayment}
                                    disabled={processing}
                                >
                                    {processing ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Redirecionando...
                                        </>
                                    ) : (
                                        "Iniciar Teste Grátis"
                                    )}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Coluna da Direita - Resumo do Pedido */}
                    <div className="lg:col-span-1 hidden lg:block">
                        <Card className="glass border-0 sticky top-8">
                            <CardHeader>
                                <CardTitle className="text-white">Resumo do Pedido</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-start gap-4 py-4 border-b border-zinc-800">
                                    <div className="relative w-16 h-16 bg-purple-900/20 rounded-lg flex items-center justify-center overflow-hidden border border-purple-500/20">
                                        <Image src="/oichat-icon.jpg" alt="Plano" width={64} height={64} className="object-cover" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-white">Plano Pro</h3>
                                        <p className="text-sm text-zinc-400">Automação completa + IA</p>
                                        <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                            7 Dias Grátis
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-zinc-400">Subtotal</span>
                                        <span className="font-medium text-white">960 MT/mês</span>
                                    </div>
                                    <div className="flex justify-between text-green-400">
                                        <span>Teste Grátis (7 Dias)</span>
                                        <span>-960 MT</span>
                                    </div>
                                    <div className="flex justify-between pt-2 border-t border-zinc-800 text-base font-bold text-white">
                                        <span>Total Hoje</span>
                                        <span>0 MT</span>
                                    </div>
                                </div>

                                <div className="bg-purple-900/10 p-3 rounded-md text-xs text-purple-300 border border-purple-500/20">
                                    <p className="font-semibold mb-1">Incluso no Teste:</p>
                                    <ul className="list-disc list-inside space-y-1 text-purple-200/70">
                                        <li>Acesso Completo (7 dias)</li>
                                        <li>Suporte Prioritário</li>
                                        <li>Configuração Assistida</li>
                                    </ul>
                                </div>
                            </CardContent>
                            <CardFooter className="flex flex-col gap-4">
                                <Button
                                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white py-6 text-lg font-semibold shadow-lg shadow-purple-500/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                                    onClick={handlePayment}
                                    disabled={processing}
                                >
                                    {processing ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Redirecionando...
                                        </>
                                    ) : (
                                        "Iniciar Teste Grátis"
                                    )}
                                </Button>
                                <div className="flex items-center justify-center gap-2 text-xs text-zinc-500">
                                    <ShieldCheck className="h-4 w-4" />
                                    <span>Checkout Seguro via Stripe</span>
                                </div>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
            </div>
        }>
            <CheckoutContent />
        </Suspense>
    )
}

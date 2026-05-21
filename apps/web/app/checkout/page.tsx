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
import { signInWithGoogle } from "@/lib/supabase/auth-actions"

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

            if (user) {
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", user.id)
                    .single()

                if (profile) {
                    setUser(user)

                    // Se não tiver assinatura no banco, tentar sincronizar uma última vez com o Stripe
                    if (!profile.stripe_subscription_id) {
                        try {
                            const syncResponse = await fetch("/api/subscription/sync", {
                                method: "POST",
                            })
                            const syncData = await syncResponse.json()
                            if (syncData.success && syncData.synced) {
                                // Se sincronizou algo novo, redirecionar para o dashboard
                                router.push("/dashboard")
                                return
                            }
                        } catch (err) {
                            console.error("Erro ao tentar sincronizar no checkout:", err)
                        }
                    }

                    // Se já tiver uma assinatura do Stripe (ou acabou de sincronizar acima), redirecionar para o dashboard
                    if (profile.stripe_subscription_id) {
                        router.push("/dashboard")
                        return
                    }

                    if (profile.trial_used) {
                        setTrialUsed(true)
                    }
                }
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

    if (!user) {
        return (
            <div className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center space-y-2">
                        <div className="flex justify-center mb-4">
                            <div className="relative w-12 h-12 overflow-hidden rounded-xl">
                                <Image src="/oichat-icon.jpg" alt="OiChat" fill className="object-cover" />
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold text-white">
                            {searchParams.get("onboarding") === "complete" ? "Parabéns! Onboarding Concluído 🚀" : "OiChat Checkout"}
                        </h1>
                        <p className="text-zinc-400">
                            {searchParams.get("onboarding") === "complete"
                                ? "Seu agente está pronto! Você já tem 7 dias de teste grátis ativos."
                                : "Entre ou crie uma conta para iniciar seu teste de 7 dias"}
                        </p>
                    </div>

                    <Card className="glass border-zinc-800 bg-zinc-900/50">
                        <CardHeader>
                            <CardTitle className="text-xl text-center">Acesse sua conta</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Button
                                type="button"
                                className="w-full bg-white text-black hover:bg-zinc-100 hover:text-black flex items-center justify-center gap-2 h-12 text-lg font-medium border border-zinc-200 shadow-md transition-all"
                                onClick={async () => {
                                    try {
                                        const { error } = await signInWithGoogle()
                                        if (error) throw error
                                    } catch (err: any) {
                                        alert(err.message || "Erro ao entrar com Google")
                                    }
                                }}
                            >
                                <svg className="h-5 w-5" viewBox="0 0 488 512">
                                    <path fill="#4285F4" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                                </svg>
                                Entrar com Google
                            </Button>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-zinc-800"></span>
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-zinc-900 px-2 text-zinc-500">Ou use seu email</span>
                                </div>
                            </div>

                            <Button
                                variant="outline"
                                className="w-full border-zinc-800 hover:bg-zinc-800/50 text-zinc-300"
                                onClick={() => router.push("/login?redirect=/checkout")}
                            >
                                Entrar com Email e Senha
                            </Button>
                        </CardContent>
                    </Card>

                    <p className="text-center text-sm text-zinc-500">
                        Ao continuar, você concorda com nossos Termos de Serviço e Política de Privacidade.
                    </p>
                </div>
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
                                <CardTitle className="text-white">
                                    {searchParams.get("onboarding") === "complete" ? "Ative seus 7 Dias Grátis" : "Inicie seu Teste de 7 Dias"}
                                </CardTitle>
                                <CardDescription className="text-zinc-400">
                                    {searchParams.get("onboarding") === "complete"
                                        ? "Como você concluiu a configuração, seu teste de 7 dias já está ativo! Você pode começar a usar o dashboard agora mesmo."
                                        : "Você tem 7 dias grátis para testar todas as funcionalidades. Após o período, entre em contato via WhatsApp para manter sua assinatura ativa."}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div
                                    className="flex items-center justify-between p-4 rounded-lg bg-[#25D366]/10 border border-[#25D366]/20 cursor-pointer hover:bg-[#25D366]/20 transition-all"
                                    onClick={() => window.open("https://wa.me/258856428686", "_blank")}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="bg-[#25D366] p-2 rounded-full text-white">
                                            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.67-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.438 9.886-9.886 9.886m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.435 5.63 1.435h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="font-medium text-white">Pagar via WhatsApp</p>
                                            <p className="text-sm text-zinc-500">Ativação manual imediata</p>
                                        </div>
                                    </div>
                                    <div className="text-zinc-500">
                                        <ArrowLeft className="h-4 w-4 rotate-180" />
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 p-4 rounded-lg bg-zinc-950/50 border border-zinc-800 opacity-50 grayscale cursor-not-allowed">
                                    <CreditCard className="h-8 w-8 text-zinc-600" />
                                    <div>
                                        <p className="font-medium text-zinc-500">Cartão de Crédito (Indisponível)</p>
                                        <p className="text-sm text-zinc-600">Checkout Stripe desativado temporariamente</p>
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
                                    onClick={() => router.push("/dashboard")}
                                >
                                    Ir para o Dashboard
                                </Button>
                                <div className="flex items-center justify-center gap-2 text-xs text-green-500 font-medium">
                                    <CheckCircle2 className="h-4 w-4" />
                                    <span>7 Dias de Teste Grátis Inclusos</span>
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

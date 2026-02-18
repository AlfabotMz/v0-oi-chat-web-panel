"use client"

import { Button } from "@/components/ui/button"
import { FadeIn } from "@/components/animations/fade-in"
import { Check, Zap } from "lucide-react"
import Link from "next/link"

export function V2Pricing() {
    const benefits = [
        "Agentes de IA Ilimitados",
        "Respostas Ilimitadas",
        "Formulário Automático de Pedidos",
        "Suporte Prioritário 24/7",
        "Configuração Assistida",
        "Multi-idiomas",
    ]

    return (
        <section id="plans" className="py-20 md:py-32 relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-violet-600/5 rounded-full blur-[120px] -z-10" />

            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center mb-16">
                    <FadeIn>
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Plano Simples e Transparente</h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto italic">
                            Comece agora e escale conforme seu negócio cresce.
                        </p>
                    </FadeIn>
                </div>

                <div className="max-w-xl mx-auto">
                    <FadeIn className="relative rounded-3xl border-2 border-violet-600 bg-card p-8 md:p-12 shadow-2xl shadow-violet-600/10 overflow-hidden transform md:-translate-y-4">
                        <div className="absolute top-0 right-0 bg-violet-600 text-white px-6 py-2 rounded-bl-3xl text-sm font-bold flex items-center gap-2">
                            <Zap size={16} fill="currentColor" /> MAIS POPULAR
                        </div>

                        <div className="mb-8">
                            <h3 className="text-3xl font-bold text-foreground">Plano Pro</h3>
                            <p className="text-muted-foreground mt-2">Tudo que você precisa para automatizar e vender.</p>
                        </div>

                        <div className="mb-10">
                            <div className="flex items-baseline gap-2">
                                <span className="text-5xl font-black text-foreground">7 Dias Grátis</span>
                            </div>
                            <p className="text-lg text-muted-foreground font-medium mt-3">
                                Depois apenas <span className="text-violet-600 font-bold">960 MT/mês</span>
                            </p>
                            <p className="text-xs text-muted-foreground mt-1 tracking-wide">Sem contratos. Cancele quando quiser.</p>
                        </div>

                        <div className="space-y-4 mb-10">
                            {benefits.map((benefit, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center">
                                        <Check className="w-3 h-3 text-violet-600 dark:text-violet-400" strokeWidth={3} />
                                    </div>
                                    <span className="text-foreground font-medium">{benefit}</span>
                                </div>
                            ))}
                        </div>

                        <Link href="https://oichat.mz/checkout">
                            <Button size="lg" className="w-full h-14 text-xl bg-violet-600 hover:bg-violet-700 text-white shadow-xl shadow-violet-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
                                Começar Teste Grátis
                            </Button>
                        </Link>

                        <p className="text-center text-xs text-muted-foreground mt-6 font-medium">
                            Checkout Seguro via Stripe 🔒
                        </p>
                    </FadeIn>
                </div>
            </div>
        </section>
    )
}

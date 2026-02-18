"use client"

import { Button } from "@/components/ui/button"
import { FadeIn } from "@/components/animations/fade-in"
import { Check, ArrowRight, MessageSquare, ShoppingCart, Star } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export function V2Hero() {
    return (
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-violet-200/20 dark:bg-violet-900/10 rounded-full blur-[120px] -z-10 animate-pulse" />

            <div className="container mx-auto px-4 md:px-6">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Content side */}
                    <div className="flex flex-col gap-8 max-w-2xl">
                        <FadeIn delay={100} direction="none">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 text-xs font-semibold border border-violet-200 dark:border-violet-800 w-fit">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-600"></span>
                                </span>
                                SISTEMA DE VENDAS AUTOMÁTICO
                            </div>
                        </FadeIn>

                        <FadeIn delay={200}>
                            <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.1] text-foreground">
                                Seu WhatsApp pode <span className="text-violet-600 dark:text-violet-400">vender sozinho</span> enquanto você dorme.
                            </h1>
                        </FadeIn>

                        <FadeIn delay={300}>
                            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                                O OiChat responde, fecha pedidos e envia automaticamente o formulário completo de entrega para você.
                                <span className="block mt-2 font-medium text-foreground">Você só confirma e despacha.</span>
                            </p>
                        </FadeIn>

                        <FadeIn delay={400}>
                            <div className="grid sm:grid-cols-2 gap-4">
                                {[
                                    "Respostas imediatas 24h",
                                    "Nunca mais perca vendas",
                                    "Pedidos organizados",
                                    "Mais tempo para o seu negócio"
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center">
                                            <Check className="w-3 h-3 text-violet-600 dark:text-violet-400" strokeWidth={3} />
                                        </div>
                                        <span className="text-sm font-medium text-muted-foreground">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </FadeIn>

                        <FadeIn delay={500} className="flex flex-col sm:flex-row items-center gap-4">
                            <Link href="https://oichat.mz/checkout" className="w-full sm:w-auto">
                                <Button size="lg" className="h-14 px-8 text-lg w-full bg-violet-600 hover:bg-violet-700 text-white shadow-xl shadow-violet-600/20 transition-all hover:-translate-y-1">
                                    Começar teste grátis por 7 dias <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                        </FadeIn>

                        <FadeIn delay={600}>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <div className="flex -space-x-2">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-muted overflow-hidden relative">
                                            <Image src={`https://i.pravatar.cc/100?u=${i}`} alt="User" fill />
                                        </div>
                                    ))}
                                </div>
                                <div className="flex flex-col">
                                    <div className="flex gap-0.5 text-yellow-500">
                                        {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={12} fill="currentColor" />)}
                                    </div>
                                    <span>+500 empresas automatizadas</span>
                                </div>
                            </div>
                        </FadeIn>
                    </div>

                    {/* Visual side */}
                    <FadeIn delay={400} direction="right" className="relative">
                        <div className="relative z-10 mx-auto max-w-[400px]">
                            {/* WhatsApp Mockup */}
                            <div className="rounded-[40px] border-[8px] border-zinc-200 dark:border-zinc-800 bg-background shadow-2xl p-2 relative overflow-hidden">
                                <div className="bg-[#E5DDD5] dark:bg-zinc-950 aspect-[9/18.5] rounded-[30px] overflow-hidden flex flex-col relative">
                                    {/* WA Header */}
                                    <div className="bg-[#075E54] dark:bg-zinc-900 p-4 pt-8 text-white flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-[10px]">OI</div>
                                        <div>
                                            <p className="text-sm font-bold leading-none">Vendedor IA</p>
                                            <p className="text-[10px] opacity-80">Online</p>
                                        </div>
                                    </div>

                                    {/* WA Chat Area */}
                                    <div className="flex-1 p-4 flex flex-col gap-3 font-sans overflow-y-auto">
                                        <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg rounded-tl-none shadow-sm max-w-[85%] text-xs text-foreground">
                                            Olá! Vi que você tem interesse na Panela Elétrica. Temos em estoque! Gostaria de fechar o pedido agora?
                                        </div>
                                        <div className="bg-[#DCF8C6] dark:bg-violet-950 p-3 rounded-lg rounded-tr-none shadow-sm max-w-[85%] self-end text-xs text-black dark:text-white">
                                            Sim, quero sim! Meu endereço é Zimpeto.
                                        </div>
                                        <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg rounded-tl-none shadow-sm max-w-[85%] text-xs border-l-4 border-violet-500 text-foreground">
                                            <p className="font-bold text-violet-600 mb-1">Pedido Confirmado!</p>
                                            <p>Enviei seu formulário para a expedição.</p>
                                            <div className="mt-2 p-2 bg-muted rounded border text-[10px] leading-tight">
                                                <strong>📦 FORMATO DE ENTREGA:</strong><br />
                                                Nome: Maria João<br />
                                                Item: Panela Elétrica<br />
                                                Endereço: Zimpeto, Rua X<br />
                                                Pagamento: M-Pesa
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Floating Elements */}
                            <div className="absolute -right-6 top-1/4 p-4 bg-background dark:bg-zinc-900 rounded-2xl border border-border shadow-2xl z-20">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                        <ShoppingCart className="w-5 h-5 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold leading-none">Novo pedido!</p>
                                        <p className="text-[10px] text-muted-foreground">Panela Elétrica ⚡</p>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute -left-6 bottom-1/4 p-4 bg-background dark:bg-zinc-900 rounded-2xl border border-border shadow-2xl z-20">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                                        <MessageSquare className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold leading-none">Cliente Atendido</p>
                                        <p className="text-[10px] text-muted-foreground">Qualificado em 2s</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Visual glow behind mockup */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-violet-400/10 dark:bg-violet-600/5 rounded-full blur-[100px] -z-10" />
                    </FadeIn>
                </div>
            </div>
        </section>
    )
}

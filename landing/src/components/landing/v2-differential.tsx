"use client"

import { FadeIn } from "@/components/animations/fade-in"
import { CheckCircle2, ClipboardCheck } from "lucide-react"

export function V2Differential() {
    return (
        <section className="py-20 md:py-32 relative">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <FadeIn direction="left">
                        <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
                            Não é só responder. <br />
                            <span className="text-violet-600">É fechar e organizar.</span>
                        </h2>
                        <p className="text-lg text-muted-foreground mb-8">
                            Enquanto outros chatbots apenas conversam, o OiChat é focado em conversão.
                            Ele conduz o cliente até o fechamento e entrega um formulário pronto para você.
                        </p>

                        <div className="space-y-6">
                            {[
                                {
                                    title: "Envio Inteligente de Formulário",
                                    desc: "O sistema identifica os dados da venda e estrutura automaticamente para sua expedição."
                                },
                                {
                                    title: "Redução de Trabalho Manual",
                                    desc: "Elimine a necessidade de perguntar nome, endereço e produto repetidamente."
                                },
                                {
                                    title: "Zero Erros na Entrega",
                                    desc: "Dados padronizados evitam confusões e devoluções por endereços incompletos."
                                }
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center mt-1">
                                        <CheckCircle2 className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-foreground">{item.title}</h4>
                                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </FadeIn>

                    <FadeIn direction="right" className="relative">
                        <div className="bg-card rounded-3xl border border-border shadow-2xl p-6 md:p-10 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <ClipboardCheck size={120} className="text-violet-600" />
                            </div>

                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="p-2 rounded-lg bg-violet-600 text-white">
                                        <ClipboardCheck size={24} />
                                    </div>
                                    <h3 className="text-xl font-bold">Pedido Estruturado</h3>
                                </div>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4 pb-4 border-b border-border/50">
                                        <span className="text-sm text-muted-foreground">Cliente</span>
                                        <span className="text-sm font-semibold text-right">Maria João</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 pb-4 border-b border-border/50">
                                        <span className="text-sm text-muted-foreground">WhatsApp</span>
                                        <span className="text-sm font-semibold text-right">+258 84 000 0000</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 pb-4 border-b border-border/50">
                                        <span className="text-sm text-muted-foreground">Produto</span>
                                        <span className="text-sm font-semibold text-right text-violet-600 dark:text-violet-400">Panela Elétrica ⚡</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 pb-4 border-b border-border/50">
                                        <span className="text-sm text-muted-foreground">Endereço</span>
                                        <span className="text-sm font-semibold text-right">Zimpeto, Rua X</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 pb-4 border-b border-border/50">
                                        <span className="text-sm text-muted-foreground">Referência</span>
                                        <span className="text-sm font-semibold text-right">Casa azul ao lado do mercado</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <span className="text-sm text-muted-foreground">Pagamento</span>
                                        <span className="text-sm font-semibold text-right uppercase">M-Pesa</span>
                                    </div>
                                </div>

                                <div className="mt-8 p-4 bg-violet-50 dark:bg-violet-900/20 rounded-xl border border-violet-100 dark:border-violet-800/50">
                                    <p className="text-center text-sm font-bold text-violet-700 dark:text-violet-300">
                                        ✨ Você só confirma e despacha.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </FadeIn>
                </div>
            </div>
        </section>
    )
}

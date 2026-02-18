"use client"

import { FadeIn } from "@/components/animations/fade-in"
import { Smartphone, Sparkles, Zap } from "lucide-react"

export function V2HowItWorks() {
    const steps = [
        {
            title: "Conecte seu WhatsApp",
            desc: "Escaneie o QR Code e integre seu número em segundos. Sem burocracia.",
            icon: <Smartphone size={24} />,
        },
        {
            title: "Configure o tom da marca",
            desc: "Defina como sua IA deve falar e quais produtos ela deve vender.",
            icon: <Sparkles size={24} />,
        },
        {
            title: "Ative o fluxo de vendas",
            icon: <Zap size={24} />,
            desc: "Pronto! Sua IA começa a atender e fechar pedidos 24h por dia.",
            highlight: true
        }
    ]

    return (
        <section id="how-it-works" className="py-20 md:py-32">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center mb-16">
                    <FadeIn>
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Pronto em poucos minutos.</h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Configuração simples e intuitiva para você começar a vender no automático ainda hoje.
                        </p>
                    </FadeIn>
                </div>

                <div className="grid md:grid-cols-3 gap-8 relative">
                    {/* Connector Line (Desktop) */}
                    <div className="hidden md:block absolute top-1/2 left-0 right-0 h-[2px] bg-border/50 -translate-y-1/2 -z-10" />

                    {steps.map((step, i) => (
                        <FadeIn key={i} delay={i * 200} className="relative group">
                            <div className="bg-background border border-border rounded-3xl p-8 h-full flex flex-col items-center text-center group-hover:border-violet-600/50 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-2">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all ${step.highlight ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30' : 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400'}`}>
                                    {step.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-4">{step.title}</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
                                <div className="absolute top-4 right-4 text-4xl font-black text-border/20 group-hover:text-violet-600/10 transition-colors">
                                    0{i + 1}
                                </div>
                            </div>
                        </FadeIn>
                    ))}
                </div>
            </div>
        </section>
    )
}

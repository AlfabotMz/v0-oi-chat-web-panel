"use client"

import { FadeIn } from "@/components/animations/fade-in"
import { XCircle, CheckCircle, ArrowRightCircle } from "lucide-react"

export function V2ProblemSolution() {
    const points = [
        {
            problem: "Resposta lenta afasta o cliente",
            solution: "Respostas imediatas em menos de 3s",
        },
        {
            problem: "Cliente desiste no meio da conversa",
            solution: "IA que engaja e conduz até o fechamento",
        },
        {
            problem: "Pedidos incompletos e confusos",
            solution: "Dados estruturados automaticamente",
        },
        {
            problem: "Dificuldade em organizar entregas",
            solution: "Formulários prontos para expedição",
        }
    ]

    return (
        <section className="py-20 bg-muted/30 relative">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center mb-16 max-w-3xl mx-auto">
                    <FadeIn>
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">Pare de perder vendas por cansaço.</h2>
                        <p className="text-lg text-muted-foreground">
                            Vender pelo WhatsApp não precisa ser um trabalho manual de 24 horas.
                            Veja a diferença que o OiChat faz no seu dia a dia.
                        </p>
                    </FadeIn>
                </div>

                <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                    {/* Problem Side */}
                    <FadeIn direction="left" className="space-y-4">
                        <h3 className="text-xl font-bold flex items-center gap-2 text-red-600 dark:text-red-400 mb-6">
                            <XCircle size={24} /> Sem OiChat
                        </h3>
                        <div className="space-y-3">
                            {points.map((p, i) => (
                                <div key={i} className="p-5 rounded-xl border border-red-100 dark:border-red-900/30 bg-background/50 flex items-center justify-between group grayscale hover:grayscale-0 transition-all">
                                    <span className="text-muted-foreground group-hover:text-foreground font-medium">{p.problem}</span>
                                    <XCircle size={18} className="text-red-300 dark:text-red-900" />
                                </div>
                            ))}
                        </div>
                    </FadeIn>

                    {/* Solution Side */}
                    <FadeIn direction="right" className="space-y-4">
                        <h3 className="text-xl font-bold flex items-center gap-2 text-violet-600 dark:text-violet-400 mb-6">
                            <CheckCircle size={24} /> Com OiChat
                        </h3>
                        <div className="space-y-3">
                            {points.map((p, i) => (
                                <div key={i} className="p-5 rounded-xl border border-violet-200 dark:border-violet-800 bg-background shadow-lg shadow-violet-500/5 flex items-center justify-between group">
                                    <span className="font-bold text-foreground">{p.solution}</span>
                                    <CheckCircle size={18} className="text-violet-600 dark:text-violet-400" />
                                </div>
                            ))}
                        </div>
                    </FadeIn>
                </div>

                <FadeIn delay={400} className="mt-16 text-center">
                    <div className="inline-flex items-center gap-4 p-2 pl-6 bg-background rounded-full border border-border shadow-xl">
                        <span className="text-sm font-medium">Você acorda com pedidos organizados.</span>
                        <div className="w-10 h-10 rounded-full bg-violet-600 text-white flex items-center justify-center">
                            <ArrowRightCircle size={20} />
                        </div>
                    </div>
                </FadeIn>
            </div>
        </section>
    )
}

"use client"

import { FadeIn } from "@/components/animations/fade-in"
import { ShieldCheck, CalendarRange, MousePointerClick, MessageSquareText } from "lucide-react"

export function V2Objections() {
    const items = [
        {
            title: "Sem cartão obrigatório",
            desc: "Teste todos os recursos por 7 dias sem precisar colocar seu cartão de crédito agora.",
            icon: <ShieldCheck className="text-violet-600" size={32} />
        },
        {
            title: "Sem fidelização",
            desc: "Você é dono do seu tempo. Pode cancelar a assinatura a qualquer momento com um clique.",
            icon: <CalendarRange className="text-violet-600" size={32} />
        },
        {
            title: "Pronto em minutos",
            desc: "Ativação imediata após a conexão. Sua IA começa a vender assim que você configura.",
            icon: <MousePointerClick className="text-violet-600" size={32} />
        },
        {
            title: "Suporte Local",
            desc: "Dúvidas? Nosso time está disponível via WhatsApp para te ajudar na configuração.",
            icon: <MessageSquareText className="text-violet-600" size={32} />
        }
    ]

    return (
        <section className="py-20 border-t border-border/50 bg-background">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12">
                    {items.map((item, i) => (
                        <FadeIn key={i} delay={i * 100} className="flex flex-col items-center text-center">
                            <div className="mb-6 bg-violet-50 dark:bg-violet-900/10 p-4 rounded-2xl shadow-sm">
                                {item.icon}
                            </div>
                            <h4 className="text-lg font-bold mb-3">{item.title}</h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {item.desc}
                            </p>
                        </FadeIn>
                    ))}
                </div>
            </div>
        </section>
    )
}

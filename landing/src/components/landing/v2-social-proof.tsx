"use client"

import { FadeIn } from "@/components/animations/fade-in"
import { Users, ShoppingBag, MessageCircle } from "lucide-react"

export function V2SocialProof() {
    const stats = [
        { label: "Empresas Ativas", value: "500+", icon: <Users size={20} /> },
        { label: "Pedidos Automatizados", value: "125.000+", icon: <ShoppingBag size={20} /> },
        { label: "Conversas por Mês", value: "1.2M+", icon: <MessageCircle size={20} /> },
    ]

    return (
        <section className="py-12 border-y border-border/50 bg-muted/20">
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex flex-wrap items-center justify-around gap-8 md:gap-12">
                    {stats.map((stat, i) => (
                        <FadeIn key={i} delay={i * 100} direction="none" className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-background border border-border flex items-center justify-center text-violet-600 dark:text-violet-400 shadow-sm">
                                {stat.icon}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">{stat.value}</span>
                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</span>
                            </div>
                        </FadeIn>
                    ))}
                </div>
            </div>
        </section>
    )
}

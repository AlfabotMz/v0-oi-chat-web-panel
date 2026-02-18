"use client"

import { Button } from "@/components/ui/button"
import { FadeIn } from "@/components/animations/fade-in"
import { ArrowRight, CheckCircle } from "lucide-react"
import Link from "next/link"

export function V2CTA() {
    return (
        <section className="py-20 md:py-32 relative overflow-hidden">
            {/* Visual background noise/glow */}
            <div className="absolute bottom-0 left-0 right-0 h-[500px] bg-gradient-to-t from-violet-600/10 to-transparent -z-10" />

            <div className="container mx-auto px-4 md:px-6">
                <FadeIn className="max-w-4xl mx-auto bg-card p-10 md:p-20 rounded-[40px] border border-violet-200 dark:border-violet-900 shadow-2xl relative overflow-hidden text-center">
                    {/* Decorative subtle pulse */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />

                    <h2 className="text-3xl md:text-5xl font-black mb-8 leading-tight">
                        Pare de perder vendas por demora <br className="hidden md:block" /> e desorganização.
                    </h2>

                    <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
                        Deixe o OiChat atender, fechar e organizar seus pedidos automaticamente enquanto você foca no que importa.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <Link href="https://oichat.mz/checkout" className="w-full sm:w-auto">
                            <Button size="lg" className="h-16 px-10 text-xl w-full bg-violet-600 hover:bg-violet-700 text-white shadow-2xl shadow-violet-600/30 transition-all hover:-translate-y-1">
                                Começar agora <ArrowRight className="ml-2 h-6 w-6" />
                            </Button>
                        </Link>
                    </div>

                    <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground font-medium">
                        <div className="flex items-center gap-2">
                            <CheckCircle size={18} className="text-violet-600" /> Ativação Imediata
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle size={18} className="text-violet-600" /> Cancelamento Fácil
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle size={18} className="text-violet-600" /> Teste Grátis de 7 Dias
                        </div>
                    </div>
                </FadeIn>
            </div>
        </section>
    )
}

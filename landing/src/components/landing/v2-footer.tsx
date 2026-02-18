"use client"

import Link from "next/link"
import { MessageSquare } from "lucide-react"

export function V2Footer() {
    const currentYear = new Date().getFullYear()

    const productLinks = [
        { name: "Principais Recursos", href: "#how-it-works" },
        { name: "Planos e Preços", href: "#plans" },
        { name: "Resultados Reais", href: "#results" },
        { name: "Entrar na Conta", href: "https://oichat.mz/login" },
    ]

    const companyLinks = [
        { name: "Termos de Uso", href: "#" },
        { name: "Privacidade", href: "#" },
    ]

    return (
        <footer className="py-16 border-t border-border bg-muted/20">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-1 md:col-span-2 space-y-6">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center text-white font-bold text-xs shadow-lg">OI</div>
                            <span className="text-2xl font-bold tracking-tight">OiChat</span>
                        </div>
                        <p className="text-muted-foreground max-w-sm leading-relaxed">
                            Plataforma líder em Moçambique para automação de vendas e atendimento via WhatsApp com Inteligência Artificial.
                        </p>
                        <div className="flex gap-4">
                            {/* Social placeholders if needed */}
                        </div>
                    </div>

                    <div>
                        <h4 className="font-bold text-foreground mb-6">Produto</h4>
                        <ul className="space-y-4">
                            {productLinks.map((link) => (
                                <li key={link.name}>
                                    <Link href={link.href} className="text-sm text-muted-foreground hover:text-violet-600 transition-colors">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-foreground mb-6">Suporte e Legal</h4>
                        <ul className="space-y-4">
                            {companyLinks.map((link) => (
                                <li key={link.name}>
                                    <Link href={link.href} className="text-sm text-muted-foreground hover:text-violet-600 transition-colors">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                            <li>
                                <Link href="https://wa.me/258840000000" className="text-sm text-violet-600 font-semibold hover:underline flex items-center gap-2">
                                    <MessageSquare size={16} /> Falar com Consultor
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-sm text-muted-foreground">
                        © {currentYear} OiChat. Todos os direitos reservados.
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium uppercase tracking-widest">
                        Focado em <span className="text-violet-600">Alta Conversão</span>
                    </div>
                </div>
            </div>
        </footer>
    )
}

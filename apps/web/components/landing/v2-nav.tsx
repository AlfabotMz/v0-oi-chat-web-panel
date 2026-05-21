"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Menu, X } from "lucide-react"

export function V2Nav() {
    const [isScrolled, setIsScrolled] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20)
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    const navLinks = [
        { name: "Como Funciona", href: "#how-it-works" },
        { name: "Resultados", href: "#results" },
        { name: "Planos", href: "#plans" },
    ]

    return (
        <header
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
                isScrolled
                    ? "bg-background/80 backdrop-blur-md border-border/50 py-3 shadow-sm"
                    : "bg-transparent border-transparent py-5"
            )}
        >
            <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-violet-200/50 shadow-sm group-hover:scale-105 transition-transform">
                        <Image src="/oichat-icon.jpg" alt="OiChat" fill className="object-cover" />
                    </div>
                    <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-violet-400 dark:from-violet-400 dark:to-violet-200">
                        OiChat
                    </span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="text-sm font-medium text-muted-foreground hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                        >
                            {link.name}
                        </Link>
                    ))}
                    <div className="h-4 w-[1px] bg-border/60" />
                    <Link href="/login">
                        <Button variant="ghost" className="text-sm font-medium hover:bg-violet-50 dark:hover:bg-violet-950/30">
                            Entrar
                        </Button>
                    </Link>
                    <Link href="/checkout">
                        <Button className="bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-600/20 transition-all hover:scale-105 active:scale-95">
                            Começar Teste Grátis
                        </Button>
                    </Link>
                </nav>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden p-2 text-foreground hover:bg-violet-50 dark:hover:bg-violet-950/30 rounded-md transition-colors"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-lg border-b border-border p-6 flex flex-col gap-4 animate-in slide-in-from-top-2 duration-300">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="text-lg font-medium py-2 border-b border-border/40"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            {link.name}
                        </Link>
                    ))}
                    <div className="flex flex-col gap-3 pt-4">
                        <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                            <Button variant="outline" className="w-full justify-center border-violet-200 dark:border-violet-800">
                                Entrar
                            </Button>
                        </Link>
                        <Link href="/checkout" onClick={() => setMobileMenuOpen(false)}>
                            <Button className="w-full justify-center bg-violet-600 text-white">
                                Começar Teste Grátis
                            </Button>
                        </Link>
                    </div>
                </div>
            )}
        </header>
    )
}

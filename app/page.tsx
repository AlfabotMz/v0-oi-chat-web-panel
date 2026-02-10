"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Check, MessageSquare, Zap, BarChart3, Shield, Smartphone, Globe, Users, Menu, X, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BusinessPlanDialog } from "@/components/landing/business-plan-dialog"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { FadeIn } from "@/components/animations/fade-in"
import { WhatsAppSupport } from "@/components/ui/whatsapp-support"

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen)

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground overflow-x-hidden selection:bg-primary/20 selection:text-primary">
      {/* Navbar */}
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent",
          isScrolled ? "bg-background/80 backdrop-blur-md border-border/50 py-3 shadow-sm" : "bg-transparent py-5"
        )}
      >
        <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8 overflow-hidden">
              <Image src="/oichat-icon.jpg" alt="OiChat Logo" fill className="object-cover" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
              OiChat
            </span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors">
              Recursos
            </Link>
            <Link href="#plans" className="text-sm font-medium hover:text-primary transition-colors">
              Planos
            </Link>
            <Link href="/login">
              <Button variant="ghost" className="text-sm font-medium">
                Entrar
              </Button>
            </Link>
            <Link href="/login">
              <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 transition-all hover:scale-105">
                Começar Agora
              </Button>
            </Link>
          </nav>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden p-2 text-foreground" onClick={toggleMobileMenu}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-background border-b border-border p-4 flex flex-col gap-4 animate-in slide-in-from-top-5">
            <Link href="#features" className="text-sm font-medium p-2 hover:bg-muted rounded-md" onClick={toggleMobileMenu}>
              Recursos
            </Link>
            <Link href="#plans" className="text-sm font-medium p-2 hover:bg-muted rounded-md" onClick={toggleMobileMenu}>
              Planos
            </Link>
            <div className="flex flex-col gap-2 mt-2">
              <Link href="/login" onClick={toggleMobileMenu}>
                <Button variant="outline" className="w-full justify-center">
                  Entrar
                </Button>
              </Link>
              <Link href="/login" onClick={toggleMobileMenu}>
                <Button className="w-full justify-center bg-primary text-white">
                  Começar Agora
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 pt-20">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 overflow-hidden">
          {/* Background Elements */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/10 rounded-full blur-[100px] -z-10 opacity-50 animate-pulse" />
          <div className="absolute bottom-0 left-0 right-0 h-[200px] bg-gradient-to-t from-background to-transparent z-10" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

          <div className="container mx-auto px-4 md:px-6 text-center relative z-10">
            <FadeIn delay={100} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-6 border border-primary/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Nova Geração de IA para WhatsApp
            </FadeIn>

            <FadeIn delay={200}>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
                Automatize seu atendimento <br className="hidden md:block" />
                com <span className="text-primary">Inteligência Artificial</span>
              </h1>
            </FadeIn>

            <FadeIn delay={300}>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                Crie agentes inteligentes que respondem 24/7, qualificam leads e agendam reuniões automaticamente no WhatsApp.
              </p>
            </FadeIn>

            <FadeIn delay={400} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="#plans">
                <Button size="lg" className="h-12 px-8 text-base bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all hover:-translate-y-1">
                  Começar Agora <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </FadeIn>

            {/* Dashboard Preview */}
            <FadeIn delay={500} className="hidden md:block mt-16 relative mx-auto max-w-5xl">
              <div className="relative rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm shadow-2xl overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-10 bg-muted/50 border-b border-border/50 flex items-center px-4 gap-2 z-20">
                  <div className="w-3 h-3 rounded-full bg-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                  <div className="w-3 h-3 rounded-full bg-green-500/50" />
                </div>
                {/* Mobile Preview Image */}
                <div className="md:hidden aspect-[9/16] relative bg-zinc-900">
                  <Image
                    src="/mobile-dashboard-preview.png"
                    alt="OiChat Mobile Preview"
                    fill
                    className="object-cover"
                  />
                </div>
                {/* Desktop Preview Image */}
                <div className="hidden md:block aspect-[16/9] relative bg-zinc-950/50">
                  <Image
                    src="/dashboard-v3.png"
                    alt="OiChat Dashboard Preview"
                    fill
                    className="object-contain p-4 opacity-100 transition-opacity"
                  />
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -right-10 top-20 p-4 bg-card rounded-xl border border-border shadow-xl animate-bounce duration-[3000ms] hidden lg:block">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Novo Lead</p>
                    <p className="text-xs text-muted-foreground">Qualificado via WhatsApp</p>
                  </div>
                </div>
              </div>

              <div className="absolute -left-10 bottom-20 p-4 bg-card rounded-xl border border-border shadow-xl animate-bounce duration-[4000ms] hidden lg:block">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">+150 Conversas</p>
                    <p className="text-xs text-muted-foreground">Hoje</p>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* Features Carousel Section */}
        <section id="features" className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-16">
              <FadeIn>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Tudo que você precisa</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Ferramentas poderosas para automatizar e escalar seu atendimento no WhatsApp.
                </p>
              </FadeIn>
            </div>

            <FadeIn delay={200}>
              <Carousel
                opts={{
                  align: "start",
                  loop: true,
                }}
                className="w-full max-w-5xl mx-auto"
              >
                <CarouselContent className="-ml-4">
                  {[
                    {
                      icon: <MessageSquare className="w-8 h-8 text-primary" />,
                      title: "Respostas Instantâneas",
                      desc: "Atenda seus clientes em segundos, 24 horas por dia, 7 dias por semana."
                    },
                    {
                      icon: <Zap className="w-8 h-8 text-yellow-500" />,
                      title: "IA Avançada",
                      desc: "Utilize modelos de linguagem de ponta para conversas naturais e eficientes."
                    },
                    {
                      icon: <BarChart3 className="w-8 h-8 text-blue-500" />,
                      title: "Analytics em Tempo Real",
                      desc: "Acompanhe métricas de desempenho e insights sobre suas conversas."
                    },
                    {
                      icon: <Shield className="w-8 h-8 text-green-500" />,
                      title: "Segurança Total",
                      desc: "Seus dados e conversas protegidos com criptografia de ponta a ponta."
                    },
                    {
                      icon: <Smartphone className="w-8 h-8 text-purple-500" />,
                      title: "Mobile First",
                      desc: "Gerencie tudo pelo celular com nossa interface otimizada."
                    },
                    {
                      icon: <Globe className="w-8 h-8 text-cyan-500" />,
                      title: "Multi-idiomas",
                      desc: "Atenda clientes em qualquer lugar do mundo em seu idioma nativo."
                    }
                  ].map((feature, index) => (
                    <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-1/3">
                      <div className="p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all hover:shadow-lg h-full flex flex-col">
                        <div className="mb-4 p-3 bg-background rounded-xl w-fit shadow-sm">
                          {feature.icon}
                        </div>
                        <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="hidden md:flex" />
                <CarouselNext className="hidden md:flex" />
              </Carousel>
            </FadeIn>
          </div>
        </section>

        {/* Plans Section */}
        <section id="plans" className="py-20 relative">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-16">
              <FadeIn>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Planos Simples e Transparentes</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Comece grátis e escale conforme seu negócio cresce. Sem contratos de longo prazo.
                </p>
              </FadeIn>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Free Trial Plan */}
              <FadeIn delay={400} className="relative rounded-2xl border-2 border-primary bg-card p-8 shadow-xl transform md:-translate-y-4">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-sm font-medium">
                  Recomendado
                </div>
                <div className="mb-6">
                  <h3 className="text-2xl font-bold">Plano Pro</h3>
                  <p className="text-muted-foreground mt-2">Tudo que você precisa para automatizar</p>
                </div>
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold">7 Dias Grátis</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Depois apenas 960 MT/mês
                  </p>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary" />
                    <span>Agentes Ilimitados</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary" />
                    <span>Respostas Ilimitadas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary" />
                    <span>Suporte Prioritário 24/7</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary" />
                    <span>Configuração Assistida</span>
                  </li>
                </ul>
                <Link href="/checkout">
                  <Button className="w-full h-12 text-lg bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25">
                    Começar Teste Grátis
                  </Button>
                </Link>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5 -z-10" />
          <div className="container mx-auto px-4 md:px-6 text-center">
            <FadeIn className="max-w-3xl mx-auto bg-card p-8 md:p-12 rounded-3xl border border-primary/20 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

              <h2 className="text-3xl md:text-4xl font-bold mb-6">Pronto para transformar seu atendimento?</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Teste todos os recursos da OiChat por <strong className="text-foreground">7 dias totalmente grátis</strong>.
                Sem compromisso, cancele quando quiser.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/checkout" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full h-14 px-8 text-lg bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20">
                    Começar Teste Grátis
                  </Button>
                </Link>
              </div>

              <div className="mt-8 flex items-center justify-center gap-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Check className="w-4 h-4 text-primary" /> Checkout Seguro via Stripe</span>
                <span className="flex items-center gap-1"><Check className="w-4 h-4 text-primary" /> Ativação Imediata</span>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 border-t border-border bg-muted/20">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center gap-2 mb-4">
                  <div className="relative w-6 h-6 rounded overflow-hidden">
                    <Image src="/oichat-icon.jpg" alt="OiChat Logo" fill className="object-cover" />
                  </div>
                  <span className="text-xl font-bold">OiChat</span>
                </div>
                <p className="text-muted-foreground max-w-xs">
                  Plataforma líder em automação de atendimento via WhatsApp com Inteligência Artificial.
                </p>
              </div>
              <div>
                <h4 className="font-bold mb-4">Produto</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><Link href="#" className="hover:text-primary">Recursos</Link></li>
                  <li><Link href="#" className="hover:text-primary">Planos</Link></li>
                  <li><Link href="#" className="hover:text-primary">Integrações</Link></li>
                  <li><Link href="#" className="hover:text-primary">Changelog</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4">Empresa</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><Link href="#" className="hover:text-primary">Sobre</Link></li>
                  <li><Link href="#" className="hover:text-primary">Blog</Link></li>
                  <li><Link href="#" className="hover:text-primary">Carreiras</Link></li>
                  <li><Link href="#" className="hover:text-primary">Contato</Link></li>
                </ul>
              </div>
            </div>
            <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
              <p>© 2024 OiChat. Todos os direitos reservados.</p>
              <div className="flex gap-6">
                <Link href="#" className="hover:text-primary">Termos</Link>
                <Link href="#" className="hover:text-primary">Privacidade</Link>
              </div>
            </div>
          </div>
        </footer>
      </main>
      <WhatsAppSupport />
    </div>
  )
}

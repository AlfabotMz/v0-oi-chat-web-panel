import { Button } from "@/components/ui/button"
import Link from "next/link"
import { MessageCircle, Zap, BarChart3, Shield, Crown, Check, ArrowRight, Sparkles } from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 via-purple-700 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-purple-700 to-blue-600 bg-clip-text text-transparent">
              OiChat
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="hidden sm:flex">
                Entrar
              </Button>
            </Link>
            <Link href="/login">
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg shadow-purple-500/25">
                Começar Agora
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-blue-500/5 to-pink-500/5" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
        {/* Ondas de fundo animadas */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <svg className="absolute bottom-0 left-0 w-[200%] h-full animate-wave opacity-30" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path fill="url(#wave-gradient)" fillOpacity="0.2" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,154.7C960,171,1056,181,1152,165.3C1248,149,1344,107,1392,85.3L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
            <defs>
              <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: 'rgb(147, 51, 234)', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: 'rgb(59, 130, 246)', stopOpacity: 1 }} />
              </linearGradient>
            </defs>
          </svg>
          <svg className="absolute bottom-0 left-0 w-[200%] h-full animate-wave opacity-20" style={{ animationDelay: '10s', animationDuration: '25s' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path fill="url(#wave-gradient-2)" fillOpacity="0.25" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,197.3C672,192,768,160,864,154.7C960,149,1056,171,1152,181.3C1248,192,1344,192,1392,192L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
            <defs>
              <linearGradient id="wave-gradient-2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: 'rgb(59, 130, 246)', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: 'rgb(147, 51, 234)', stopOpacity: 1 }} />
              </linearGradient>
            </defs>
          </svg>
        </div>
        {/* Ondas de fundo */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <svg className="absolute bottom-0 left-0 w-full h-full animate-wave" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path fill="url(#wave-gradient)" fillOpacity="0.1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,154.7C960,171,1056,181,1152,165.3C1248,149,1344,107,1392,85.3L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
            <defs>
              <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgb(147, 51, 234)" stopOpacity="0.3" />
                <stop offset="50%" stopColor="rgb(59, 130, 246)" stopOpacity="0.3" />
                <stop offset="100%" stopColor="rgb(236, 72, 153)" stopOpacity="0.3" />
              </linearGradient>
            </defs>
          </svg>
          <svg className="absolute bottom-0 left-0 w-full h-full animate-wave" style={{ animationDelay: '10s' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path fill="url(#wave-gradient-2)" fillOpacity="0.05" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,208C672,213,768,203,864,186.7C960,171,1056,149,1152,154.7C1248,160,1344,192,1392,208L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
            <defs>
              <linearGradient id="wave-gradient-2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.3" />
                <stop offset="50%" stopColor="rgb(236, 72, 153)" stopOpacity="0.3" />
                <stop offset="100%" stopColor="rgb(147, 51, 234)" stopOpacity="0.3" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="relative max-w-5xl mx-auto text-center space-y-8">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-950/50 dark:to-blue-950/50 text-purple-700 dark:text-purple-300 text-sm font-medium border border-purple-200/50 dark:border-purple-800/50">
              <Sparkles className="w-4 h-4" />
              Automação Inteligente de WhatsApp com IA
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-balance leading-tight">
              <span className="bg-gradient-to-r from-purple-600 via-purple-700 to-blue-600 bg-clip-text text-transparent">
                Automatize Conversas
              </span>
              <br />
              <span className="text-foreground">com Agentes IA Poderosos</span>
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground text-balance max-w-3xl mx-auto leading-relaxed">
              Crie, gerencie e monitore agentes virtuais de WhatsApp inteligentes. Otimize suporte ao cliente,
              responda enquetes em escala e crie fluxos avançados de automação.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/login">
              <Button size="lg" className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-xl shadow-purple-500/25 text-base px-8 py-6 h-auto">
                Teste Grátis de 7 Dias
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>

          <div className="pt-8 flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>Sem cartão de crédito</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>Configuração em minutos</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>Suporte 24/7</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative bg-gradient-to-b from-background to-muted/20 px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
              Recursos <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Poderosos</span>
            </h3>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Tudo o que você precisa para criar e gerenciar agentes inteligentes de WhatsApp
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            <div className="group relative p-6 rounded-2xl border border-border/50 bg-card/50 hover:bg-card hover:border-purple-200/50 dark:hover:border-purple-800/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-950/50 dark:to-purple-900/50 group-hover:scale-110 transition-transform duration-300 mb-4">
                <MessageCircle className="w-7 h-7 text-purple-600 dark:text-purple-400" />
              </div>
              <h4 className="font-bold text-lg text-foreground mb-2">Conversas Inteligentes</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Respostas baseadas em IA que entendem contexto e entregam interações personalizadas e naturais
              </p>
            </div>



            <div className="group relative p-6 rounded-2xl border border-border/50 bg-card/50 hover:bg-card hover:border-green-200/50 dark:hover:border-green-800/50 transition-all duration-300 hover:shadow-xl hover:shadow-green-500/10">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-green-100 to-green-200 dark:from-green-950/50 dark:to-green-900/50 group-hover:scale-110 transition-transform duration-300 mb-4">
                <BarChart3 className="w-7 h-7 text-green-600 dark:text-green-400" />
              </div>
              <h4 className="font-bold text-lg text-foreground mb-2">Análises em Tempo Real</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Acompanhe a performance dos agentes com métricas detalhadas e insights acionáveis
              </p>
            </div>

            <div className="group relative p-6 rounded-2xl border border-border/50 bg-card/50 hover:bg-card hover:border-orange-200/50 dark:hover:border-orange-800/50 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/10">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-950/50 dark:to-orange-900/50 group-hover:scale-110 transition-transform duration-300 mb-4">
                <Shield className="w-7 h-7 text-orange-600 dark:text-orange-400" />
              </div>
              <h4 className="font-bold text-lg text-foreground mb-2">Segurança Corporativa</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Criptografia de ponta a ponta e segurança em nível de linha para proteger todos os dados
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-20 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-blue-600/10 to-pink-600/10" />
        import Link from "next/link"
        import {Button} from "@/components/ui/button"
        import {ArrowRight, CheckCircle2, MessageSquare, Zap, BarChart3, Shield, Globe, Bot} from "lucide-react"

        export default function LandingPage() {
  return (
        <div className="flex flex-col min-h-screen bg-[#0A0A0A] text-white overflow-hidden selection:bg-purple-500/30">
          {/* Navbar */}
          <header className="px-4 lg:px-6 h-20 flex items-center fixed w-full bg-[#0A0A0A]/80 backdrop-blur-xl z-50 border-b border-white/5">
            <Link className="flex items-center justify-center gap-2 group" href="#">
              <div className="p-2 bg-gradient-to-tr from-purple-600 to-blue-600 rounded-lg group-hover:scale-110 transition-transform">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight">OiChat</span>
            </Link>
            <nav className="ml-auto flex gap-4 sm:gap-8">
              <Link className="text-sm font-medium text-zinc-400 hover:text-white transition-colors" href="#features">
                Recursos
              </Link>
              <Link className="text-sm font-medium text-zinc-400 hover:text-white transition-colors" href="#pricing">
                Preços
              </Link>
              <Link className="text-sm font-medium text-zinc-400 hover:text-white transition-colors" href="/login">
                Login
              </Link>
              <Link
                className="text-sm font-medium bg-white text-black px-4 py-2 rounded-full hover:bg-zinc-200 transition-colors"
                href="/onboarding"
              >
                Começar Agora
              </Link>
            </nav>
          </header>

          <main className="flex-1 pt-20">
            {/* Hero Section */}
            <section className="w-full py-24 md:py-32 lg:py-40 relative">
              {/* Background Gradients */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse delay-1000" />
              </div>

              <div className="container px-4 md:px-6 mx-auto">
                <div className="flex flex-col items-center space-y-8 text-center">
                  <div className="inline-flex items-center rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-sm font-medium text-purple-300 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    <span className="flex h-2 w-2 rounded-full bg-purple-500 mr-2 animate-pulse"></span>
                    Nova Geração de IA para WhatsApp
                  </div>

                  <h1 className="text-4xl font-bold tracking-tighter sm:text-6xl md:text-7xl lg:text-8xl bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-zinc-500 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200 max-w-4xl">
                    Automatize seu atendimento com <span className="text-purple-500">Inteligência</span>
                  </h1>

                  <p className="mx-auto max-w-[700px] text-zinc-400 md:text-xl lg:text-2xl animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                    Crie agentes de IA que atendem, vendem e suportam seus clientes 24/7 no WhatsApp. Configure em minutos, sem código.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 min-w-[200px] animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-400">
                    <Link href="/onboarding">
                      <Button className="w-full sm:w-auto h-12 px-8 rounded-full bg-white text-black hover:bg-zinc-200 text-lg transition-all hover:scale-105">
                        Criar meu Agente
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                    <Link href="#demo">
                      <Button variant="outline" className="w-full sm:w-auto h-12 px-8 rounded-full border-zinc-800 text-zinc-300 hover:bg-zinc-900 hover:text-white text-lg backdrop-blur-sm">
                        Ver Demonstração
                      </Button>
                    </Link>
                  </div>

                  {/* 3D-like Dashboard Preview */}
                  <div className="mt-16 relative w-full max-w-5xl mx-auto perspective-1000 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
                    <div className="relative rounded-xl bg-zinc-900/50 border border-white/10 p-2 shadow-2xl transform rotate-x-12 hover:rotate-x-0 transition-transform duration-700 ease-out">
                      <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 to-blue-500/10 rounded-xl pointer-events-none" />
                      <img
                        alt="Dashboard Preview"
                        className="rounded-lg w-full h-auto border border-white/5 shadow-2xl"
                        src="/placeholder.svg?height=720&width=1280" // Replace with actual screenshot later
                        width={1280}
                        height={720}
                      />

                      {/* Floating Elements */}
                      <div className="absolute -right-12 top-1/4 p-4 bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl animate-bounce delay-700 hidden md:block">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-500/20 rounded-lg">
                            <Zap className="w-6 h-6 text-green-500" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-zinc-400">Vendas Hoje</p>
                            <p className="text-xl font-bold text-white">+127%</p>
                          </div>
                        </div>
                      </div>

                      <div className="absolute -left-12 bottom-1/4 p-4 bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl animate-bounce delay-1000 hidden md:block">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-500/20 rounded-lg">
                            <MessageSquare className="w-6 h-6 text-blue-500" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-zinc-400">Mensagens</p>
                            <p className="text-xl font-bold text-white">2.4k</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="w-full py-24 bg-zinc-950 relative overflow-hidden">
              <div className="container px-4 md:px-6 mx-auto relative z-10">
                <div className="text-center mb-16">
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-white mb-4">
                    Poderoso. Simples. <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Inteligente.</span>
                  </h2>
                  <p className="text-zinc-400 max-w-[600px] mx-auto text-lg">
                    Tudo que você precisa para escalar seu atendimento no WhatsApp sem aumentar a equipe.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                    {
                      icon: Bot,
                      title: "IA Personalizável",
                      desc: "Treine seu agente com seus próprios dados e defina a personalidade ideal para sua marca.",
                      color: "text-purple-400",
                      bg: "bg-purple-500/10",
                      border: "border-purple-500/20"
                    },
                    {
                      icon: Zap,
                      title: "Respostas Instantâneas",
                      desc: "Nunca mais deixe um cliente esperando. Atendimento imediato 24 horas por dia.",
                      color: "text-yellow-400",
                      bg: "bg-yellow-500/10",
                      border: "border-yellow-500/20"
                    },
                    {
                      icon: BarChart3,
                      title: "Analytics Avançado",
                      desc: "Acompanhe métricas de conversão, tempo de resposta e satisfação em tempo real.",
                      color: "text-blue-400",
                      bg: "bg-blue-500/10",
                      border: "border-blue-500/20"
                    },
                    {
                      icon: Shield,
                      title: "Segurança Total",
                      desc: "Seus dados e de seus clientes protegidos com criptografia de ponta a ponta.",
                      color: "text-green-400",
                      bg: "bg-green-500/10",
                      border: "border-green-500/20"
                    },
                    {
                      icon: Globe,
                      title: "Multi-idioma",
                      desc: "Atenda clientes de todo o mundo. Nossa IA fala fluentemente mais de 50 idiomas.",
                      color: "text-pink-400",
                      bg: "bg-pink-500/10",
                      border: "border-pink-500/20"
                    },
                    {
                      icon: MessageSquare,
                      title: "Transbordo Humano",
                      desc: "A IA transfere para um humano automaticamente quando necessário ou solicitado.",
                      color: "text-orange-400",
                      bg: "bg-orange-500/10",
                      border: "border-orange-500/20"
                    }
                  ].map((feature, i) => {
                    const Icon = feature.icon
                    return (
                      <div
                        key={i}
                        className={`group p-8 rounded-3xl border bg-zinc-900/50 hover:bg-zinc-900 transition-all duration-300 hover:-translate-y-2 ${feature.border}`}
                      >
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${feature.bg}`}>
                          <Icon className={`w-7 h-7 ${feature.color}`} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                        <p className="text-zinc-400 leading-relaxed">
                          {feature.desc}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>
            </section>

            {/* CTA Section */}
            <section className="w-full py-24 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 to-[#0A0A0A]" />
              <div className="container px-4 md:px-6 mx-auto relative z-10">
                <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-[3rem] p-12 md:p-24 text-center border border-white/10 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] opacity-20" />
                  <div className="relative z-10 max-w-3xl mx-auto space-y-8">
                    <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                      Pronto para revolucionar seu atendimento?
                    </h2>
                    <p className="text-xl text-zinc-300">
                      Junte-se a centenas de empresas que já automatizaram seu WhatsApp com o OiChat.
                    </p>
                    <Link href="/onboarding">
                      <Button className="h-14 px-10 rounded-full bg-white text-black hover:bg-zinc-200 text-lg font-semibold shadow-2xl shadow-white/20 transition-all hover:scale-105">
                        Começar Gratuitamente
                      </Button>
                    </Link>
                    <p className="text-sm text-zinc-500">
                      Não requer cartão de crédito • Setup em 2 minutos
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </main>

          <footer className="py-12 px-4 md:px-6 border-t border-white/5 bg-[#0A0A0A]">
            <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-white/5 rounded-lg">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-bold text-white">OiChat</span>
              </div>
              <p className="text-sm text-zinc-500">
                © 2024 OiChat Inc. Todos os direitos reservados.
              </p>
              <div className="flex gap-6">
                <Link className="text-sm text-zinc-500 hover:text-white transition-colors" href="#">
                  Termos
                </Link>
                <Link className="text-sm text-zinc-500 hover:text-white transition-colors" href="#">
                  Privacidade
                </Link>
                <Link className="text-sm text-zinc-500 hover:text-white transition-colors" href="#">
                  Contato
                </Link>
              </div>
            </div>
          </footer>
        </div>
        )
}

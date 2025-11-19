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
                <stop offset="0%" style={{stopColor: 'rgb(147, 51, 234)', stopOpacity: 1}} />
                <stop offset="100%" style={{stopColor: 'rgb(59, 130, 246)', stopOpacity: 1}} />
              </linearGradient>
            </defs>
          </svg>
          <svg className="absolute bottom-0 left-0 w-[200%] h-full animate-wave opacity-20" style={{animationDelay: '10s', animationDuration: '25s'}} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path fill="url(#wave-gradient-2)" fillOpacity="0.25" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,197.3C672,192,768,160,864,154.7C960,149,1056,171,1152,181.3C1248,192,1344,192,1392,192L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
            <defs>
              <linearGradient id="wave-gradient-2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{stopColor: 'rgb(59, 130, 246)', stopOpacity: 1}} />
                <stop offset="100%" style={{stopColor: 'rgb(147, 51, 234)', stopOpacity: 1}} />
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
              responda enquetes em escala e integre com n8n para fluxos avançados de automação.
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

            <div className="group relative p-6 rounded-2xl border border-border/50 bg-card/50 hover:bg-card hover:border-blue-200/50 dark:hover:border-blue-800/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-950/50 dark:to-blue-900/50 group-hover:scale-110 transition-transform duration-300 mb-4">
                <Zap className="w-7 h-7 text-blue-600 dark:text-blue-400" />
              </div>
              <h4 className="font-bold text-lg text-foreground mb-2">Integração n8n</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Conecte com n8n para automação avançada e orquestração de fluxos complexos
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
        <div className="relative max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
              Pronto para <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">automatizar</span>?
            </h3>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Comece a construir agentes de WhatsApp inteligentes em minutos. 
              Sem cartão de crédito obrigatório. Configure em menos de 5 minutos.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login">
              <Button size="lg" className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-xl shadow-purple-500/25 text-base px-8 py-6 h-auto">
                Criar Conta Agora
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-purple-200/20 bg-card/50 px-6 py-8 mt-auto">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold text-foreground mb-4">OiChat</h4>
              <p className="text-sm text-muted-foreground">
                Plataforma de gerenciamento de agentes WhatsApp inteligentes
              </p>
            </div>
            <div>
              <h4 className="font-bold text-foreground mb-4">Produto</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    Recursos
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    Preços
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-foreground mb-4">Empresa</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    Sobre
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    Contato
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    Privacidade
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    Termos
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-purple-200/20 pt-8">
            <p className="text-sm text-muted-foreground text-center">
              &copy; 2025 OiChat. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

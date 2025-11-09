import { Button } from "@/components/ui/button"
import Link from "next/link"
import { MessageCircle, Zap, BarChart3, Shield, Crown } from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-purple-200/20 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
              OiChat
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="outline" className="border-purple-200/30 bg-transparent">
                Entrar
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="max-w-3xl text-center space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100/50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 text-sm font-medium">
              <Zap className="w-4 h-4" />
              Automação Inteligente de WhatsApp
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-balance text-foreground">
              Automatize Conversas com Agentes IA Poderosos
            </h2>
            <p className="text-xl text-muted-foreground text-balance">
              Crie, gerencie e monitore agentes virtuais de WhatsApp. Otimize suporte ao cliente, responda enquetes em
              escala e integre com n8n para fluxos avançados.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login">
              <Button size="lg" className="gap-2 bg-purple-600 hover:bg-purple-700">
                <MessageCircle className="w-5 h-5" />
                Começar Agora
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-card/50 px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-foreground mb-4">Recursos Poderosos</h3>
            <p className="text-muted-foreground text-lg">Tudo o que você precisa para gerenciar agentes inteligentes</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-purple-100/50 dark:bg-purple-950/30">
                <MessageCircle className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h4 className="font-bold text-foreground">Conversas Inteligentes</h4>
              <p className="text-sm text-muted-foreground">
                Respostas baseadas em IA que entendem contexto e entregam interações personalizadas
              </p>
            </div>

            <div className="space-y-3">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-purple-100/50 dark:bg-purple-950/30">
                <Zap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h4 className="font-bold text-foreground">Integração n8n</h4>
              <p className="text-sm text-muted-foreground">
                Conecte com n8n para automação avançada e orquestração de fluxos
              </p>
            </div>

            <div className="space-y-3">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-purple-100/50 dark:bg-purple-950/30">
                <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h4 className="font-bold text-foreground">Análises em Tempo Real</h4>
              <p className="text-sm text-muted-foreground">
                Acompanhe a performance dos agentes com métricas e insights detalhados
              </p>
            </div>

            <div className="space-y-3">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-purple-100/50 dark:bg-purple-950/30">
                <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h4 className="font-bold text-foreground">Segurança Corporativa</h4>
              <p className="text-sm text-muted-foreground">
                Criptografia de ponta a ponta e segurança em nível de linha para todos os dados
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h3 className="text-3xl font-bold text-foreground">Pronto para automatizar?</h3>
          <p className="text-lg text-muted-foreground">
            Comece a construir agentes de WhatsApp inteligentes em minutos. Sem cartão de crédito obrigatório.
          </p>
          <Link href="/login">
            <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
              Criar Conta Agora
            </Button>
          </Link>
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

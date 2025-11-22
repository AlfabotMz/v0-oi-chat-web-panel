import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle2, MessageSquare, Zap, BarChart3, Shield, Globe, Bot } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0A0A0A] text-white overflow-hidden selection:bg-purple-500/30">
      {/* Navbar */}
      <header className="px-4 lg:px-6 h-20 flex items-center fixed w-full bg-[#0A0A0A]/80 backdrop-blur-xl z-50 border-b border-white/5">
        <Link className="flex items-center justify-center gap-2 group" href="#">
          <div className="relative w-10 h-10 overflow-hidden rounded-lg group-hover:scale-110 transition-transform">
            <img
              src="/oichat-icon.jpg"
              alt="OiChat Icon"
              className="object-cover w-full h-full"
            />
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
                <Link href="/login">
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
                <div className="relative rounded-xl bg-zinc-900/50 border border-white/10 shadow-2xl transform rotate-x-12 hover:rotate-x-0 transition-transform duration-700 ease-out overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 to-blue-500/10 pointer-events-none" />

                  {/* Mobile Image */}
                  <img
                    alt="Dashboard Preview Mobile"
                    className="w-full h-auto md:hidden"
                    src="/oichat-icon.jpg"
                    width={1280}
                    height={720}
                  />

                  {/* Desktop Image */}
                  <img
                    alt="Dashboard Preview Desktop"
                    className="w-full h-auto hidden md:block"
                    src="/dashboard-v3.png"
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
                <Link href="/login">
                  <Button className="h-14 px-10 rounded-full bg-white text-black hover:bg-zinc-200 text-lg font-semibold shadow-2xl shadow-white/20 transition-all hover:scale-105">
                    Começar Gratuitamente
                  </Button>
                </Link>
                <p className="text-sm text-zinc-500">
                  Teste 7 dias gratis depois 15$/mes ou pagar agora 15$ e ganhar mais um mes gratis de bonus
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

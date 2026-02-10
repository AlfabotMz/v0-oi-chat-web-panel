"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { X, ChevronRight, ChevronLeft, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface TourStep {
    target: string
    title: string
    content: string
    position: "top" | "bottom" | "left" | "right"
}

const tourSteps: TourStep[] = [
    {
        target: '[data-tour="nav-agents"]',
        title: "Agentes de IA",
        content: "Este é o seu centro de comando. Aqui você cria e gerencia seus assistentes virtuais.",
        position: "right"
    },
    {
        target: '[data-tour="nav-remarketing"]',
        title: "Remarketing Automático",
        content: "Recupere carrinhos abandonados automaticamente. Em breve para sua conta!",
        position: "right"
    },
    {
        target: '[data-tour="nav-performance"]',
        title: "Performance",
        content: "Veja quantos leads e vendas cada agente está gerando para seu negócio.",
        position: "right"
    },
    {
        target: '[data-tour="mobile-menu-button"]',
        title: "Menu de Opções",
        content: "Clique aqui para abrir o menu lateral e ver configurações extras.",
        position: "bottom"
    },
    {
        target: '[data-tour="nav-settings"]',
        title: "Configurações & Perfil",
        content: "Personalize seu painel, gerencie seu plano e altere seus dados aqui.",
        position: "right"
    },
    {
        target: '[data-tour="mobile-menu-close"]',
        title: "Tudo Pronto?",
        content: "Feche o menu para voltar à tela principal e continuar o tour!",
        position: "right"
    },
    {
        target: '[data-tour="header-support"]',
        title: "Ajuda & Suporte",
        content: "Dúvidas? Fale conosco no WhatsApp a qualquer momento por aqui.",
        position: "bottom"
    },
    {
        target: '[data-tour="dashboard-stats"]',
        title: "Seus Resultados",
        content: "Acompanhe o volume de mensagens e conversões nos últimos dias.",
        position: "bottom"
    },
    {
        target: '[data-tour="create-agent-button"]',
        title: "Vamos Começar?",
        content: "Clique aqui para criar seu primeiro agente e ver a mágica acontecer!",
        position: "bottom"
    },
    {
        target: '[data-tour="agent-dialog-step-1"]',
        title: "Identidade",
        content: "Defina o nome do agente e o que ele vai vender. Importante para as notificações!",
        position: "right"
    },
    {
        target: '[data-tour="agent-dialog-step-2"]',
        title: "A Alma do Agente",
        content: "Diga à IA como ela deve agir. Seja específico nas instruções!",
        position: "right"
    },
    {
        target: '[data-tour="agent-dialog-step-3"]',
        title: "Revisão Final",
        content: "Revise tudo antes de ativar seu novo consultor digital.",
        position: "right"
    },
    {
        target: '[data-tour="agent-dialog-step-4"]',
        title: "Conexão WhatsApp",
        content: "Agora é só escanear o QR Code para colocar seu agente para trabalhar imediatamente!",
        position: "right"
    }
]

export function OnboardingTour() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [currentStep, setCurrentStep] = useState(-1)
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, height: 0 })
    const [isVisible, setIsVisible] = useState(false)
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 640)
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    const onboardingValue = searchParams.get("onboarding")

    useEffect(() => {
        if (onboardingValue === "true") {
            localStorage.removeItem("oichat_onboarding_completed")
            // Strict guard against double initialization
            if (currentStep === -1 && !isVisible) {
                const timer = setTimeout(() => {
                    setCurrentStep(0)
                    setIsVisible(true)
                }, 1000)
                return () => clearTimeout(timer)
            }
        }

        if (!isVisible || currentStep === -1) return

        const getVisibleElement = (selector: string) => {
            const elements = document.querySelectorAll(selector)
            for (const el of Array.from(elements)) {
                const rect = (el as HTMLElement).getBoundingClientRect()
                const style = window.getComputedStyle(el)
                // Checar se o elemento tem tamanho e não está escondido por display/visibility/opacity
                if (rect.width > 0 && rect.height > 0 &&
                    style.display !== 'none' &&
                    style.visibility !== 'hidden' &&
                    parseFloat(style.opacity || '1') > 0) {
                    return el as HTMLElement
                }
            }
            return null
        }

        const checkElement = () => {
            if (currentStep >= 0 && currentStep < tourSteps.length) {
                const step = tourSteps[currentStep]
                const element = getVisibleElement(step.target)

                if (element) {
                    const rect = element.getBoundingClientRect()
                    setCoords({
                        top: rect.top + window.scrollY,
                        left: rect.left + window.scrollX,
                        width: rect.width,
                        height: rect.height
                    })

                    element.scrollIntoView({ behavior: 'smooth', block: 'center' })
                } else if (currentStep <= 5) {
                    handleNext()
                }
            }
        }

        checkElement()
        const interval = setInterval(checkElement, 500)
        return () => clearInterval(interval)
    }, [onboardingValue, currentStep, isVisible])

    const handleNext = () => {
        if (currentStep < tourSteps.length - 1) {
            setCurrentStep(currentStep + 1)
        } else {
            handleFinish()
        }
    }

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1)
        }
    }

    const handleFinish = () => {
        setIsVisible(false)
        setCurrentStep(-1)
        localStorage.setItem("oichat_onboarding_completed", "true")

        // Remove query param and clean URL
        router.replace("/dashboard")
    }

    if (isMobile || !isVisible || currentStep === -1) return null

    const step = tourSteps[currentStep]

    return (
        <div className="fixed inset-0 z-[100] pointer-events-none">
            {/* Desktop-only Dim Overlay with Hole */}
            {!isMobile && (
                <>
                    <div className="absolute inset-0 bg-black/70 pointer-events-auto transition-all duration-500"
                        style={{
                            clipPath: `polygon(0% 0%, 0% 100%, ${coords.left}px 100%, ${coords.left}px ${coords.top}px, ${coords.left + coords.width}px ${coords.top}px, ${coords.left + coords.width}px ${coords.top + coords.height}px, ${coords.left}px ${coords.top + coords.height}px, ${coords.left}px 100%, 100% 100%, 100% 0%)`
                        }}
                    />
                    {/* Spotlight Border */}
                    <div
                        className="absolute border-2 border-primary rounded-lg shadow-[0_0_20px_rgba(168,85,247,0.5)] transition-all duration-500 pointer-events-none"
                        style={{
                            top: coords.top - 4,
                            left: coords.left - 4,
                            width: coords.width + 8,
                            height: coords.height + 8
                        }}
                    />
                </>
            )}

            {/* Mobile-only Advanced Pulse Highlighter */}
            {isMobile && coords.width > 0 && (
                <div
                    className="absolute z-50 pointer-events-none transition-all duration-500"
                    style={{
                        top: coords.top,
                        left: coords.left,
                        width: coords.width,
                        height: coords.height
                    }}
                >
                    {/* Ring 1 (Outer Ping) */}
                    <div className="absolute inset-0 rounded-lg animate-ping ring-2 ring-primary opacity-75" />
                    {/* Ring 2 (Inner Pulse) */}
                    <div className="absolute -inset-1 rounded-lg animate-pulse ring-4 ring-primary/50 shadow-[0_0_15px_rgba(168,85,247,0.5)]" />

                    {/* Pointer Arrow for Step 0 (Helping with clarity) */}
                    {currentStep === 0 && (
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 animate-bounce">
                            <div className="bg-primary text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg whitespace-nowrap border border-white/20">
                                OLHE AQUI
                            </div>
                            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-primary mx-auto" />
                        </div>
                    )}
                </div>
            )}

            {/* Tooltip / Mobile Card */}
            <div
                className={cn(
                    "pointer-events-auto bg-zinc-950/95 border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.8)] transition-all duration-500 animate-in fade-in backdrop-blur-3xl",
                    isMobile
                        ? "fixed w-[calc(100vw-32px)] left-4 rounded-[2rem] p-6 slide-in-from-bottom-5 border-white/20"
                        : cn(
                            "absolute w-[320px] rounded-[2rem] p-8 zoom-in-95",
                            step.position === "right" && "ml-4",
                            step.position === "left" && "mr-4",
                            step.position === "bottom" && "mt-4",
                            step.position === "top" && "mb-4"
                        )
                )}
                style={isMobile
                    ? {
                        // Se o alvo estiver na metade de baixo, mostra em cima. Se não, mostra embaixo.
                        // Ajuste extra para não tampar a barra de navegação inferior (aprox 85px)
                        bottom: coords.top > (typeof window !== 'undefined' ? window.innerHeight : 600) / 2 ? 'auto' : 'calc(env(safe-area-inset-bottom, 0px) + 90px)',
                        top: coords.top > (typeof window !== 'undefined' ? window.innerHeight : 600) / 2 ? 'calc(env(safe-area-inset-top, 0px) + 24px)' : 'auto',
                        zIndex: 100
                    }
                    : {
                        top: step.position === "bottom" ? coords.top + coords.height + 12 :
                            step.position === "top" ? coords.top - 200 :
                                coords.top + (coords.height / 2) - 100,
                        left: step.position === "right" ? Math.min(coords.left + coords.width + 12, window.innerWidth - 340) :
                            step.position === "left" ? Math.max(coords.left - 332, 12) :
                                Math.max(12, Math.min(coords.left + (coords.width / 2) - 160, window.innerWidth - 340))
                    }
                }
            >
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase tracking-widest text-primary font-bold">Tutorial OiChat</span>
                        <button onClick={handleFinish} className="text-zinc-500 hover:text-white transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-lg font-bold text-white leading-tight">{step.title}</h3>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                            {step.content}
                        </p>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <div className="flex gap-1">
                            {tourSteps.map((_, i) => (
                                <div
                                    key={i}
                                    className={cn(
                                        "w-1 h-1 rounded-full transition-all",
                                        i === currentStep ? "w-4 bg-primary" : "bg-zinc-700"
                                    )}
                                />
                            ))}
                        </div>

                        <div className="flex gap-2">
                            {currentStep > 0 && (
                                <Button variant="ghost" size="sm" onClick={handleBack} className="h-8 px-2 text-zinc-400">
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                            )}
                            <Button size="sm" onClick={handleNext} className="h-8 px-4 bg-primary hover:bg-primary/90 text-white gap-1">
                                {currentStep === tourSteps.length - 1 ? (
                                    <>Finalizar <Check className="w-4 h-4" /></>
                                ) : (
                                    <>Próximo <ChevronRight className="w-4 h-4" /></>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Arrow - Only on Desktop */}
                {!isMobile && (
                    <>
                        {step.position === "right" && (
                            <div className="absolute left-[-6px] top-[50%] -translate-y-1/2 w-3 h-3 bg-zinc-900 border-l border-b border-white/10 rotate-45" />
                        )}
                        {step.position === "bottom" && (
                            <div className="absolute top-[-6px] left-[50%] -translate-x-1/2 w-3 h-3 bg-zinc-900 border-t border-l border-white/10 rotate-45" />
                        )}
                        {step.position === "top" && (
                            <div className="absolute bottom-[-6px] left-[50%] -translate-x-1/2 w-3 h-3 bg-zinc-900 border-b border-r border-white/10 rotate-45" />
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

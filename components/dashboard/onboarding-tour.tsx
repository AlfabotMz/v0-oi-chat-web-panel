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
        content: "Este é o seu centro de comando. Aqui você cria e configura seus agentes de IA personalizados para atender seus clientes.",
        position: "right"
    },
    {
        target: '[data-tour="nav-remarketing"]',
        title: "Remarketing Automático",
        content: "Nossa poderosa ferramenta de retorno para clientes que não concluíram a compra. Em breve disponível para você!",
        position: "right"
    },
    {
        target: '[data-tour="nav-performance"]',
        title: "Análise de Performance",
        content: "Acompanhe seus resultados em tempo real! Veja exatamente quantos leads cada agente está gerando.",
        position: "right"
    },
    {
        target: '[data-tour="header-support"]',
        title: "Suporte 24/7",
        content: "Qualquer dúvida, nossa equipe está a um clique de distância. Clique aqui para falar conosco pelo WhatsApp a qualquer momento.",
        position: "bottom"
    },
    {
        target: '[data-tour="dashboard-stats"]',
        title: "Métricas Rápidas",
        content: "Visão geral do volume de mensagens e conversões da sua conta nos últimos dias.",
        position: "bottom"
    },
    {
        target: '[data-tour="dashboard-agents"]',
        title: "Seus Agentes",
        content: "Gerencie todos os seus robôs ativos. Ative, desative ou edite as configurações de cada um aqui.",
        position: "top"
    }
]

export function OnboardingTour() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [currentStep, setCurrentStep] = useState(-1)
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, height: 0 })
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        if (searchParams.get("onboarding") === "true") {
            setTimeout(() => setCurrentStep(0), 1000) // Delay to ensure layout is ready
            setIsVisible(true)
        }
    }, [searchParams])

    useEffect(() => {
        if (currentStep >= 0 && currentStep < tourSteps.length) {
            const step = tourSteps[currentStep]
            const element = document.querySelector(step.target) as HTMLElement

            if (element) {
                const rect = element.getBoundingClientRect()
                setCoords({
                    top: rect.top + window.scrollY,
                    left: rect.left + window.scrollX,
                    width: rect.width,
                    height: rect.height
                })

                element.scrollIntoView({ behavior: 'smooth', block: 'center' })
            } else {
                // Skip step if element not found
                handleNext()
            }
        }
    }, [currentStep])

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
        // Remove query param without reload
        const params = new URLSearchParams(searchParams.toString())
        params.delete("onboarding")
        router.replace(`/dashboard?${params.toString()}`)
    }

    if (!isVisible || currentStep === -1) return null

    const step = tourSteps[currentStep]

    return (
        <div className="fixed inset-0 z-[100] pointer-events-none">
            {/* Dim Overlay with Hole */}
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

            {/* Tooltip */}
            <div
                className={cn(
                    "absolute pointer-events-auto w-[300px] bg-zinc-900 border border-white/10 rounded-2xl p-6 shadow-2xl transition-all duration-500 animate-in fade-in zoom-in-95",
                    step.position === "right" && "ml-4",
                    step.position === "left" && "mr-4",
                    step.position === "bottom" && "mt-4",
                    step.position === "top" && "mb-4"
                )}
                style={{
                    top: step.position === "bottom" ? coords.top + coords.height + 12 :
                        step.position === "top" ? coords.top - 200 : // Approximation
                            coords.top + (coords.height / 2) - 100,
                    left: step.position === "right" ? coords.left + coords.width + 12 :
                        step.position === "left" ? coords.left - 312 :
                            coords.left + (coords.width / 2) - 150
                }}
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

                {/* Arrow (Approximation) */}
                {step.position === "right" && (
                    <div className="absolute left-[-6px] top-[50%] -translate-y-1/2 w-3 h-3 bg-zinc-900 border-l border-b border-white/10 rotate-45" />
                )}
                {step.position === "bottom" && (
                    <div className="absolute top-[-6px] left-[50%] -translate-x-1/2 w-3 h-3 bg-zinc-900 border-t border-l border-white/10 rotate-45" />
                )}
                {step.position === "top" && (
                    <div className="absolute bottom-[-6px] left-[50%] -translate-x-1/2 w-3 h-3 bg-zinc-900 border-b border-r border-white/10 rotate-45" />
                )}
            </div>
        </div>
    )
}

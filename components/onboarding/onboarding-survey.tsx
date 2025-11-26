"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Check, Target, Users, Globe, Phone, Briefcase, DollarSign, ShoppingBag, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface OnboardingSurveyProps {
    onComplete: (data: any) => void
}

export function OnboardingSurvey({ onComplete }: OnboardingSurveyProps) {
    const [step, setStep] = useState(1)
    const [formData, setFormData] = useState({
        source: "",
        whatsapp: "",
        businessType: "",
        monthlyRevenue: "",
        market: "",
    })

    const totalSteps = 5

    const handleNext = () => {
        if (step < totalSteps) {
            setStep(step + 1)
        } else {
            onComplete(formData)
        }
    }

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    const sources = [
        { id: "google", label: "Google", icon: Globe },
        { id: "social", label: "Redes Sociais", icon: Users },
        { id: "recommendation", label: "Indicação", icon: Check },
        { id: "other", label: "Outro", icon: Target },
    ]

    const businessTypes = [
        { id: "dropshipping", label: "Dropshipping", icon: ShoppingBag },
        { id: "plr", label: "PLR / Infoprodutos", icon: Globe },
        { id: "service", label: "Prestação de Serviços", icon: Briefcase },
        { id: "other", label: "Outro", icon: Target },
    ]

    const revenues = [
        "Até 50.000 MT",
        "50.000 MT - 200.000 MT",
        "200.000 MT - 1.000.000 MT",
        "+1.000.000 MT",
    ]

    const markets = [
        "Moçambique",
        "Angola",
        "Portugal",
        "Brasil",
        "Global",
    ]

    return (
        <div className="w-full max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                    Bem-vindo ao OiChat
                </h1>
                <p className="text-zinc-400 text-lg">
                    Vamos personalizar sua experiência em poucos cliques.
                </p>
            </div>

            <div className="bg-zinc-900/40 border border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
                {/* Background Gradients */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                    <div className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent opacity-50" />
                </div>

                {/* Step Indicator */}
                <div className="flex gap-2 mb-12">
                    {Array.from({ length: totalSteps }).map((_, i) => (
                        <div
                            key={i}
                            className={cn(
                                "h-1.5 flex-1 rounded-full transition-all duration-500",
                                i + 1 <= step ? "bg-gradient-to-r from-purple-500 to-blue-500" : "bg-white/10"
                            )}
                        />
                    ))}
                </div>

                <div className="min-h-[300px]">
                    {step === 1 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                            <h2 className="text-2xl font-semibold text-white text-center mb-8">
                                Como você nos conheceu?
                            </h2>
                            <div className="grid grid-cols-2 gap-4">
                                {sources.map((source) => {
                                    const Icon = source.icon
                                    const isSelected = formData.source === source.id
                                    return (
                                        <button
                                            key={source.id}
                                            onClick={() => handleChange("source", source.id)}
                                            className={cn(
                                                "flex flex-col items-center justify-center p-6 rounded-2xl border transition-all duration-300 group",
                                                isSelected
                                                    ? "bg-purple-500/20 border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.15)]"
                                                    : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                                            )}
                                        >
                                            <Icon className={cn(
                                                "w-8 h-8 mb-3 transition-colors duration-300",
                                                isSelected ? "text-purple-400" : "text-zinc-400 group-hover:text-white"
                                            )} />
                                            <span className={cn(
                                                "font-medium transition-colors duration-300",
                                                isSelected ? "text-white" : "text-zinc-400 group-hover:text-white"
                                            )}>{source.label}</span>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                            <h2 className="text-2xl font-semibold text-white text-center mb-8">
                                Qual seu número de WhatsApp?
                            </h2>
                            <div className="max-w-md mx-auto space-y-4">
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                                    <Input
                                        placeholder="84 123 4567"
                                        value={formData.whatsapp}
                                        onChange={(e) => handleChange("whatsapp", e.target.value)}
                                        className="pl-12 py-6 bg-white/5 border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-purple-500 text-lg"
                                    />
                                </div>
                                <p className="text-sm text-zinc-500 text-center">
                                    Usaremos para enviar dicas e atualizações importantes.
                                </p>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                            <h2 className="text-2xl font-semibold text-white text-center mb-8">
                                Qual seu modelo de negócio?
                            </h2>
                            <div className="grid grid-cols-2 gap-4">
                                {businessTypes.map((type) => {
                                    const Icon = type.icon
                                    const isSelected = formData.businessType === type.id
                                    return (
                                        <button
                                            key={type.id}
                                            onClick={() => handleChange("businessType", type.id)}
                                            className={cn(
                                                "flex flex-col items-center justify-center p-6 rounded-2xl border transition-all duration-300 group",
                                                isSelected
                                                    ? "bg-purple-500/20 border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.15)]"
                                                    : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                                            )}
                                        >
                                            <Icon className={cn(
                                                "w-8 h-8 mb-3 transition-colors duration-300",
                                                isSelected ? "text-purple-400" : "text-zinc-400 group-hover:text-white"
                                            )} />
                                            <span className={cn(
                                                "font-medium transition-colors duration-300",
                                                isSelected ? "text-white" : "text-zinc-400 group-hover:text-white"
                                            )}>{type.label}</span>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                            <h2 className="text-2xl font-semibold text-white text-center mb-8">
                                Qual seu faturamento mensal estimado?
                            </h2>
                            <div className="space-y-3">
                                {revenues.map((rev) => (
                                    <button
                                        key={rev}
                                        onClick={() => handleChange("monthlyRevenue", rev)}
                                        className={cn(
                                            "w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-300 group text-left",
                                            formData.monthlyRevenue === rev
                                                ? "bg-purple-500/20 border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.15)]"
                                                : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <DollarSign className={cn(
                                                "w-5 h-5",
                                                formData.monthlyRevenue === rev ? "text-purple-400" : "text-zinc-500"
                                            )} />
                                            <span className={cn(
                                                "font-medium transition-colors duration-300",
                                                formData.monthlyRevenue === rev ? "text-white" : "text-zinc-400 group-hover:text-white"
                                            )}>{rev}</span>
                                        </div>
                                        {formData.monthlyRevenue === rev && (
                                            <Check className="w-5 h-5 text-purple-400" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 5 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                            <h2 className="text-2xl font-semibold text-white text-center mb-8">
                                Qual seu mercado principal?
                            </h2>
                            <div className="space-y-3">
                                {markets.map((mkt) => (
                                    <button
                                        key={mkt}
                                        onClick={() => handleChange("market", mkt)}
                                        className={cn(
                                            "w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-300 group text-left",
                                            formData.market === mkt
                                                ? "bg-purple-500/20 border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.15)]"
                                                : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Globe className={cn(
                                                "w-5 h-5",
                                                formData.market === mkt ? "text-purple-400" : "text-zinc-500"
                                            )} />
                                            <span className={cn(
                                                "font-medium transition-colors duration-300",
                                                formData.market === mkt ? "text-white" : "text-zinc-400 group-hover:text-white"
                                            )}>{mkt}</span>
                                        </div>
                                        {formData.market === mkt && (
                                            <Check className="w-5 h-5 text-purple-400" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-8 pt-8 border-t border-white/10 flex justify-end">
                    <Button
                        onClick={handleNext}
                        disabled={
                            (step === 1 && !formData.source) ||
                            (step === 2 && !formData.whatsapp) ||
                            (step === 3 && !formData.businessType) ||
                            (step === 4 && !formData.monthlyRevenue) ||
                            (step === 5 && !formData.market)
                        }
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg shadow-purple-500/25 rounded-xl px-8 py-6 text-lg font-medium transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
                    >
                        {step === totalSteps ? "Concluir" : "Próximo"}
                        <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                </div>
            </div>
        </div>
    )
}

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowRight, Check, Target, Users, Globe } from "lucide-react"
import { cn } from "@/lib/utils"

interface OnboardingSurveyProps {
    onComplete: (data: any) => void
}

export function OnboardingSurvey({ onComplete }: OnboardingSurveyProps) {
    const [step, setStep] = useState(1)
    const [formData, setFormData] = useState({
        source: "",
        companySize: "",
        goal: "",
    })

    const handleNext = () => {
        if (step < 3) {
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

    const sizes = [
        "Apenas eu",
        "2-5 funcionários",
        "6-20 funcionários",
        "21-50 funcionários",
        "+50 funcionários",
    ]

    const goals = [
        { id: "support", label: "Automatizar Suporte", desc: "Responder dúvidas frequentes 24/7" },
        { id: "sales", label: "Aumentar Vendas", desc: "Qualificar leads e agendar reuniões" },
        { id: "scheduling", label: "Agendamentos", desc: "Gerenciar agenda e reservas" },
        { id: "other", label: "Outro", desc: "Necessidades específicas" },
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
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className={cn(
                                "h-1.5 flex-1 rounded-full transition-all duration-500",
                                i <= step ? "bg-gradient-to-r from-purple-500 to-blue-500" : "bg-white/10"
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
                                Qual o tamanho da sua empresa?
                            </h2>
                            <div className="space-y-3">
                                {sizes.map((size) => (
                                    <button
                                        key={size}
                                        onClick={() => handleChange("companySize", size)}
                                        className={cn(
                                            "w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-300 group text-left",
                                            formData.companySize === size
                                                ? "bg-purple-500/20 border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.15)]"
                                                : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                                        )}
                                    >
                                        <span className={cn(
                                            "font-medium transition-colors duration-300",
                                            formData.companySize === size ? "text-white" : "text-zinc-400 group-hover:text-white"
                                        )}>{size}</span>
                                        {formData.companySize === size && (
                                            <Check className="w-5 h-5 text-purple-400" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                            <h2 className="text-2xl font-semibold text-white text-center mb-8">
                                Qual seu principal objetivo?
                            </h2>
                            <div className="grid gap-4">
                                {goals.map((goal) => (
                                    <button
                                        key={goal.id}
                                        onClick={() => handleChange("goal", goal.id)}
                                        className={cn(
                                            "w-full flex items-center p-4 rounded-xl border transition-all duration-300 group text-left",
                                            formData.goal === goal.id
                                                ? "bg-purple-500/20 border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.15)]"
                                                : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                                        )}
                                    >
                                        <div className="flex-1">
                                            <div className={cn(
                                                "font-medium mb-1 transition-colors duration-300",
                                                formData.goal === goal.id ? "text-white" : "text-zinc-200 group-hover:text-white"
                                            )}>{goal.label}</div>
                                            <div className="text-sm text-zinc-500 group-hover:text-zinc-400">
                                                {goal.desc}
                                            </div>
                                        </div>
                                        {formData.goal === goal.id && (
                                            <Check className="w-5 h-5 text-purple-400 ml-4" />
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
                            (step === 2 && !formData.companySize) ||
                            (step === 3 && !formData.goal)
                        }
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg shadow-purple-500/25 rounded-xl px-8 py-6 text-lg font-medium transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
                    >
                        {step === 3 ? "Continuar" : "Próximo"}
                        <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                </div>
            </div>
        </div>
    )
}

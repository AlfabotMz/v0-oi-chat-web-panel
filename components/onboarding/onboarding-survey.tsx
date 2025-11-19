"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowRight, Building2, MessageCircle, Target, Users } from "lucide-react"

interface OnboardingSurveyProps {
    onComplete: (data: any) => void
}

export function OnboardingSurvey({ onComplete }: OnboardingSurveyProps) {
    const [step, setStep] = useState(1)
    const [formData, setFormData] = useState({
        source: "",
        businessName: "",
        whatsapp: "",
        companySize: "",
        goal: "",
    })

    const handleNext = () => {
        if (step < 4) {
            setStep(step + 1)
        } else {
            onComplete(formData)
        }
    }

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    return (
        <div className="w-full max-w-md mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-white">
                    Bem-vindo ao OiChat
                </h1>
                <p className="text-zinc-400">
                    Vamos personalizar sua experiência.
                </p>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
                {/* Step Indicator */}
                <div className="flex gap-2 mb-8">
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= step ? "bg-purple-600" : "bg-zinc-800"
                                }`}
                        />
                    ))}
                </div>

                <div className="space-y-6">
                    {step === 1 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="space-y-2">
                                <Label className="text-zinc-200">Como você conheceu a OiChat?</Label>
                                <Select onValueChange={(value) => handleChange("source", value)} value={formData.source}>
                                    <SelectTrigger className="bg-zinc-950 border-zinc-800 text-zinc-200 focus:ring-purple-600/20">
                                        <SelectValue placeholder="Selecione uma opção" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
                                        <SelectItem value="google">Google</SelectItem>
                                        <SelectItem value="social">Redes Sociais (Instagram, LinkedIn)</SelectItem>
                                        <SelectItem value="recommendation">Indicação de Amigo</SelectItem>
                                        <SelectItem value="youtube">YouTube</SelectItem>
                                        <SelectItem value="other">Outro</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="space-y-2">
                                <Label className="text-zinc-200">Nome do seu Negócio</Label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                                    <Input
                                        placeholder="Ex: TechMoz Solutions"
                                        className="pl-9 bg-zinc-950 border-zinc-800 text-zinc-200 focus:ring-purple-600/20 placeholder:text-zinc-600"
                                        value={formData.businessName}
                                        onChange={(e) => handleChange("businessName", e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-zinc-200">WhatsApp Comercial</Label>
                                <div className="relative">
                                    <MessageCircle className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                                    <Input
                                        placeholder="+258 84 123 4567"
                                        className="pl-9 bg-zinc-950 border-zinc-800 text-zinc-200 focus:ring-purple-600/20 placeholder:text-zinc-600"
                                        value={formData.whatsapp}
                                        onChange={(e) => handleChange("whatsapp", e.target.value)}
                                    />
                                </div>
                                <p className="text-xs text-zinc-500">
                                    Ex: +258 (Moçambique)
                                </p>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="space-y-2">
                                <Label className="text-zinc-200">Tamanho da Empresa</Label>
                                <RadioGroup
                                    value={formData.companySize}
                                    onValueChange={(value) => handleChange("companySize", value)}
                                    className="grid gap-2"
                                >
                                    {[
                                        "Apenas eu",
                                        "2-5 funcionários",
                                        "6-20 funcionários",
                                        "21-50 funcionários",
                                        "Mais de 50 funcionários",
                                    ].map((size) => (
                                        <Label
                                            key={size}
                                            className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all duration-200 ${formData.companySize === size
                                                    ? "bg-purple-600/10 border-purple-600/50 text-purple-400"
                                                    : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:border-zinc-700"
                                                }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <Users className="w-4 h-4" />
                                                <span>{size}</span>
                                            </div>
                                            <RadioGroupItem value={size} className="sr-only" />
                                        </Label>
                                    ))}
                                </RadioGroup>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="space-y-2">
                                <Label className="text-zinc-200">Qual seu principal objetivo?</Label>
                                <div className="relative">
                                    <Target className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                                    <Textarea
                                        placeholder="Ex: Automatizar atendimento ao cliente e aumentar vendas..."
                                        className="min-h-[100px] pl-9 bg-zinc-950 border-zinc-800 text-zinc-200 focus:ring-purple-600/20 placeholder:text-zinc-600 resize-none"
                                        value={formData.goal}
                                        onChange={(e) => handleChange("goal", e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <Button
                        onClick={handleNext}
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg shadow-purple-500/25"
                    >
                        {step === 4 ? "Começar a Criar Agente" : "Próximo"}
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            </div>
        </div>
    )
}

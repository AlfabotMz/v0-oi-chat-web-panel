"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowRight, ArrowLeft, Loader2, CheckCircle2, Bot, Sparkles, Zap, MessageSquare } from "lucide-react"
import { OnboardingSurvey } from "@/components/onboarding/onboarding-survey"
import { cn } from "@/lib/utils"

const personas = [
  {
    id: "support",
    title: "Suporte ao Cliente",
    description: "Especialista em resolver dúvidas e problemas técnicos.",
    icon: MessageSquare,
    prompt: "Você é um assistente de suporte técnico especializado. Seu objetivo é ajudar os clientes a resolverem problemas de forma rápida e eficiente. Seja paciente, claro e técnico quando necessário.",
  },
  {
    id: "sales",
    title: "Vendas & Leads",
    description: "Focado em conversão e qualificação de clientes.",
    icon: Zap,
    prompt: "Você é um consultor de vendas experiente. Seu objetivo é entender as necessidades do cliente, apresentar soluções e fechar vendas. Seja persuasivo, entusiasta e focado em resultados.",
  },
  {
    id: "scheduler",
    title: "Agendamento",
    description: "Organiza horários e gerencia reservas.",
    icon: CheckCircle2,
    prompt: "Você é um assistente de agendamento organizado. Seu objetivo é ajudar clientes a marcar horários e gerenciar reservas. Seja preciso, educado e eficiente.",
  },
  {
    id: "custom",
    title: "Personalizado",
    description: "Um assistente genérico adaptável.",
    icon: Bot,
    prompt: "Você é um assistente virtual versátil. Seu objetivo é ajudar no que for preciso. Seja educado e prestativo.",
  },
]

const tones = [
  {
    id: "friendly",
    title: "Amigável & Casual",
    description: "Conversa leve, usa emojis e linguagem acessível.",
    prompt: "Use um tom amigável, casual e acolhedor. Sinta-se à vontade para usar emojis e uma linguagem mais relaxada.",
  },
  {
    id: "professional",
    title: "Profissional & Sério",
    description: "Direto, formal e focado em eficiência.",
    prompt: "Mantenha um tom estritamente profissional, formal e direto. Evite gírias ou excesso de informalidade.",
  },
  {
    id: "enthusiastic",
    title: "Entusiasta & Energético",
    description: "Alto astral, motivador e muito positivo.",
    prompt: "Seja extremamente entusiasta, energético e positivo. Use pontos de exclamação e mostre empolgação em ajudar.",
  },
  {
    id: "empathetic",
    title: "Empático & Calmo",
    description: "Compreensivo, paciente e tranquilizador.",
    prompt: "Adote uma postura empática, calma e paciente. Mostre que você entende os sentimentos do cliente e está lá para apoiar.",
  },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPersona, setSelectedPersona] = useState<string>("")
  const [selectedTone, setSelectedTone] = useState<string>("")
  const [error, setError] = useState<string | null>(null)

  const handleSurveyComplete = async (data: any) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        // Log error but continue flow if profile update fails (non-critical)
        console.warn("Failed to update profile survey data")
      }

      setCurrentStep(1)
    } catch (err) {
      console.error("Erro ao salvar pesquisa:", err)
      setCurrentStep(1)
    } finally {
      setIsLoading(false)
    }
  }

  const handleNext = () => {
    if (currentStep === 1 && !selectedPersona) {
      setError("Por favor, selecione um tipo de agente")
      return
    }
    if (currentStep === 2 && !selectedTone) {
      setError("Por favor, selecione um tom de voz")
      return
    }

    setError(null)
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1)
    } else {
      handleCreateAgent()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      setError(null)
    }
  }

  const handleCreateAgent = async () => {
    setIsLoading(true)
    setError(null)

    const persona = personas.find(p => p.id === selectedPersona)
    const tone = tones.find(t => t.id === selectedTone)

    if (!persona || !tone) return

    const finalPrompt = `${persona.prompt}\n\nTom de voz: ${tone.prompt}`
    const agentName = `Agente de ${persona.title}`

    try {
      const response = await fetch("/api/agents/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome: agentName,
          prompt: finalPrompt,
          phone_number: null, // Skipped as requested
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Erro ao criar agente")
      }

      router.push("/dashboard?onboarding=complete")
    } catch (err: unknown) {
      console.error("Erro ao criar agente:", err)
      setError(err instanceof Error ? err.message : "Erro ao criar agente")
    } finally {
      setIsLoading(false)
    }
  }

  // Step 0: Survey (Full Screen)
  if (currentStep === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] px-4 py-12 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[120px]" />
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center gap-4 z-10">
            <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
            <p className="text-zinc-400 text-lg">Salvando suas preferências...</p>
          </div>
        ) : (
          <div className="z-10 w-full">
            <OnboardingSurvey onComplete={handleSurveyComplete} />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] px-4 py-12 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-4xl w-full z-10">
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-white">
            Configurando seu Agente
          </h1>
          <p className="text-zinc-400 text-lg">
            Passo {currentStep} de 2
          </p>
        </div>

        {/* Progress Bar */}
        <div className="max-w-md mx-auto mb-12">
          <div className="flex gap-2">
            {[1, 2].map((i) => (
              <div
                key={i}
                className={cn(
                  "h-1.5 flex-1 rounded-full transition-all duration-500",
                  i <= currentStep ? "bg-gradient-to-r from-purple-500 to-blue-500" : "bg-white/10"
                )}
              />
            ))}
          </div>
        </div>

        <div className="bg-zinc-900/40 border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl backdrop-blur-xl">
          {currentStep === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-semibold text-white">Escolha a Personalidade</h2>
                <p className="text-zinc-400">Qual será a função principal do seu agente?</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {personas.map((persona) => {
                  const Icon = persona.icon
                  const isSelected = selectedPersona === persona.id
                  return (
                    <button
                      key={persona.id}
                      onClick={() => setSelectedPersona(persona.id)}
                      className={cn(
                        "flex flex-col items-start p-6 rounded-2xl border transition-all duration-300 group text-left relative overflow-hidden",
                        isSelected
                          ? "bg-purple-500/20 border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.15)]"
                          : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                      )}
                    >
                      <div className={cn(
                        "p-3 rounded-xl mb-4 transition-colors duration-300",
                        isSelected ? "bg-purple-500/20 text-purple-400" : "bg-white/5 text-zinc-400 group-hover:text-white"
                      )}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <h3 className={cn(
                        "text-lg font-semibold mb-2 transition-colors duration-300",
                        isSelected ? "text-white" : "text-zinc-200 group-hover:text-white"
                      )}>
                        {persona.title}
                      </h3>
                      <p className="text-sm text-zinc-500 group-hover:text-zinc-400">
                        {persona.description}
                      </p>
                      {isSelected && (
                        <div className="absolute top-4 right-4">
                          <CheckCircle2 className="w-5 h-5 text-purple-400" />
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-semibold text-white">Defina o Tom de Voz</h2>
                <p className="text-zinc-400">Como seu agente deve se comunicar?</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tones.map((tone) => {
                  const isSelected = selectedTone === tone.id
                  return (
                    <button
                      key={tone.id}
                      onClick={() => setSelectedTone(tone.id)}
                      className={cn(
                        "flex flex-col items-start p-6 rounded-2xl border transition-all duration-300 group text-left relative overflow-hidden",
                        isSelected
                          ? "bg-blue-500/20 border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.15)]"
                          : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                      )}
                    >
                      <div className={cn(
                        "p-3 rounded-xl mb-4 transition-colors duration-300",
                        isSelected ? "bg-blue-500/20 text-blue-400" : "bg-white/5 text-zinc-400 group-hover:text-white"
                      )}>
                        <Sparkles className="w-6 h-6" />
                      </div>
                      <h3 className={cn(
                        "text-lg font-semibold mb-2 transition-colors duration-300",
                        isSelected ? "text-white" : "text-zinc-200 group-hover:text-white"
                      )}>
                        {tone.title}
                      </h3>
                      <p className="text-sm text-zinc-500 group-hover:text-zinc-400">
                        {tone.description}
                      </p>
                      {isSelected && (
                        <div className="absolute top-4 right-4">
                          <CheckCircle2 className="w-5 h-5 text-blue-400" />
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {error && (
            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-center text-sm">
              {error}
            </div>
          )}

          <div className="mt-12 flex items-center justify-between pt-8 border-t border-white/10">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 1 || isLoading}
              className="text-zinc-400 hover:text-white hover:bg-white/5"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>

            <Button
              onClick={handleNext}
              disabled={isLoading}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg shadow-purple-500/25 rounded-xl px-8 py-6 text-lg font-medium transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Criando...
                </>
              ) : currentStep === 2 ? (
                <>
                  Criar Agente
                  <Sparkles className="w-5 h-5 ml-2" />
                </>
              ) : (
                <>
                  Próximo
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

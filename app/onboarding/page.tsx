"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowRight, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react"
import { OnboardingSurvey } from "@/components/onboarding/onboarding-survey"

const steps = [
  {
    id: 0,
    title: "Pesquisa Rápida",
    description: "Conte-nos um pouco sobre seu negócio",
  },
  {
    id: 1,
    title: "Bem-vindo ao OiChat!",
    description: "Vamos criar seu primeiro agente em poucos passos",
  },
  {
    id: 2,
    title: "Nome do seu agente",
    description: "Como você gostaria de chamar seu agente?",
  },
  {
    id: 3,
    title: "Instruções do agente",
    description: "Descreva como o agente deve se comportar e responder",
  },
  {
    id: 4,
    title: "Número de telefone (opcional)",
    description: "Adicione um número de telefone associado ao agente",
  },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [agentName, setAgentName] = useState("")
  const [agentPrompt, setAgentPrompt] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
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
        throw new Error("Falha ao salvar dados")
      }

      setCurrentStep(1)
    } catch (err) {
      console.error("Erro ao salvar pesquisa:", err)
      // Opcional: mostrar erro ou apenas prosseguir
      setCurrentStep(1)
    } finally {
      setIsLoading(false)
    }
  }

  const handleNext = () => {
    if (currentStep === 2 && !agentName.trim()) {
      setError("Por favor, informe o nome do agente")
      return
    }
    if (currentStep === 3 && !agentPrompt.trim()) {
      setError("Por favor, informe as instruções do agente")
      return
    }
    setError(null)
    if (currentStep < steps.length - 1) {
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

    try {
      const response = await fetch("/api/agents/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome: agentName,
          prompt: agentPrompt,
          phone_number: phoneNumber || null,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Erro ao criar agente")
      }

      // Redirecionar para dashboard
      router.push("/dashboard?onboarding=complete")
    } catch (err: unknown) {
      console.error("Erro ao criar agente:", err)
      setError(err instanceof Error ? err.message : "Erro ao criar agente")
    } finally {
      setIsLoading(false)
    }
  }

  // Se estiver no passo da pesquisa, renderizar componente tela cheia
  if (currentStep === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4 py-12">
        {isLoading ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            <p className="text-zinc-400">Salvando suas preferências...</p>
          </div>
        ) : (
          <OnboardingSurvey onComplete={handleSurveyComplete} />
        )}
      </div>
    )
  }

  const currentStepData = steps.find(s => s.id === currentStep) || steps[0]
  const totalSteps = steps.length - 1 // Excluindo passo 0 da contagem visual se desejar, ou ajustar conforme UX

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 py-12">
      <div className="max-w-2xl w-full">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">
              Passo {currentStep} de {totalSteps}
            </span>
            <span className="text-sm font-medium text-muted-foreground">
              {Math.round((currentStep / totalSteps) * 100)}%
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        <Card className="border-border/50 shadow-xl">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-3xl">{currentStepData.title}</CardTitle>
            <CardDescription className="text-base">{currentStepData.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentStep === 1 && (
              <div className="space-y-4 text-center py-8">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 mb-4">
                  <CheckCircle2 className="w-10 h-10 text-white" />
                </div>
                <p className="text-muted-foreground">
                  Vamos configurar seu primeiro agente de WhatsApp. Isso levará apenas alguns minutos.
                </p>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="agentName">Nome do Agente</Label>
                  <Input
                    id="agentName"
                    placeholder="Ex: Atendimento Cliente"
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && agentName.trim()) {
                        handleNext()
                      }
                    }}
                    autoFocus
                  />
                  <p className="text-xs text-muted-foreground">
                    Escolha um nome descritivo para identificar seu agente
                  </p>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="agentPrompt">Instruções do Agente</Label>
                  <Textarea
                    id="agentPrompt"
                    placeholder="Ex: Você é um atendente virtual amigável e profissional. Sempre seja educado e tente ajudar o cliente da melhor forma possível..."
                    value={agentPrompt}
                    onChange={(e) => setAgentPrompt(e.target.value)}
                    rows={8}
                    autoFocus
                  />
                  <p className="text-xs text-muted-foreground">
                    Descreva como o agente deve se comportar, responder e interagir com os clientes
                  </p>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Número de Telefone (Opcional)</Label>
                  <Input
                    id="phoneNumber"
                    placeholder="+55 11 99999-9999"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleNext()
                      }
                    }}
                    autoFocus
                  />
                  <p className="text-xs text-muted-foreground">
                    Número associado ao WhatsApp do agente (pode ser adicionado depois)
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-500/10 text-red-700 dark:text-red-400 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between pt-4">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1 || isLoading}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>
              <Button
                onClick={handleNext}
                disabled={isLoading}
                className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Criando...
                  </>
                ) : currentStep === steps.length - 1 ? (
                  <>
                    Criar Agente
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Próximo
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

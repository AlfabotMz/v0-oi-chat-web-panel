"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { Loader2, Link as LinkIcon, CheckCircle2 } from "lucide-react"

interface PushcutFormProps {
    user: User
    pushcutUrl: string
}

export function PushcutForm({ user, pushcutUrl: initialPushcutUrl }: PushcutFormProps) {
    const router = useRouter()
    const [pushcutUrl, setPushcutUrl] = useState(initialPushcutUrl)
    const [isSaving, setIsSaving] = useState(false)
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
    const [isTesting, setIsTesting] = useState(false)

    const handleUpdatePushcut = async () => {
        setIsSaving(true)
        setMessage(null)

        try {
            const supabase = createClient()
            const { error } = await supabase
                .from("profiles")
                .update({ pushcut_url: pushcutUrl })
                .eq("id", user.id)

            if (error) throw error

            setMessage({ type: "success", text: "Integração atualizada com sucesso!" })
            router.refresh()
        } catch (err: any) {
            console.error("Erro ao atualizar a integração do Pushcut:", err)
            setMessage({
                type: "error",
                text: err.message || "Erro ao atualizar integração. Tente novamente.",
            })
        } finally {
            setIsSaving(false)
        }
    }

    const handleTestNotification = async () => {
        setIsTesting(true)
        setMessage(null)

        try {
            if (!pushcutUrl) {
                throw new Error("Insira uma URL primeiro.");
            }

            const payload = {
                title: "Integração Pushcut OiChat",
                text: "Este é um teste de integração de notificação para o iPhone!",
            }

            const response = await fetch(pushcutUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            })

            if (!response.ok) {
                throw new Error(`Erro no servidor: ${response.status}`)
            }

            setMessage({ type: "success", text: "Notificação de teste enviada com sucesso! Verifique seu iPhone." })
        } catch (err: any) {
            setMessage({ type: "error", text: `Falha ao testar notificação: ${err.message}` })
        } finally {
            setIsTesting(false)
        }
    }

    return (
        <div className="space-y-6">
            <Card className="border-border/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <LinkIcon className="w-5 h-5" /> Pushcut Webhook
                    </CardTitle>
                    <CardDescription>
                        Insira o URL de Webhook obtido no aplicativo Pushcut do seu iOS para receber alertas automáticos para as suas vendas.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>URL do Pushcut</Label>
                        <Input
                            value={pushcutUrl}
                            onChange={(e) => setPushcutUrl(e.target.value)}
                            placeholder="https://api.pushcut.io/secret/notifications/Notificacao"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            Copie o link do webhook no seu aplicativo Pushcut (Aba Notifications &gt; Add Webhook).
                        </p>
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row gap-3">
                        <Button onClick={handleUpdatePushcut} disabled={isSaving}>
                            {isSaving ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Salvando...
                                </>
                            ) : (
                                "Salvar"
                            )}
                        </Button>
                        <Button variant="outline" onClick={handleTestNotification} disabled={isTesting || !pushcutUrl}>
                            {isTesting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Enviando...
                                </>
                            ) : (
                                "Notificação de Teste"
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {message && (
                <div
                    className={`p-4 rounded-lg text-sm flex items-center gap-2 ${message.type === "success"
                            ? "bg-green-500/10 text-green-700 dark:text-green-400"
                            : "bg-red-500/10 text-red-700 dark:text-red-400"
                        }`}
                >
                    {message.type === "success" && <CheckCircle2 className="w-4 h-4" />}
                    {message.text}
                </div>
            )}
        </div>
    )
}

"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Send, RefreshCw, MessageSquarePlus, Trash2, SearchCode, Facebook } from "lucide-react"
import Script from "next/script"

export default function WabaTestPage() {
    const [agents, setAgents] = useState<any[]>([])
    const [selectedAgentId, setSelectedAgentId] = useState<string>("")
    const [logs, setLogs] = useState<any[]>([])

    const [templateName, setTemplateName] = useState("hello_world_lab")
    const [templateText, setTemplateText] = useState("Olá! Bem-vindo ao ambiente de testes.")
    const [isCreatingTemplate, setIsCreatingTemplate] = useState(false)

    const [sendPhone, setSendPhone] = useState("")
    const [sendTemplateName, setSendTemplateName] = useState("hello_world")
    const [languageCode, setLanguageCode] = useState("en_US")
    const [isSending, setIsSending] = useState(false)
    const [isRegistering, setIsRegistering] = useState(false)

    const [chatInput, setChatInput] = useState("")

    const [debugInfo, setDebugInfo] = useState<any>(null)
    const [isDebugLoading, setIsDebugLoading] = useState(false)

    // Utilizar variáveis de ambiente públicas
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    useEffect(() => {
        fetchAgents()
    }, [])

    useEffect(() => {
        if (selectedAgentId) {
            fetchLogs()

            // Inscrição em tempo real para os Webhooks da Meta!
            const channel = supabase
                .channel('schema-db-changes')
                .on(
                    'postgres_changes',
                    { event: 'INSERT', schema: 'public', table: 'waba_webhook_logs', filter: `agent_id=eq.${selectedAgentId}` },
                    (payload) => {
                        setLogs((current) => [payload.new, ...current])
                    }
                )
                .subscribe()

            return () => {
                supabase.removeChannel(channel)
            }
        }
    }, [selectedAgentId])

    const fetchAgents = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data } = await supabase
            .from("agents")
            .select("id, name, waba_id, waba_phone_number_id")
            .eq("user_id", user.id)
            .not("waba_id", "is", null)

        if (data && data.length > 0) {
            setAgents(data)
            setSelectedAgentId(data[0].id)
        }
    }

    const fetchLogs = async () => {
        const { data } = await supabase
            .from("waba_webhook_logs")
            .select("*")
            .eq("agent_id", selectedAgentId)
            .order("created_at", { ascending: false })
            .limit(50)

        if (data) setLogs(data)
    }

    const handleRegisterNumber = async () => {
        if (!selectedAgentId) return alert("Selecione um agente primeiro")
        setIsRegistering(true)
        try {
            const res = await fetch("/api/agents/waba-register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ agent_id: selectedAgentId, pin: "123456" })
            })
            const data = await res.json()
            if (data.success) {
                alert("Número registrado com sucesso na API da Meta! Você já pode disparar o template.")
            } else {
                alert("Erro no registro: " + data.error)
            }
        } catch (e: any) {
            alert("Erro fatal: " + e.message)
        } finally {
            setIsRegistering(false)
        }
    }

    const handleCreateTemplate = async () => {
        if (!templateName || !templateText || !selectedAgentId) return alert("Preencha todos os campos do template")
        setIsCreatingTemplate(true)
        try {
            const res = await fetch("/api/agents/waba-templates", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    agent_id: selectedAgentId,
                    template_name: templateName,
                    template_text: templateText,
                    category: "MARKETING"
                })
            })
            const data = await res.json()
            if (data.success) {
                alert("Template criado com sucesso! O nome formatado para envio é: " + data.data.formatted_name)
                setSendTemplateName(data.data.formatted_name)
                setTemplateName("")
                setTemplateText("")
            } else {
                alert("Erro na aprovação da Meta: " + data.error)
            }
        } catch (e: any) {
            alert("Erro de servidor: " + e.message)
        } finally {
            setIsCreatingTemplate(false)
        }
    }

    const handleSendMessage = async () => {
        if (!sendPhone || !sendTemplateName || !selectedAgentId) return alert("Preencha o telefone de destino e o nome do template")
        setIsSending(true)
        try {
            const res = await fetch("/api/agents/waba-messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    agent_id: selectedAgentId,
                    to_phone: sendPhone,
                    template_name: sendTemplateName,
                    language_code: languageCode
                })
            })
            const data = await res.json()
            if (data.success) {
                alert("Chamada API completada com Sucesso! Aguarde os eventos de Delivery aparecerem no painel ao lado.")
            } else {
                alert("A API da Meta rejeitou o disparo: " + data.error)
            }
        } catch (e: any) {
            alert("Erro fatal: " + e.message)
        } finally {
            setIsSending(false)
        }
    }

    const handleSendText = async () => {
        const targetPhone = sendPhone || logs.find(l => l.phone_number && l.phone_number.length > 5)?.phone_number;

        if (!chatInput.trim() || !targetPhone || !selectedAgentId) {
            return alert("Preencha o telefone de destino no módulo esquerdo OU receba/dispare pelo menos uma mensagem primeiro.")
        }

        setIsSending(true)
        const textToSend = chatInput.trim()
        setChatInput("") // Limpa o input imediatamente

        try {
            const res = await fetch("/api/agents/waba-messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    agent_id: selectedAgentId,
                    to_phone: targetPhone,
                    text_message: textToSend
                })
            })
            const data = await res.json()
            if (!data.success) {
                alert("Erro ao enviar: " + data.error)
                setChatInput(textToSend) // Volta o texto se falhou
            }
        } catch (e: any) {
            alert("Erro de servidor: " + e.message)
        } finally {
            setIsSending(false)
        }
    }

    const handleClearChat = async () => {
        if (!selectedAgentId) return;
        if (!window.confirm("Isso vai apagar todas as mensagens da tela de testes. Confirmar?")) return;
        try {
            await fetch("/api/agents/waba-webhook/clear", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ agent_id: selectedAgentId })
            });
            setLogs([]);
        } catch (e) {
            alert("Erro ao limpar os dados.");
        }
    }

    const handleDebugLogin = () => {
        // @ts-ignore
        if (!window.FB) return alert("Facebook SDK não carregou ainda.")

        // @ts-ignore
        window.FB.login((response: any) => {
            if (response.authResponse) {
                const code = response.authResponse.code;
                if (code) {
                    setIsDebugLoading(true)
                    fetch('/api/agents/waba-debug', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ code })
                    })
                        .then(r => r.json())
                        .then(data => {
                            if (data.success) {
                                setDebugInfo(data)
                                // Rolar para a sessão de debug suavemente
                                setTimeout(() => document.getElementById("waba-debugger")?.scrollIntoView({ behavior: 'smooth' }), 300)
                            } else {
                                alert("Erro na API: " + JSON.stringify(data.error))
                            }
                        })
                        .catch(e => alert("Erro ao fazer fetch: " + e.message))
                        .finally(() => setIsDebugLoading(false))
                }
            } else {
                alert("Login com o Facebook cancelado.")
            }
        }, {
            config_id: process.env.NEXT_PUBLIC_FACEBOOK_CONFIG_ID,
            response_type: 'code',
            override_default_response_type: true,
            extras: {
                featureType: 'whatsapp_business_app_onboarding',
                sessionInfoVersion: '3'
            }
        });
    }

    return (
        <div className="p-8 space-y-8 max-w-6xl mx-auto">
            <Script src="https://connect.facebook.net/en_US/sdk.js" strategy="lazyOnload" onLoad={() => {
                // @ts-ignore
                window.FB?.init({
                    appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID!,
                    cookie: true,
                    xfbml: true,
                    version: 'v19.0'
                })
            }} />

            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold">Laboratório Oficial (Sandbox WABA)</h1>
                    <p className="text-muted-foreground mt-2">Valide e simule os envios e os retornos do Webhook Oficial da Meta em Tempo Real.</p>
                </div>
                <Button onClick={handleDebugLogin} disabled={isDebugLoading} className="bg-[#1877F2] hover:bg-[#0c5cbd] text-white font-semibold">
                    {isDebugLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Facebook className="w-5 h-5 mr-2" />}
                    Logar e Inspecionar Contas da Meta
                </Button>
            </div>

            {!agents.length ? (
                <Card><CardContent className="p-8 text-center text-muted-foreground"><p>Você ainda não logou com o Facebook em nenhum Agente.</p></CardContent></Card>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-8">
                            {/* Seleção de WABA */}
                            <Card>
                                <CardHeader className="pb-4">
                                    <CardTitle className="flex justify-between items-center text-lg">
                                        Canal WABA Conectado
                                        {selectedAgentId && (
                                            <Button variant="secondary" size="sm" onClick={handleRegisterNumber} disabled={isRegistering}>
                                                {isRegistering ? <Loader2 className="w-3 h-3 animate-spin" /> : "Registrar Número na API"}
                                            </Button>
                                        )}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione um agente" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {agents.map(a => (
                                                <SelectItem key={a.id} value={a.id}>{a.name} (ID: {a.waba_id})</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </CardContent>
                            </Card>

                            {/* Criar Template */}
                            <Card>
                                <CardHeader className="pb-4">
                                    <CardTitle className="flex items-center gap-2 text-lg"><MessageSquarePlus className="w-4 h-4 text-blue-500" /> Criar Template (Graph API)</CardTitle>
                                    <CardDescription>Crie um template de mensagem de aprovação instantânea na Meta.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Nome Interno do Template</Label>
                                        <Input placeholder="boas_vindas_lab" value={templateName} onChange={e => setTemplateName(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Texto Principal do Template</Label>
                                        <Input placeholder="Olá! Seja muito bem-vindo ao teste oficial WABA!" value={templateText} onChange={e => setTemplateText(e.target.value)} />
                                    </div>
                                    <Button onClick={handleCreateTemplate} disabled={isCreatingTemplate}>
                                        {isCreatingTemplate && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                        Criar & Submeter (pt_BR)
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Disparar Mensagem */}
                            <Card>
                                <CardHeader className="pb-4">
                                    <CardTitle className="flex items-center gap-2 text-lg"><Send className="w-4 h-4 text-green-500" /> Simular Envio de Mensagem</CardTitle>
                                    <CardDescription>Envie um template já criado (dica: "hello_world" é um template padrão sempre aprovado pela Meta que você pode testar agora mesmo).</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Telefone (Qualquer código de país, ex: 55119...)</Label>
                                        <Input placeholder="5511999999999" value={sendPhone} onChange={e => setSendPhone(e.target.value)} />
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="space-y-2 flex-grow">
                                            <Label>Nome Exato do Template</Label>
                                            <Input placeholder="hello_world" value={sendTemplateName} onChange={e => setSendTemplateName(e.target.value)} />
                                        </div>
                                        <div className="space-y-2 w-1/3">
                                            <Label>Idioma</Label>
                                            <Input placeholder="en_US" value={languageCode} onChange={e => setLanguageCode(e.target.value)} />
                                        </div>
                                    </div>
                                    <Button onClick={handleSendMessage} disabled={isSending} className="w-full bg-green-600 hover:bg-green-700">
                                        {isSending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                        Disparar Template Oficial Oficial
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Area de Eventos em Tempo Real do Webhook (CHAT) */}
                        <div className="space-y-2 flex flex-col h-[800px]">
                            <div className="flex items-center justify-between mb-2">
                                <div>
                                    <h2 className="text-xl font-bold flex items-center gap-2 text-primary">Chat Sandbox <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span></span></h2>
                                    <p className="text-xs text-muted-foreground">Inicie com um Template se há &gt;24h de inatividade.</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm" onClick={handleClearChat}><Trash2 className="w-4 h-4 mr-2" /> Limpar</Button>
                                    <Button variant="outline" size="sm" onClick={fetchLogs}><RefreshCw className="w-4 h-4 mr-2" /> Recarregar</Button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 rounded-xl border border-border/50 bg-[#e5e5e5] dark:bg-[#0b141a] flex flex-col-reverse gap-3">
                                {logs.length === 0 ? (
                                    <div className="text-center text-muted-foreground my-auto p-8 bg-card rounded-lg border border-dashed border-border/50 flex flex-col items-center justify-center gap-4">
                                        <RefreshCw className="w-8 h-8 animate-spin opacity-20" />
                                        <p>Nenhuma mensagem enviada ou recebida.</p>
                                    </div>
                                ) : (
                                    logs.map(log => {
                                        const isIncoming = log.event_type === "message_received"
                                        const isOutgoing = log.event_type === "message_sent_api"
                                        const isSystem = !isIncoming && !isOutgoing

                                        // Recibos (Lido, Entregue) ficam na fenda no centro
                                        if (isSystem) {
                                            return (
                                                <div key={log.id} className="flex justify-center my-1 opacity-70">
                                                    <div className="bg-black/10 dark:bg-white/10 px-3 py-1 rounded-full text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
                                                        {log.phone_number}: {log.event_type.replace('status_', '')}
                                                    </div>
                                                </div>
                                            )
                                        }

                                        const msgText = isIncoming
                                            ? (log.payload?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.text?.body || 'Áudio/Imagem/Não-Texto')
                                            : (log.payload?.sent_text || 'Envio de mídia ou template')

                                        const bubbleClasses = isIncoming
                                            ? "bg-white text-black self-start rounded-tr-xl rounded-br-xl rounded-tl-sm rounded-bl-xl"
                                            : "bg-[#d9fdd3] dark:bg-[#005c4b] text-black dark:text-[#e9edef] self-end rounded-tl-xl rounded-bl-xl rounded-tr-sm rounded-br-xl"

                                        return (
                                            <div key={log.id} className={`max-w-[85%] p-3 shadow-sm relative ${bubbleClasses}`}>
                                                <p className="text-[14px] leading-relaxed whitespace-pre-wrap">{msgText}</p>
                                                <div className="text-[10px] mt-1 opacity-60 text-right font-medium">
                                                    {new Date(log.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                            </div>

                            {/* Input de Texto Livre */}
                            <div className="flex gap-2 bg-card p-2 rounded-xl border border-border/50">
                                <Input
                                    placeholder="Mandar mensagem de texto livre..."
                                    className="border-0 shadow-none focus-visible:ring-0 bg-transparent"
                                    value={chatInput}
                                    onChange={e => setChatInput(e.target.value)}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter') handleSendText()
                                    }}
                                />
                                <Button onClick={handleSendText} disabled={isSending || !chatInput.trim()} size="icon" className="shrink-0 rounded-full h-10 w-10">
                                    {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Meta Inspector Dump Área */}
                    {debugInfo && (
                        <Card id="waba-debugger" className="border-indigo-500/50 shadow-lg shadow-indigo-500/10 mt-8">
                            <CardHeader className="bg-indigo-50 dark:bg-indigo-950/20 border-b">
                                <CardTitle className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                                    <SearchCode className="w-5 h-5" /> Inspetor de Dados Brutos da Meta
                                </CardTitle>
                                <CardDescription>Aqui estão os IDs e as configurações completas de todas as contas vinculadas a este login do Facebook.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="p-6 bg-[#0d0d0d] text-emerald-400 rounded-b-xl font-mono text-sm overflow-x-auto whitespace-pre-wrap">
                                    {JSON.stringify(debugInfo, null, 2)}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </>
            )}
        </div>
    )
}

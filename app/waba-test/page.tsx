"use client"

import { useState, useEffect } from "react"
import { getAgents, fetchWabaNumbers, fetchWabaTemplates, createWabaTemplate, fetchWabaAccounts, fetchWabaSettings, fetchPhoneNumberDetails } from "./actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Loader2, RefreshCw, Plus, Phone, Layout, Building, Settings, CheckCircle2, Clock, AlertCircle } from "lucide-react"

export default function WabaTestPage() {
    const [agents, setAgents] = useState<any[]>([])
    const [selectedAgentId, setSelectedAgentId] = useState<string>("")
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState<any>({
        numbers: null,
        templates: null,
        accounts: null,
        settings: null
    })
    const [newTemplate, setNewTemplate] = useState({ name: "", text: "", category: "UTILITY" })

    useEffect(() => {
        loadAgents()
    }, [])

    async function loadAgents() {
        try {
            const list = await getAgents()
            setAgents(list)
            if (list.length > 0) setSelectedAgentId(list[0].id)
        } catch (error: any) {
            toast.error("Erro ao carregar agentes: " + error.message)
        }
    }

    async function handleFetch(type: string) {
        if (!selectedAgentId) return
        setLoading(true)
        try {
            let res: any
            switch (type) {
                case "numbers":
                    res = await fetchWabaNumbers(selectedAgentId)
                    break
                case "templates":
                    res = await fetchWabaTemplates(selectedAgentId)
                    break
                case "accounts":
                    res = await fetchWabaAccounts(selectedAgentId)
                    break
                case "settings":
                    res = await fetchWabaSettings(selectedAgentId)
                    break
            }

            if (res.success) {
                setData((prev: any) => ({ ...prev, [type]: res.data }))
                toast.success(`Dados de ${type} carregados com sucesso`)
            } else {
                toast.error(`Erro ao carregar ${type}: ` + (res.error?.message || "Erro desconhecido"))
            }
        } catch (error: any) {
            toast.error("Erro: " + error.message)
        } finally {
            setLoading(false)
        }
    }

    async function handleCreateTemplate() {
        if (!selectedAgentId) return
        if (!newTemplate.name || !newTemplate.text) {
            toast.error("Preencha o nome e o texto do template")
            return
        }

        setLoading(true)
        try {
            const res = await createWabaTemplate(selectedAgentId, newTemplate)
            if (res.success) {
                toast.success("Template enviado para aprovação!")
                handleFetch("templates")
                setNewTemplate({ name: "", text: "", category: "UTILITY" })
            } else {
                toast.error("Erro ao criar template: " + (res.error?.message || "Erro desconhecido"))
            }
        } catch (error: any) {
            toast.error("Erro: " + error.message)
        } finally {
            setLoading(false)
        }
    }

    const agent = agents.find(a => a.id === selectedAgentId)

    return (
        <div className="min-h-screen bg-[#0F0F12] text-white p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                            WABA Management Test Panel
                        </h1>
                        <p className="text-gray-400 mt-1">Verifique e gerencie sua infraestrutura do WhatsApp Business API</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Label htmlFor="agent-select" className="hidden md:block">Agente:</Label>
                        <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
                            <SelectTrigger className="w-[250px] bg-white/5 border-white/10">
                                <SelectValue placeholder="Selecione um agente" />
                            </SelectTrigger>
                            <SelectContent>
                                {agents.map(a => (
                                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button variant="outline" size="icon" onClick={loadAgents} className="border-white/10 bg-white/5">
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {agent && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="bg-white/5 border-white/10 text-white">
                            <CardHeader className="pb-2">
                                <CardDescription className="text-gray-400">WABA ID</CardDescription>
                                <CardTitle className="text-lg font-mono">{agent.waba_id || agent.waba_business_account_id || "Não configurado"}</CardTitle>
                            </CardHeader>
                        </Card>
                        <Card className="bg-white/5 border-white/10 text-white">
                            <CardHeader className="pb-2">
                                <CardDescription className="text-gray-400">Phone Number ID</CardDescription>
                                <CardTitle className="text-lg font-mono">{agent.waba_phone_number_id || "Não configurado"}</CardTitle>
                            </CardHeader>
                        </Card>
                        <Card className="bg-white/5 border-white/10 text-white">
                            <CardHeader className="pb-2">
                                <CardDescription className="text-gray-400">Token Status</CardDescription>
                                <CardTitle className="flex items-center gap-2">
                                    {agent.waba_access_token ? (
                                        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">Configurado</Badge>
                                    ) : (
                                        <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">Ausente</Badge>
                                    )}
                                </CardTitle>
                            </CardHeader>
                        </Card>
                    </div>
                )}

                <Tabs defaultValue="numbers" className="w-full">
                    <TabsList className="bg-white/5 border border-white/10 p-1 mb-8">
                        <TabsTrigger value="numbers" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white gap-2">
                            <Phone className="h-4 w-4" /> Números
                        </TabsTrigger>
                        <TabsTrigger value="templates" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white gap-2">
                            <Layout className="h-4 w-4" /> Templates
                        </TabsTrigger>
                        <TabsTrigger value="accounts" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white gap-2">
                            <Building className="h-4 w-4" /> Contas
                        </TabsTrigger>
                        <TabsTrigger value="settings" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white gap-2">
                            <Settings className="h-4 w-4" /> Config
                        </TabsTrigger>
                    </TabsList>

                    {/* Numbers Tab */}
                    <TabsContent value="numbers" className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold">Listar números do WhatsApp Business</h2>
                            <Button onClick={() => handleFetch("numbers")} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Atualizar Lista
                            </Button>
                        </div>

                        {data.numbers?.data ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {data.numbers.data.map((num: any) => (
                                    <Card key={num.id} className="bg-white/5 border-white/10 text-white">
                                        <CardHeader>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <CardTitle className="text-xl">{num.verified_name}</CardTitle>
                                                    <CardDescription className="text-gray-400">{num.display_phone_number}</CardDescription>
                                                </div>
                                                <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 uppercase">
                                                    {num.quality_rating}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-sm space-y-1 text-gray-300">
                                                <p>ID: <span className="font-mono">{num.id}</span></p>
                                                <p>Status: <span className="text-green-400 font-medium">{num.status}</span></p>
                                                <p>Namespace: <span className="font-mono text-xs overflow-hidden">{num.certificate}</span></p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-white/5 rounded-xl border border-dashed border-white/10">
                                <p className="text-gray-500 italic">Clique em 'Atualizar Lista' para buscar os números.</p>
                            </div>
                        )}
                    </TabsContent>

                    {/* Templates Tab */}
                    <TabsContent value="templates" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Create Form */}
                            <Card className="bg-white/5 border-white/10 text-white lg:col-span-1">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Plus className="h-5 w-5 text-blue-500" /> Criar Template
                                    </CardTitle>
                                    <CardDescription>Crie um novo template de utilidade básico.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="t-name">Nome do Template</Label>
                                        <Input
                                            id="t-name"
                                            placeholder="ex: boas_vindas"
                                            className="bg-white/5 border-white/10"
                                            value={newTemplate.name}
                                            onChange={e => setNewTemplate({ ...newTemplate, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="t-text">Mensagem (Corpo)</Label>
                                        <Textarea
                                            id="t-text"
                                            placeholder="Olá {{1}}, bem-vindo!"
                                            className="bg-white/5 border-white/10 min-h-[100px]"
                                            value={newTemplate.text}
                                            onChange={e => setNewTemplate({ ...newTemplate, text: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Categoria</Label>
                                        <Select value={newTemplate.category} onValueChange={val => setNewTemplate({ ...newTemplate, category: val })}>
                                            <SelectTrigger className="bg-white/5 border-white/10">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="UTILITY">UTILITY (Utilitário)</SelectItem>
                                                <SelectItem value="MARKETING">MARKETING (Marketing)</SelectItem>
                                                <SelectItem value="AUTHENTICATION">AUTHENTICATION (Autenticação)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button onClick={handleCreateTemplate} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
                                        Criar Template
                                    </Button>
                                </CardFooter>
                            </Card>

                            {/* List Templates */}
                            <div className="lg:col-span-2 space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-medium">Modelos Existentes</h3>
                                    <Button size="sm" variant="outline" onClick={() => handleFetch("templates")} disabled={loading} className="border-white/10">
                                        Recarregar
                                    </Button>
                                </div>

                                {data.templates?.data ? (
                                    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                        {data.templates.data.map((t: any) => (
                                            <div key={t.id} className="p-4 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-all">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="font-bold text-blue-400">{t.name}</span>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline" className="text-[10px] opacity-70">
                                                            {t.language}
                                                        </Badge>
                                                        {t.status === 'APPROVED' ? (
                                                            <Badge className="bg-green-500/20 text-green-500 border-green-500/30 flex gap-1">
                                                                <CheckCircle2 className="h-3 w-3" /> Approved
                                                            </Badge>
                                                        ) : (
                                                            <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30 flex gap-1">
                                                                <Clock className="h-3 w-3" /> {t.status}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                                <p className="text-sm text-gray-400 bg-black/20 p-2 rounded border border-white/5 truncate">
                                                    {t.components?.find((c: any) => c.type === 'BODY')?.text}
                                                </p>
                                                <div className="mt-2 flex justify-between items-center">
                                                    <span className="text-[10px] text-gray-500">ID: {t.id}</span>
                                                    <span className="text-[10px] text-gray-500 uppercase">{t.category}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-20 bg-white/5 rounded-xl border border-dashed border-white/10">
                                        <p className="text-gray-500">Nenhum template carregado.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </TabsContent>

                    {/* WABA Accounts Tab */}
                    <TabsContent value="accounts" className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold">Suas Contas WhatsApp Business</h2>
                            <Button onClick={() => handleFetch("accounts")} disabled={loading} className="bg-blue-600">
                                Listar Contas
                            </Button>
                        </div>

                        {data.accounts?.data ? (
                            <div className="space-y-4">
                                {data.accounts.data.map((acc: any) => (
                                    <Card key={acc.id} className="bg-white/5 border-white/10 text-white">
                                        <CardHeader>
                                            <CardTitle>{acc.name}</CardTitle>
                                            <CardDescription className="text-gray-400">ID: {acc.id}</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                <div>
                                                    <span className="text-gray-500 block mb-1 uppercase text-[10px]">Currency</span>
                                                    <span className="font-medium">{acc.currency}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500 block mb-1 uppercase text-[10px]">Timezone</span>
                                                    <span className="font-medium">{acc.timezone_id}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500 block mb-1 uppercase text-[10px]">Account Status</span>
                                                    <Badge variant="outline" className={acc.account_review_status === 'APPROVED' ? 'text-green-400' : ''}>
                                                        {acc.account_review_status}
                                                    </Badge>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500 block mb-1 uppercase text-[10px]">Business ID</span>
                                                    <span className="font-mono text-xs">{acc.message_template_namespace}</span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 bg-white/5 rounded-xl border border-dashed border-white/10 space-y-4">
                                <Building className="h-12 w-12 text-gray-700" />
                                <p className="text-gray-500">Clique para buscar as contas vinculadas a este token.</p>
                            </div>
                        )}
                    </TabsContent>

                    {/* Settings Tab */}
                    <TabsContent value="settings" className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold">Configurações do WABA</h2>
                            <Button onClick={() => handleFetch("settings")} disabled={loading} variant="outline" className="border-white/10">
                                Buscar Configurações
                            </Button>
                        </div>

                        {data.settings ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card className="bg-white/5 border-white/10 text-white">
                                    <CardHeader>
                                        <CardTitle className="text-lg">Informações Gerais</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <pre className="text-xs bg-black/30 p-4 rounded-lg overflow-x-auto custom-scrollbar border border-white/5">
                                            {JSON.stringify(data.settings, null, 2)}
                                        </pre>
                                    </CardContent>
                                </Card>

                                <div className="space-y-4">
                                    <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 flex gap-4">
                                        <AlertCircle className="h-6 w-6 text-orange-500 shrink-0" />
                                        <div>
                                            <h4 className="font-medium text-orange-400">Verificação de Scope</h4>
                                            <p className="text-sm text-gray-400 mt-1">
                                                Estas informações são acessíveis apenas com o scope `whatsapp_business_management`.
                                                Se você vê esses dados, seu token está configurado corretamente.
                                            </p>
                                        </div>
                                    </div>

                                    <Card className="bg-white/5 border-white/10 text-white">
                                        <CardHeader>
                                            <CardTitle className="text-sm uppercase text-gray-500 tracking-wider">Próximos Passos</CardTitle>
                                        </CardHeader>
                                        <CardContent className="text-sm text-gray-300 space-y-2">
                                            <p>✔️ Gerenciar Números: Concluído</p>
                                            <p>✔️ Gerenciar Templates: Concluído</p>
                                            <p>✔️ Gerenciar WABA: Concluído</p>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white/5 rounded-xl border border-dashed border-white/10">
                                <Settings className="h-12 w-12 text-gray-700 mx-auto mb-4" />
                                <p className="text-gray-500 italic">Carregue as configurações para validar o scope de management.</p>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.05);
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
            `}</style>
        </div>
    )
}

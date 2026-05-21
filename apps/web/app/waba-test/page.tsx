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
import Script from "next/script"

declare global {
    interface Window {
        FB: any;
    }
}

export default function WabaTestPage() {
    const [agents, setAgents] = useState<any[]>([])
    const [selectedAgentId, setSelectedAgentId] = useState<string>("")
    const [loading, setLoading] = useState(false)
    const [isFbLoading, setIsFbLoading] = useState(false)
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
            if (list.length > 0 && !selectedAgentId) setSelectedAgentId(list[0].id)
        } catch (error: any) {
            toast.error("Error loading agents: " + error.message)
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
                toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} data loaded successfully`)
            } else {
                toast.error(`Error loading ${type}: ` + (res.error?.message || "Unknown error"))
            }
        } catch (error: any) {
            toast.error("Error: " + error.message)
        } finally {
            setLoading(false)
        }
    }

    async function handleCreateTemplate() {
        if (!selectedAgentId) return
        if (!newTemplate.name || !newTemplate.text) {
            toast.error("Fill in the template name and text")
            return
        }

        setLoading(true)
        try {
            const res = await createWabaTemplate(selectedAgentId, newTemplate)
            if (res.success) {
                toast.success("Template sent for approval!")
                handleFetch("templates")
                setNewTemplate({ name: "", text: "", category: "UTILITY" })
            } else {
                toast.error("Error creating template: " + (res.error?.message || "Unknown error"))
            }
        } catch (error: any) {
            toast.error("Error: " + error.message)
        } finally {
            setLoading(false)
        }
    }

    function handleFacebookLogin() {
        if (!selectedAgentId) {
            toast.error("Please select an agent first")
            return
        }

        if (typeof window === "undefined" || !window.FB) {
            toast.error("Facebook SDK not loaded. Try again in a few seconds.")
            return
        }

        setIsFbLoading(true)

        const configId = process.env.NEXT_PUBLIC_FACEBOOK_CONFIG_ID
        if (!configId) {
            setIsFbLoading(false)
            toast.error("Missing NEXT_PUBLIC_FACEBOOK_CONFIG_ID environment variable.")
            return
        }

        window.FB.login((response: any) => {
            if (response.authResponse && response.authResponse.code) {
                const code = response.authResponse.code;

                fetch('/api/agents/waba-callback', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ agent_id: selectedAgentId, code: code })
                })
                    .then(res => res.json())
                    .then(data => {
                        setIsFbLoading(false)
                        if (data.success) {
                            toast.success("Meta Account connected successfully!")
                            loadAgents() // Refresh agents to get the new waba status
                        } else {
                            toast.error(data.error || "Error connecting WABA account on server")
                        }
                    })
                    .catch(err => {
                        setIsFbLoading(false)
                        toast.error("Request error. Check console or try again.")
                    })
            } else {
                setIsFbLoading(false)
                toast.error("Facebook login incomplete or cancelled by the user.")
            }
        }, {
            config_id: configId,
            response_type: 'code',
            override_default_response_type: true,
            extras: {
                featureType: 'whatsapp_business_app_onboarding',
                sessionInfoVersion: '3'
            }
        });
    }

    const agent = agents.find(a => a.id === selectedAgentId)

    return (
        <div className="min-h-screen bg-[#0F0F12] text-white p-4 md:p-8">
            <Script
                strategy="lazyOnload"
                src="https://connect.facebook.net/en_US/sdk.js"
                onLoad={() => {
                    if (window.FB) {
                        window.FB.init({
                            appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || '',
                            cookie: true,
                            xfbml: true,
                            version: 'v19.0'
                        });
                    }
                }}
            />

            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                            WABA Management Test Panel
                        </h1>
                        <p className="text-gray-400 mt-1">Verify and manage your WhatsApp Business API infrastructure</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Label htmlFor="agent-select" className="hidden md:block">Agent:</Label>
                        <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
                            <SelectTrigger className="w-[250px] bg-white/5 border-white/10">
                                <SelectValue placeholder="Select an agent" />
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

                {/* Agent Status */}
                {agent && (
                    <div className="space-y-4">
                        <div className="flex justify-start text-sm sm:items-center">
                            <Button
                                onClick={handleFacebookLogin}
                                disabled={isFbLoading}
                                className="bg-[#1877F2] text-white hover:bg-[#1877F2]/90 border-transparent gap-2 font-medium"
                            >
                                {isFbLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path></svg>
                                )}
                                Connect with Meta
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card className="bg-white/5 border-white/10 text-white">
                                <CardHeader className="pb-2">
                                    <CardDescription className="text-gray-400">WABA ID</CardDescription>
                                    <CardTitle className="text-lg font-mono">{agent.waba_id || agent.waba_business_account_id || "Not configured"}</CardTitle>
                                </CardHeader>
                            </Card>
                            <Card className="bg-white/5 border-white/10 text-white">
                                <CardHeader className="pb-2">
                                    <CardDescription className="text-gray-400">Phone Number ID</CardDescription>
                                    <CardTitle className="text-lg font-mono">{agent.waba_phone_number_id || "Not configured"}</CardTitle>
                                </CardHeader>
                            </Card>
                            <Card className="bg-white/5 border-white/10 text-white">
                                <CardHeader className="pb-2">
                                    <CardDescription className="text-gray-400">Token Status</CardDescription>
                                    <CardTitle className="flex items-center gap-2">
                                        {agent.waba_access_token ? (
                                            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">Configured</Badge>
                                        ) : (
                                            <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">Missing</Badge>
                                        )}
                                    </CardTitle>
                                </CardHeader>
                            </Card>
                        </div>
                    </div>
                )}

                <Tabs defaultValue="numbers" className="w-full">
                    <TabsList className="bg-white/5 border border-white/10 p-1 mb-8">
                        <TabsTrigger value="numbers" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white gap-2">
                            <Phone className="h-4 w-4" /> Numbers
                        </TabsTrigger>
                        <TabsTrigger value="templates" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white gap-2">
                            <Layout className="h-4 w-4" /> Templates
                        </TabsTrigger>
                        <TabsTrigger value="accounts" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white gap-2">
                            <Building className="h-4 w-4" /> Accounts
                        </TabsTrigger>
                        <TabsTrigger value="settings" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white gap-2">
                            <Settings className="h-4 w-4" /> Settings
                        </TabsTrigger>
                    </TabsList>

                    {/* Numbers Tab */}
                    <TabsContent value="numbers" className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold">List WhatsApp Business Numbers</h2>
                            <Button onClick={() => handleFetch("numbers")} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Refresh List
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
                                <p className="text-gray-500 italic">Click 'Refresh List' to fetch the numbers.</p>
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
                                        <Plus className="h-5 w-5 text-blue-500" /> Create Template
                                    </CardTitle>
                                    <CardDescription>Create a new basic utility template.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="t-name">Template Name</Label>
                                        <Input
                                            id="t-name"
                                            placeholder="ex: welcome_message"
                                            className="bg-white/5 border-white/10"
                                            value={newTemplate.name}
                                            onChange={e => setNewTemplate({ ...newTemplate, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="t-text">Message (Body)</Label>
                                        <Textarea
                                            id="t-text"
                                            placeholder="Hello {{1}}, welcome!"
                                            className="bg-white/5 border-white/10 min-h-[100px]"
                                            value={newTemplate.text}
                                            onChange={e => setNewTemplate({ ...newTemplate, text: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Category</Label>
                                        <Select value={newTemplate.category} onValueChange={val => setNewTemplate({ ...newTemplate, category: val })}>
                                            <SelectTrigger className="bg-white/5 border-white/10">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="UTILITY">UTILITY</SelectItem>
                                                <SelectItem value="MARKETING">MARKETING</SelectItem>
                                                <SelectItem value="AUTHENTICATION">AUTHENTICATION</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button onClick={handleCreateTemplate} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
                                        Create Template
                                    </Button>
                                </CardFooter>
                            </Card>

                            {/* List Templates */}
                            <div className="lg:col-span-2 space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-medium">Existing Templates</h3>
                                    <Button size="sm" variant="outline" onClick={() => handleFetch("templates")} disabled={loading} className="border-white/10">
                                        Reload
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
                                        <p className="text-gray-500">No templates loaded.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </TabsContent>

                    {/* WABA Accounts Tab */}
                    <TabsContent value="accounts" className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold">Your WhatsApp Business Accounts</h2>
                            <Button onClick={() => handleFetch("accounts")} disabled={loading} className="bg-blue-600">
                                List Accounts
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
                                <p className="text-gray-500">Click to fetch the accounts linked to this token.</p>
                            </div>
                        )}
                    </TabsContent>

                    {/* Settings Tab */}
                    <TabsContent value="settings" className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold">WABA Settings</h2>
                            <Button onClick={() => handleFetch("settings")} disabled={loading} variant="outline" className="border-white/10">
                                Fetch Settings
                            </Button>
                        </div>

                        {data.settings ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card className="bg-white/5 border-white/10 text-white">
                                    <CardHeader>
                                        <CardTitle className="text-lg">General Information</CardTitle>
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
                                            <h4 className="font-medium text-orange-400">Scope Verification</h4>
                                            <p className="text-sm text-gray-400 mt-1">
                                                This information is only accessible with the `whatsapp_business_management` scope.
                                                If you see these details, your token is properly configured.
                                            </p>
                                        </div>
                                    </div>

                                    <Card className="bg-white/5 border-white/10 text-white">
                                        <CardHeader>
                                            <CardTitle className="text-sm uppercase text-gray-500 tracking-wider">Next Steps</CardTitle>
                                        </CardHeader>
                                        <CardContent className="text-sm text-gray-300 space-y-2">
                                            <p>✔️ Manage Numbers: Completed</p>
                                            <p>✔️ Manage Templates: Completed</p>
                                            <p>✔️ Manage WABA: Completed</p>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white/5 rounded-xl border border-dashed border-white/10">
                                <Settings className="h-12 w-12 text-gray-700 mx-auto mb-4" />
                                <p className="text-gray-500 italic">Load settings to validate the management scope.</p>
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

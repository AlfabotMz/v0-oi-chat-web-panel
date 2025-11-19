"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageCircle, Mail, ExternalLink, Users } from "lucide-react"

export default function SupportPage() {
    const communityLink = "https://chat.whatsapp.com/YOUR_COMMUNITY_LINK" // Replace with actual link if available
    const supportWhatsApp = "https://wa.me/258841234567" // Replace with actual number

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Central de Ajuda</h2>
                <p className="text-muted-foreground">
                    Precisa de ajuda? Entre em contato com nossa equipe ou junte-se à comunidade.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Comunidade */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Users className="h-6 w-6 text-purple-600" />
                            <CardTitle>Comunidade OiChat</CardTitle>
                        </div>
                        <CardDescription>
                            Junte-se a outros usuários, compartilhe experiências e receba dicas exclusivas.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            className="w-full gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                            onClick={() => window.open(communityLink, "_blank")}
                        >
                            <MessageCircle className="h-4 w-4" />
                            Entrar na Comunidade
                            <ExternalLink className="h-4 w-4" />
                        </Button>
                    </CardContent>
                </Card>

                {/* Suporte WhatsApp */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <MessageCircle className="h-6 w-6 text-green-600" />
                            <CardTitle>Suporte via WhatsApp</CardTitle>
                        </div>
                        <CardDescription>
                            Fale diretamente com nossa equipe de suporte para resolver problemas técnicos.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            variant="outline"
                            className="w-full gap-2 border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20"
                            onClick={() => window.open(supportWhatsApp, "_blank")}
                        >
                            <MessageCircle className="h-4 w-4" />
                            Falar no WhatsApp
                        </Button>
                    </CardContent>
                </Card>

                {/* Email */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Mail className="h-6 w-6 text-blue-600" />
                            <CardTitle>Email</CardTitle>
                        </div>
                        <CardDescription>
                            Para assuntos administrativos ou parcerias, envie-nos um email.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            variant="outline"
                            className="w-full gap-2"
                            onClick={() => window.location.href = "mailto:suporte@oichat.com"}
                        >
                            <Mail className="h-4 w-4" />
                            Enviar Email
                        </Button>
                    </CardContent>
                </Card>

                {/* FAQ / Docs */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <ExternalLink className="h-6 w-6 text-orange-600" />
                            <CardTitle>Documentação</CardTitle>
                        </div>
                        <CardDescription>
                            Acesse nossos tutoriais e guias passo a passo para aproveitar ao máximo.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            variant="outline"
                            className="w-full gap-2"
                            onClick={() => window.open("#", "_blank")}
                        >
                            <ExternalLink className="h-4 w-4" />
                            Ver Tutoriais
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

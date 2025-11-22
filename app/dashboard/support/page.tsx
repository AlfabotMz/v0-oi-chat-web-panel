import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageCircle, Mail, ExternalLink, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"

export default async function SupportPage() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let communityLink = "https://chat.whatsapp.com/your-invite-code"
    let supportWhatsAppLink = "https://wa.me/258841234567"

    if (user) {
        const { data: profile } = await supabase
            .from("profiles")
            .select("community_link, support_whatsapp_link")
            .eq("id", user.id)
            .single()

        if (profile) {
            if (profile.community_link) communityLink = profile.community_link
            if (profile.support_whatsapp_link) supportWhatsAppLink = profile.support_whatsapp_link
        }
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h2 className="text-3xl font-bold tracking-tight">Suporte & Ajuda</h2>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Comunidade */}
                <Card className="hover:border-primary/50 transition-colors">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MessageCircle className="h-5 w-5 text-primary" />
                            Comunidade
                        </CardTitle>
                        <CardDescription>
                            Junte-se à nossa comunidade no WhatsApp para tirar dúvidas e compartilhar experiências.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href={communityLink} target="_blank" rel="noopener noreferrer">
                            <Button className="w-full gap-2">
                                Acessar Comunidade
                                <ExternalLink className="h-4 w-4" />
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                {/* Suporte Direto */}
                <Card className="hover:border-primary/50 transition-colors">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Mail className="h-5 w-5 text-primary" />
                            Suporte Direto
                        </CardTitle>
                        <CardDescription>
                            Precisa de ajuda específica? Fale diretamente com nosso time de suporte.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href={supportWhatsAppLink} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" className="w-full gap-2">
                                Falar no WhatsApp
                                <ExternalLink className="h-4 w-4" />
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

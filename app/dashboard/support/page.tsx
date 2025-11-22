import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageCircle, Mail, FileText, ExternalLink, ArrowLeft } from "lucide-react"
<MessageCircle className="h-5 w-5 text-primary" />
Comunidade
                        </CardTitle >
    <CardDescription>
        Junte-se à nossa comunidade no WhatsApp para tirar dúvidas e compartilhar experiências.
    </CardDescription>
                    </CardHeader >
    <CardContent>
        <Link href="https://chat.whatsapp.com/..." target="_blank">
            <Button className="w-full gap-2">
                Acessar Comunidade
                <ExternalLink className="h-4 w-4" />
            </Button>
        </Link>
    </CardContent>
                </Card >

    {/* Suporte Direto */ }
    < Card className = "hover:border-primary/50 transition-colors" >
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
                        <Link href="https://wa.me/..." target="_blank">
                            <Button variant="outline" className="w-full gap-2">
                                Falar no WhatsApp
                                <ExternalLink className="h-4 w-4" />
                            </Button>
                        </Link>
                    </CardContent>
                </Card >

    {/* Documentação */ }
    < Card className = "hover:border-primary/50 transition-colors" >
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" />
                            Documentação
                        </CardTitle>
                        <CardDescription>
                            Acesse nossos tutoriais e guias completos para aproveitar ao máximo a plataforma.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="#" target="_blank">
                            <Button variant="secondary" className="w-full gap-2">
                                Ver Tutoriais
                                <ExternalLink className="h-4 w-4" />
                            </Button>
                        </Link>
                    </CardContent>
                </Card >
            </div >
        </div >
    )
}

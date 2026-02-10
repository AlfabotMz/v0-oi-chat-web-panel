import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, Clock, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"

export default function RemarketingPage() {
    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div className="flex items-center gap-2">
                        <div className="relative w-8 h-8 overflow-hidden">
                            <Image src="/oichat-icon.jpg" alt="OiChat Logo" fill className="object-cover" />
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight">Remarketing</h2>
                    </div>
                </div>
            </div>

            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                    <Clock className="w-10 h-10 text-primary" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-2xl font-bold">Brevimente</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                        Estamos trabalhando em uma ferramenta poderosa de remarketing para que você possa reengajar seus contatos de forma automática e estratégica.
                    </p>
                </div>
                <div className="flex gap-4">
                    <Link href="/dashboard">
                        <Button>Voltar ao Dashboard</Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}

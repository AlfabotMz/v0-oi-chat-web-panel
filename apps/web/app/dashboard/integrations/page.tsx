import { DashboardLayout } from "@/components/dashboard/layout"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Smartphone, ArrowRight } from "lucide-react"

export default async function IntegrationsPage() {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
        redirect("/login")
    }

    return (
        <DashboardLayout user={user}>
            <div className="max-w-4xl space-y-6">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Integrações</h1>
                    <p className="text-muted-foreground">Conecte a OiChat com seus apps favoritos.</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Link href="/dashboard/integrations/pushcut" className="block transition hover:scale-[1.01]">
                        <Card className="h-full border-border/50 hover:border-primary/50 cursor-pointer">
                            <CardHeader className="pb-3">
                                <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-2">
                                    <Smartphone className="w-6 h-6 text-blue-500" />
                                </div>
                                <CardTitle className="text-xl">Pushcut (iOS)</CardTitle>
                                <CardDescription>
                                    Receba notificações customizadas no seu iPhone a cada nova encomenda.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex items-center text-sm font-medium text-primary">
                                Configurar <ArrowRight className="ml-1 w-4 h-4" />
                            </CardContent>
                        </Card>
                    </Link>
                </div>
            </div>
        </DashboardLayout>
    )
}

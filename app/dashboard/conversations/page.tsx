"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { signOut } from "@/lib/supabase/auth-actions"

export default function ConversationsPage() {
    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Conversas</h2>
                <Button
                    variant="ghost"
                    onClick={async () => {
                        await signOut()
                        window.location.href = "/login"
                    }}
                    className="gap-2"
                >
                    <LogOut className="h-4 w-4" />
                    Sair
                </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total de Conversas
                        </CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">
                            +0% em relação ao mês passado
                        </p>
                    </CardContent>
                </Card>
            </div>
            <div className="rounded-md border border-dashed p-8 text-center animate-in fade-in zoom-in duration-500">
                <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                        <MessageSquare className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold">Nenhuma conversa ainda</h3>
                    <p className="mb-4 mt-2 text-sm text-muted-foreground">
                        As conversas com seus agentes aparecerão aqui. Conecte seu WhatsApp para começar.
                    </p>
                </div>
            </div>
        </div>
    )
}

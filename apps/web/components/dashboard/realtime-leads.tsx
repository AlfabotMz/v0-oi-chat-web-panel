"use client"

import { useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import type { User } from "@supabase/supabase-js"
import { Inbox } from "lucide-react"

export function RealtimeLeads({ user }: { user: User }) {
    useEffect(() => {
        // Pedir permissão para Notificações Web automaticamente
        if ("Notification" in window && Notification.permission === "default") {
            Notification.requestPermission()
        }

        const supabase = createClient()

        // Listen to inserts on the "leads" table
        const channel = supabase
            .channel('realtime-leads-channel')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'leads',
                    filter: `user_id=eq.${user.id}`
                },
                (payload) => {
                    console.log("📣 Realtime Event Received:", payload)
                    const newLead = payload.new

                    // Exibir notificação (Toast) da nova encomenda internamente
                    toast("Nova Encomenda Recebida!", {
                        description: newLead.user_number ? `Via: ${newLead.user_number}` : "Novo lead recebido agora mesmo.",
                        icon: <Inbox className="h-4 w-4 text-primary" />,
                        action: {
                            label: "Ver",
                            onClick: () => {
                                window.location.href = "/dashboard/leads"
                            }
                        },
                        duration: 8000
                    })

                    // Disparar Notificação Nativa (Push Notification do Sistema Operacional)
                    if ("Notification" in window && Notification.permission === "granted") {
                        const notification = new Notification("Nova Encomenda - OiChat", {
                            body: newLead.user_number ? `Você recebeu um novo lead pelo número ${newLead.user_number}!` : "Você recebeu uma nova encomenda.",
                            icon: "/oichat-icon.jpg",
                        })

                        notification.onclick = () => {
                            window.focus()
                            window.location.href = "/dashboard/leads"
                        }
                    }
                }
            )
            .subscribe((status, err) => {
                console.log("Realtime subscription status:", status)
                if (err) console.error("Realtime subscription error:", err)
            })

        return () => {
            supabase.removeChannel(channel)
        }
    }, [user.id])

    return null // This component does not render anything
}

"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Lock } from "lucide-react"

export function TrialChecker() {
    const [open, setOpen] = useState(false)
    const router = useRouter()

    useEffect(() => {
        const checkTrial = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) return

            const { data: profile } = await supabase
                .from("profiles")
                .select("subscription_status, plan_end_date, plan, stripe_subscription_id")
                .eq("id", user.id)
                .single()

            if (profile) {
                // Se tiver assinatura ativa no Stripe, não bloquear por trial
                if (profile.stripe_subscription_id) return

                const isTrial = profile.subscription_status === 'trial'
                const isExpired = profile.plan_end_date && new Date(profile.plan_end_date) < new Date()

                // If trial expired, block access
                if (isTrial && isExpired) {
                    setOpen(true)
                }
            }
        }

        checkTrial()
    }, [])

    const handleUpgrade = () => {
        router.push("/checkout")
    }

    return (
        <AlertDialog open={open}>
            <AlertDialogContent className="max-w-md">
                <AlertDialogHeader>
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
                        <Lock className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                    <AlertDialogTitle className="text-center text-xl">Seu período de teste acabou</AlertDialogTitle>
                    <AlertDialogDescription className="text-center pt-2">
                        Esperamos que você tenha gostado do OiChat! Para continuar criando agentes e atendendo seus clientes, assine o plano Premium.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="sm:justify-center">
                    <AlertDialogAction
                        onClick={handleUpgrade}
                        className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                        Assinar Agora
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"

export default function RootPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (session) {
          router.replace("/dashboard")
        } else {
          router.replace("/login")
        }
      } catch (error) {
        console.error("Error checking session:", error)
        router.replace("/login")
      } finally {
        setLoading(false)
      }
    }

    checkUser()
  }, [router, supabase.auth])

  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#0F0F12]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-16 h-16 rounded-2xl overflow-hidden shadow-2xl border border-white/10">
          <img src="/oichat-icon.jpg" alt="OiChat Logo" className="object-cover w-full h-full" />
        </div>
        <div className="flex items-center gap-2 text-white/50">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <p className="text-sm font-medium animate-pulse">Carregando OiChat...</p>
        </div>
      </div>
    </div>
  )
}

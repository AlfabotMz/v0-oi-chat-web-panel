"use client"

import type { User } from "@supabase/supabase-js"
import { Button } from "@/components/ui/button"
import { signOut } from "@/lib/supabase/auth-actions"
import { useRouter } from "next/navigation"
import { LogOut, UserIcon } from "lucide-react"

interface HeaderProps {
  user: User
}

export function Header({ user }: HeaderProps) {
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push("/login")
  }

  return (
    <header className="border-b border-border/50 bg-card px-8 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">OiChat Dashboard</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <UserIcon className="w-4 h-4" />
            <span>{user.email}</span>
          </div>
          <Button variant="outline" size="sm" onClick={handleSignOut} className="gap-2 bg-transparent">
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </header>
  )
}

"use client"

import type { User } from "@supabase/supabase-js"
import { Button } from "@/components/ui/button"
import { signOut } from "@/lib/supabase/auth-actions"
import { useRouter } from "next/navigation"
import { LogOut, UserIcon, Menu, X } from "lucide-react"

interface HeaderProps {
  user: User
  onMenuToggle?: () => void
}

export function Header({ user, onMenuToggle }: HeaderProps) {
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push("/login")
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-card px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuToggle}
            className="md:hidden p-2"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-semibold text-foreground sm:text-2xl">OiChat Dashboard</h1>
        </div>
        <div className="flex w-full items-center justify-between gap-3 text-sm text-muted-foreground sm:w-auto sm:justify-end">
          <div className="flex items-center gap-2 truncate">
            <UserIcon className="w-4 h-4 shrink-0" />
            <span className="truncate max-w-[12rem] sm:max-w-xs">{user.email}</span>
          </div>
          <Button variant="outline" size="sm" onClick={handleSignOut} className="gap-2 bg-transparent">
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </div>
      </div>
    </header>
  )
}

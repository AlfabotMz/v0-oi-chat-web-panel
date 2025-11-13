"use client"

import type { ReactNode } from "react"
import type { User } from "@supabase/supabase-js"
import { Navigation } from "./navigation"
import { Header } from "./header"

interface DashboardLayoutProps {
  children: ReactNode
  user: User
}

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background flex-col md:flex-row">
      <div className="hidden md:flex md:w-64 md:flex-shrink-0">
        <Navigation user={user} />
      </div>
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} />
        <div className="flex-1 overflow-auto">
          <div className="px-4 py-6 sm:px-6 lg:px-8">{children}</div>
        </div>
        <div className="md:hidden sticky bottom-0 border-t border-border/40 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
          <Navigation user={user} variant="mobile" />
        </div>
      </main>
    </div>
  )
}

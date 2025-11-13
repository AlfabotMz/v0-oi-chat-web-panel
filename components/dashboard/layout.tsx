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
    <div className="flex min-h-screen flex-col bg-background md:flex-row">
      <div className="hidden md:flex md:w-64 md:flex-shrink-0">
        <Navigation user={user} />
      </div>
      <main className="flex flex-1 flex-col overflow-hidden">
        <Header user={user} />
        <div className="flex-1 overflow-auto">
          <div className="px-4 pb-28 pt-6 sm:px-6 sm:pb-10 lg:px-8 lg:pb-12">{children}</div>
        </div>
        <div className="sticky bottom-0 z-40 border-t border-border/60 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/75 md:hidden">
          <Navigation user={user} variant="mobile" />
        </div>
      </main>
    </div>
  )
}

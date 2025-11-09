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
    <div className="flex h-screen bg-background">
      <Navigation user={user} />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} />
        <div className="flex-1 overflow-auto">
          <div className="p-8">{children}</div>
        </div>
      </main>
    </div>
  )
}

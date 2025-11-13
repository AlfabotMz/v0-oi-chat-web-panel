"use client"

import { useState } from "react"
import type { ReactNode } from "react"
import type { User } from "@supabase/supabase-js"
import { Navigation } from "./navigation"
import { Header } from "./header"

interface DashboardLayoutProps {
  children: ReactNode
  user: User
}

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
<<<<<<< HEAD
    <div className="flex min-h-screen flex-col bg-background">
      <Header user={user} onMenuToggle={() => setIsMenuOpen(!isMenuOpen)} />
      
      {/* Menu lateral minimizável */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-card border-r border-border/50 transition-transform duration-300 ease-in-out ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:static md:z-auto`}
      >
        <Navigation onNavigate={() => setIsMenuOpen(false)} />
      </div>

      {/* Overlay para mobile quando menu está aberto */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      <main className="flex flex-1 flex-col overflow-hidden md:ml-64">
        <div className="flex-1 overflow-auto">
          <div className="px-4 pb-6 pt-6 sm:px-6 lg:px-8">{children}</div>
=======
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
>>>>>>> 3a199d4 (Refactor dashboard layout and navigation components for improved styling and responsiveness. Adjusted layout structure, spacing, and mobile navigation padding for better user experience. Enhanced navigation item styles for improved accessibility.)
        </div>
      </main>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import type { ReactNode } from "react"
import type { User } from "@supabase/supabase-js"
import { Navigation } from "./navigation"
import { Header } from "./header"
import { CommunityInviteDialog } from "./community-invite-dialog"
import { createClient } from "@/lib/supabase/client"
import { TrialChecker } from "./trial-checker"

interface DashboardLayoutProps {
  children: ReactNode
  user: User
}

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [communityLink, setCommunityLink] = useState<string | undefined>()
  const [supportWhatsAppLink, setSupportWhatsAppLink] = useState<string | undefined>()

  useEffect(() => {
    // Buscar links de suporte do perfil admin
    const fetchSupportLinks = async () => {
      const supabase = createClient()
      const { data: adminProfile } = await supabase
        .from("profiles")
        .select("community_link, support_whatsapp_link")
        .eq("role", "admin")
        .single()

      if (adminProfile) {
        setCommunityLink(adminProfile.community_link || undefined)
        setSupportWhatsAppLink(adminProfile.support_whatsapp_link || undefined)
      }
    }

    fetchSupportLinks()
  }, [])

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar para desktop - fixa à esquerda */}
      <aside
        className={`hidden md:block flex-shrink-0 sticky top-0 h-screen transition-all duration-300 ${isCollapsed ? "w-20" : "w-64"
          }`}
      >
        <Navigation
          onNavigate={() => { }}
          communityLink={communityLink}
          supportWhatsAppLink={supportWhatsAppLink}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
          user={user}
        />
      </aside>

      {/* Conteúdo principal */}
      <main className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Header user={user} onMenuToggle={() => setIsMenuOpen(!isMenuOpen)} />

        {/* Menu lateral minimizável para mobile */}
        <div
          className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-card border-r border-border/50 transition-transform duration-300 ease-in-out ${isMenuOpen ? "translate-x-0" : "-translate-x-full"
            } md:hidden`}
        >
          <Navigation
            onNavigate={() => setIsMenuOpen(false)}
            communityLink={communityLink}
            supportWhatsAppLink={supportWhatsAppLink}
            user={user}
          />
        </div>

        {/* Overlay para mobile quando menu está aberto */}
        {isMenuOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setIsMenuOpen(false)}
          />
        )}

        <div className="flex-1 overflow-auto">
          <div className="px-4 pb-28 pt-6 sm:px-6 sm:pb-10 lg:px-8 lg:pb-12">{children}</div>
        </div>

        {/* Menu mobile na parte inferior */}
        <div className="sticky bottom-0 z-40 border-t border-border/60 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/75 md:hidden">
          <Navigation
            variant="mobile"
            onNavigate={() => { }}
            communityLink={communityLink}
            supportWhatsAppLink={supportWhatsAppLink}
            user={user}
          />
        </div>
      </main>

      <CommunityInviteDialog
        communityLink={communityLink}
        whatsappLink={supportWhatsAppLink}
      />
      <TrialChecker />
    </div>
  )
}

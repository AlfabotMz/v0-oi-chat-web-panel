"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { MessageCircle, BarChart3, Settings, HelpCircle, MessageSquare, ChevronLeft, ChevronRight, UserIcon, LogOut, Smartphone, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { signOut } from "@/lib/supabase/auth-actions"
import type { User } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"

interface NavigationProps {
  variant?: "sidebar" | "mobile"
  onNavigate?: () => void
  communityLink?: string
  supportWhatsAppLink?: string
  isCollapsed?: boolean
  onToggleCollapse?: () => void
  user: User
}

const navItems = [
  { href: "/dashboard", label: "Agentes", icon: MessageCircle },
  { href: "/dashboard/remarketing", label: "Remarketing", icon: MessageSquare, isSoon: true },
  { href: "/dashboard/performance", label: "Performance", icon: BarChart3 },
  { href: "/dashboard/settings", label: "Configurações", icon: Settings },
]

export function Navigation({ variant = "sidebar", onNavigate, isCollapsed = false, onToggleCollapse, user }: NavigationProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [plan, setPlan] = useState<string>("free")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPlan = async () => {
      const supabase = createClient()
      const { data: profile } = await supabase
        .from("profiles")
        .select("plan, subscription_status")
        .eq("id", user.id)
        .single()

      if (profile) {
        setPlan(profile.plan || "free")
      }
      setLoading(false)
    }

    fetchPlan()
  }, [user.id])

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    setDeferredPrompt(null);
  };

  const handleSignOut = async () => {
    await signOut()
    router.push("/login")
  }

  const getPlanName = (planCode: string) => {
    switch (planCode) {
      case "pro": return "Plano Pro"
      case "business": return "Plano Business"
      default: return "Plano Gratuito"
    }
  }

  const getPlanBadge = (planCode: string) => {
    switch (planCode) {
      case "pro": return "Pro"
      case "business": return "Biz"
      default: return "Free"
    }
  }

  if (variant === "mobile") {
    return (
      <nav
        className="flex items-stretch justify-around gap-1 px-2 py-3"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 0.75rem)" }}
      >
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 rounded-md px-3 py-2 text-xs transition-colors",
                isActive
                  ? "text-primary font-medium"
                  : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground",
              )}
              onClick={onNavigate}
              data-tour={
                item.label === "Agentes" ? "nav-agents" :
                  item.label === "Remarketing" ? "nav-remarketing" :
                    item.label === "Performance" ? "nav-performance" :
                      item.label === "Configurações" ? "nav-settings" : undefined
              }
            >
              <Icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-muted-foreground")} />
              <span>{item.label}</span>
            </Link>
          )
        })}
        {deferredPrompt && (
          <button
            onClick={handleInstallClick}
            className="flex flex-1 flex-col items-center justify-center gap-1 rounded-md px-3 py-2 text-xs text-primary animate-pulse"
          >
            <Smartphone className="h-5 w-5" />
            <span>Instalar</span>
          </button>
        )}
      </nav>
    )
  }

  return (
    <nav className={cn(
      "flex h-full flex-col bg-[#0F0F12] text-white border-r border-white/5 transition-all duration-300 overflow-y-auto",
      isCollapsed ? "px-2 py-4" : "p-4"
    )}>
      <div className={cn("mb-8 flex items-center", isCollapsed ? "justify-center" : "justify-between px-2")}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/20 flex-shrink-0">
            <span className="font-bold text-white">O</span>
          </div>
          {!isCollapsed && (
            <div>
              <h2 className="text-lg font-bold">OiChat</h2>
            </div>
          )}
        </div>
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCollapse}
              className="hidden md:flex p-2 text-zinc-400 hover:text-white"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            {/* Botão de fechar exclusivo para mobile side menu */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onNavigate}
              className="md:hidden p-2 text-zinc-400 hover:text-white"
              data-tour="mobile-menu-close"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href)
          return (
            <Link key={item.href} href={item.href} onClick={onNavigate}>
              <div
                className={cn(
                  "relative flex items-center gap-3 rounded-xl transition-all duration-200 group",
                  isCollapsed ? "justify-center p-2" : "px-4 py-3",
                  isActive
                    ? "bg-white/5 text-white"
                    : "text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
                )}
                data-tour={
                  item.label === "Agentes" ? "nav-agents" :
                    item.label === "Remarketing" ? "nav-remarketing" :
                      item.label === "Performance" ? "nav-performance" :
                        item.label === "Configurações" ? "nav-settings" : undefined
                }
              >
                {isActive && (
                  <div className={cn(
                    "absolute bg-primary rounded-r-full shadow-[0_0_10px_rgba(168,85,247,0.5)]",
                    isCollapsed ? "left-0 top-1/2 -translate-y-1/2 w-1 h-4" : "left-0 top-1/2 -translate-y-1/2 w-1 h-6"
                  )} />
                )}
                <Icon className={cn("w-5 h-5 transition-colors", isActive ? "text-primary" : "group-hover:text-zinc-300")} />
                {!isCollapsed && <span className="font-medium">{item.label}</span>}

                {!isCollapsed && (item as any).isSoon && (
                  <span className="ml-auto text-[10px] opacity-20 group-hover:opacity-100 transition-opacity">
                    ...
                  </span>
                )}
              </div>
            </Link>
          )
        })}
      </div>

      {isCollapsed && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="hidden md:flex mx-auto mt-2 p-2 text-zinc-400 hover:text-white"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      )}

      <div className="mt-auto space-y-2">
        {deferredPrompt && (
          <Button
            onClick={handleInstallClick}
            variant="ghost"
            className={cn(
              "w-full text-primary hover:text-primary hover:bg-primary/10 rounded-xl h-12 border border-primary/20 bg-primary/5 shadow-[0_0_15px_rgba(168,85,247,0.1)] transition-all duration-300",
              isCollapsed ? "justify-center px-0" : "justify-start gap-3 px-4"
            )}
          >
            <Smartphone className="w-5 h-5" />
            {!isCollapsed && <span className="font-bold">Instalar Aplicativo</span>}
          </Button>
        )}

        <Link href="/dashboard/support" onClick={onNavigate}>
          <Button
            variant="ghost"
            className={cn(
              "w-full text-zinc-500 hover:text-white hover:bg-white/5 rounded-xl h-12",
              isCollapsed ? "justify-center px-0" : "justify-start gap-3",
              pathname === "/dashboard/support" && "bg-white/5 text-white"
            )}
          >
            <HelpCircle className="w-5 h-5" />
            {!isCollapsed && <span className="font-medium">Suporte</span>}
          </Button>
        </Link>
      </div>

      <div className={cn(
        "pt-4 border-t border-white/5",
        isCollapsed ? "flex flex-col items-center gap-4" : "space-y-4"
      )}>
        {!isCollapsed ? (
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
              <UserIcon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.email}</p>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider">{loading ? "Carregando..." : getPlanName(plan)}</p>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400" title={user.email}>
            <UserIcon className="w-4 h-4" />
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className={cn(
            "w-full text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl h-10",
            isCollapsed ? "justify-center px-0" : "justify-start gap-3"
          )}
        >
          <LogOut className="w-4 h-4" />
          {!isCollapsed && <span className="font-medium">Sair</span>}
        </Button>
      </div>
    </nav>
  )
}

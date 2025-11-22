"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { MessageCircle, BarChart3, Settings, X, HelpCircle, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface NavigationProps {
  variant?: "sidebar" | "mobile"
  onNavigate?: () => void
  communityLink?: string
  supportWhatsAppLink?: string
}

const navItems = [
  { href: "/dashboard", label: "Agentes", icon: MessageCircle },
  { href: "/dashboard/conversations", label: "Conversas", icon: MessageSquare },
  { href: "/dashboard/performance", label: "Performance", icon: BarChart3 },
  { href: "/dashboard/settings", label: "Configurações", icon: Settings },
]

export function Navigation({ variant = "sidebar", onNavigate }: NavigationProps) {
  const pathname = usePathname()

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
            >
              <Icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-muted-foreground")} />
              <span>{item.label}</span>
            </Link>
          )
        })}
        <Link
          href="/dashboard/support"
          className="flex flex-1 flex-col items-center justify-center gap-1 rounded-md px-3 py-2 text-xs transition-colors text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
          onClick={onNavigate}
        >
          <HelpCircle className="h-5 w-5" />
          <span>Suporte</span>
        </Link>
      </nav>
    )
  }

  return (
    <nav className="flex h-full flex-col bg-card border-r border-border/50 p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">OiChat</h2>
          <p className="text-sm text-muted-foreground">Agent Management</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onNavigate}
          className="md:hidden p-2"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      <div className="space-y-6">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href)
          return (
            <Link key={item.href} href={item.href} onClick={onNavigate}>
              <div
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors",
                  isActive ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-secondary",
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Botão de Suporte */}
      <div className="mt-auto pt-4 border-t border-border/50">
        <Link href="/dashboard/support" onClick={onNavigate}>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-3 text-foreground hover:bg-secondary",
              pathname === "/dashboard/support" && "bg-secondary"
            )}
          >
            <HelpCircle className="w-5 h-5" />
            <span className="font-medium">Suporte</span>
          </Button>
        </Link>
      </div>
    </nav>
  )
}


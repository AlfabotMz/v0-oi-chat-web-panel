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
    <nav className="flex h-full flex-col bg-[#0F0F12] text-white border-r border-white/5 p-4">
      <div className="mb-8 flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="font-bold text-white">O</span>
          </div>
          <div>
            <h2 className="text-lg font-bold">OiChat</h2>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onNavigate}
          className="md:hidden p-2 text-zinc-400 hover:text-white"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      <div className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href)
          return (
            <Link key={item.href} href={item.href} onClick={onNavigate}>
              <div
                className={cn(
                  "relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                  isActive
                    ? "bg-white/5 text-white"
                    : "text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
                )}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                )}
                <Icon className={cn("w-5 h-5 transition-colors", isActive ? "text-primary" : "group-hover:text-zinc-300")} />
                <span className="font-medium">{item.label}</span>

                {item.label === "Performance" && (
                  <span className="ml-auto text-[10px] font-bold bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
                    NEW
                  </span>
                )}
              </div>
            </Link>
          )
        })}
      </div>

      {/* Botão de Suporte */}
      <div className="mt-auto space-y-4">
        {/* Plan Usage Card */}
        <div className="bg-gradient-to-br from-primary/20 to-purple-900/20 rounded-2xl p-4 border border-white/5 relative overflow-hidden group">
          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-2">
              <div className="p-2 bg-primary/20 rounded-lg">
                <BarChart3 className="w-4 h-4 text-primary" />
              </div>
              <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">Pro</span>
            </div>
            <h4 className="font-bold text-sm mb-1">Plano Business</h4>
            <p className="text-xs text-zinc-400 mb-3">2,450 / 5,000 msgs</p>

            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-primary w-[49%] rounded-full" />
            </div>
          </div>
        </div>

        <Link href="/dashboard/support" onClick={onNavigate}>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-3 text-zinc-500 hover:text-white hover:bg-white/5 rounded-xl h-12",
              pathname === "/dashboard/support" && "bg-white/5 text-white"
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


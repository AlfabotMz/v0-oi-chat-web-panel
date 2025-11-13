"use client"

import type { User } from "@supabase/supabase-js"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { MessageCircle, BarChart3, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

interface NavigationProps {
  user: User
  variant?: "sidebar" | "mobile"
  onNavigate?: () => void
}

const navItems = [
  { href: "/dashboard", label: "Agents", icon: MessageCircle },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
]

export function Navigation({ variant = "sidebar", onNavigate }: NavigationProps) {
  const pathname = usePathname()

  if (variant === "mobile") {
    return (
      <nav className="flex items-stretch justify-around gap-1 px-2 py-3 bg-card">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 text-xs rounded-md transition-colors",
                isActive ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground",
              )}
              onClick={onNavigate}
            >
              <Icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-muted-foreground")} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    )
  }

  return (
    <nav className="w-64 border-r border-border/50 bg-card p-6 space-y-8">
      <div>
        <h2 className="text-lg font-bold text-foreground">OiChat</h2>
        <p className="text-sm text-muted-foreground">Agent Management</p>
      </div>

      <div className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href)
          return (
            <Link key={item.href} href={item.href}>
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
    </nav>
  )
}

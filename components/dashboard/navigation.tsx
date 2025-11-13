"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { MessageCircle, BarChart3, Settings, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface NavigationProps {
  onNavigate?: () => void
}

const navItems = [
  { href: "/dashboard", label: "Agents", icon: MessageCircle },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
]

export function Navigation({ onNavigate }: NavigationProps) {
  const pathname = usePathname()

  return (
    <nav className="flex h-full flex-col bg-card p-6">
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

      <div className="space-y-2">
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
    </nav>
  )
}

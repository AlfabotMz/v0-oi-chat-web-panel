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

<<<<<<< HEAD
=======
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
      </nav>
    )
  }

>>>>>>> 3a199d4 (Refactor dashboard layout and navigation components for improved styling and responsiveness. Adjusted layout structure, spacing, and mobile navigation padding for better user experience. Enhanced navigation item styles for improved accessibility.)
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

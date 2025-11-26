"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"

interface BackButtonProps {
  href?: string
  className?: string
  label?: string
}

export function BackButton({ href, className, label = "Voltar" }: BackButtonProps) {
  const router = useRouter()

  const handleClick = () => {
    if (href) {
      router.push(href)
    } else {
      router.back()
    }
  }

  return (
    <Button
      variant="ghost"
      onClick={handleClick}
      className={cn("hidden md:flex items-center gap-2", className)}
    >
      <ArrowLeft className="w-4 h-4" />
      {label}
    </Button>
  )
}

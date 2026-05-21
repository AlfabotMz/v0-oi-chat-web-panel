"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { MessageCircle, ExternalLink } from "lucide-react"
import { useState, useEffect } from "react"

interface CommunityInviteDialogProps {
  communityLink?: string
  whatsappLink?: string
}

export function CommunityInviteDialog({ communityLink, whatsappLink }: CommunityInviteDialogProps) {
  const [open, setOpen] = useState(false)
  const [dontShowAgain, setDontShowAgain] = useState(false)

  useEffect(() => {
    // Verificar se deve mostrar o popup
    const hideInvite = localStorage.getItem("hideCommunityInvite")
    const urlParams = new URLSearchParams(window.location.search)
    const onboardingComplete = urlParams.get("onboarding") === "complete"
    
    if (!hideInvite && onboardingComplete && communityLink) {
      setOpen(true)
      // Remover parâmetro da URL
      window.history.replaceState({}, "", window.location.pathname)
    }
  }, [communityLink])

  const handleJoin = () => {
    if (communityLink) {
      window.open(communityLink, "_blank")
    }
    if (dontShowAgain) {
      localStorage.setItem("hideCommunityInvite", "true")
    }
    setOpen(false)
  }

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem("hideCommunityInvite", "true")
    }
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <DialogTitle>Junte-se à Comunidade OiChat!</DialogTitle>
              <DialogDescription>
                Conecte-se com outros usuários e receba suporte
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            Faça parte da nossa comunidade e tenha acesso a:
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-purple-600 dark:text-purple-400">•</span>
              <span>Dicas e tutoriais exclusivos</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600 dark:text-purple-400">•</span>
              <span>Suporte da comunidade</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600 dark:text-purple-400">•</span>
              <span>Atualizações e novidades</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600 dark:text-purple-400">•</span>
              <span>Networking com outros usuários</span>
            </li>
          </ul>
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="dontShowAgain"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="w-4 h-4 rounded border-border"
            />
            <label htmlFor="dontShowAgain" className="text-xs text-muted-foreground cursor-pointer">
              Não mostrar novamente
            </label>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleClose} className="flex-1">
            Depois
          </Button>
          <Button
            onClick={handleJoin}
            className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 gap-2"
          >
            Participar
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

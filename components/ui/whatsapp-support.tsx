"use client"

import { MessageCircle } from "lucide-react"

export function WhatsAppSupport() {
    const whatsappNumber = "258856428686"
    const whatsappUrl = `https://wa.me/${whatsappNumber}`

    return (
        <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-all hover:scale-110 hover:bg-[#20ba5a] active:scale-95 group"
            aria-label="Suporte WhatsApp"
        >
            <MessageCircle className="h-7 w-7" />
            <span className="absolute right-full mr-3 whitespace-nowrap rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none border border-white/10 shadow-xl">
                Precisa de ajuda?
            </span>
            <div className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20 -z-10" />
        </a>
    )
}

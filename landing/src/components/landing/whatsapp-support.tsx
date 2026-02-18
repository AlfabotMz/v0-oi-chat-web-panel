"use client"

import { MessageCircle } from "lucide-react"

export function WhatsAppSupport() {
    const handleClick = () => {
        window.open("https://wa.me/258844274944?text=Olá, vim pela landing page e gostaria de saber mais sobre o OiChat.", "_blank")
    }

    return (
        <button
            onClick={handleClick}
            className="fixed bottom-8 right-8 z-[60] group flex items-center gap-3"
            aria-label="Suporte via WhatsApp"
        >
            <div className="bg-white dark:bg-zinc-900 border border-border px-4 py-2 rounded-full shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0 hidden md:block">
                <p className="text-sm font-bold whitespace-nowrap">Dúvidas? Fale conosco!</p>
            </div>
            <div className="w-16 h-16 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all animate-bounce duration-[4000ms]">
                <MessageCircle size={32} />
            </div>
        </button>
    )
}

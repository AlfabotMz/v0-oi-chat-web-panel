import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "OiChat - Venda no Automático via WhatsApp | IA Gratís por 7 Dias",
  description: "O OiChat automatiza seu atendimento no WhatsApp, fecha pedidos e organiza sua expedição 24h por dia. Sistema de vendas inteligente focado em alta conversão.",
  keywords: ["whatsapp automação", "IA para whatsapp", "atendimento automático", "chatbot vendas", "oi chat", "vendas mozambique"],
  openGraph: {
    title: "OiChat - Venda no Automático via WhatsApp",
    description: "Crie agentes inteligentes que respondem, qualificam leads e agendam reuniões no WhatsApp.",
    type: "website",
    locale: "pt_MZ",
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-MZ" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  )
}

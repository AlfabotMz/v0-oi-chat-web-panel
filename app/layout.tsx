import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "OiChat - Automação de Atendimento com IA",
  description: "Crie agentes de IA inteligentes para WhatsApp em minutos. Automatize seu suporte, vendas e atendimento com a OiChat.",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/oichat-icon.jpg",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/oichat-icon.jpg",
        media: "(prefers-color-scheme: dark)",
      },
    ],
    apple: "/oichat-icon.jpg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}

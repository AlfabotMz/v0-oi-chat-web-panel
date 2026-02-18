"use client"

import { V2Nav } from "@/components/landing/v2-nav"
import { V2Hero } from "@/components/landing/v2-hero"
import { V2SocialProof } from "@/components/landing/v2-social-proof"
import { V2Differential } from "@/components/landing/v2-differential"
import { V2ProblemSolution } from "@/components/landing/v2-problem-solution"
import { V2HowItWorks } from "@/components/landing/v2-how-it-works"
import { V2Pricing } from "@/components/landing/v2-pricing"
import { V2Objections } from "@/components/landing/v2-objections"
import { V2CTA } from "@/components/landing/v2-cta"
import { V2Footer } from "@/components/landing/v2-footer"
import { WhatsAppSupport } from "@/components/landing/whatsapp-support"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-violet-600/20 selection:text-violet-600">
      <V2Nav />
      <main className="flex-1">
        <V2Hero />
        <V2SocialProof />
        <V2Differential />
        <V2ProblemSolution />
        <V2HowItWorks />
        <V2Pricing />
        <V2Objections />
        <V2CTA />
      </main>
      <V2Footer />
      <WhatsAppSupport />
    </div>
  )
}

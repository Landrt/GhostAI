import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Hero } from "@/components/landing/Hero";
import { Problem } from "@/components/landing/Problem";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { VoiceProfilePreview } from "@/components/landing/VoiceProfilePreview";
import { BeforeAfter } from "@/components/landing/BeforeAfter";
import { QualityCheckPreview } from "@/components/landing/QualityCheckPreview";
import { PricingTable } from "@/components/landing/PricingTable";
import { FAQ } from "@/components/landing/FAQ";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { PublicFooter } from "@/components/navigation/PublicFooter";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink">
      {/* Navigation publique */}
      <header className="border-b border-line bg-surface/90 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex flex-col">
            <span className="font-bold text-lg text-ink tracking-tight">GhostAI</span>
            <span className="text-[10px] text-ink-quiet">Your Voice. Your Ideas.</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-ink-quiet">
            <a href="#how-it-works" className="hover:text-ink transition-colors">
              Comment ça marche
            </a>
            <Link href="/pricing" className="hover:text-ink transition-colors">
              Tarifs
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Se connecter
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="secondary" size="sm">
                Créer un compte
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Contenu principal ordonné selon la spec */}
      <main className="flex-1">
        <Hero />
        <Problem />
        <HowItWorks />
        <VoiceProfilePreview />
        <BeforeAfter />
        <QualityCheckPreview />
        <PricingTable />
        <FAQ />
        <FinalCTA />
      </main>

      {/* Pied de page */}
      <PublicFooter />
    </div>
  );
}

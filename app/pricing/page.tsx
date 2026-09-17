import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { PricingTable } from "@/components/landing/PricingTable";
import { FAQ } from "@/components/landing/FAQ";
import { PublicFooter } from "@/components/navigation/PublicFooter";

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink">
      {/* Header */}
      <header className="border-b border-line bg-surface sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex flex-col">
            <span className="font-bold text-lg text-ink tracking-tight">GhostAI</span>
            <span className="text-[10px] text-ink-quiet">Your Voice. Your Ideas.</span>
          </Link>

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

      <main className="flex-1 py-12">
        <PricingTable isFullPage={true} />
        <FAQ isPricing={true} />
      </main>

      <PublicFooter />
    </div>
  );
}

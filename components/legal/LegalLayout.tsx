"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { ArrowLeft, FileText, Shield, Cookie, Cpu, Users, Wallet, Scale } from "lucide-react";
import { PublicFooter } from "@/components/navigation/PublicFooter";

export interface LegalTab {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const LEGAL_TABS: LegalTab[] = [
  { href: "/legal/mentions-legales", label: "Mentions Légales", icon: FileText },
  { href: "/legal/terms", label: "Conditions d'Utilisation & Vente", icon: Scale },
  { href: "/legal/privacy", label: "Politique de Confidentialité", icon: Shield },
  { href: "/legal/cookies", label: "Politique des Cookies", icon: Cookie },
  { href: "/legal/decharge-ia", label: "Décharge IA", icon: Cpu },
  { href: "/legal/terms-partners", label: "Programme Partenaire", icon: Users },
  { href: "/legal/retraits-affiliation", label: "Retraits Affiliation", icon: Wallet },
  { href: "/legal/dpa", label: "Accord DPA (RGPD)", icon: Shield },
];

interface LegalLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  badge?: string;
  lastUpdated?: string;
}

export function LegalLayout({
  children,
  title,
  subtitle,
  badge = "Documentation Légale Officielle",
  lastUpdated = "17 septembre 2026",
}: LegalLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-paper flex flex-col font-sans text-ink">
      {/* En-tête de navigation */}
      <header className="border-b border-line bg-surface sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-ink font-semibold text-sm hover:opacity-80 transition-opacity">
            <span className="font-serif text-lg tracking-tight font-bold">GhostAI</span>
          </Link>
          <div className="flex items-center gap-4 text-xs">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-ink-quiet hover:text-ink font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour à l&apos;accueil
            </Link>
          </div>
        </div>

        {/* Barre d'onglets horizontaux des documents légaux */}
        <div className="border-t border-line/60 bg-paper overflow-x-auto">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center gap-1 py-1.5">
            {LEGAL_TABS.map((tab) => {
              const isActive = pathname === tab.href || (tab.href === "/legal/privacy" && pathname === "/privacy");
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={clsx(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap transition-colors",
                    isActive
                      ? "bg-surface text-mark border border-line shadow-sm font-semibold"
                      : "text-ink-quiet hover:text-ink hover:bg-surface/50"
                  )}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{tab.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-10 space-y-8">
        {/* Titre & métadonnées */}
        <div className="space-y-3 border-b border-line pb-6">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-mark bg-mark-light px-2.5 py-1 rounded-full">
            <Scale className="w-3.5 h-3.5" />
            {badge}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink font-serif">
            {title}
          </h1>
          {subtitle && <p className="text-sm text-ink-quiet">{subtitle}</p>}
          <p className="text-xs text-ink-quiet">
            Dernière mise à jour : {lastUpdated} • Document contractuel opposable
          </p>
        </div>

        {/* Corps du texte légal */}
        <div className="text-xs sm:text-sm text-ink leading-relaxed space-y-6">
          {children}
        </div>
      </main>

      {/* Footer global unifié */}
      <PublicFooter />
    </div>
  );
}

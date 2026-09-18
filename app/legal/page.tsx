import React from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ShieldCheck, Sparkles, Scale, BookOpen, Clock, Lock } from "lucide-react";
import { getAllLegalDocuments, LEGAL_CATEGORIES } from "@/lib/legal/registry";
import { LegalIcon } from "@/components/legal/LegalIcon";
import { PublicFooter } from "@/components/navigation/PublicFooter";

export const metadata = {
  title: "Centre de Conformité & Portail Juridique | GhostAI",
  description: "Portail juridique officiel de GhostAI : Mentions Légales, CGU/CGV, Confidentialité, Cookies, Programme Partenaire, Décharge IA et DPA.",
};

export default function LegalHubPage() {
  const documents = getAllLegalDocuments();

  return (
    <div className="min-h-screen bg-paper flex flex-col font-sans text-ink">
      {/* En-tête de navigation */}
      <header className="border-b border-line bg-surface sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-ink font-semibold text-sm hover:opacity-80 transition-opacity">
            <span className="font-serif text-lg tracking-tight font-bold">GhostAI</span>
            <span className="text-[10px] font-sans text-ink-quiet bg-paper border border-line px-2 py-0.5 rounded-full font-medium">
              Espace Juridique
            </span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs text-ink-quiet hover:text-ink font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour à l&apos;accueil</span>
          </Link>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-12 space-y-12">
        {/* Hero Section */}
        <div className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-mark bg-mark-light px-2.5 py-1 rounded-full">
            <Scale className="w-3.5 h-3.5" />
            Transparence & Conformité Réglementaire
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-ink font-serif">
            Centre de Conformité & Portail Juridique
          </h1>
          <p className="text-sm sm:text-base text-ink-quiet leading-relaxed font-sans">
            Retrouvez ici l&apos;intégralité des textes contractuels, chartes de partenariat, politiques de souveraineté des données et accords régissant l&apos;utilisation de GhostAI.
          </p>
        </div>

        {/* 3 Piliers de confiance GhostAI */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-card border border-line bg-surface shadow-sm space-y-2">
            <div className="w-9 h-9 rounded-lg bg-confirm-light text-confirm flex items-center justify-center font-bold">
              <Lock className="w-4 h-4" />
            </div>
            <h3 className="font-serif font-bold text-sm text-ink">Zéro Réentraînement IA</h3>
            <p className="text-xs text-ink-quiet leading-relaxed">
              Vos idées, notes et publications LinkedIn ne sont jamais exploitées pour réentraîner des modèles publics. Vos contenus restent votre propriété exclusive.
            </p>
          </div>

          <div className="p-5 rounded-card border border-line bg-surface shadow-sm space-y-2">
            <div className="w-9 h-9 rounded-lg bg-mark-light text-mark flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="font-serif font-bold text-sm text-ink">30% de Commission à Vie</h3>
            <p className="text-xs text-ink-quiet leading-relaxed">
              Programme d&apos;affiliation équitable avec tracking 60 jours, déblocage transparent à 30 jours et retraits dès 75 $.
            </p>
          </div>

          <div className="p-5 rounded-card border border-line bg-surface shadow-sm space-y-2">
            <div className="w-9 h-9 rounded-lg bg-paper border border-line text-ink flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="font-serif font-bold text-sm text-ink">Conformité RGPD Stricte</h3>
            <p className="text-xs text-ink-quiet leading-relaxed">
              Hébergement sécurisé, traçabilité des accès, politique de cookies transparente sans pixels publicitaires invasifs.
            </p>
          </div>
        </div>

        {/* Grille des 8 documents par catégorie */}
        <div className="space-y-10">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <h2 className="text-lg sm:text-xl font-serif font-bold text-ink flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-mark" />
              Index des 8 Documents Officiels
            </h2>
            <span className="text-xs text-ink-quiet font-medium">8 documents en vigueur</span>
          </div>

          <div className="space-y-8">
            {LEGAL_CATEGORIES.map((category) => {
              const categoryDocs = documents.filter((doc) => doc.category === category);
              if (categoryDocs.length === 0) return null;

              return (
                <div key={category} className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-ink-quiet">
                    {category}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {categoryDocs.map((doc) => (
                      <Link
                        key={doc.slug}
                        href={`/legal/${doc.slug}`}
                        className="group block p-6 rounded-card border border-line bg-surface hover:border-mark/40 hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="w-10 h-10 rounded-lg bg-paper border border-line flex items-center justify-center text-mark group-hover:bg-mark-light transition-colors">
                            <LegalIcon name={doc.iconName} className="w-5 h-5" />
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-ink-quiet font-medium bg-paper px-2 py-0.5 rounded-full border border-line/60">
                            <Clock className="w-3 h-3" />
                            <span>{doc.estimatedReadingTime}</span>
                          </div>
                        </div>

                        <div className="mt-4 space-y-1.5">
                          <h4 className="font-serif font-bold text-base text-ink group-hover:text-mark transition-colors">
                            {doc.title}
                          </h4>
                          <p className="text-xs text-ink-quiet leading-relaxed">
                            {doc.description}
                          </p>
                        </div>

                        <div className="mt-5 pt-3 border-t border-line/50 flex items-center justify-between text-xs font-medium text-mark">
                          <span>Consulter les clauses</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Boîte Contact / DPA sur mesure */}
        <div className="p-6 rounded-card border border-line bg-surface/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="font-serif font-bold text-sm text-ink">Besoin d&apos;un accord spécifique ou d&apos;un DPA signé ?</h4>
            <p className="text-xs text-ink-quiet">
              Pour les entreprises, agences et commandes groupées nécessitant un contrat personnalisé ou un DPA contresigné.
            </p>
          </div>
          <a
            href="mailto:contact@ghostai.app?subject=Demande%20Juridique%20GhostAI"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-btn bg-surface border border-line text-xs font-semibold text-ink hover:bg-paper hover:border-mark transition-colors shrink-0"
          >
            <span>Contacter le département juridique</span>
          </a>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

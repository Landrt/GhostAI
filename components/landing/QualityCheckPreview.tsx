import React from "react";
import { QualityScore } from "@/components/posts/QualityScore";

export function QualityCheckPreview() {
  return (
    <section className="py-20 bg-surface border-y border-line">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-4">
            <span className="text-xs font-semibold text-mark uppercase tracking-wider">Garantie éditoriale</span>
            <h2 className="text-3xl font-bold text-ink tracking-tight">
              Chaque post est vérifié avant de t&apos;être montré — jamais l&apos;inverse.
            </h2>
            <p className="text-sm sm:text-base text-ink-quiet leading-relaxed">
              Trois vérifications s&apos;exécutent en parallèle sur chaque brouillon : la densité de tournures formulaires, la spécificité des détails concrets, et la distance mathématique avec tes écrits passés. Si les seuils ne sont pas atteints, le texte retourne en réécriture automatique.
            </p>
          </div>

          <div className="lg:col-span-6">
            <QualityScore
              voiceMatchScore={88}
              specificityScore={84}
              genericityScore={12}
              clicheScore={4}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

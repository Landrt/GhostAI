import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function Hero() {
  return (
    <section className="py-16 md:py-24 max-w-6xl mx-auto px-4 sm:px-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Colonne gauche : Copy & CTAs */}
        <div className="lg:col-span-7 flex flex-col items-start text-left space-y-6">
          <div className="inline-flex items-center px-2.5 py-1 rounded bg-mark-light text-mark text-xs font-medium border border-mark/20">
            Ghostwriting LinkedIn sans compromis
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-ink tracking-tight leading-[1.1]">
            Write LinkedIn posts that actually sound like you.
          </h1>

          <p className="text-base sm:text-lg text-ink-quiet max-w-xl leading-relaxed">
            Les autres outils génèrent une fois et espèrent. Le nôtre génère, compare à une version neutre, et ne te montre que ce qui bat vraiment le générique.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2 w-full sm:w-auto">
            <Link href="/register">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                Créer ton premier post
              </Button>
            </Link>

            <a
              href="#how-it-works"
              className="text-sm font-medium text-ink-quiet hover:text-ink transition-colors px-3 py-2 text-center"
            >
              Voir comment ça marche
            </a>
          </div>
        </div>

        {/* Colonne droite : Comparatif avant/après statique */}
        <div className="lg:col-span-5 bg-surface border border-line rounded-card p-5 sm:p-6">
          <div className="space-y-4">
            {/* Version générique */}
            <div className="p-4 bg-paper rounded-input border border-line">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-ink-quiet uppercase tracking-wider">Version générique rejetée</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-danger/10 text-danger rounded font-medium">Clichés détectés</span>
              </div>
              <p className="text-xs sm:text-sm text-ink-quiet leading-relaxed">
                <span className="underline decoration-mark decoration-2 font-medium text-ink">Dans le paysage actuel</span>, il est indispensable de{" "}
                <span className="underline decoration-mark decoration-2 font-medium text-ink">naviguer dans la complexité</span> pour libérer son potentiel.{" "}
                <span className="underline decoration-mark decoration-2 font-medium text-ink">Voici pourquoi c&apos;est un game changer</span>...
              </p>
            </div>

            {/* Séparateur / Flèche */}
            <div className="flex items-center justify-center text-xs font-mono text-ink-quiet">
              <span className="bg-surface px-2 py-0.5 text-mark font-semibold border border-line rounded">
                Refus actif par le checker de voix
              </span>
            </div>

            {/* Ta version */}
            <div className="p-4 bg-surface rounded-input border-2 border-ink">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-ink uppercase tracking-wider">Ta version retenue</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-confirm/15 text-confirm rounded font-medium">Voice Match 89%</span>
              </div>
              <p className="text-xs sm:text-sm text-ink font-medium leading-relaxed">
                On a passé 4 mois à empiler des fonctionnalités parce qu&apos;on avait peur de demander aux utilisateurs ce qu&apos;ils voulaient vraiment. Résultat : 0 vente. La simplicité fait peur parce qu&apos;elle n&apos;offre aucun endroit où cacher ses doutes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

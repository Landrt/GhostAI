import React from "react";
import Link from "next/link";
import { ShieldCheck, Sparkles } from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="border-t border-line bg-surface text-ink-quiet">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Colonne 1 : Brand & mission */}
          <div className="space-y-3 sm:col-span-2 md:col-span-1">
            <Link href="/" className="flex flex-col">
              <span className="font-bold text-lg text-ink tracking-tight font-serif">GhostAI</span>
              <span className="text-[10px] text-ink-quiet font-medium">Your Voice. Your Ideas.</span>
            </Link>
            <p className="text-xs leading-relaxed text-ink-quiet pr-2">
              Ghostwriting LinkedIn et atomisation multicanale sans compromis. Écris des publications percutantes qui te ressemblent fidèlement.
            </p>
            <div className="pt-1">
              <span className="inline-flex items-center gap-1.5 text-[11px] text-confirm font-medium bg-confirm-light px-2 py-0.5 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Zéro réentraînement IA</span>
              </span>
            </div>
          </div>

          {/* Colonne 2 : Produit */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-ink">Produit</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/#how-it-works" className="hover:text-ink transition-colors">
                  Comment ça marche
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-ink transition-colors">
                  Tarifs & Abonnements
                </Link>
              </li>
              <li>
                <Link href="/app/repurpose" className="inline-flex items-center gap-1 text-ink-quiet hover:text-ink transition-colors">
                  <Sparkles className="w-3 h-3 text-mark" />
                  <span>Atomiseur (Opus Clip)</span>
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-ink transition-colors">
                  Créer ton premier post
                </Link>
              </li>
            </ul>
          </div>

          {/* Colonne 3 : Partenariat */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-ink">Partenariat & Affiliation</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/app/partner" className="hover:text-ink transition-colors">
                  Programme Partenaire
                </Link>
              </li>
              <li>
                <Link href="/legal/programme-partenaire" className="hover:text-ink transition-colors">
                  Conditions Partenaires
                </Link>
              </li>
              <li>
                <Link href="/legal/retraits-affiliation" className="hover:text-ink transition-colors">
                  Modalités des Retraits
                </Link>
              </li>
            </ul>
          </div>

          {/* Colonne 4 : Légal & Conformité */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-ink">Conformité & Légal</h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link href="/legal/mentions-legales" className="hover:text-ink transition-colors">
                  Mentions Légales
                </Link>
              </li>
              <li>
                <Link href="/legal/cgu-cgv" className="hover:text-ink transition-colors">
                  Conditions d’Utilisation & Vente (CGU/CGV)
                </Link>
              </li>
              <li>
                <Link href="/legal/confidentialite" className="hover:text-ink transition-colors">
                  Politique de Confidentialité (RGPD)
                </Link>
              </li>
              <li>
                <Link href="/legal/cookies" className="hover:text-ink transition-colors">
                  Gestion des Cookies
                </Link>
              </li>
              <li>
                <Link href="/legal/decharge-ia" className="hover:text-ink transition-colors">
                  Décharge relative à l’IA
                </Link>
              </li>
              <li>
                <Link href="/legal/dpa" className="hover:text-ink transition-colors">
                  Accord de Traitement (DPA B2B)
                </Link>
              </li>
              <li>
                <Link href="/legal" className="hover:text-ink transition-colors">
                  Centre Légal
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bas de page / Mentions & Copyright */}
        <div className="pt-8 border-t border-line/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} GhostAI. Tous droits réservés.</p>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-ink-quiet">
            <Link href="/legal/mentions-legales" className="hover:text-ink transition-colors">
              Mentions Légales
            </Link>
            <span>•</span>
            <Link href="/legal/cgu-cgv" className="hover:text-ink transition-colors">
              CGU / CGV
            </Link>
            <span>•</span>
            <Link href="/legal/confidentialite" className="hover:text-ink transition-colors">
              Confidentialité
            </Link>
            <span>•</span>
            <Link href="/legal/cookies" className="hover:text-ink transition-colors">
              Cookies
            </Link>
            <span>•</span>
            <Link href="/legal" className="hover:text-ink transition-colors">
              Centre Légal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

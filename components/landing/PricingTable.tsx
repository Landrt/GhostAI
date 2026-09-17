import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Check, ShieldCheck } from "lucide-react";

export function PricingTable({ isFullPage = false }: { isFullPage?: boolean }) {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "/mois",
      billingNote: "Sans carte bancaire",
      subtitle: "Génération complète avec vérification qualité incluse — pas une version brute limitée.",
      features: [
        "5 posts par mois",
        "1 Pack Atomiseur d'essai / mois (Opus Clip)",
        "Triple vérification qualité",
        "Aperçu feed LinkedIn fidèle",
        "Profil de voix initial",
        "Export de données complet",
      ],
      ctaText: "Commencer gratuitement",
      ctaHref: "/register",
      popular: false,
    },
    {
      name: "Pro",
      price: "$49",
      period: "/mois",
      billingNote: "Paiement 30 jours • Zéro reconduction forcée",
      subtitle: "Pour qui publie régulièrement.",
      features: [
        "30 posts par mois",
        "4 Packs Atomiseur complets / mois (10 posts, 3 carrousels, 10 hooks)",
        "Triple vérification qualité",
        "Aperçu feed LinkedIn fidèle",
        "Apprentissage continu de la voix",
        "Régénérations ciblées rapides",
        "Support prioritaire",
      ],
      ctaText: "Choisir le plan Pro",
      ctaHref: "/register",
      popular: true,
    },
    {
      name: "ProMax",
      price: "$99",
      period: "/mois",
      billingNote: "Paiement 30 jours • Zéro reconduction forcée",
      subtitle: "Pour qui gère plusieurs voix ou publie sans compter.",
      features: [
        "Usage illimité (posts)",
        "30 Packs Atomiseur XXL / mois (Quotidien)",
        "Toutes les fonctionnalités Pro",
        "Gestion multi-voix",
        "Analyse approfondie de la consistance",
        "Accès prioritaire aux nouveaux moteurs",
      ],
      ctaText: "Choisir ProMax",
      ctaHref: "/register",
      popular: false,
    },
  ];

  return (
    <section className="py-20 max-w-6xl mx-auto px-4 sm:px-6">
      <div className="text-center mb-8">
        <span className="text-xs font-semibold text-mark uppercase tracking-wider">Tarification transparente</span>
        <h2 className="text-3xl font-bold text-ink tracking-tight mt-1">
          Simple. Prévisible. Aucun piège.
        </h2>
        <p className="text-sm sm:text-base text-ink-quiet mt-2 max-w-xl mx-auto">
          Même sur le plan gratuit, chaque post passe par la boucle de vérification complète.
        </p>
      </div>

      {/* ENCART MARKETING : CHARTE ZÉRO RECONDUCTION FORCÉE */}
      <div className="mb-10 max-w-2xl mx-auto bg-surface border border-line rounded-card p-4 sm:p-5 shadow-xs flex items-start gap-3.5 text-left">
        <div className="w-8 h-8 rounded-full bg-confirm/10 text-confirm shrink-0 flex items-center justify-center mt-0.5">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-xs sm:text-sm font-bold text-ink">
              Garantie Anti-Prélèvement Piège • Maîtrise Totale de votre Budget
            </h4>
            <span className="text-[10px] font-mono uppercase bg-confirm/15 text-confirm px-2 py-0.5 rounded-full font-semibold">
              Sans tacite reconduction
            </span>
          </div>
          <p className="text-xs text-ink-quiet leading-relaxed">
            Contrairement aux abonnements SaaS traditionnels qui continuent de vous prélever en silence chaque mois, <strong>vos paiements GhostAI ne sont jamais renouvelés automatiquement</strong>. Chaque recharge vous octroie 30 jours d&apos;accès complets. À l&apos;échéance, c&apos;est vous et vous seul qui décidez en 1 clic de prolonger si vous êtes satisfait. Zéro débit surprise, zéro démarche fastidieuse de désabonnement.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`bg-surface border rounded-card p-6 sm:p-8 flex flex-col justify-between relative transition-all ${
              plan.popular ? "border-ink ring-1 ring-ink" : "border-line"
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-ink text-surface text-[11px] font-semibold px-3 py-0.5 rounded-full">
                Le plus choisi
              </div>
            )}

            <div>
              <h3 className="text-xl font-bold text-ink">{plan.name}</h3>
              <p className="text-xs text-ink-quiet mt-1 min-h-[36px]">{plan.subtitle}</p>

              <div className="my-6">
                <span className="text-4xl font-extrabold text-ink font-mono">{plan.price}</span>
                <span className="text-xs text-ink-quiet font-medium">{plan.period}</span>
                <span className="block text-[11px] font-medium text-confirm mt-1">
                  ✓ {plan.billingNote}
                </span>
              </div>

              <div className="space-y-3 pt-4 border-t border-line/60">
                {plan.features.map((feat) => (
                  <div key={feat} className="flex items-center gap-2 text-xs text-ink">
                    <Check className="w-4 h-4 text-confirm flex-shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-8">
              <Link href={plan.ctaHref}>
                <Button
                  variant={plan.popular ? "secondary" : "outline"}
                  className="w-full"
                >
                  {plan.ctaText}
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Ligne de réassurance */}
      <div className="mt-8 text-center text-xs text-ink-quiet">
        Pas de carte bancaire pour le plan Free • Paiement sécurisé par Stripe • Zéro prélèvement automatique sournois
      </div>

      {!isFullPage && (
        <div className="text-center mt-6">
          <Link href="/pricing" className="text-xs font-semibold text-mark hover:underline">
            Voir tous les détails de la tarification et la FAQ
          </Link>
        </div>
      )}
    </section>
  );
}

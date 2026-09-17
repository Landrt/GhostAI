import React from "react";

export function FAQ({ isPricing = false }: { isPricing?: boolean }) {
  const generalQuestions = [
    {
      q: "Est-ce indétectable par les détecteurs IA ?",
      a: "Ce n'est pas notre objectif ni notre métrique. Les détecteurs sont peu fiables et changent sans arrêt. On optimise pour que le texte sonne fidèlement comme toi auprès de vrais humains, pas pour tromper un algorithme de détection.",
    },
    {
      q: "En quoi êtes-vous différents des autres outils de rédaction LinkedIn ?",
      a: "La plupart des outils génèrent un brouillon et s'arrêtent là. Notre pipeline exécute trois juges en parallèle (détection de clichés, niveau de spécificité, alignement de voix) et rejette le texte jusqu'à 3 fois en réécriture automatique s'il reste trop générique.",
    },
    {
      q: "Mes écrits servent-ils à entraîner des modèles partagés ?",
      a: "Absolument pas. Tes exemples de style et tes posts ne sont utilisés que pour affiner ton propre profil de voix dans ton espace privé. Aucune donnée n'est mutualisée.",
    },
    {
      q: "GhostAI publie-t-il directement sur mon compte LinkedIn ?",
      a: "Non, nous respectons ton contrôle total. Tu relis, tu copies le texte final en un clic, et tu le postes toi-même sur LinkedIn. Cela garantit ta totale liberté sans dépendre des politiques fluctuantes de l'API LinkedIn.",
    },
  ];

  const pricingQuestions = [
    {
      q: "Que se passe-t-il si je dépasse mon quota mensuel ?",
      a: "Le système t'indique que le quota du mois est atteint et te propose de passer au plan supérieur si tu le souhaites. Nous ne prélevons jamais de frais surprises au-delà de ton abonnement sans ton accord explicite.",
    },
    {
      q: "Quelle est la différence entre Pro et ProMax ?",
      a: "Pro offre 30 posts par mois (amplement suffisant pour publier quasi quotidiennement). ProMax est pensé pour ceux qui gèrent plusieurs profils ou qui publient intensivement sans restriction.",
    },
    {
      q: "Les paiements sont-ils renouvelés automatiquement chaque mois ?",
      a: "Non, absolument pas ! Chez GhostAI, nous appliquons une charte stricte de Transparence Totale : nous refusons le modèle des abonnements pièges avec prélèvement automatique forcé. Chaque paiement active 30 jours d'accès complets. À l'échéance, votre compte repasse simplement au plan Free sans aucun débit surprise sur votre carte. Si vous êtes satisfait, c'est vous qui décidez manuellement de recharger votre mois en 1 clic.",
    },
    {
      q: "Y a-t-il un engagement de durée ou des frais cachés ?",
      a: "Zéro engagement et zéro frais caché. Vous payez mois par mois en toute autonomie. Pas besoin de penser à résilier pour éviter un prélèvement : vous gardez le contrôle absolu sur votre budget.",
    },
  ];

  const questions = isPricing ? [...pricingQuestions, ...generalQuestions] : generalQuestions;

  return (
    <section className="py-20 bg-surface border-t border-line">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-left mb-12">
          <span className="text-xs font-semibold text-mark uppercase tracking-wider">Transparence</span>
          <h2 className="text-3xl font-bold text-ink tracking-tight mt-1">Questions fréquentes</h2>
        </div>

        <div className="space-y-6">
          {questions.map((item, idx) => (
            <div key={idx} className="bg-paper border border-line rounded-card p-6">
              <h4 className="text-base font-semibold text-ink mb-2">{item.q}</h4>
              <p className="text-sm text-ink-quiet leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import React from "react";

export function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "Ton idée brute",
      description: "Une intuition, une leçon apprise, ou trois lignes griffonnées entre deux réunions. Pas besoin d'un prompt parfait.",
    },
    {
      num: "02",
      title: "La confrontation interne",
      description: "Le moteur génère, passe le texte au crible de trois juges indépendants, et rejette les tournures génériques avant que tu ne les voies.",
    },
    {
      num: "03",
      title: "Tu reçois la version qui gagne",
      description: "Un post calibré pour l'algorithme LinkedIn, fidèle à ta cadence de phrase, prêt à être copié et publié.",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 max-w-5xl mx-auto px-4 sm:px-6">
      <div className="text-left mb-12">
        <span className="text-xs font-semibold text-mark uppercase tracking-wider">Comment ça marche</span>
        <h2 className="text-3xl font-bold text-ink tracking-tight mt-1">
          Le seul système qui refuse son propre travail avant de te le montrer.
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {steps.map((step) => (
          <div key={step.num} className="bg-surface border border-line rounded-card p-6 flex flex-col justify-between">
            <div>
              <span className="font-mono text-xs font-bold text-mark">{step.num}</span>
              <h3 className="text-lg font-semibold text-ink mt-2 mb-2">{step.title}</h3>
              <p className="text-sm text-ink-quiet leading-relaxed">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

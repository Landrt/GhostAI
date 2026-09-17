import React from "react";

export function BeforeAfter() {
  const examples = [
    {
      topic: "Idée : Arrêter de recruter des juniors sans encadrement",
      generic: "Dans un monde en constante évolution, le capital humain est le véritable catalyseur de la croissance. Voici pourquoi accompagner les talents émergents change la donne...",
      cliche: "capital humain, catalyseur, change la donne",
      yours: "On a embauché 3 juniors l'an dernier sans prévoir 1 heure par semaine pour les relire. On a perdu 6 mois, et eux leur confiance. Si vous n'avez pas le temps de former, n'embauchez pas.",
    },
    {
      topic: "Idée : Dire non à un gros client toxique",
      generic: "Découvrez la vérité brutale sur la gestion de la relation client. Parfois, savoir dire non témoigne d'un leadership authentique et libère votre potentiel...",
      cliche: "vérité brutale, témoigne de, libère votre potentiel",
      yours: "Ce client représentait 40% de notre chiffre d'affaires et 90% de nos ulcères. Le jour où on a rompu le contrat, l'équipe a recommencé à sourire. L'argent toxique coûte toujours plus cher qu'il ne rapporte.",
    },
  ];

  return (
    <section className="py-20 max-w-5xl mx-auto px-4 sm:px-6">
      <div className="text-left mb-12">
        <span className="text-xs font-semibold text-mark uppercase tracking-wider">Exemples concrets</span>
        <h2 className="text-3xl font-bold text-ink tracking-tight mt-1">
          La différence entre un texte poli par une machine et une voix humaine.
        </h2>
      </div>

      <div className="space-y-8">
        {examples.map((item, idx) => (
          <div key={idx} className="bg-surface border border-line rounded-card p-6">
            <div className="text-xs font-mono text-ink-quiet mb-4 font-semibold">{item.topic}</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-paper rounded-input border border-line flex flex-col justify-between">
                <div>
                  <span className="text-xs font-semibold text-ink-quiet block mb-2">Version rejetée</span>
                  <p className="text-sm text-ink-quiet leading-relaxed italic">{item.generic}</p>
                </div>
                <span className="text-[11px] text-danger mt-3 block">Clichés : {item.cliche}</span>
              </div>

              <div className="p-4 bg-surface rounded-input border border-ink flex flex-col justify-between">
                <div>
                  <span className="text-xs font-semibold text-ink block mb-2">Ta version livrée</span>
                  <p className="text-sm text-ink font-medium leading-relaxed">{item.yours}</p>
                </div>
                <span className="text-[11px] text-confirm font-medium mt-3 block">Singulier • Direct • Sans filtre</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

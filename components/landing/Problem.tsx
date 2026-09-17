import React from "react";

export function Problem() {
  return (
    <section className="py-16 bg-surface border-y border-line">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <span className="text-xs font-semibold text-mark uppercase tracking-wider">Le constat</span>
        <h2 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight mt-2 mb-4">
          Générer du texte ne suffit plus. Tout le monde voit quand ce n&apos;est pas toi.
        </h2>
        <p className="text-base sm:text-lg text-ink-quiet leading-relaxed max-w-2xl mx-auto">
          La plupart des outils génèrent un post et s&apos;arrêtent là. Tu passes ensuite 20 minutes à l&apos;éditer pour qu&apos;il sonne humain. Ou pire : tu le publies tel quel, et ça se voit quand même.
        </p>
      </div>
    </section>
  );
}

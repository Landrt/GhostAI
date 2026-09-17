"use client";

import React from "react";
import { Sparkles, CheckCircle2 } from "lucide-react";

export function VoiceProfilePreview() {
  const dimensions = [
    { label: "Directness", value: 82, desc: "Franchise et concision" },
    { label: "Storytelling", value: 74, desc: "Récit & structure narrative" },
    { label: "Formality", value: 41, desc: "Vocabulaire direct, zéro langue de bois" },
    { label: "Technicality", value: 86, desc: "Précision métier et concepts concrets" },
  ];

  return (
    <section className="py-20 bg-surface border-y border-line">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5 space-y-4">
            <span className="text-xs font-semibold text-secondary uppercase tracking-wider">
              Apprentissage continu
            </span>
            <h2 className="text-3xl font-bold text-ink tracking-tight">
              Plus tu écris, plus il te ressemble.
            </h2>
            <p className="text-sm sm:text-base text-ink-quiet leading-relaxed">
              Chaque post validé ou édité affine les six dimensions de ta voix. Le système n&apos;invente rien : il cartographie comment tu t&apos;exprimes réellement et verrouille tes préférences.
            </p>
            <div className="flex items-center gap-2 pt-2 text-xs text-ink-quiet">
              <Sparkles className="w-4 h-4 text-secondary flex-shrink-0" />
              <span>Boucle d&apos;apprentissage automatique à chaque publication</span>
            </div>
          </div>

          <div className="lg:col-span-7 bg-paper border border-line rounded-card p-6 sm:p-7 space-y-5 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-line">
              <div>
                <span className="text-sm font-bold text-ink">Profil de voix observé</span>
                <p className="text-[11px] text-ink-quiet">Calibré en continu sur tes publications</p>
              </div>
              <span className="text-xs px-3 py-1 rounded-full bg-secondary-light text-secondary font-mono font-bold border border-secondary/20 shadow-sm flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                87% consistance
              </span>
            </div>

            <div className="space-y-4">
              {dimensions.map((dim) => (
                <div key={dim.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-ink text-sm">{dim.label}</span>
                      <span className="text-[11px] text-ink-quiet hidden sm:inline">• {dim.desc}</span>
                    </div>
                    <span className="font-mono font-bold text-secondary text-xs px-2 py-0.5 rounded bg-secondary-light border border-secondary/20">
                      {dim.value}%
                    </span>
                  </div>

                  {/* Barre de progression bien visible */}
                  <div className="w-full bg-surface border-2 border-line/80 rounded-full h-3.5 p-0.5 overflow-hidden shadow-inner">
                    <div
                      className="h-full bg-secondary rounded-full transition-all duration-700 ease-out shadow-sm"
                      style={{ width: `${dim.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-line flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-2.5 py-1 bg-surface border border-line rounded text-ink font-medium">
                  Phrases courtes
                </span>
                <span className="px-2.5 py-1 bg-surface border border-line rounded text-ink font-medium">
                  Exemples concrets
                </span>
                <span className="px-2.5 py-1 bg-secondary-light text-secondary border border-secondary/20 rounded font-semibold">
                  Zéro jargon corporate
                </span>
              </div>
              <span className="text-[11px] text-ink-quiet font-medium">Modèle actif</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

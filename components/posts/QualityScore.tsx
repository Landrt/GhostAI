import React from "react";
import clsx from "clsx";

export interface QualityScoreProps {
  voiceMatchScore: number | null;
  specificityScore: number | null;
  genericityScore: number | null;
  clicheScore: number | null;
  className?: string;
}

export function QualityScore({
  voiceMatchScore,
  specificityScore,
  genericityScore,
  clicheScore,
  className,
}: QualityScoreProps) {
  return (
    <div className={clsx("bg-surface border border-line rounded-card p-4 flex flex-col gap-3", className)}>
      <div className="flex items-center justify-between pb-2 border-b border-line/60">
        <span className="text-xs font-semibold text-ink uppercase tracking-wider">Contrôle Qualité</span>
        <span className="text-[11px] text-ink-quiet">Vérification multi-juges</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Voice Match */}
        <div className="p-2.5 bg-paper rounded border border-line/60 flex flex-col justify-between">
          <span className="text-xs text-ink-quiet">Voice Match</span>
          <div className="mt-1">
            {voiceMatchScore !== null ? (
              <span className={clsx("text-base font-semibold font-mono", voiceMatchScore >= 75 ? "text-confirm" : "text-warn")}>
                {voiceMatchScore}%
              </span>
            ) : (
              <span className="text-xs text-ink-quiet italic">Pas encore assez de données</span>
            )}
          </div>
        </div>

        {/* Spécificité */}
        <div className="p-2.5 bg-paper rounded border border-line/60 flex flex-col justify-between">
          <span className="text-xs text-ink-quiet">Spécificité</span>
          <div className="mt-1">
            {specificityScore !== null ? (
              <span className={clsx("text-base font-semibold font-mono", specificityScore >= 75 ? "text-confirm" : "text-ink")}>
                {specificityScore}%
              </span>
            ) : (
              <span className="text-xs text-ink-quiet">-</span>
            )}
          </div>
        </div>

        {/* Genericness (plus c'est bas, mieux c'est) */}
        <div className="p-2.5 bg-paper rounded border border-line/60 flex flex-col justify-between">
          <span className="text-xs text-ink-quiet">Genericness</span>
          <div className="mt-1">
            {genericityScore !== null ? (
              <span className={clsx("text-base font-semibold font-mono", genericityScore <= 25 ? "text-confirm" : "text-danger")}>
                {genericityScore}%
              </span>
            ) : (
              <span className="text-xs text-ink-quiet">-</span>
            )}
          </div>
        </div>

        {/* Densité de clichés (plus c'est bas, mieux c'est) */}
        <div className="p-2.5 bg-paper rounded border border-line/60 flex flex-col justify-between">
          <span className="text-xs text-ink-quiet">Densité de clichés</span>
          <div className="mt-1">
            {clicheScore !== null ? (
              <span className={clsx("text-base font-semibold font-mono", clicheScore <= 20 ? "text-confirm" : "text-danger")}>
                {clicheScore}%
              </span>
            ) : (
              <span className="text-xs text-ink-quiet">-</span>
            )}
          </div>
        </div>
      </div>

      <p className="text-[11px] text-ink-quiet/80 italic mt-1 leading-snug">
        Ces scores sont des indicateurs internes, pas des vérités scientifiques absolues.
      </p>
    </div>
  );
}

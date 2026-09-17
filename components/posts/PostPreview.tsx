"use client";

import React, { useState } from "react";
import clsx from "clsx";
import { Smartphone, Monitor, User } from "lucide-react";

export interface PostPreviewProps {
  content: string;
  authorName?: string;
  authorTitle?: string;
  authorImage?: string | null;
  className?: string;
}

export function PostPreview({
  content,
  authorName = "Toi",
  authorTitle = "Fondateur / Créateur",
  authorImage,
  className,
}: PostPreviewProps) {
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");

  const charLimit = viewMode === "desktop" ? 210 : 140;
  const totalLength = content ? content.length : 0;

  // Découpage du texte pour marquer visuellement l'endroit de coupure estimé "...voir plus"
  let beforeCut = content;
  let afterCut = "";

  if (content && content.length > charLimit) {
    beforeCut = content.slice(0, charLimit);
    afterCut = content.slice(charLimit);
  }

  return (
    <div className={clsx("flex flex-col gap-3", className)}>
      {/* Barre d'outils de l'aperçu */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-medium text-ink-quiet">Aperçu dans le feed LinkedIn</span>
        <div className="flex items-center bg-paper border border-line rounded p-0.5 text-xs">
          <button
            type="button"
            onClick={() => setViewMode("desktop")}
            className={clsx(
              "flex items-center gap-1 px-2 py-1 rounded transition-colors",
              viewMode === "desktop" ? "bg-surface font-semibold text-ink shadow-none" : "text-ink-quiet hover:text-ink"
            )}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Desktop</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("mobile")}
            className={clsx(
              "flex items-center gap-1 px-2 py-1 rounded transition-colors",
              viewMode === "mobile" ? "bg-surface font-semibold text-ink shadow-none" : "text-ink-quiet hover:text-ink"
            )}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile</span>
          </button>
        </div>
      </div>

      {/* Cadre de simulation LinkedIn */}
      <div
        className={clsx(
          "bg-surface border border-line rounded-card p-4 transition-all duration-150",
          viewMode === "mobile" ? "max-w-[360px] mx-auto w-full" : "w-full"
        )}
      >
        {/* En-tête profil LinkedIn */}
        <div className="flex items-center gap-3 pb-3 border-b border-line/40 mb-3">
          <div className="w-10 h-10 rounded-full bg-paper border border-line flex items-center justify-center text-ink flex-shrink-0">
            {authorImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={authorImage} alt={authorName} className="w-full h-full rounded-full object-cover" />
            ) : (
              <User className="w-5 h-5 text-ink-quiet" />
            )}
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-semibold text-ink truncate">{authorName}</h4>
            <p className="text-xs text-ink-quiet truncate">{authorTitle}</p>
            <p className="text-[10px] text-ink-quiet/70">Maintenant • 🌐</p>
          </div>
        </div>

        {/* Corps du post avec estimation de coupure */}
        <div className="text-sm text-ink leading-relaxed whitespace-pre-wrap font-sans">
          {!content ? (
            <span className="text-ink-quiet/50 italic">Le texte généré s&apos;affichera ici...</span>
          ) : totalLength <= charLimit ? (
            <span>{content}</span>
          ) : (
            <div>
              <span>{beforeCut}</span>
              {/* Ligne de coupure estimée */}
              <div className="my-2 py-1 border-t border-dashed border-line flex items-center justify-between text-[11px] text-ink-quiet select-none">
                <span className="bg-paper px-1.5 py-0.5 rounded border border-line/50 text-mark font-medium">
                  …voir plus apparaît ici (~{charLimit} car.)
                </span>
                <span className="text-[10px] text-ink-quiet/70">estimation feed</span>
              </div>
              <span className="text-ink/85">{afterCut}</span>
            </div>
          )}
        </div>
      </div>

      {/* Compteur de caractères */}
      <div className="flex items-center justify-between px-1 text-xs text-ink-quiet">
        <span>Limite recommandée : &lt;150 ou 2000-3000 car.</span>
        <span className={clsx("font-mono font-medium", totalLength > 3000 ? "text-danger" : "text-ink")}>
          {totalLength} / 3000
        </span>
      </div>
    </div>
  );
}

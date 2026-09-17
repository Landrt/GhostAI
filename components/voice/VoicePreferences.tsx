"use client";

import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import clsx from "clsx";

interface VoicePreferencesProps {
  title: string;
  description: string;
  tags: string[];
  onChange: (newTags: string[]) => void;
  badgeVariant?: "neutral" | "mark";
}

export function VoicePreferences({
  title,
  description,
  tags,
  onChange,
  badgeVariant = "neutral",
}: VoicePreferencesProps) {
  const [inputVal, setInputVal] = useState("");

  const handleAdd = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputVal.trim();
    if (!trimmed) return;

    // Cas de test 3 : Ignorer silencieusement les doublons
    if (!tags.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
      onChange([...tags, trimmed]);
    }
    setInputVal("");
  };

  const handleRemove = (index: number) => {
    onChange(tags.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-surface border border-line rounded-card p-5 space-y-4">
      <div>
        <h4 className="text-sm font-semibold text-ink">{title}</h4>
        <p className="text-xs text-ink-quiet mt-0.5">{description}</p>
      </div>

      <div className="flex flex-wrap gap-2 min-h-[36px]">
        {tags.length === 0 ? (
          <span className="text-xs text-ink-quiet/50 italic py-1">Aucune mention pour l&apos;instant</span>
        ) : (
          tags.map((tag, idx) => (
            <span
              key={idx}
              className={clsx(
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium border",
                badgeVariant === "mark"
                  ? "bg-mark-light/50 text-mark border-mark/20"
                  : "bg-paper text-ink border-line"
              )}
            >
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="text-ink-quiet hover:text-danger rounded transition-colors"
                aria-label={`Supprimer ${tag}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))
        )}
      </div>

      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Ajouter une consigne..."
          className="flex-1 px-3 py-1.5 text-xs bg-paper border border-line rounded-input text-ink focus:outline-none focus:border-ink placeholder:text-ink-quiet/60"
        />
        <button
          type="submit"
          className="px-3 py-1.5 bg-ink text-surface rounded-input text-xs font-medium hover:bg-ink/90 transition-colors flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Ajouter</span>
        </button>
      </form>
    </div>
  );
}

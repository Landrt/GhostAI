"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Slider } from "@/components/ui/Slider";
import { Button } from "@/components/ui/Button";
import { VoicePreferences } from "@/components/voice/VoicePreferences";
import { Info, Sparkles, Check, RefreshCw } from "lucide-react";
import clsx from "clsx";

export default function VoiceProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);
  const [recalculating, setRecalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sliders locaux
  const [directness, setDirectness] = useState(70);
  const [storytelling, setStorytelling] = useState(50);
  const [formality, setFormality] = useState(40);
  const [humor, setHumor] = useState(30);
  const [technicality, setTechnicality] = useState(60);
  const [emotionality, setEmotionality] = useState(40);

  // Tags
  const [preferredPhrases, setPreferredPhrases] = useState<string[]>([]);
  const [avoidedPhrases, setAvoidedPhrases] = useState<string[]>([]);

  // Exemples
  const [styleExamples, setStyleExamples] = useState<string[]>([]);
  const [newExampleInput, setNewExampleInput] = useState("");
  const [showAddExample, setShowAddExample] = useState(false);

  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/voice-profile");
      if (!res.ok) throw new Error("Erreur de chargement.");
      const data = await res.json();
      const p = data.profile;
      setProfile(p);

      if (p) {
        setDirectness(Math.round((p.directness ?? 0.7) * 100));
        setStorytelling(Math.round((p.storytelling ?? 0.5) * 100));
        setFormality(Math.round((p.formality ?? 0.4) * 100));
        setHumor(Math.round((p.humor ?? 0.3) * 100));
        setTechnicality(Math.round((p.technicality ?? 0.6) * 100));
        setEmotionality(Math.round((p.emotionality ?? 0.4) * 100));
        setPreferredPhrases((p.preferredPhrases as string[]) || []);
        setAvoidedPhrases((p.avoidedPhrases as string[]) || []);
        setStyleExamples((p.styleExamples as string[]) || []);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const persistChanges = async (updates: any) => {
    setSaving(true);
    try {
      const res = await fetch("/api/voice-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        setSavedNotice(true);
        setTimeout(() => setSavedNotice(false), 2000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleSliderChange = (setter: (val: number) => void, key: string, val: number) => {
    setter(val);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      persistChanges({ [key]: val / 100 });
    }, 600);
  };

  const handleRecalculate = async () => {
    setRecalculating(true);
    try {
      const res = await fetch("/api/voice-profile?recalculate=true", { method: "POST" });
      if (res.ok) {
        await fetchProfile();
      }
    } finally {
      setRecalculating(false);
    }
  };

  const handleAddExample = () => {
    const trimmed = newExampleInput.trim();
    if (!trimmed || styleExamples.length >= 5) return;

    const updated = [...styleExamples, trimmed];
    setStyleExamples(updated);
    setNewExampleInput("");
    setShowAddExample(false);
    persistChanges({ styleExamples: updated });
  };

  const handleRemoveExample = (idx: number) => {
    const updated = styleExamples.filter((_, i) => i !== idx);
    setStyleExamples(updated);
    persistChanges({ styleExamples: updated });
  };

  if (loading) {
    return (
      <div className="py-16 text-center space-y-3">
        <div className="inline-block animate-spin w-6 h-6 border-2 border-mark border-t-transparent rounded-full" />
        <p className="text-xs text-ink-quiet">Chargement de ton profil de voix...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight">Ta voix</h1>
          <p className="text-xs text-ink-quiet mt-0.5">
            Ce profil aide le système à comprendre comment tu communiques en réalité.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {saving && <span className="text-xs text-ink-quiet animate-pulse">Enregistrement...</span>}
          {savedNotice && (
            <span className="text-xs text-confirm font-medium flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Enregistré
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRecalculate}
            loading={recalculating}
            className="gap-1.5"
          >
            <RefreshCw className={clsx("w-3.5 h-3.5", recalculating && "animate-spin")} />
            <span>Recalculer depuis mes posts</span>
          </Button>
        </div>
      </div>

      {/* Bandeau explicatif obligatoire distinguant Voix et Personnalité */}
      <div className="bg-paper border border-line rounded-card p-4 flex items-start gap-3 text-xs text-ink-quiet leading-relaxed">
        <Info className="w-4 h-4 text-ink flex-shrink-0 mt-0.5" />
        <div>
          <strong className="text-ink font-semibold">Profil de voix (observé) :</strong> cette page mesure comment tu écris réellement, déduit de tes exemples de style et de tes posts acceptés.{" "}
          <Link href="/app/personality" className="text-mark font-medium hover:underline inline-flex items-center gap-0.5">
            Voir ton profil de communication (déclaré)
          </Link>
        </div>
      </div>

      {/* Score de consistance */}
      <div className="bg-surface border border-line rounded-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-ink-quiet uppercase tracking-wider">Score de fidélité</span>
          <h3 className="text-lg font-bold text-ink mt-0.5">Consistance de voix</h3>
          <p className="text-xs text-ink-quiet mt-1">
            Calculé sur la régularité stylistique de tes posts acceptés.
          </p>
        </div>

        <div className="text-right">
          {profile?.consistencyScore !== null && profile?.consistencyScore !== undefined ? (
            <span className="text-3xl font-extrabold font-mono text-confirm">
              {Math.round(profile.consistencyScore)}%
            </span>
          ) : (
            <span className="text-xs text-ink-quiet italic">
              Pas encore assez de données — crée quelques posts pour voir apparaître ce score.
            </span>
          )}
        </div>
      </div>

      {/* Caractéristiques (sliders 0-100%) */}
      <div className="bg-surface border border-line rounded-card p-6 space-y-6">
        <div>
          <h3 className="text-base font-bold text-ink">Caractéristiques observées</h3>
          <p className="text-xs text-ink-quiet mt-0.5">
            Une modification manuelle est définitive et n&apos;est jamais écrasée silencieusement par un calcul automatique.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <Slider
            label="Directness"
            description="Aller droit au but sans formules de politesse superflues."
            value={directness}
            onChange={(v) => handleSliderChange(setDirectness, "directness", v)}
          />
          <Slider
            label="Storytelling"
            description="Raconter les faits sous forme narrative plutôt que de simples listes."
            value={storytelling}
            onChange={(v) => handleSliderChange(setStorytelling, "storytelling", v)}
          />
          <Slider
            label="Formality"
            description="Niveau de solennité dans le choix du vocabulaire."
            value={formality}
            onChange={(v) => handleSliderChange(setFormality, "formality", v)}
          />
          <Slider
            label="Humor / Ironie"
            description="Capacité à introduire du second degré ou des traits d'esprit."
            value={humor}
            onChange={(v) => handleSliderChange(setHumor, "humor", v)}
          />
          <Slider
            label="Technicality"
            description="Profondeur métier et précision des termes employés."
            value={technicality}
            onChange={(v) => handleSliderChange(setTechnicality, "technicality", v)}
          />
          <Slider
            label="Emotionality"
            description="Partage des ressentis et franchise sur les difficultés."
            value={emotionality}
            onChange={(v) => handleSliderChange(setEmotionality, "emotionality", v)}
          />
        </div>
      </div>

      {/* Exemples de style (max 5) */}
      <div className="bg-surface border border-line rounded-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-ink">Exemples de ton style</h3>
            <p className="text-xs text-ink-quiet mt-0.5">
              Ces textes nourrissent les calculs d&apos;embeddings Voyage AI pour vérifier la ressemblance.
            </p>
          </div>
          <span className="text-xs font-mono text-ink-quiet font-semibold">
            {styleExamples.length}/5 exemples
          </span>
        </div>

        <div className="space-y-3">
          {styleExamples.map((ex, idx) => (
            <div key={idx} className="p-3.5 bg-paper rounded-input border border-line space-y-2">
              <div className="flex items-center justify-between text-xs text-ink-quiet">
                <span className="font-semibold text-ink">Exemple {idx + 1}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveExample(idx)}
                  className="text-danger hover:underline text-xs"
                >
                  Supprimer
                </button>
              </div>
              <p className="text-xs text-ink leading-relaxed whitespace-pre-wrap font-sans">{ex}</p>
            </div>
          ))}

          {showAddExample ? (
            <div className="p-4 bg-paper rounded-input border border-line space-y-3">
              <textarea
                value={newExampleInput}
                onChange={(e) => setNewExampleInput(e.target.value)}
                placeholder="Colle ici un extrait de post ou d'écrit que tu as rédigé..."
                rows={4}
                className="w-full p-2.5 bg-surface text-ink text-xs rounded border border-line focus:outline-none focus:border-ink resize-none"
              />
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => setShowAddExample(false)}>
                  Annuler
                </Button>
                <Button variant="secondary" size="sm" onClick={handleAddExample}>
                  Enregistrer l&apos;exemple
                </Button>
              </div>
            </div>
          ) : styleExamples.length < 5 ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddExample(true)}
              className="w-full text-xs"
            >
              + Ajouter un exemple de style
            </Button>
          ) : null}
        </div>
      </div>

      {/* Préférences d'écriture / À éviter */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <VoicePreferences
          title="Préférences d'écriture"
          description="Tournures et approches que le système doit privilégier."
          tags={preferredPhrases}
          onChange={(newTags) => {
            setPreferredPhrases(newTags);
            persistChanges({ preferredPhrases: newTags });
          }}
          badgeVariant="neutral"
        />

        <VoicePreferences
          title="À éviter absolument"
          description="Jargon, tics de langage ou tournures que tu refuses de lire."
          tags={avoidedPhrases}
          onChange={(newTags) => {
            setAvoidedPhrases(newTags);
            persistChanges({ avoidedPhrases: newTags });
          }}
          badgeVariant="mark"
        />
      </div>
    </div>
  );
}

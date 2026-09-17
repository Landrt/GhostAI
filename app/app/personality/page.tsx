"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Slider } from "@/components/ui/Slider";
import { Info, Check } from "lucide-react";

export default function PersonalityProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [voiceProfile, setVoiceProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  // Dimensions
  const [directness, setDirectness] = useState(70);
  const [opinionStrength, setOpinionStrength] = useState(65);
  const [storytelling, setStorytelling] = useState(50);
  const [vulnerability, setVulnerability] = useState(50);
  const [formality, setFormality] = useState(40);
  const [humor, setHumor] = useState(30);
  const [technicality, setTechnicality] = useState(60);
  const [emotionalExpression, setEmotionalExpression] = useState(40);

  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchBoth = async () => {
      setLoading(true);
      try {
        const [pRes, vRes] = await Promise.all([
          fetch("/api/personality-profile"),
          fetch("/api/voice-profile"),
        ]);

        if (pRes.ok) {
          const pData = await pRes.json();
          const p = pData.profile;
          setProfile(p);
          if (p) {
            setDirectness(Math.round((p.directness ?? 0.7) * 100));
            setOpinionStrength(Math.round((p.opinionStrength ?? 0.65) * 100));
            setStorytelling(Math.round((p.storytelling ?? 0.5) * 100));
            setVulnerability(Math.round((p.vulnerability ?? 0.5) * 100));
            setFormality(Math.round((p.formality ?? 0.4) * 100));
            setHumor(Math.round((p.humor ?? 0.3) * 100));
            setTechnicality(Math.round((p.technicality ?? 0.6) * 100));
            setEmotionalExpression(Math.round((p.emotionalExpression ?? 0.4) * 100));
          }
        }

        if (vRes.ok) {
          const vData = await vRes.json();
          setVoiceProfile(vData.profile);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchBoth();
  }, []);

  const persistChanges = async (updates: any) => {
    setSaving(true);
    try {
      const res = await fetch("/api/personality-profile", {
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

  // Bonus : calcul des décalages significatifs (> 30 points) entre déclaré et observé
  const gapAlerts: string[] = [];
  if (voiceProfile) {
    if (voiceProfile.directness !== null && Math.abs(directness - Math.round(voiceProfile.directness * 100)) > 30) {
      gapAlerts.push(
        `Tu te perçois ${directness > Math.round(voiceProfile.directness * 100) ? "plus" : "moins"} direct (${directness}%) que tes écrits réels (${Math.round(voiceProfile.directness * 100)}%). Le système équilibre les deux.`
      );
    }
    if (voiceProfile.formality !== null && Math.abs(formality - Math.round(voiceProfile.formality * 100)) > 30) {
      gapAlerts.push(
        `Niveau de formalité : déclaré à ${formality}%, observé à ${Math.round(voiceProfile.formality * 100)}%. Le système concilie ces nuances.`
      );
    }
  }

  if (loading) {
    return (
      <div className="py-16 text-center space-y-3">
        <div className="inline-block animate-spin w-6 h-6 border-2 border-mark border-t-transparent rounded-full" />
        <p className="text-xs text-ink-quiet">Chargement de ton profil de communication...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight">Profil de communication</h1>
          <p className="text-xs text-ink-quiet mt-0.5">
            Ce profil reflète la manière dont tu te décris communiquer.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {saving && <span className="text-xs text-ink-quiet animate-pulse">Enregistrement...</span>}
          {savedNotice && (
            <span className="text-xs text-confirm font-medium flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Enregistré
            </span>
          )}
        </div>
      </div>

      {/* Bandeau explicatif obligatoire */}
      <div className="bg-paper border border-line rounded-card p-4 flex items-start gap-3 text-xs text-ink-quiet leading-relaxed">
        <Info className="w-4 h-4 text-ink flex-shrink-0 mt-0.5" />
        <div>
          <strong className="text-ink font-semibold">Profil de communication (déclaré) :</strong> cette page capture tes intentions et tes postures souhaitées.{" "}
          <Link href="/app/voice" className="text-mark font-medium hover:underline inline-flex items-center gap-0.5">
            Comparer avec ta voix réelle observée
          </Link>
        </div>
      </div>

      {/* Alertes d'alignement bonus */}
      {gapAlerts.length > 0 && (
        <div className="bg-mark-light/30 border border-mark/20 rounded-card p-4 space-y-2">
          <span className="text-xs font-semibold text-mark uppercase tracking-wider block">
            Éclairage d&apos;alignement
          </span>
          {gapAlerts.map((alert, idx) => (
            <p key={idx} className="text-xs text-ink leading-relaxed">
              • {alert}
            </p>
          ))}
        </div>
      )}

      {/* Les 8 dimensions */}
      <div className="bg-surface border border-line rounded-card p-6 space-y-6">
        <div>
          <h3 className="text-base font-bold text-ink">Dimensions de communication</h3>
          <p className="text-xs text-ink-quiet mt-0.5">
            Ajuste chaque curseur selon ton intention de positionnement éditorial.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <Slider
            label="Directness"
            description="Franchise et concision de l'argumentation."
            value={directness}
            onChange={(v) => handleSliderChange(setDirectness, "directness", v)}
          />
          <Slider
            label="Opinion Strength"
            description="Fermeté des prises de position sans compromis tiède."
            value={opinionStrength}
            onChange={(v) => handleSliderChange(setOpinionStrength, "opinionStrength", v)}
          />
          <Slider
            label="Storytelling"
            description="Recours aux scènes vécues et à la dramaturgie."
            value={storytelling}
            onChange={(v) => handleSliderChange(setStorytelling, "storytelling", v)}
          />
          <Slider
            label="Vulnerability"
            description="Capacité à assumer les échecs et les doutes avec humilité."
            value={vulnerability}
            onChange={(v) => handleSliderChange(setVulnerability, "vulnerability", v)}
          />
          <Slider
            label="Formality"
            description="Niveau de décontraction ou de retenue professionnelle."
            value={formality}
            onChange={(v) => handleSliderChange(setFormality, "formality", v)}
          />
          <Slider
            label="Humor"
            description="Tonalité légère, ironique ou pince-sans-rire."
            value={humor}
            onChange={(v) => handleSliderChange(setHumor, "humor", v)}
          />
          <Slider
            label="Technicality"
            description="Niveau d'expertise pointue et de termes spécialisés."
            value={technicality}
            onChange={(v) => handleSliderChange(setTechnicality, "technicality", v)}
          />
          <Slider
            label="Emotional Expression"
            description="Intensité des émotions partagées dans le récit."
            value={emotionalExpression}
            onChange={(v) => handleSliderChange(setEmotionalExpression, "emotionalExpression", v)}
          />
        </div>
      </div>
    </div>
  );
}

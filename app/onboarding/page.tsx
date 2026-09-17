"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Réponses utilisateur
  const [opinionStyle, setOpinionStyle] = useState<string>("directly");
  const [formalityLevel, setFormalityLevel] = useState<number>(3);
  const [hardLesson, setHardLesson] = useState<string>("");
  const [styleExamples, setStyleExamples] = useState<string[]>([""]);

  const handleNextStep = async () => {
    if (step < 5) {
      setStep((prev) => prev + 1);
    } else {
      // Étape 5 : Finalisation
      setLoading(true);
      try {
        const filteredExamples = styleExamples.map((s) => s.trim()).filter(Boolean);
        const res = await fetch("/api/onboarding/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            opinionStyle,
            formalityLevel,
            hardLesson,
            styleExamples: filteredExamples,
          }),
        });

        if (res.ok) {
          router.push("/app");
          router.refresh();
        }
      } catch (err) {
        console.error("Erreur onboarding:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePrevStep = () => {
    if (step > 1) setStep((prev) => prev - 1);
  };

  const addExampleField = () => {
    if (styleExamples.length < 5) {
      setStyleExamples([...styleExamples, ""]);
    }
  };

  const updateExample = (index: number, val: string) => {
    const updated = [...styleExamples];
    updated[index] = val;
    setStyleExamples(updated);
  };

  const removeExample = (index: number) => {
    if (styleExamples.length > 1) {
      setStyleExamples(styleExamples.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="min-h-screen bg-paper flex flex-col justify-between py-12 px-4 sm:px-6">
      <div className="max-w-xl mx-auto w-full">
        {/* Barre de progression à 5 points */}
        <div className="flex items-center justify-center gap-3 mb-10">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={clsx(
                "w-2.5 h-2.5 rounded-full transition-all duration-200",
                s === step
                  ? "bg-mark scale-125"
                  : s < step
                  ? "bg-ink"
                  : "bg-line"
              )}
            />
          ))}
        </div>

        {/* Contenu de la question (un écran = une question) */}
        <div className="bg-surface border border-line rounded-card p-6 sm:p-10 min-h-[380px] flex flex-col justify-between">
          <div>
            {/* Étape 1 */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <span className="text-xs font-semibold text-mark uppercase tracking-wider">Question 1 / 4</span>
                  <h2 className="text-2xl font-bold text-ink tracking-tight mt-1">
                    Comment exprimes-tu généralement une opinion ?
                  </h2>
                </div>

                <div className="space-y-2.5">
                  {[
                    { id: "directly", label: "Directement", desc: "La conclusion d'abord, sans fioritures." },
                    { id: "context_first", label: "En expliquant le contexte d'abord", desc: "Poser le cadre avant d'affirmer." },
                    { id: "story", label: "À travers une histoire", desc: "Partir d'une anecdote vécue." },
                    { id: "questions", label: "En posant des questions", desc: "Inviter la réflexion plutôt qu'imposer." },
                  ].map((opt) => (
                    <label
                      key={opt.id}
                      className={clsx(
                        "p-4 rounded-input border transition-colors flex items-start gap-3 cursor-pointer",
                        opinionStyle === opt.id
                          ? "border-mark bg-mark-light/30"
                          : "border-line bg-surface hover:bg-paper"
                      )}
                    >
                      <input
                        type="radio"
                        name="opinionStyle"
                        value={opt.id}
                        checked={opinionStyle === opt.id}
                        onChange={() => setOpinionStyle(opt.id)}
                        className="mt-1 accent-mark"
                      />
                      <div>
                        <span className="text-sm font-semibold text-ink block">{opt.label}</span>
                        <span className="text-xs text-ink-quiet">{opt.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Étape 2 */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <span className="text-xs font-semibold text-mark uppercase tracking-wider">Question 2 / 4</span>
                  <h2 className="text-2xl font-bold text-ink tracking-tight mt-1">
                    Quel est ton niveau de formalité souhaité ?
                  </h2>
                  <p className="text-sm text-ink-quiet mt-1">
                    Cela oriente le choix des tournures de phrases et du tutoiement/vouvoiement.
                  </p>
                </div>

                <div className="space-y-8 py-6">
                  <div className="flex items-center justify-between text-xs font-medium text-ink-quiet">
                    <span>Très décontracté</span>
                    <span>Équilibré</span>
                    <span>Très formel</span>
                  </div>

                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="1"
                    value={formalityLevel}
                    onChange={(e) => setFormalityLevel(Number(e.target.value))}
                    className="w-full h-2 bg-line rounded-lg appearance-none cursor-pointer accent-mark"
                  />

                  <div className="flex justify-between px-1 text-xs font-mono text-ink-quiet">
                    {[1, 2, 3, 4, 5].map((lvl) => (
                      <span
                        key={lvl}
                        className={clsx(
                          "w-6 h-6 rounded-full flex items-center justify-center font-bold",
                          formalityLevel === lvl ? "bg-mark text-surface" : "bg-paper text-ink-quiet"
                        )}
                      >
                        {lvl}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Étape 3 */}
            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <span className="text-xs font-semibold text-mark uppercase tracking-wider">Question 3 / 4</span>
                  <h2 className="text-2xl font-bold text-ink tracking-tight mt-1">
                    Raconte ta dernière leçon professionnelle apprise à la dure.
                  </h2>
                  <p className="text-xs text-ink-quiet mt-1">
                    Ce texte sert de premier exemple de style et de matière pour un futur post.
                  </p>
                </div>

                <Textarea
                  value={hardLesson}
                  onChange={(e) => setHardLesson(e.target.value)}
                  placeholder="Ex : J'ai passé 6 mois à développer un produit sans jamais faire de démo aux utilisateurs. Quand on a enfin lancé..."
                  rows={6}
                />
              </div>
            )}

            {/* Étape 4 */}
            {step === 4 && (
              <div className="space-y-4">
                <div>
                  <span className="text-xs font-semibold text-mark uppercase tracking-wider">Question 4 / 4</span>
                  <h2 className="text-2xl font-bold text-ink tracking-tight mt-1">
                    Exemples de ton style (1 à 5 textes)
                  </h2>
                  <p className="text-xs text-ink-quiet mt-1">
                    Pas obligatoire, mais plus tu en donnes, plus vite le système comprend ta voix.
                  </p>
                </div>

                <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
                  {styleExamples.map((ex, idx) => (
                    <div key={idx} className="space-y-1 bg-paper p-3 rounded-input border border-line">
                      <div className="flex items-center justify-between text-xs text-ink-quiet">
                        <span>Exemple {idx + 1}</span>
                        {styleExamples.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeExample(idx)}
                            className="text-danger hover:underline text-xs"
                          >
                            Supprimer
                          </button>
                        )}
                      </div>
                      <textarea
                        value={ex}
                        onChange={(e) => updateExample(idx, e.target.value)}
                        placeholder="Colle ici un post LinkedIn, un email ou un extrait rédigé par toi..."
                        rows={3}
                        className="w-full text-xs p-2 rounded bg-surface border border-line text-ink resize-none focus:outline-none focus:border-ink"
                      />
                    </div>
                  ))}
                </div>

                {styleExamples.length < 5 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addExampleField}
                    className="w-full text-xs"
                  >
                    + Ajouter un autre exemple ({styleExamples.length}/5)
                  </Button>
                )}
              </div>
            )}

            {/* Étape 5 : Récapitulatif */}
            {step === 5 && (
              <div className="space-y-6 text-center py-6">
                <div className="w-12 h-12 bg-confirm/15 text-confirm rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                  ✓
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-ink tracking-tight">
                    Ton profil de communication est prêt.
                  </h2>
                  <p className="text-sm text-ink-quiet mt-2 max-w-md mx-auto leading-relaxed">
                    Le système a enregistré tes préférences d&apos;expression. Tu peux maintenant transformer ta première idée en post LinkedIn.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Boutons Suivant / Précédent */}
          <div className="flex items-center justify-between pt-6 border-t border-line mt-6">
            {step > 1 ? (
              <Button variant="ghost" size="sm" onClick={handlePrevStep} disabled={loading}>
                Précédent
              </Button>
            ) : (
              <div />
            )}

            <Button
              variant="secondary"
              size="md"
              onClick={handleNextStep}
              loading={loading}
            >
              {step === 5 ? "Continuer vers le tableau de bord" : "Suivant"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { PostPreview } from "@/components/posts/PostPreview";
import { QualityScore } from "@/components/posts/QualityScore";
import { PostFeedbackModal } from "@/components/posts/PostFeedbackModal";
import { Mic, MicOff, Check, Copy, FileEdit, Sparkles } from "lucide-react";
import clsx from "clsx";

interface PipelineStep {
  id: string;
  label: string;
  status: "idle" | "in_progress" | "done";
}

const INITIAL_STEPS: PipelineStep[] = [
  { id: "analyze", label: "Analyse de ton idée", status: "idle" },
  { id: "voice", label: "Recherche de ta voix", status: "idle" },
  { id: "draft", label: "Rédaction du post", status: "idle" },
  { id: "verify", label: "Vérification qualité (3 juges)", status: "idle" },
  { id: "finalize", label: "Finalisation", status: "idle" },
];

export default function CreatePostPage() {
  const router = useRouter();

  // Entrées formulaire
  const [idea, setIdea] = useState("");
  const [format, setFormat] = useState<string>("opinion");
  const [tone, setTone] = useState<string>("direct");

  // Dictée vocale
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  // État de génération
  const [generating, setGenerating] = useState(false);
  const [pipelineSteps, setPipelineSteps] = useState<PipelineStep[]>(INITIAL_STEPS);
  const [error, setError] = useState<string | null>(null);

  // Résultat généré
  const [generatedPost, setGeneratedPost] = useState<string | null>(null);
  const [postId, setPostId] = useState<string | null>(null);
  const [voiceMatchScore, setVoiceMatchScore] = useState<number | null>(null);
  const [genericityScore, setGenericityScore] = useState<number | null>(null);
  const [clicheScore, setClicheScore] = useState<number | null>(null);
  const [specificityScore, setSpecificityScore] = useState<number | null>(null);

  // Feedback
  const [feedbackSent, setFeedbackSent] = useState<"positive" | "negative" | null>(null);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Démarrage / arrêt dictée vocale (via Web Speech API si disponible)
  const toggleSpeechRecognition = () => {
    if (isRecording) {
      setIsRecording(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("La reconnaissance vocale n'est pas supportée par votre navigateur actuel.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "fr-FR";
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => setIsRecording(true);
      recognition.onend = () => setIsRecording(false);
      recognition.onerror = () => setIsRecording(false);

      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript + " ";
        }
        if (transcript.trim()) {
          setIdea((prev) => (prev ? prev + " " + transcript.trim() : transcript.trim()));
        }
      };

      recognition.start();
    } catch (e) {
      console.error(e);
      setIsRecording(false);
    }
  };

  const handleGenerate = async () => {
    if (!idea.trim()) {
      setError("Veuillez saisir une idée avant de générer.");
      return;
    }

    setGenerating(true);
    setError(null);
    setGeneratedPost(null);
    setFeedbackSent(null);

    // Initialisation visuelle des étapes
    setPipelineSteps([
      { id: "analyze", label: "Analyse de ton idée", status: "in_progress" },
      { id: "voice", label: "Recherche de ta voix", status: "idle" },
      { id: "draft", label: "Rédaction du post", status: "idle" },
      { id: "verify", label: "Vérification qualité (3 juges)", status: "idle" },
      { id: "finalize", label: "Finalisation", status: "idle" },
    ]);

    // Progression des étapes
    const stepTimer1 = setTimeout(() => {
      setPipelineSteps((prev) =>
        prev.map((s) =>
          s.id === "analyze" ? { ...s, status: "done" } : s.id === "voice" ? { ...s, status: "in_progress" } : s
        )
      );
    }, 600);

    const stepTimer2 = setTimeout(() => {
      setPipelineSteps((prev) =>
        prev.map((s) =>
          s.id === "voice" ? { ...s, status: "done" } : s.id === "draft" ? { ...s, status: "in_progress" } : s
        )
      );
    }, 1300);

    const stepTimer3 = setTimeout(() => {
      setPipelineSteps((prev) =>
        prev.map((s) =>
          s.id === "draft" ? { ...s, status: "done" } : s.id === "verify" ? { ...s, status: "in_progress" } : s
        )
      );
    }, 2000);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea: idea.trim(),
          format,
          tone,
        }),
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);

      if (!res.ok) {
        const errData = await res.json();
        setError(errData.error || "Une erreur est survenue lors de la génération.");
        setGenerating(false);
        return;
      }

      const data = await res.json();

      // Finalisation des étapes
      setPipelineSteps((prev) => prev.map((s) => ({ ...s, status: "done" })));

      setGeneratedPost(data.post);
      setPostId(data.postId);
      setVoiceMatchScore(data.voiceMatchScore);
      setGenericityScore(data.genericityScore);
      setClicheScore(data.clicheScore);
      setSpecificityScore(data.specificityScore);
    } catch (err) {
      console.error(err);
      setError("Erreur de connexion serveur. Réessayez.");
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!generatedPost) return;
    navigator.clipboard.writeText(generatedPost);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePositiveFeedback = async () => {
    if (!postId) return;
    setFeedbackSent("positive");
    await fetch(`/api/posts/${postId}/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ soundsLikeMe: true }),
    });
  };

  const handleNegativeFeedbackSubmit = async (reasons: string[]) => {
    if (!postId) return;
    setFeedbackSent("negative");
    await fetch(`/api/posts/${postId}/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ soundsLikeMe: false, reasons }),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-line">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight">Créer un post</h1>
          <p className="text-xs text-ink-quiet mt-0.5">
            L&apos;idée est la tienne. Le système s&apos;assure qu&apos;elle ne ressemble à aucun texte générique.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-danger/10 border border-danger/20 rounded-input text-xs text-danger flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="font-semibold underline">
            Fermer
          </button>
        </div>
      )}

      {/* Disposition 2 colonnes Desktop / 1 colonne Mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Colonne gauche : Ton Idée & Options */}
        <div className="lg:col-span-6 bg-surface border border-line rounded-card p-5 sm:p-6 space-y-6">
          {/* Champ Idée avec micro */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-ink">De quoi veux-tu parler ?</label>
              <button
                type="button"
                onClick={toggleSpeechRecognition}
                className={clsx(
                  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-colors border",
                  isRecording
                    ? "bg-danger text-surface border-danger animate-pulse"
                    : "bg-paper text-ink-quiet border-line hover:text-ink"
                )}
                title="Dicter ton idée au micro"
              >
                {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                <span>{isRecording ? "Arrêter" : "Dicter l'idée"}</span>
              </button>
            </div>

            <Textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="J'ai récemment réalisé que je passais trop de temps à peaufiner des fonctionnalités que personne ne demandait..."
              rows={6}
              disabled={generating}
              className="font-sans"
            />
          </div>

          {/* Options de Format et de Ton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-ink">Format</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                disabled={generating}
                className="w-full px-3 py-2 bg-surface text-ink text-sm rounded-input border border-line focus:outline-none focus:border-ink"
              >
                <option value="opinion">Opinion (accroche courte &lt;150c)</option>
                <option value="text">Texte libre (concis)</option>
                <option value="story">Histoire vécue (format long)</option>
                <option value="educational">Éducatif / Méthode (format long)</option>
                <option value="case_study">Étude de cas (format long)</option>
                <option value="personal_experience">Expérience personnelle (format long)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-ink">Ton</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                disabled={generating}
                className="w-full px-3 py-2 bg-surface text-ink text-sm rounded-input border border-line focus:outline-none focus:border-ink"
              >
                <option value="direct">Direct (sans préliminaire)</option>
                <option value="conversational">Conversationnel</option>
                <option value="professional">Professionnel</option>
                <option value="provocative">Provocateur</option>
                <option value="thoughtful">Réfléchi / Posé</option>
              </select>
            </div>
          </div>

          {/* Bouton de génération dominant (couleur mark) */}
          <Button
            variant="secondary"
            size="lg"
            onClick={handleGenerate}
            disabled={generating || !idea.trim()}
            className="w-full h-12 text-base font-semibold gap-2 shadow-none"
          >
            <Sparkles className="w-4 h-4" />
            <span>{generating ? "Génération & Vérification..." : "Générer le post"}</span>
          </Button>

          <p className="text-[11px] text-ink-quiet/80 text-center leading-relaxed">
            Le profil de voix a toujours priorité sur le sélecteur en cas de tension stylistique.
          </p>
        </div>

        {/* Colonne droite : Aperçu & Generation State & Quality */}
        <div className="lg:col-span-6 space-y-6">
          {/* Séquence d'étapes pendant la génération */}
          {generating && (
            <div className="bg-surface border border-line rounded-card p-5 space-y-3">
              <span className="text-xs font-semibold text-ink uppercase tracking-wider block">
                Pipeline de contrôle actif
              </span>
              <div className="space-y-2">
                {pipelineSteps.map((step) => (
                  <div key={step.id} className="flex items-center justify-between text-xs py-1">
                    <span
                      className={clsx(
                        step.status === "done"
                          ? "text-ink font-medium"
                          : step.status === "in_progress"
                          ? "text-mark font-semibold"
                          : "text-ink-quiet/60"
                      )}
                    >
                      {step.label}
                    </span>
                    <span>
                      {step.status === "done" && <Check className="w-4 h-4 text-confirm" />}
                      {step.status === "in_progress" && (
                        <span className="text-mark font-mono animate-pulse">… en cours</span>
                      )}
                      {step.status === "idle" && <span className="text-ink-quiet/40">…</span>}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Aperçu LinkedIn fidèle */}
          <PostPreview content={generatedPost || ""} />

          {/* Scores et Actions après génération */}
          {generatedPost && (
            <div className="space-y-4">
              <QualityScore
                voiceMatchScore={voiceMatchScore}
                specificityScore={specificityScore}
                genericityScore={genericityScore}
                clicheScore={clicheScore}
              />

              {/* Barre d'actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-surface border border-line rounded-card">
                {/* Feedback */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-ink-quiet">Est-ce que ça te ressemble ?</span>
                  <button
                    type="button"
                    onClick={handlePositiveFeedback}
                    className={clsx(
                      "px-2.5 py-1 text-xs rounded border transition-colors",
                      feedbackSent === "positive"
                        ? "bg-confirm text-surface border-confirm font-semibold"
                        : "bg-paper text-ink border-line hover:border-ink"
                    )}
                  >
                    👍 Oui
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsFeedbackModalOpen(true)}
                    className={clsx(
                      "px-2.5 py-1 text-xs rounded border transition-colors",
                      feedbackSent === "negative"
                        ? "bg-danger text-surface border-danger font-semibold"
                        : "bg-paper text-ink border-line hover:border-ink"
                    )}
                  >
                    👎 Pas vraiment
                  </button>
                </div>

                {/* Actions Copier / Éditeur */}
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5">
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copied ? "Copié !" : "Copier"}</span>
                  </Button>

                  {postId && (
                    <Link href={`/app/posts/${postId}`}>
                      <Button variant="primary" size="sm" className="gap-1.5">
                        <FileEdit className="w-3.5 h-3.5" />
                        <span>Ouvrir dans l&apos;éditeur</span>
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modale de motif de feedback négatif */}
      {postId && (
        <PostFeedbackModal
          postId={postId}
          isOpen={isFeedbackModalOpen}
          onClose={() => setIsFeedbackModalOpen(false)}
          onSubmit={handleNegativeFeedbackSubmit}
        />
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { PostPreview } from "@/components/posts/PostPreview";
import { QualityScore } from "@/components/posts/QualityScore";
import { PostFeedbackModal } from "@/components/posts/PostFeedbackModal";
import { Badge } from "@/components/ui/Badge";
import {
  ArrowLeft,
  Save,
  Copy,
  Sparkles,
  Scissors,
  Zap,
  RefreshCw,
  Sliders,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import clsx from "clsx";

export default function PostEditorPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;

  const [post, setPost] = useState<any>(null);
  const [content, setContent] = useState("");
  const [savedContent, setSavedContent] = useState("");
  const [status, setStatus] = useState<string>("draft");

  // Scores
  const [voiceMatchScore, setVoiceMatchScore] = useState<number | null>(null);
  const [genericityScore, setGenericityScore] = useState<number | null>(null);
  const [clicheScore, setClicheScore] = useState<number | null>(null);
  const [specificityScore, setSpecificityScore] = useState<number | null>(null);

  // États
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Changement de ton modale / inline
  const [selectedNewTone, setSelectedNewTone] = useState<string>("direct");
  const [showToneSelect, setShowToneSelect] = useState(false);

  // Feedback
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState<"positive" | "negative" | null>(null);

  const hasUnsavedChanges = content !== savedContent;

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/posts/${postId}`);
        if (!res.ok) throw new Error("Impossible de charger le post.");
        const data = await res.json();
        setPost(data.post);
        setContent(data.post.content || "");
        setSavedContent(data.post.content || "");
        setStatus(data.post.status || "draft");
        setVoiceMatchScore(data.post.voiceMatchScore);
        setGenericityScore(data.post.genericityScore);
        setClicheScore(data.post.clicheScore);
        setSpecificityScore(data.post.specificityScore);
      } catch (err: any) {
        setError(err.message || "Erreur.");
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [postId]);

  const handleSave = async (newStatus?: string) => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          status: newStatus || status,
        }),
      });

      if (!res.ok) throw new Error("Échec de la sauvegarde.");
      const data = await res.json();
      setSavedContent(content);
      if (newStatus) setStatus(newStatus);
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 2500);
    } catch (err: any) {
      setError(err.message || "Erreur de sauvegarde.");
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleQuickAction = async (
    instruction: "regenerate" | "improve_hook" | "shorten" | "more_direct" | "change_tone",
    newTone?: string
  ) => {
    if (status === "archived") {
      setError("Impossible de régénérer un post archivé. Veuillez d'abord le désarchiver.");
      return;
    }

    setGenerating(true);
    setError(null);
    setShowToneSelect(false);

    try {
      const res = await fetch(`/api/posts/${postId}/regenerate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instruction, newTone }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Échec de la régénération.");
      }

      const data = await res.json();
      setContent(data.post);
      setSavedContent(data.post);
      setVoiceMatchScore(data.voiceMatchScore);
      setGenericityScore(data.genericityScore);
      setClicheScore(data.clicheScore);
      setSpecificityScore(data.specificityScore);
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 2500);
    } catch (err: any) {
      setError(err.message || "Erreur lors de la régénération.");
    } finally {
      setGenerating(false);
    }
  };

  const handlePositiveFeedback = async () => {
    setFeedbackSent("positive");
    await fetch(`/api/posts/${postId}/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ soundsLikeMe: true }),
    });
  };

  const handleNegativeFeedbackSubmit = async (reasons: string[]) => {
    setFeedbackSent("negative");
    await fetch(`/api/posts/${postId}/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ soundsLikeMe: false, reasons }),
    });
  };

  if (loading) {
    return (
      <div className="py-16 text-center space-y-3">
        <div className="inline-block animate-spin w-6 h-6 border-2 border-mark border-t-transparent rounded-full" />
        <p className="text-xs text-ink-quiet">Chargement de l&apos;éditeur...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Barre de titre et navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line">
        <div className="flex items-center gap-3">
          <Link href="/app/posts">
            <Button variant="ghost" size="sm" className="px-2">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-ink tracking-tight">Éditeur de post</h1>
              <Badge variant={status === "completed" ? "confirm" : status === "archived" ? "warn" : "neutral"}>
                {status === "completed" ? "Terminé" : status === "archived" ? "Archivé" : "Brouillon"}
              </Badge>
            </div>
            {hasUnsavedChanges && (
              <span className="text-[11px] text-mark font-medium inline-flex items-center gap-1 mt-0.5">
                <AlertTriangle className="w-3 h-3" /> Modifications non enregistrées
              </span>
            )}
            {savedNotice && (
              <span className="text-[11px] text-confirm font-medium inline-flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="w-3 h-3" /> Enregistré avec succès
              </span>
            )}
          </div>
        </div>

        {/* Boutons d'action principaux */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5">
            <Copy className="w-3.5 h-3.5" />
            <span>{copied ? "Copié !" : "Copier"}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSave(status === "completed" ? "draft" : "completed")}
            disabled={saving}
          >
            {status === "completed" ? "Marquer comme brouillon" : "Marquer comme terminé"}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleSave()}
            loading={saving}
            className="gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Sauvegarder</span>
          </Button>
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

      {/* Barre d'actions rapides de réécriture */}
      <div className="bg-surface border border-line rounded-card p-3 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-ink uppercase tracking-wider px-2">Actions rapides :</span>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleQuickAction("regenerate")}
          disabled={generating || status === "archived"}
          className="h-8 gap-1 text-xs"
        >
          <RefreshCw className={clsx("w-3 h-3", generating && "animate-spin")} />
          <span>Régénérer</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleQuickAction("improve_hook")}
          disabled={generating || status === "archived"}
          className="h-8 gap-1 text-xs"
        >
          <Sparkles className="w-3 h-3" />
          <span>Améliorer l&apos;accroche</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleQuickAction("shorten")}
          disabled={generating || status === "archived"}
          className="h-8 gap-1 text-xs"
        >
          <Scissors className="w-3 h-3" />
          <span>Raccourcir</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleQuickAction("more_direct")}
          disabled={generating || status === "archived"}
          className="h-8 gap-1 text-xs"
        >
          <Zap className="w-3 h-3" />
          <span>Rendre plus direct</span>
        </Button>

        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowToneSelect(!showToneSelect)}
            disabled={generating || status === "archived"}
            className="h-8 gap-1 text-xs"
          >
            <Sliders className="w-3 h-3" />
            <span>Changer le ton</span>
          </Button>

          {showToneSelect && (
            <div className="absolute top-10 left-0 bg-surface border border-line rounded-card p-3 z-30 shadow-none space-y-2 w-56">
              <span className="text-xs font-semibold text-ink block">Sélectionne le ton</span>
              <select
                value={selectedNewTone}
                onChange={(e) => setSelectedNewTone(e.target.value)}
                className="w-full text-xs p-1.5 border border-line rounded bg-paper text-ink"
              >
                <option value="direct">Direct</option>
                <option value="conversational">Conversationnel</option>
                <option value="professional">Professionnel</option>
                <option value="provocative">Provocateur</option>
                <option value="thoughtful">Réfléchi</option>
              </select>
              <Button
                variant="secondary"
                size="sm"
                className="w-full text-xs h-7"
                onClick={() => handleQuickAction("change_tone", selectedNewTone)}
              >
                Appliquer
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Éditeur côte à côte avec PostPreview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Colonne gauche : Textarea d'édition directe */}
        <div className="lg:col-span-6 bg-surface border border-line rounded-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-ink">Texte en cours d&apos;édition</span>
            <span className="text-xs text-ink-quiet font-mono">{content.length} caractères</span>
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={generating}
            rows={18}
            className="w-full p-3.5 bg-paper rounded-input border border-line text-ink text-sm leading-relaxed focus:outline-none focus:border-ink font-sans resize-y"
            placeholder="Écris ou modifie ton post ici..."
          />

          <p className="text-[11px] text-ink-quiet/80 leading-tight">
            Les modifications manuelles sont précieuses : elles alimentent en continu l&apos;apprentissage de ta voix.
          </p>
        </div>

        {/* Colonne droite : PostPreview miroir avec coupure feed LinkedIn + QualityPanel */}
        <div className="lg:col-span-6 space-y-6">
          <PostPreview content={content} />

          <QualityScore
            voiceMatchScore={voiceMatchScore}
            specificityScore={specificityScore}
            genericityScore={genericityScore}
            clicheScore={clicheScore}
          />

          {/* Feedback */}
          <div className="flex items-center justify-between p-4 bg-surface border border-line rounded-card text-xs">
            <span className="text-ink-quiet">Est-ce que ça sonne fidèlement comme toi ?</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePositiveFeedback}
                className={clsx(
                  "px-2.5 py-1 rounded border transition-colors",
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
                  "px-2.5 py-1 rounded border transition-colors",
                  feedbackSent === "negative"
                    ? "bg-danger text-surface border-danger font-semibold"
                    : "bg-paper text-ink border-line hover:border-ink"
                )}
              >
                👎 Pas vraiment
              </button>
            </div>
          </div>
        </div>
      </div>

      <PostFeedbackModal
        postId={postId}
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        onSubmit={handleNegativeFeedbackSubmit}
      />
    </div>
  );
}

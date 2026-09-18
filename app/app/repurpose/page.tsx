"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import {
  Sparkles,
  PlaySquare,
  Globe,
  FileText,
  Check,
  Copy,
  Lock,
  ArrowRight,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Clock,
  Layers,
  BookmarkPlus,
  Flame,
  MessageSquare,
  TrendingUp,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import clsx from "clsx";

interface Slide {
  slideNumber: number;
  header: string;
  body: string;
  visualNote?: string;
}

interface RepurposedPost {
  id: string;
  title: string;
  format: "story" | "educational" | "framework" | "debate";
  angle: string;
  hook: string;
  content: string;
  locked?: boolean;
}

interface RepurposedCarousel {
  id: string;
  title: string;
  hook: string;
  slides: Slide[];
  locked?: boolean;
}

interface RepurposedHook {
  id: string;
  category: "counter_intuitive" | "question" | "data_drop" | "story_opener" | "bold_statement";
  text: string;
  targetAngle: string;
  locked?: boolean;
}

interface RepurposedOpinion {
  id: string;
  statement: string;
  content: string;
  counterConsensus: string;
  locked?: boolean;
}

interface RepurposedCaseStudy {
  id: string;
  title: string;
  problem: string;
  solution: string;
  result: string;
  keyTakeaway: string;
  locked?: boolean;
}

interface RepurposedComment {
  id: string;
  angle: string;
  comment: string;
  contextToDeploy: string;
  locked?: boolean;
}

interface RepurposePackData {
  summary: string;
  keyThemes: string[];
  posts: RepurposedPost[];
  carousels: RepurposedCarousel[];
  hooks: RepurposedHook[];
  opinions: RepurposedOpinion[];
  caseStudies: RepurposedCaseStudy[];
  comments: RepurposedComment[];
  isSampleLocked: boolean;
}

interface BatchItem {
  id: string;
  sourceType: string;
  sourceTitle: string | null;
  sourceUrl: string | null;
  planSnapshot: string;
  createdAt: string;
}

interface QuotaInfo {
  allowed: boolean;
  remaining: number;
  limit: number;
  used: number;
  plan: string;
}

export default function RepurposePage() {
  const router = useRouter();

  // Formulaire d'ingestion
  const [sourceType, setSourceType] = useState<"youtube" | "url" | "text">("youtube");
  const [sourceInput, setSourceInput] = useState("");

  // Quotas & Historique
  const [quota, setQuota] = useState<QuotaInfo | null>(null);
  const [batches, setBatches] = useState<BatchItem[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);

  // Pack actif affiché
  const [activePack, setActivePack] = useState<RepurposePackData | null>(null);
  const [activeSourceTitle, setActiveSourceTitle] = useState<string>("");
  const [activeSourceType, setActiveSourceType] = useState<string>("");

  // Onglet interne du studio
  const [activeTab, setActiveTab] = useState<"posts" | "carousels" | "hooks" | "opinions" | "caseStudies" | "comments">("posts");

  // Slides de carrousel actives (index par ID de carrousel)
  const [carouselSlideIndex, setCarouselSlideIndex] = useState<Record<string, number>>({});

  // États de chargement et retours visuels
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savingPostId, setSavingPostId] = useState<string | null>(null);
  const [savedPosts, setSavedPosts] = useState<Record<string, string>>({}); // { itemId: createdPostId }

  // Chargement initial des quotas et de l'historique
  useEffect(() => {
    fetchHistoryAndQuota();
  }, []);

  const fetchHistoryAndQuota = async () => {
    try {
      const res = await fetch("/api/repurpose");
      if (res.ok) {
        const data = await res.json();
        setQuota(data.quota);
        setBatches(data.batches || []);
      }
    } catch (e) {
      console.error("Erreur chargement quotas repurpose:", e);
    }
  };

  // Chargement d'un pack existant depuis l'historique
  const handleLoadBatch = async (batchId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch(`/api/repurpose/${batchId}`);
      if (!res.ok) {
        throw new Error("Impossible de charger ce pack.");
      }
      const data = await res.json();
      setActivePack(data.batch.data);
      setActiveSourceTitle(data.batch.sourceTitle || "Source sans titre");
      setActiveSourceType(data.batch.sourceType);
      setSelectedBatchId(batchId);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Suppression d'un batch
  const handleDeleteBatch = async (batchId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Voulez-vous vraiment supprimer ce pack ?")) return;

    try {
      const res = await fetch(`/api/repurpose/${batchId}`, { method: "DELETE" });
      if (res.ok) {
        setBatches((prev) => prev.filter((b) => b.id !== batchId));
        if (selectedBatchId === batchId) {
          setActivePack(null);
          setSelectedBatchId(null);
        }
      }
    } catch (e) {
      console.error("Erreur suppression:", e);
    }
  };

  // Lancement de l'atomisation
  const handleStartRepurpose = async () => {
    if (!sourceInput.trim()) {
      setError("Veuillez saisir une URL ou coller du contenu avant de lancer l'atomisation.");
      return;
    }

    setIsLoading(true);
    setError(null);

    // Animation séquentielle des étapes d'atomisation
    setLoadingPhase("Extraction et décodage de la source...");
    const timer1 = setTimeout(() => {
      setLoadingPhase("Analyse sémantique et extraction des pépites d'expertise...");
    }, 2000);
    const timer2 = setTimeout(() => {
      setLoadingPhase("Découpage chirurgical (10 posts, carrousels, hooks viraux)...");
    }, 4500);
    const timer3 = setTimeout(() => {
      setLoadingPhase("Application de ton profil de voix et élimination des clichés d'IA...");
    }, 7000);

    try {
      const res = await fetch("/api/repurpose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceType,
          input: sourceInput.trim(),
        }),
      });

      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Une erreur est survenue pendant l'atomisation.");
        setIsLoading(false);
        return;
      }

      setActivePack(data.batch.data);
      setActiveSourceTitle(data.batch.sourceTitle || "Contenu atomisé");
      setActiveSourceType(data.batch.sourceType);
      setSelectedBatchId(data.batch.id);
      if (data.quota) setQuota(data.quota);

      // Met à jour la liste des batches
      setBatches((prev) => [
        {
          id: data.batch.id,
          sourceType: data.batch.sourceType,
          sourceTitle: data.batch.sourceTitle,
          sourceUrl: data.batch.sourceUrl,
          planSnapshot: data.batch.planSnapshot,
          createdAt: data.batch.createdAt,
        },
        ...prev,
      ]);

      setSourceInput("");
    } catch (err: any) {
      console.error(err);
      setError("Erreur de connexion au serveur. Réessayez.");
    } finally {
      setIsLoading(false);
      setLoadingPhase("");
    }
  };

  // Copier dans le presse-papier
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Enregistrer un post dans GhostAI (Post model)
  const handleSaveToMyPosts = async (item: { id: string; title: string; content: string; format?: string }) => {
    setSavingPostId(item.id);
    try {
      const res = await fetch("/api/repurpose/save-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: item.title,
          content: item.content,
          format: item.format || "educational",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSavedPosts((prev) => ({ ...prev, [item.id]: data.postId }));
      } else {
        alert("Impossible d'enregistrer le post.");
      }
    } catch (e) {
      console.error(e);
      alert("Erreur lors de l'enregistrement.");
    } finally {
      setSavingPostId(null);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* En-tête de la page avec indicateur de forfait */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-line">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight">
              Atomiseur de Contenu
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-mark/10 text-mark border border-mark/20">
              <Sparkles className="w-3 h-3" />
              Repurposing LinkedIn IA
            </span>
          </div>
          <p className="text-xs sm:text-sm text-ink-quiet mt-1 max-w-2xl">
            Injectez un article, une vidéo YouTube ou une note brute. Obtenez immédiatement 10 posts, 3 carrousels, 10 accroches et 5 commentaires calibrés sur votre voix.
          </p>
        </div>

        {/* Badge Quota */}
        {quota && (
          <div className="bg-surface border border-line rounded-card px-4 py-3 flex items-center gap-4 text-xs">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-ink capitalize">
                  Plan {quota.plan === "promax" ? "ProMax" : quota.plan === "pro" ? "Pro" : "Gratuit"}
                </span>
                <span
                  className={clsx(
                    "px-2 py-0.5 rounded text-[10px] font-semibold",
                    quota.remaining > 0 ? "bg-confirm/10 text-confirm" : "bg-danger/10 text-danger"
                  )}
                >
                  {quota.remaining} pack{quota.remaining > 1 ? "s" : ""} restant{quota.remaining > 1 ? "s" : ""}
                </span>
              </div>
              <div className="text-[11px] text-ink-quiet mt-0.5">
                {quota.used} / {quota.limit} utilisés ce mois-ci
              </div>
            </div>

            {quota.plan === "free" && (
              <Link href="/app/billing">
                <Button size="sm" variant="secondary" className="text-xs whitespace-nowrap">
                  Débloquer Pro (49$/m)
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Message d'erreur s'il y a lieu */}
      {error && (
        <div className="p-4 bg-danger/10 border border-danger/20 rounded-card text-xs sm:text-sm text-danger flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="font-semibold underline ml-4 text-xs">
            Fermer
          </button>
        </div>
      )}

      {/* Carte d'ingestion (Formulaire) */}
      {!isLoading && !activePack && (
        <div className="bg-surface border border-line rounded-card p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-line pb-4">
            <h2 className="text-base sm:text-lg font-bold text-ink">
              1. Choisissez votre source de contenu
            </h2>
            <span className="text-xs text-ink-quiet">Extraction 100% automatisée</span>
          </div>

          {/* Onglets de source */}
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => {
                setSourceType("youtube");
                setSourceInput("");
              }}
              className={clsx(
                "flex flex-col sm:flex-row items-center justify-center gap-2 p-3.5 rounded-input text-xs sm:text-sm font-medium border transition-all",
                sourceType === "youtube"
                  ? "bg-mark-light text-mark border-mark font-semibold shadow-sm"
                  : "bg-paper text-ink-quiet border-line hover:text-ink"
              )}
            >
              <PlaySquare className="w-4 h-4 text-red-500" />
              <span>Vidéo YouTube</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSourceType("url");
                setSourceInput("");
              }}
              className={clsx(
                "flex flex-col sm:flex-row items-center justify-center gap-2 p-3.5 rounded-input text-xs sm:text-sm font-medium border transition-all",
                sourceType === "url"
                  ? "bg-mark-light text-mark border-mark font-semibold shadow-sm"
                  : "bg-paper text-ink-quiet border-line hover:text-ink"
              )}
            >
              <Globe className="w-4 h-4 text-blue-500" />
              <span>Article Web</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSourceType("text");
                setSourceInput("");
              }}
              className={clsx(
                "flex flex-col sm:flex-row items-center justify-center gap-2 p-3.5 rounded-input text-xs sm:text-sm font-medium border transition-all",
                sourceType === "text"
                  ? "bg-mark-light text-mark border-mark font-semibold shadow-sm"
                  : "bg-paper text-ink-quiet border-line hover:text-ink"
              )}
            >
              <FileText className="w-4 h-4 text-amber-500" />
              <span>Texte Brut / Notes</span>
            </button>
          </div>

          {/* Champ de saisie selon le type */}
          <div className="space-y-2">
            {sourceType === "youtube" && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-ink">
                  Lien de la vidéo YouTube (Podcast, Interview, Tuto...)
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={sourceInput}
                    onChange={(e) => setSourceInput(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ ou https://youtu.be/..."
                    className="w-full px-4 py-3 bg-paper text-ink text-sm rounded-input border border-line focus:outline-none focus:border-mark pl-10"
                  />
                  <PlaySquare className="w-4 h-4 text-red-500 absolute left-3.5 top-3.5" />
                </div>
                <p className="text-[11px] text-ink-quiet">
                  L&apos;Atomiseur extrait directement la transcription synchronisée et les leçons clés de la vidéo.
                </p>
              </div>
            )}

            {sourceType === "url" && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-ink">
                  Lien de l&apos;article ou de l&apos;étude (Medium, Substack, Blog tech...)
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={sourceInput}
                    onChange={(e) => setSourceInput(e.target.value)}
                    placeholder="https://monblog.com/guide-croissance-b2b"
                    className="w-full px-4 py-3 bg-paper text-ink text-sm rounded-input border border-line focus:outline-none focus:border-mark pl-10"
                  />
                  <Globe className="w-4 h-4 text-blue-500 absolute left-3.5 top-3.5" />
                </div>
                <p className="text-[11px] text-ink-quiet">
                  Le contenu éditorial est extrait proprement, nettoyé des bannières et publicités.
                </p>
              </div>
            )}

            {sourceType === "text" && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-ink">
                  Collez votre texte brut, compte-rendu, notes vocales ou document
                </label>
                <Textarea
                  value={sourceInput}
                  onChange={(e) => setSourceInput(e.target.value)}
                  placeholder="Collez ici votre transcription brute, vos idées clés ou le brouillon d'un document que vous souhaitez décliner..."
                  rows={8}
                  className="font-sans text-sm"
                />
                <p className="text-[11px] text-ink-quiet">
                  Minimum 40 caractères. Vous pouvez insérer jusqu&apos;à 40 000 caractères.
                </p>
              </div>
            )}
          </div>

          {/* Bouton d'action */}
          <div className="pt-2 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2 text-xs text-ink-quiet">
              <Sparkles className="w-4 h-4 text-mark" />
              <span>Génère 10 posts, 3 carrousels, 10 hooks et 5 commentaires en un seul clic</span>
            </div>

            <Button
              onClick={handleStartRepurpose}
              variant="secondary"
              className="px-6 py-3 text-sm font-semibold flex items-center gap-2"
              disabled={!sourceInput.trim()}
            >
              <Sparkles className="w-4 h-4" />
              <span>Atomiser ce contenu</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* État de chargement animé */}
      {isLoading && (
        <div className="bg-surface border border-line rounded-card p-12 text-center space-y-6 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-mark-light flex items-center justify-center mx-auto animate-bounce">
            <Sparkles className="w-8 h-8 text-mark" />
          </div>
          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-ink">Atomisation en cours...</h3>
            <p className="text-xs sm:text-sm text-mark font-medium animate-pulse">
              {loadingPhase || "Traitement du contenu source..."}
            </p>
            <p className="text-xs text-ink-quiet">
              Notre moteur extrait les pépites cachées et élimine activement les clichés d&apos;IA pour préserver votre voix.
            </p>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* STUDIO D'ATOMISATION (PACK GÉNÉRÉ AFFICHÉ) */}
      {/* ========================================================= */}
      {!isLoading && activePack && (
        <div className="space-y-6">
          {/* Bannière de synthèse de la source */}
          <div className="bg-surface border border-line rounded-card p-6 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-wider font-semibold text-mark">
                    Pack Atomisé
                  </span>
                  <span className="text-xs text-ink-quiet">•</span>
                  <span className="text-xs text-ink-quiet capitalize">
                    Source {activeSourceType}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-ink">{activeSourceTitle}</h2>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setActivePack(null);
                    setSelectedBatchId(null);
                  }}
                  className="text-xs flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Nouvelle atomisation</span>
                </Button>
              </div>
            </div>

            {/* Résumé stratégique et thèmes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="md:col-span-2 bg-paper p-4 rounded-input space-y-1.5 border border-line">
                <span className="font-semibold text-ink">Synthèse stratégique :</span>
                <p className="text-ink-quiet leading-relaxed">{activePack.summary}</p>
              </div>

              <div className="bg-paper p-4 rounded-input space-y-2 border border-line">
                <span className="font-semibold text-ink">Thèmes pivots extraits :</span>
                <div className="flex flex-wrap gap-1.5">
                  {activePack.keyThemes.map((theme, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-surface text-ink text-[11px] font-medium rounded border border-line"
                    >
                      #{theme}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Avertissement Pack Échantillon Free */}
            {activePack.isSampleLocked && (
              <div className="p-3.5 bg-mark-light/60 border border-mark/20 rounded-input flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <Lock className="w-4 h-4 text-mark flex-shrink-0" />
                  <span className="text-ink font-medium">
                    <strong>Pack d&apos;essai gratuit :</strong> 3 posts et 1 carrousel complet débloqués. Passez au forfait Pro ($49/m) pour débloquer l&apos;intégralité des 10 posts, carrousels et accroches.
                  </span>
                </div>
                <Link href="/app/billing" className="flex-shrink-0">
                  <Button size="sm" variant="secondary" className="text-xs whitespace-nowrap">
                    Débloquer le pack complet
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Navigation des sous-formats (Tabs) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-line select-none">
            <button
              onClick={() => setActiveTab("posts")}
              className={clsx(
                "flex items-center gap-2 px-4 py-2.5 rounded-input text-xs sm:text-sm font-medium transition-colors whitespace-nowrap",
                activeTab === "posts"
                  ? "bg-ink text-surface font-semibold shadow-sm"
                  : "bg-surface text-ink hover:bg-paper border border-line"
              )}
            >
              <FileText className="w-4 h-4" />
              <span>Posts LinkedIn ({activePack.posts.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("carousels")}
              className={clsx(
                "flex items-center gap-2 px-4 py-2.5 rounded-input text-xs sm:text-sm font-medium transition-colors whitespace-nowrap",
                activeTab === "carousels"
                  ? "bg-ink text-surface font-semibold shadow-sm"
                  : "bg-surface text-ink hover:bg-paper border border-line"
              )}
            >
              <Layers className="w-4 h-4" />
              <span>Carrousels Slide Deck ({activePack.carousels.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("hooks")}
              className={clsx(
                "flex items-center gap-2 px-4 py-2.5 rounded-input text-xs sm:text-sm font-medium transition-colors whitespace-nowrap",
                activeTab === "hooks"
                  ? "bg-ink text-surface font-semibold shadow-sm"
                  : "bg-surface text-ink hover:bg-paper border border-line"
              )}
            >
              <Flame className="w-4 h-4 text-orange-500" />
              <span>Accroches Virales ({activePack.hooks.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("opinions")}
              className={clsx(
                "flex items-center gap-2 px-4 py-2.5 rounded-input text-xs sm:text-sm font-medium transition-colors whitespace-nowrap",
                activeTab === "opinions"
                  ? "bg-ink text-surface font-semibold shadow-sm"
                  : "bg-surface text-ink hover:bg-paper border border-line"
              )}
            >
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span>Prises de Position ({activePack.opinions.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("caseStudies")}
              className={clsx(
                "flex items-center gap-2 px-4 py-2.5 rounded-input text-xs sm:text-sm font-medium transition-colors whitespace-nowrap",
                activeTab === "caseStudies"
                  ? "bg-ink text-surface font-semibold shadow-sm"
                  : "bg-surface text-ink hover:bg-paper border border-line"
              )}
            >
              <BookmarkPlus className="w-4 h-4 text-blue-500" />
              <span>Études de Cas ({activePack.caseStudies.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("comments")}
              className={clsx(
                "flex items-center gap-2 px-4 py-2.5 rounded-input text-xs sm:text-sm font-medium transition-colors whitespace-nowrap",
                activeTab === "comments"
                  ? "bg-ink text-surface font-semibold shadow-sm"
                  : "bg-surface text-ink hover:bg-paper border border-line"
              )}
            >
              <MessageSquare className="w-4 h-4 text-purple-500" />
              <span>Commentaires d&apos;Autorité ({activePack.comments.length})</span>
            </button>
          </div>

          {/* ================= TAB 1 : POSTS ================= */}
          {activeTab === "posts" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activePack.posts.map((post, idx) => {
                const isSaved = Boolean(savedPosts[post.id]);
                const isSaving = savingPostId === post.id;
                const isCopied = copiedId === post.id;

                return (
                  <div
                    key={post.id}
                    className={clsx(
                      "bg-surface border rounded-card p-6 flex flex-col justify-between relative transition-all",
                      post.locked ? "border-line/60 bg-paper/50" : "border-line shadow-sm hover:border-mark/40"
                    )}
                  >
                    {/* Badge angle & format */}
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-paper text-ink border border-line">
                            Post #{idx + 1}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-mark-light text-mark">
                            {post.format === "story"
                              ? "Histoire vécue"
                              : post.format === "framework"
                              ? "Framework pas-à-pas"
                              : post.format === "debate"
                              ? "Débat & Mentalité"
                              : "Éducatif"}
                          </span>
                          {post.angle && (
                            <span className="text-[11px] text-ink-quiet italic">
                              • {post.angle}
                            </span>
                          )}
                        </div>

                        {post.locked && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-mark">
                            <Lock className="w-3 h-3" />
                            Pro
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm font-bold text-ink mb-3">{post.title}</h3>

                      {/* Contenu du post */}
                      {post.locked ? (
                        <div className="relative py-8 px-4 rounded-input bg-paper/80 border border-line/60 text-center space-y-3 overflow-hidden select-none">
                          <div className="filter blur-[4px] opacity-40 text-xs text-ink text-left space-y-2 pointer-events-none">
                            <p className="font-semibold">{post.hook}</p>
                            <p>Voici la première erreur que font tous les créateurs sans s&apos;en rendre compte...</p>
                            <p>1. Penser que le volume remplace la netteté du point de vue.</p>
                            <p>2. Copier ce que font les autres au lieu de documenter ce qu&apos;ils vivent.</p>
                          </div>

                          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-surface/80 backdrop-blur-[2px]">
                            <Lock className="w-6 h-6 text-mark mb-1.5" />
                            <p className="text-xs font-semibold text-ink">
                              Ce post est réservé aux forfaits Pro & ProMax
                            </p>
                            <Link href="/app/billing" className="mt-2">
                              <Button size="sm" variant="secondary" className="text-xs">
                                Débloquer ce post ($49/m)
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-paper p-4 rounded-input border border-line text-xs sm:text-sm text-ink whitespace-pre-line leading-relaxed font-sans min-h-[160px]">
                          {post.content}
                        </div>
                      )}
                    </div>

                    {/* Actions sur le post */}
                    {!post.locked && (
                      <div className="pt-4 mt-4 border-t border-line flex items-center justify-between gap-3">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCopy(post.content, post.id)}
                          className="text-xs flex items-center gap-1.5"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5 text-confirm" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{isCopied ? "Copié !" : "Copier le texte"}</span>
                        </Button>

                        {isSaved ? (
                          <Link href={`/app/posts/${savedPosts[post.id]}`}>
                            <Button size="sm" variant="outline" className="text-xs flex items-center gap-1.5 text-confirm border-confirm/30">
                              <Check className="w-3.5 h-3.5" />
                              <span>Enregistré (Ouvrir)</span>
                              <ExternalLink className="w-3 h-3 ml-0.5" />
                            </Button>
                          </Link>
                        ) : (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleSaveToMyPosts(post)}
                            disabled={isSaving}
                            className="text-xs flex items-center gap-1.5"
                          >
                            <BookmarkPlus className="w-3.5 h-3.5" />
                            <span>{isSaving ? "Enregistrement..." : "Enregistrer dans mes posts"}</span>
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ================= TAB 2 : CARROUSELS ================= */}
          {activeTab === "carousels" && (
            <div className="space-y-8">
              {activePack.carousels.map((carousel, cIdx) => {
                const currentSlideIdx = carouselSlideIndex[carousel.id] || 0;
                const totalSlides = carousel.slides.length;
                const currentSlide = carousel.slides[currentSlideIdx];

                const nextSlide = () => {
                  if (currentSlideIdx < totalSlides - 1) {
                    setCarouselSlideIndex((prev) => ({ ...prev, [carousel.id]: currentSlideIdx + 1 }));
                  }
                };

                const prevSlide = () => {
                  if (currentSlideIdx > 0) {
                    setCarouselSlideIndex((prev) => ({ ...prev, [carousel.id]: currentSlideIdx - 1 }));
                  }
                };

                const copyAllSlides = () => {
                  const fullText = carousel.slides
                    .map((s) => `[Slide ${s.slideNumber}]\n${s.header}\n${s.body}\n(Note visuelle : ${s.visualNote || "N/A"})`)
                    .join("\n\n---\n\n");
                  handleCopy(fullText, carousel.id);
                };

                return (
                  <div
                    key={carousel.id}
                    className={clsx(
                      "bg-surface border rounded-card p-6 sm:p-8 space-y-6 relative transition-all",
                      carousel.locked ? "border-line/60 bg-paper/50" : "border-line shadow-sm"
                    )}
                  >
                    {/* Header carrousel */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-mark-light text-mark">
                            Carrousel #{cIdx + 1}
                          </span>
                          <span className="text-xs text-ink-quiet">
                            {totalSlides} slides pré-formatées
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-ink mt-1">{carousel.title}</h3>
                        <p className="text-xs text-ink-quiet italic mt-0.5">Accroche : &quot;{carousel.hook}&quot;</p>
                      </div>

                      {!carousel.locked && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={copyAllSlides}
                          className="text-xs flex items-center gap-1.5 self-start sm:self-auto"
                        >
                          {copiedId === carousel.id ? <Check className="w-3.5 h-3.5 text-confirm" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedId === carousel.id ? "Copié !" : "Copier tout le deck"}</span>
                        </Button>
                      )}
                    </div>

                    {/* Viewer de Slide Deck interactif */}
                    {carousel.locked ? (
                      <div className="py-12 px-6 rounded-input bg-paper/80 border border-line/60 text-center space-y-3 relative overflow-hidden select-none">
                        <div className="filter blur-[4px] opacity-30 pointer-events-none max-w-md mx-auto space-y-3">
                          <div className="h-8 bg-ink/20 rounded"></div>
                          <div className="h-20 bg-ink/10 rounded"></div>
                        </div>
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-surface/80 backdrop-blur-[2px]">
                          <Lock className="w-8 h-8 text-mark mb-2" />
                          <h4 className="text-sm font-bold text-ink">Carrousel réservé au Forfait Pro</h4>
                          <p className="text-xs text-ink-quiet max-w-sm mt-1">
                            Débloquez les 3 carrousels détaillés avec notes de direction artistique et mise en page slide-by-slide.
                          </p>
                          <Link href="/app/billing" className="mt-3">
                            <Button size="sm" variant="secondary" className="text-xs">
                              Passer à GhostAI Pro (49$/m)
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ) : (
                      currentSlide && (
                        <div className="space-y-4">
                          {/* Slide Player Card */}
                          <div className="bg-paper border-2 border-line rounded-card p-6 sm:p-8 min-h-[220px] flex flex-col justify-between relative shadow-sm">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between text-xs font-mono text-ink-quiet border-b border-line pb-2">
                                <span className="font-semibold text-mark">SLIDE {currentSlide.slideNumber} / {totalSlides}</span>
                                <span>LinkedIn Carousel Card</span>
                              </div>

                              <h4 className="text-base sm:text-lg font-bold text-ink tracking-tight pt-1">
                                {currentSlide.header}
                              </h4>

                              <p className="text-xs sm:text-sm text-ink leading-relaxed">
                                {currentSlide.body}
                              </p>
                            </div>

                            {/* Note de direction artistique */}
                            {currentSlide.visualNote && (
                              <div className="mt-4 pt-3 border-t border-line/60 text-[11px] text-mark italic flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
                                <span>Direction visuelle : {currentSlide.visualNote}</span>
                              </div>
                            )}
                          </div>

                          {/* Contrôles de navigation dans le carrousel */}
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-1.5">
                              {carousel.slides.map((_, sIdx) => (
                                <button
                                  key={sIdx}
                                  onClick={() =>
                                    setCarouselSlideIndex((prev) => ({ ...prev, [carousel.id]: sIdx }))
                                  }
                                  className={clsx(
                                    "w-7 h-7 rounded text-xs font-semibold transition-colors flex items-center justify-center",
                                    sIdx === currentSlideIdx
                                      ? "bg-ink text-surface shadow-sm"
                                      : "bg-surface text-ink-quiet hover:text-ink border border-line"
                                  )}
                                >
                                  {sIdx + 1}
                                </button>
                              ))}
                            </div>

                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={prevSlide}
                                disabled={currentSlideIdx === 0}
                                className="px-3"
                              >
                                <ChevronLeft className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={nextSlide}
                                disabled={currentSlideIdx === totalSlides - 1}
                                className="px-3"
                              >
                                <ChevronRight className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ================= TAB 3 : ACCROCHES (HOOKS) ================= */}
          {activeTab === "hooks" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activePack.hooks.map((hook, hIdx) => {
                const isCopied = copiedId === hook.id;

                const categoryLabels: Record<string, string> = {
                  counter_intuitive: "Contre-intuitif",
                  data_drop: "Chiffre & Data",
                  story_opener: "Début d'histoire",
                  question: "Question ouverte",
                  bold_statement: "Déclaration audacieuse",
                };

                return (
                  <div
                    key={hook.id}
                    className={clsx(
                      "bg-surface border rounded-card p-4 sm:p-5 flex flex-col justify-between gap-3 relative transition-all",
                      hook.locked ? "border-line/60 bg-paper/50" : "border-line shadow-sm hover:border-mark/40"
                    )}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-paper text-ink border border-line">
                          {categoryLabels[hook.category] || "Accroche"}
                        </span>
                        {hook.locked && <Lock className="w-3 h-3 text-mark" />}
                      </div>

                      {hook.locked ? (
                        <div className="py-4 text-center space-y-2 select-none">
                          <p className="filter blur-[3px] text-xs text-ink">
                            Accroche virale réservée au forfait Pro...
                          </p>
                          <Link href="/app/billing">
                            <span className="text-[11px] font-semibold text-mark underline">
                              Débloquer les 10 accroches
                            </span>
                          </Link>
                        </div>
                      ) : (
                        <p className="text-sm font-semibold text-ink leading-snug">
                          &quot;{hook.text}&quot;
                        </p>
                      )}
                    </div>

                    {!hook.locked && (
                      <div className="pt-2 border-t border-line flex items-center justify-between text-xs">
                        <span className="text-[11px] text-ink-quiet">Angle : {hook.targetAngle}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCopy(hook.text, hook.id)}
                          className="text-xs h-7 px-2"
                        >
                          {isCopied ? <Check className="w-3 h-3 text-confirm" /> : <Copy className="w-3 h-3" />}
                          <span>{isCopied ? "Copié !" : "Copier"}</span>
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ================= TAB 4 : OPINIONS ================= */}
          {activeTab === "opinions" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activePack.opinions.map((op, oIdx) => {
                const isCopied = copiedId === op.id;
                const isSaved = Boolean(savedPosts[op.id]);
                const isSaving = savingPostId === op.id;

                return (
                  <div
                    key={op.id}
                    className={clsx(
                      "bg-surface border rounded-card p-6 flex flex-col justify-between space-y-4",
                      op.locked ? "border-line/60 bg-paper/50" : "border-line shadow-sm"
                    )}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                          Opinion Tranchée #{oIdx + 1}
                        </span>
                        {op.locked && <Lock className="w-3.5 h-3.5 text-mark" />}
                      </div>

                      <h3 className="text-base font-bold text-ink mt-2">{op.statement}</h3>

                      {op.locked ? (
                        <div className="py-6 text-center space-y-2 select-none">
                          <p className="filter blur-[3px] text-xs text-ink">
                            Prise de position complète réservée au plan Pro...
                          </p>
                          <Link href="/app/billing">
                            <Button size="sm" variant="secondary" className="text-xs">
                              Débloquer le pack Pro ($49/m)
                            </Button>
                          </Link>
                        </div>
                      ) : (
                        <div className="space-y-3 mt-3">
                          <div className="p-3 bg-paper rounded-input border border-line text-xs sm:text-sm text-ink leading-relaxed">
                            {op.content}
                          </div>
                          <div className="text-[11px] text-ink-quiet">
                            <strong>Consensus combattu :</strong> {op.counterConsensus}
                          </div>
                        </div>
                      )}
                    </div>

                    {!op.locked && (
                      <div className="pt-4 border-t border-line flex items-center justify-between gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCopy(`${op.statement}\n\n${op.content}`, op.id)}
                          className="text-xs"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5 text-confirm" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{isCopied ? "Copié !" : "Copier"}</span>
                        </Button>

                        {isSaved ? (
                          <Link href={`/app/posts/${savedPosts[op.id]}`}>
                            <Button size="sm" variant="outline" className="text-xs text-confirm border-confirm/30">
                              <Check className="w-3.5 h-3.5 mr-1" />
                              <span>Enregistré</span>
                            </Button>
                          </Link>
                        ) : (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() =>
                              handleSaveToMyPosts({
                                id: op.id,
                                title: op.statement,
                                content: `${op.statement}\n\n${op.content}`,
                                format: "opinion",
                              })
                            }
                            disabled={isSaving}
                            className="text-xs"
                          >
                            <BookmarkPlus className="w-3.5 h-3.5 mr-1" />
                            <span>Enregistrer dans mes posts</span>
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ================= TAB 5 : ÉTUDES DE CAS ================= */}
          {activeTab === "caseStudies" && (
            <div className="space-y-6">
              {activePack.caseStudies.map((cs, cIdx) => {
                const isCopied = copiedId === cs.id;
                const formattedCaseText = `ÉTUDE DE CAS : ${cs.title}\n\nPROBLÈME :\n${cs.problem}\n\nSOLUTION :\n${cs.solution}\n\nRÉSULTATS :\n${cs.result}\n\nLEÇON CLÉ :\n${cs.keyTakeaway}`;

                return (
                  <div
                    key={cs.id}
                    className={clsx(
                      "bg-surface border rounded-card p-6 sm:p-8 space-y-5",
                      cs.locked ? "border-line/60 bg-paper/50" : "border-line shadow-sm"
                    )}
                  >
                    <div className="flex items-center justify-between border-b border-line pb-3">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-blue-500/10 text-blue-600 border border-blue-500/20">
                          Cas Concret #{cIdx + 1}
                        </span>
                        <h3 className="text-base font-bold text-ink">{cs.title}</h3>
                      </div>
                      {cs.locked && <Lock className="w-4 h-4 text-mark" />}
                    </div>

                    {cs.locked ? (
                      <div className="py-8 text-center space-y-2 select-none">
                        <p className="filter blur-[3px] text-xs text-ink">
                          Étude de cas détaillée avec métriques Problem/Solution/Result...
                        </p>
                        <Link href="/app/billing">
                          <Button size="sm" variant="secondary" className="text-xs">
                            Débloquer Pro ($49/m)
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                        <div className="p-4 bg-paper rounded-input border border-line space-y-1">
                          <span className="font-bold text-danger">1. Le Problème</span>
                          <p className="text-ink leading-relaxed">{cs.problem}</p>
                        </div>

                        <div className="p-4 bg-paper rounded-input border border-line space-y-1">
                          <span className="font-bold text-blue-600">2. La Solution Déployée</span>
                          <p className="text-ink leading-relaxed">{cs.solution}</p>
                        </div>

                        <div className="p-4 bg-paper rounded-input border border-line space-y-1">
                          <span className="font-bold text-confirm">3. Le Résultat Obtenu</span>
                          <p className="text-ink leading-relaxed">{cs.result}</p>
                        </div>

                        <div className="md:col-span-3 p-3.5 bg-mark-light/50 rounded-input border border-mark/20 text-xs">
                          <strong className="text-mark">À retenir absolument :</strong> {cs.keyTakeaway}
                        </div>
                      </div>
                    )}

                    {!cs.locked && (
                      <div className="pt-4 border-t border-line flex items-center justify-between">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCopy(formattedCaseText, cs.id)}
                          className="text-xs"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5 text-confirm mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                          <span>{isCopied ? "Copié !" : "Copier le texte complet"}</span>
                        </Button>

                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() =>
                            handleSaveToMyPosts({
                              id: cs.id,
                              title: cs.title,
                              content: formattedCaseText,
                              format: "case_study",
                            })
                          }
                          className="text-xs"
                        >
                          <BookmarkPlus className="w-3.5 h-3.5 mr-1" />
                          <span>Enregistrer comme post</span>
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ================= TAB 6 : COMMENTAIRES ================= */}
          {activeTab === "comments" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activePack.comments.map((cm, cIdx) => {
                const isCopied = copiedId === cm.id;

                return (
                  <div
                    key={cm.id}
                    className={clsx(
                      "bg-surface border rounded-card p-5 flex flex-col justify-between gap-3",
                      cm.locked ? "border-line/60 bg-paper/50" : "border-line shadow-sm"
                    )}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-500/10 text-purple-600 border border-purple-500/20">
                          Commentaire d&apos;Autorité #{cIdx + 1}
                        </span>
                        {cm.locked && <Lock className="w-3 h-3 text-mark" />}
                      </div>

                      {cm.locked ? (
                        <div className="py-4 text-center select-none">
                          <p className="filter blur-[3px] text-xs text-ink">Commentaire d&apos;autorité réservé à Pro...</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-xs sm:text-sm text-ink bg-paper p-3.5 rounded-input border border-line leading-relaxed">
                            &quot;{cm.comment}&quot;
                          </p>
                          <p className="text-[11px] text-ink-quiet">
                            <strong>Quand le poster :</strong> {cm.contextToDeploy}
                          </p>
                        </div>
                      )}
                    </div>

                    {!cm.locked && (
                      <div className="pt-2 border-t border-line flex items-center justify-end">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCopy(cm.comment, cm.id)}
                          className="text-xs h-7 px-2"
                        >
                          {isCopied ? <Check className="w-3 h-3 text-confirm mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                          <span>{isCopied ? "Copié !" : "Copier le commentaire"}</span>
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* HISTORIQUE DES PACKS PRÉCÉDEMMENT ATOMISÉS */}
      {/* ========================================================= */}
      {batches.length > 0 && (
        <div className="pt-6 border-t border-line space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-ink flex items-center gap-2">
              <Clock className="w-4 h-4 text-ink-quiet" />
              <span>Vos packs atomisés récents</span>
            </h3>
            <span className="text-xs text-ink-quiet">{batches.length} pack{batches.length > 1 ? "s" : ""}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {batches.map((batch) => {
              const isCurrent = selectedBatchId === batch.id;

              return (
                <div
                  key={batch.id}
                  onClick={() => handleLoadBatch(batch.id)}
                  className={clsx(
                    "p-3.5 bg-surface border rounded-card cursor-pointer transition-all flex items-center justify-between group",
                    isCurrent ? "border-mark ring-1 ring-mark bg-mark-light/20" : "border-line hover:border-ink/30"
                  )}
                >
                  <div className="min-w-0 pr-3">
                    <div className="flex items-center gap-1.5 text-[10px] text-ink-quiet mb-1">
                      <span className="capitalize font-medium">{batch.sourceType}</span>
                      <span>•</span>
                      <span>{new Date(batch.createdAt).toLocaleDateString("fr-FR")}</span>
                    </div>
                    <p className="text-xs font-semibold text-ink truncate">
                      {batch.sourceTitle || "Contenu atomisé"}
                    </p>
                  </div>

                  <button
                    onClick={(e) => handleDeleteBatch(batch.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-ink-quiet hover:text-danger rounded transition-opacity"
                    title="Supprimer ce pack"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

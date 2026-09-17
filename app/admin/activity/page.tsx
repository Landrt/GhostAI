"use client";

import React, { useState, useEffect } from "react";
import { Activity, FileText, CheckCircle2, AlertOctagon, ShieldAlert, Sparkles } from "lucide-react";
import clsx from "clsx";

export default function AdminActivityPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/activity")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur activity:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl">
        <div className="h-8 w-64 bg-line/40 rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-line/20 rounded-card animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const metrics = data?.metrics || {
    totalPosts: 0,
    draftPosts: 0,
    completedPosts: 0,
    avgVoiceMatch: 0,
    avgCliche: 0,
    avgSpecificity: 0,
  };
  const flaggedPosts = data?.flaggedPosts || [];

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink font-serif">
          Activité Métier & Qualité Ghostwriting
        </h1>
        <p className="text-xs text-ink-quiet mt-1">
          Surveillez le volume d&apos;écrits générés et le respect des filtres anti-généricité.
        </p>
      </div>

      {/* 4 Métriques de Qualité */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface border border-line rounded-card p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-xs text-ink-quiet">
            <span>Posts Rédigés</span>
            <FileText className="w-4 h-4 text-ink" />
          </div>
          <div className="text-2xl font-bold text-ink font-mono">{metrics.totalPosts}</div>
          <p className="text-[11px] text-ink-quiet">
            {metrics.completedPosts} finalisés / {metrics.draftPosts} brouillons
          </p>
        </div>

        <div className="bg-surface border border-line rounded-card p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-xs text-ink-quiet">
            <span>Score Voix Moyen</span>
            <Sparkles className="w-4 h-4 text-mark" />
          </div>
          <div className="text-2xl font-bold text-mark font-mono">{metrics.avgVoiceMatch}%</div>
          <p className="text-[11px] text-ink-quiet">Fidélité au style de l&apos;auteur</p>
        </div>

        <div className="bg-surface border border-line rounded-card p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-xs text-ink-quiet">
            <span>Taux de Clichés IA</span>
            <AlertOctagon className="w-4 h-4 text-warn" />
          </div>
          <div className="text-2xl font-bold text-warn font-mono">{metrics.avgCliche}%</div>
          <p className="text-[11px] text-ink-quiet">Tournures génériques détectées</p>
        </div>

        <div className="bg-surface border border-line rounded-card p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-xs text-ink-quiet">
            <span>Spécificité Moyenne</span>
            <CheckCircle2 className="w-4 h-4 text-confirm" />
          </div>
          <div className="text-2xl font-bold text-confirm font-mono">
            {metrics.avgSpecificity}%
          </div>
          <p className="text-[11px] text-ink-quiet">Données concrètes et exemples</p>
        </div>
      </div>

      {/* Posts signalés ou à clichés élevés */}
      <div className="bg-surface border border-line rounded-card overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-line flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-warn" />
            <h2 className="font-semibold text-sm text-ink">
              Posts Signalés pour Généricité ({flaggedPosts.length})
            </h2>
          </div>
          <span className="text-xs text-ink-quiet">Contrôle de qualité éditoriale</span>
        </div>

        {flaggedPosts.length > 0 ? (
          <div className="divide-y divide-line/60">
            {flaggedPosts.map((post: any) => (
              <div key={post.id} className="p-5 space-y-2 hover:bg-paper/40 transition-colors">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-ink">{post.user?.email}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-warn font-bold">
                      Clichés : {post.clicheScore || 0}%
                    </span>
                    <span className="font-mono text-ink-quiet">
                      {new Date(post.createdAt).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-ink font-serif line-clamp-2 italic bg-paper p-3 rounded-input border border-line/60">
                  « {post.content} »
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-ink-quiet">
            Aucun post signalé pour généricité ou clichés excessifs.
          </div>
        )}
      </div>
    </div>
  );
}

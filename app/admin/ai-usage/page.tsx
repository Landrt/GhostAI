"use client";

import React, { useState, useEffect } from "react";
import { Cpu, DollarSign, Zap, Sliders, Save, CheckCircle, Database } from "lucide-react";
import clsx from "clsx";

export default function AdminAiUsagePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [savingRateLimit, setSavingRateLimit] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Rate limit form state
  const [rateLimitCapacity, setRateLimitCapacity] = useState(80);
  const [rateLimitDurationHours, setRateLimitDurationHours] = useState(5);
  const [rateLimitEnabled, setRateLimitEnabled] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/ai-usage");
      if (res.ok) {
        const json = await res.json();
        setData(json);
        if (json.config) {
          setRateLimitCapacity(json.config.rateLimitCapacity);
          setRateLimitDurationHours(json.config.rateLimitDurationHours);
          setRateLimitEnabled(json.config.rateLimitEnabled);
        }
      }
    } catch (err) {
      console.error("Erreur fetch ai-usage:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveRateLimit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingRateLimit(true);
      setFeedback(null);
      const res = await fetch("/api/admin/ai-usage", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rateLimitCapacity,
          rateLimitDurationHours,
          rateLimitEnabled,
        }),
      });
      if (res.ok) {
        setFeedback("Configuration du Rate Limiting mise à jour avec succès !");
      }
    } catch (err) {
      setFeedback("Erreur lors de la sauvegarde.");
    } finally {
      setSavingRateLimit(false);
    }
  };

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
    totalPromptTokens: 0,
    totalCompletionTokens: 0,
    totalTokens: 0,
    totalCostUsd: 0,
    totalCalls: 0,
  };
  const logs = data?.logs || [];

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink font-serif">
          Consommation IA & Contrôle des LLMs
        </h1>
        <p className="text-xs text-ink-quiet mt-1">
          Suivez la consommation des tokens DeepSeek / Voyage AI et ajustez les quotas de sécurité.
        </p>
      </div>

      {feedback && (
        <div className="p-3 bg-confirm/10 border border-confirm/30 text-confirm rounded-input text-xs font-semibold">
          {feedback}
        </div>
      )}

      {/* 4 Métriques de consommation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface border border-line rounded-card p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-xs text-ink-quiet">
            <span>Tokens Prompt</span>
            <Database className="w-4 h-4 text-ink-quiet" />
          </div>
          <div className="text-2xl font-bold text-ink font-mono">
            {metrics.totalPromptTokens.toLocaleString()}
          </div>
          <p className="text-[11px] text-ink-quiet">Instructions et contexte envoyés</p>
        </div>

        <div className="bg-surface border border-line rounded-card p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-xs text-ink-quiet">
            <span>Tokens Completion</span>
            <Zap className="w-4 h-4 text-mark" />
          </div>
          <div className="text-2xl font-bold text-mark font-mono">
            {metrics.totalCompletionTokens.toLocaleString()}
          </div>
          <p className="text-[11px] text-ink-quiet">Posts et analyses générés</p>
        </div>

        <div className="bg-surface border border-line rounded-card p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-xs text-ink-quiet">
            <span>Volume Total Tokens</span>
            <Cpu className="w-4 h-4 text-ink" />
          </div>
          <div className="text-2xl font-bold text-ink font-mono">
            {metrics.totalTokens.toLocaleString()}
          </div>
          <p className="text-[11px] text-ink-quiet">Cumul toutes requêtes confondues</p>
        </div>

        <div className="bg-surface border border-line rounded-card p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-xs text-ink-quiet">
            <span>Coût Estimé LLM</span>
            <DollarSign className="w-4 h-4 text-confirm" />
          </div>
          <div className="text-2xl font-bold text-confirm font-mono">
            {metrics.totalCostUsd.toFixed(3)} $
          </div>
          <p className="text-[11px] text-ink-quiet">Calculé sur tarifs DeepSeek V3 ($0.27 / $1.10)</p>
        </div>
      </div>

      {/* Panneau de Contrôle du Rate Limiting Dynamique */}
      <div className="bg-surface border border-line rounded-card p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-line pb-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-mark" />
            <h2 className="text-sm font-semibold text-ink">Rate Limiting Dynamique</h2>
          </div>
          <span className="text-xs font-mono text-ink-quiet">Protection anti-abus IA</span>
        </div>

        <form onSubmit={handleSaveRateLimit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-ink-quiet block mb-1">
                Capacité Max (Requêtes autorisées)
              </label>
              <input
                type="number"
                value={rateLimitCapacity}
                onChange={(e) => setRateLimitCapacity(parseInt(e.target.value, 10) || 1)}
                className="w-full border border-line rounded-input px-3 py-2 text-xs text-ink font-mono bg-paper focus:border-mark focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-ink-quiet block mb-1">
                Fenêtre Glissante (en heures)
              </label>
              <input
                type="number"
                value={rateLimitDurationHours}
                onChange={(e) => setRateLimitDurationHours(parseInt(e.target.value, 10) || 1)}
                className="w-full border border-line rounded-input px-3 py-2 text-xs text-ink font-mono bg-paper focus:border-mark focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-ink-quiet block mb-1">
                État de la Restriction
              </label>
              <select
                value={rateLimitEnabled ? "true" : "false"}
                onChange={(e) => setRateLimitEnabled(e.target.value === "true")}
                className="w-full border border-line rounded-input px-3 py-2 text-xs text-ink bg-paper focus:outline-hidden"
              >
                <option value="true">Actif (Limitation stricte)</option>
                <option value="false">Désactivé (Illimité)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingRateLimit}
              className="px-4 py-2 bg-mark text-white text-xs font-semibold rounded-input hover:bg-mark/90 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              {savingRateLimit ? "Enregistrement..." : "Appliquer les limites"}
            </button>
          </div>
        </form>
      </div>

      {/* Journal récent des opérations IA */}
      <div className="bg-surface border border-line rounded-card overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-line flex items-center justify-between">
          <h2 className="font-semibold text-sm text-ink">Journal des Requêtes LLM</h2>
          <span className="text-xs text-ink-quiet">{logs.length} dernière(s) trace(s)</span>
        </div>

        {logs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-ink">
              <thead className="bg-paper border-b border-line text-ink-quiet font-medium">
                <tr>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Opération</th>
                  <th className="px-5 py-3">Modèle</th>
                  <th className="px-5 py-3">Tokens (P / C)</th>
                  <th className="px-5 py-3">Total</th>
                  <th className="px-5 py-3">Coût Estimé</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {logs.map((l: any) => (
                  <tr key={l.id} className="hover:bg-paper/40 transition-colors">
                    <td className="px-5 py-3 font-mono text-ink-quiet">
                      {new Date(l.createdAt).toLocaleTimeString("fr-FR")}
                    </td>
                    <td className="px-5 py-3 font-mono text-ink">{l.operation}</td>
                    <td className="px-5 py-3 font-mono text-ink-quiet">{l.model}</td>
                    <td className="px-5 py-3 font-mono text-ink-quiet">
                      {l.promptTokens} / {l.completionTokens}
                    </td>
                    <td className="px-5 py-3 font-mono font-semibold">{l.totalTokens}</td>
                    <td className="px-5 py-3 font-mono text-confirm">
                      ${Number(l.estimatedCostUsd).toFixed(4)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-ink-quiet">
            Aucun journal d&apos;usage IA pour le moment. Les opérations de ghostwriting apparaîtront ici.
          </div>
        )}
      </div>
    </div>
  );
}

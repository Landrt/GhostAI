"use client";

import React, { useState, useEffect } from "react";
import { Tags, Save, Clock, PlusCircle, CheckCircle, AlertTriangle } from "lucide-react";
import clsx from "clsx";

export default function AdminSubscriptionsPage() {
  const [config, setConfig] = useState<any>(null);
  const [expiringSoon, setExpiringSoon] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/subscriptions");
      if (res.ok) {
        const data = await res.json();
        setConfig(data.config);
        setExpiringSoon(data.expiringSoon || []);
      }
    } catch (err) {
      console.error("Erreur fetch subscriptions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage(null);
      const res = await fetch("/api/admin/subscriptions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_pricing",
          sprintPrice: parseFloat(config.sprintPrice),
          monthlyPrice: parseFloat(config.monthlyPrice),
          lifetimePrice: parseFloat(config.lifetimePrice),
          founderQuotaTotal: parseInt(config.founderQuotaTotal, 10),
          founderQuotaUsed: parseInt(config.founderQuotaUsed, 10),
        }),
      });

      if (res.ok) {
        setMessage({ type: "success", text: "Configuration tarifaire enregistrée avec succès !" });
      } else {
        setMessage({ type: "error", text: "Impossible de sauvegarder les tarifs." });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Erreur serveur." });
    } finally {
      setSaving(false);
    }
  };

  const handleExtend = async (subscriptionId: string) => {
    try {
      const res = await fetch("/api/admin/subscriptions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "extend_subscription",
          subscriptionId,
        }),
      });

      if (res.ok) {
        await fetchData();
      }
    } catch (err) {
      console.error("Erreur extension:", err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl">
        <div className="h-8 w-64 bg-line/40 rounded animate-pulse" />
        <div className="h-64 bg-line/20 rounded-card animate-pulse" />
      </div>
    );
  }

  const founderPercent =
    config?.founderQuotaTotal > 0
      ? Math.round((config.founderQuotaUsed / config.founderQuotaTotal) * 100)
      : 0;

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink font-serif">
          Abonnements & Configuration des Tarifs
        </h1>
        <p className="text-xs text-ink-quiet mt-1">
          Ajustez les prix publics et les quotas sans redéploiement et gérez les renouvellements.
        </p>
      </div>

      {message && (
        <div
          className={clsx(
            "p-3 rounded-input text-xs font-medium border",
            message.type === "success"
              ? "bg-confirm/10 text-confirm border-confirm/30"
              : "bg-danger/10 text-danger border-danger/30"
          )}
        >
          {message.text}
        </div>
      )}

      {/* Formulaire des Tarifs Dynamiques */}
      <div className="bg-surface border border-line rounded-card p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-line pb-4">
          <div className="flex items-center gap-2">
            <Tags className="w-4 h-4 text-mark" />
            <h2 className="text-sm font-semibold text-ink">Grille Tarifaire Active</h2>
          </div>
          <span className="text-[11px] text-ink-quiet font-mono">
            Mise à jour immédiate en production
          </span>
        </div>

        <form onSubmit={handleSaveConfig} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="text-xs font-semibold text-ink-quiet block mb-1">
                Formule Découverte / Sprint ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={config?.sprintPrice || 0}
                onChange={(e) => setConfig({ ...config, sprintPrice: e.target.value })}
                className="w-full border border-line rounded-input px-3 py-2 text-sm text-ink font-mono bg-paper focus:border-mark focus:outline-hidden"
                required
              />
              <span className="text-[10px] text-ink-quiet mt-1 block">Accès 1 mois ponctuel</span>
            </div>

            <div>
              <label className="text-xs font-semibold text-ink-quiet block mb-1">
                Formule Mensuelle Pro ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={config?.monthlyPrice || 0}
                onChange={(e) => setConfig({ ...config, monthlyPrice: e.target.value })}
                className="w-full border border-line rounded-input px-3 py-2 text-sm text-ink font-mono bg-paper focus:border-mark focus:outline-hidden"
                required
              />
              <span className="text-[10px] text-ink-quiet mt-1 block">Abonnement récurrent mensuel</span>
            </div>

            <div>
              <label className="text-xs font-semibold text-ink-quiet block mb-1">
                Formule À Vie / Lifetime ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={config?.lifetimePrice || 0}
                onChange={(e) => setConfig({ ...config, lifetimePrice: e.target.value })}
                className="w-full border border-line rounded-input px-3 py-2 text-sm text-ink font-mono bg-paper focus:border-mark focus:outline-hidden"
                required
              />
              <span className="text-[10px] text-ink-quiet mt-1 block">Offre Fondateur unique</span>
            </div>
          </div>

          {/* Quotas Fondateurs */}
          <div className="p-4 bg-paper rounded-input border border-line/60 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-semibold text-ink">Jauge Quota Fondateur</h3>
                <p className="text-[11px] text-ink-quiet">
                  {config?.founderQuotaUsed || 0} / {config?.founderQuotaTotal || 0} places allouées ({founderPercent}%)
                </p>
              </div>
              <span className="text-xs font-bold text-mark font-mono">{founderPercent}%</span>
            </div>

            <div className="w-full h-2 bg-line rounded-full overflow-hidden">
              <div
                className="h-full bg-mark transition-all duration-300"
                style={{ width: `${Math.min(100, founderPercent)}%` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-[11px] font-semibold text-ink-quiet block mb-1">
                  Quota Maximum Fondateur
                </label>
                <input
                  type="number"
                  value={config?.founderQuotaTotal || 0}
                  onChange={(e) => setConfig({ ...config, founderQuotaTotal: e.target.value })}
                  className="w-full border border-line rounded-input px-3 py-1.5 text-xs text-ink font-mono bg-surface"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-ink-quiet block mb-1">
                  Compteur Ventes Déjà Réalisées
                </label>
                <input
                  type="number"
                  value={config?.founderQuotaUsed || 0}
                  onChange={(e) => setConfig({ ...config, founderQuotaUsed: e.target.value })}
                  className="w-full border border-line rounded-input px-3 py-1.5 text-xs text-ink font-mono bg-surface"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-mark text-white text-xs font-semibold rounded-input hover:bg-mark/90 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {saving ? "Enregistrement..." : "Enregistrer les modifications"}
            </button>
          </div>
        </form>
      </div>

      {/* Abonnements expirant sous 72h */}
      <div className="bg-surface border border-line rounded-card overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-line flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-warn" />
            <h2 className="font-semibold text-sm text-ink">
              Abonnements expirant sous 72h ({expiringSoon.length})
            </h2>
          </div>
          <span className="text-xs text-ink-quiet">Action de fidélisation rapide</span>
        </div>

        {expiringSoon.length > 0 ? (
          <div className="divide-y divide-line/60">
            {expiringSoon.map((sub: any) => (
              <div key={sub.id} className="p-4 flex items-center justify-between text-xs hover:bg-paper/40">
                <div className="space-y-0.5">
                  <div className="font-semibold text-ink">{sub.user?.email}</div>
                  <div className="text-[11px] text-ink-quiet">
                    Formule : <span className="uppercase font-mono text-mark">{sub.plan}</span> — Expire le{" "}
                    {new Date(sub.renewalDate).toLocaleDateString("fr-FR")}
                  </div>
                </div>

                <button
                  onClick={() => handleExtend(sub.id)}
                  className="px-3 py-1.5 bg-paper hover:bg-paper/80 border border-line rounded-input text-ink font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-confirm" />
                  Prolonger +7 jours
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-ink-quiet">
            Aucun abonnement en fin de période dans les 72 prochaines heures.
          </div>
        )}
      </div>
    </div>
  );
}

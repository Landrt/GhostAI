"use client";

import React, { useState, useEffect } from "react";
import { Server, CheckCircle2, AlertTriangle, XCircle, Shield, RefreshCw } from "lucide-react";
import clsx from "clsx";

export default function AdminSystemPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchHealth = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/system");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Erreur system:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
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

  const pings = data?.pings || [];
  const envStatus = data?.envStatus || [];

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink font-serif">
            Santé du Système & Diagnostic
          </h1>
          <p className="text-xs text-ink-quiet mt-1">
            Vérification de la connectivité réseau, de la latence des services et de l&apos;environnement.
          </p>
        </div>

        <button
          onClick={fetchHealth}
          className="px-3.5 py-2 bg-paper hover:bg-paper/80 border border-line rounded-input text-xs font-semibold text-ink flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Rafraîchir les pings
        </button>
      </div>

      {/* Pings des services en direct */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {pings.map((p: any, idx: number) => {
          const isOk = p.status === "operational";
          return (
            <div key={idx} className="bg-surface border border-line rounded-card p-5 space-y-2 shadow-sm">
              <div className="flex items-center justify-between text-xs text-ink-quiet">
                <span>{p.name}</span>
                {isOk ? (
                  <CheckCircle2 className="w-4 h-4 text-confirm" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-warn" />
                )}
              </div>
              <div className="text-lg font-bold text-ink">
                {isOk ? "Opérationnel" : p.status === "pending_key" ? "Clé en attente" : "Dégradé"}
              </div>
              <p className="text-[11px] text-ink-quiet font-mono">
                {p.latencyMs >= 0 ? `Latence : ~${p.latencyMs} ms` : "Non joignable"}
              </p>
            </div>
          );
        })}
      </div>

      {/* Checklist des variables d'environnement */}
      <div className="bg-surface border border-line rounded-card overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-line flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-mark" />
            <h2 className="font-semibold text-sm text-ink">
              Audit des Variables d&apos;Environnement
            </h2>
          </div>
          <span className="text-xs text-ink-quiet">Masquées pour la sécurité</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-ink">
            <thead className="bg-paper border-b border-line text-ink-quiet font-medium">
              <tr>
                <th className="px-5 py-3">Catégorie</th>
                <th className="px-5 py-3">Variable</th>
                <th className="px-5 py-3">Valeur (Masquée)</th>
                <th className="px-5 py-3">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/60">
              {envStatus.map((env: any, idx: number) => (
                <tr key={idx} className="hover:bg-paper/40 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-ink-quiet">{env.category}</td>
                  <td className="px-5 py-3.5 font-mono font-semibold text-ink">{env.name}</td>
                  <td className="px-5 py-3.5 font-mono text-ink-quiet">{env.preview || "Non définie"}</td>
                  <td className="px-5 py-3.5">
                    <span
                      className={clsx(
                        "px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider",
                        env.configured ? "bg-confirm/15 text-confirm" : "bg-warn/15 text-warn"
                      )}
                    >
                      {env.configured ? "Configurée" : "Optionnelle"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Infos Système */}
      <div className="p-4 bg-paper border border-line/60 rounded-input flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-ink-quiet font-mono">
        <div>Environnement actif : <span className="font-bold text-ink uppercase">{data?.nodeEnv}</span></div>
        <div>Horloge serveur : {data?.systemTime}</div>
      </div>
    </div>
  );
}

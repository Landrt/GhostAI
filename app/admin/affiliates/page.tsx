"use client";

import React, { useState, useEffect } from "react";
import {
  BadgePercent,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Smartphone,
  CreditCard,
  Ban,
  ShieldCheck,
} from "lucide-react";
import clsx from "clsx";

export default function AdminAffiliatesPage() {
  const [affiliates, setAffiliates] = useState<any[]>([]);
  const [pendingPayouts, setPendingPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/affiliates");
      if (res.ok) {
        const data = await res.json();
        setAffiliates(data.affiliates || []);
        setPendingPayouts(data.pendingPayouts || []);
      }
    } catch (err) {
      console.error("Erreur fetch affiliates:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTogglePartner = async (affiliate: any) => {
    if (!confirm(`Voulez-vous ${affiliate.isActive ? "suspendre" : "réactiver"} le lien de ce partenaire ?`)) {
      return;
    }

    try {
      setActionLoading(true);
      const res = await fetch("/api/admin/affiliates", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle_partner_status",
          affiliateId: affiliate.id,
          isActive: !affiliate.isActive,
        }),
      });

      if (res.ok) {
        await fetchData();
      }
    } catch (err) {
      console.error("Erreur toggle partner:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleModeratePayout = async (payoutId: string, decision: "approve" | "reject") => {
    if (!confirm(`Confirmer la décision : ${decision === "approve" ? "Valider le versement" : "Rejeter et recréditer le solde"} ?`)) {
      return;
    }

    try {
      setActionLoading(true);
      const res = await fetch("/api/admin/affiliates", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "moderate_payout",
          payoutId,
          decision,
        }),
      });

      if (res.ok) {
        await fetchData();
      }
    } catch (err) {
      console.error("Erreur modération payout:", err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink font-serif">
          Affiliés & Modération des Retraits
        </h1>
        <p className="text-xs text-ink-quiet mt-1">
          Supervisez tous les parrains et validez manuellement les virements de commissions.
        </p>
      </div>

      {/* File d'attente des retraits à valider */}
      <div className="bg-surface border border-line rounded-card overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-line flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-warn" />
            <h2 className="font-semibold text-sm text-ink">
              Demandes de Retrait en Attente ({pendingPayouts.length})
            </h2>
          </div>
          <span className="text-xs text-ink-quiet">Validation humaine requise</span>
        </div>

        {pendingPayouts.length > 0 ? (
          <div className="divide-y divide-line/60">
            {pendingPayouts.map((p) => {
              const details = (p.accountDetails as any) || {};
              return (
                <div key={p.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-paper/40">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-mark">
                        {p.amount.toFixed(2)} {p.currency}
                      </span>
                      <span className="text-xs text-ink-quiet">par</span>
                      <span className="font-semibold text-ink text-xs">{p.affiliate?.name}</span>
                      <span className="text-xs font-mono text-ink-quiet">({p.affiliate?.code})</span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-ink-quiet">
                      <span className="flex items-center gap-1 font-medium text-ink">
                        {p.payoutMethod === "mobile_money" ? (
                          <>
                            <Smartphone className="w-3.5 h-3.5 text-mark" />
                            {details.operator || "Mobile Money"} : {details.phone}
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-3.5 h-3.5 text-confirm" />
                            IBAN : {details.iban} ({details.accountName})
                          </>
                        )}
                      </span>
                      <span>• Réf : {p.reference}</span>
                      <span>• {new Date(p.createdAt).toLocaleDateString("fr-FR")}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleModeratePayout(p.id, "approve")}
                      disabled={actionLoading}
                      className="px-3.5 py-1.5 bg-confirm text-white text-xs font-semibold rounded-input hover:bg-confirm/90 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Valider & Payer
                    </button>
                    <button
                      onClick={() => handleModeratePayout(p.id, "reject")}
                      disabled={actionLoading}
                      className="px-3.5 py-1.5 bg-paper hover:bg-danger/10 text-danger border border-line rounded-input text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Rejeter
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-ink-quiet">
            Aucune demande de retrait en attente de modération.
          </div>
        )}
      </div>

      {/* Liste globale des Partenaires */}
      <div className="bg-surface border border-line rounded-card overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-line flex items-center justify-between">
          <h2 className="font-semibold text-sm text-ink flex items-center gap-2">
            <BadgePercent className="w-4 h-4 text-mark" />
            Tous les Partenaires ({affiliates.length})
          </h2>
          <span className="text-xs text-ink-quiet">Taux standard : 30% à vie</span>
        </div>

        {affiliates.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-ink">
              <thead className="bg-paper border-b border-line text-ink-quiet font-medium">
                <tr>
                  <th className="px-5 py-3">Code / Slug</th>
                  <th className="px-5 py-3">Partenaire</th>
                  <th className="px-5 py-3">Clics</th>
                  <th className="px-5 py-3">Inscrits</th>
                  <th className="px-5 py-3">Ventes</th>
                  <th className="px-5 py-3">Total Gagné</th>
                  <th className="px-5 py-3">Solde Dispo</th>
                  <th className="px-5 py-3">Statut</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {affiliates.map((a) => (
                  <tr key={a.id} className="hover:bg-paper/40 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-bold text-mark">
                      ?ref={a.code}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-ink">{a.name}</div>
                      <div className="text-[11px] text-ink-quiet font-mono">{a.email}</div>
                    </td>
                    <td className="px-5 py-3.5 font-mono">{a.totalClicks}</td>
                    <td className="px-5 py-3.5 font-mono">{a.totalSignups}</td>
                    <td className="px-5 py-3.5 font-mono font-bold text-confirm">
                      {a.totalConversions}
                    </td>
                    <td className="px-5 py-3.5 font-mono font-semibold">
                      {a.totalEarned.toFixed(2)} $
                    </td>
                    <td className="px-5 py-3.5 font-mono font-bold text-mark">
                      {a.availableBalance.toFixed(2)} $
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={clsx(
                          "px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider",
                          a.isActive ? "bg-confirm/15 text-confirm" : "bg-danger/15 text-danger"
                        )}
                      >
                        {a.isActive ? "Actif" : "Suspendu"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => handleTogglePartner(a)}
                        disabled={actionLoading}
                        className={clsx(
                          "px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer",
                          a.isActive
                            ? "bg-danger/10 text-danger hover:bg-danger/20"
                            : "bg-confirm/10 text-confirm hover:bg-confirm/20"
                        )}
                      >
                        {a.isActive ? "Suspendre" : "Réactiver"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-ink-quiet">
            Aucun compte affilié actif sur la plateforme pour le moment.
          </div>
        )}
      </div>
    </div>
  );
}

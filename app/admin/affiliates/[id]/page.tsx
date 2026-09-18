"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Video,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Trash2,
  ShieldAlert,
  ShieldCheck,
  Calendar,
  DollarSign,
  Users,
  MousePointer,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import clsx from "clsx";

export default function AdminAffiliateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const affiliateId = params?.id as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchAffiliateDetail = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const res = await fetch(`/api/admin/affiliates/${affiliateId}`);
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Impossible de charger cet affilié");
      }
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setErrorMessage(err.message || "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, [affiliateId]);

  useEffect(() => {
    if (affiliateId) {
      fetchAffiliateDetail();
    }
  }, [affiliateId, fetchAffiliateDetail]);

  const handleSetStrikes = async (newStrikes: number) => {
    if (
      !confirm(
        `Confirmez-vous l'ajustement des manquements à ${newStrikes} / 3 ?${
          newStrikes >= 3 ? " ATTENTION : Cela révoquera immédiatement l'affilié !" : ""
        }`
      )
    ) {
      return;
    }

    try {
      setActionLoading(true);
      setErrorMessage(null);
      const res = await fetch(`/api/admin/affiliates/${affiliateId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "set_strikes",
          strikesCount: newStrikes,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erreur lors de la mise à jour");
      }

      setSuccessMessage("Manquements mis à jour avec succès.");
      await fetchAffiliateDetail();
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevoke = async () => {
    const reason = prompt("Raison de la révocation manuelle (optionnelle) :", "Non-respect des quotas hebdomadaires");
    if (reason === null) return;

    try {
      setActionLoading(true);
      setErrorMessage(null);
      const res = await fetch(`/api/admin/affiliates/${affiliateId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "revoke",
          reason,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erreur de révocation");
      }

      setSuccessMessage("L'affilié a été révoqué. Ses commissions en cours sont annulées.");
      await fetchAffiliateDetail();
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReinstate = async () => {
    if (
      !confirm(
        "Voulez-vous réhabiliter cet affilié ? Ses manquements seront remis à 0 et son compte sera réactivé."
      )
    ) {
      return;
    }

    try {
      setActionLoading(true);
      setErrorMessage(null);
      const res = await fetch(`/api/admin/affiliates/${affiliateId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reinstate",
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erreur lors de la réhabilitation");
      }

      setSuccessMessage("L'affilié a été réhabilité avec succès.");
      await fetchAffiliateDetail();
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        `ATTENTION ACTION IRRÉVERSIBLE :\nVoulez-vous supprimer définitivement l'affilié ${data?.affiliate?.name} ?\nToutes ses commissions, clics et vidéos seront purgés de la base de données.`
      )
    ) {
      return;
    }

    try {
      setActionLoading(true);
      setErrorMessage(null);
      const res = await fetch(`/api/admin/affiliates/${affiliateId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erreur de suppression");
      }

      alert("Affilié supprimé avec succès.");
      router.push("/admin/affiliates");
    } catch (err: any) {
      setErrorMessage(err.message);
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-ink-quiet text-sm animate-pulse">
        Chargement de la fiche affilié et des vidéos...
      </div>
    );
  }

  if (!data?.affiliate) {
    return (
      <div className="space-y-4 max-w-4xl">
        <Link
          href="/admin/affiliates"
          className="inline-flex items-center gap-2 text-xs font-semibold text-mark hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Retour à la liste des affiliés
        </Link>
        <div className="p-6 bg-danger/10 border border-danger/30 rounded-card text-danger text-sm">
          {errorMessage || "Affilié introuvable."}
        </div>
      </div>
    );
  }

  const { affiliate, currentWeek, rules } = data;
  const isRevoked = affiliate.isRevoked;
  const strikes = affiliate.strikesCount || 0;
  const weekVideos = currentWeek.videosCount;
  const weekTarget = currentWeek.requiredVideos;
  const allVideos: any[] = affiliate.videos || [];

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header & Navigation */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <Link
            href="/admin/affiliates"
            className="inline-flex items-center gap-2 text-xs font-semibold text-mark hover:underline mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Retour à la liste des affiliés
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-ink font-serif">
              {affiliate.name}
            </h1>
            <span
              className={clsx(
                "px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider",
                isRevoked
                  ? "bg-danger text-white"
                  : affiliate.isActive
                  ? "bg-confirm/15 text-confirm"
                  : "bg-paper-contrast text-ink-quiet"
              )}
            >
              {isRevoked ? "Révoqué (3 manquements)" : affiliate.isActive ? "Actif" : "Suspendu"}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-ink-quiet mt-1 font-mono">
            <span>{affiliate.email}</span>
            <span>•</span>
            <span className="text-mark font-bold">Lien : ?ref={affiliate.code}</span>
            <span>•</span>
            <span>Membre depuis le {new Date(affiliate.createdAt).toLocaleDateString("fr-FR")}</span>
          </div>
        </div>

        {/* Boutons d'actions rapides Admin */}
        <div className="flex items-center gap-2 flex-wrap">
          {isRevoked ? (
            <button
              onClick={handleReinstate}
              disabled={actionLoading}
              className="px-3.5 py-1.5 bg-confirm text-white text-xs font-semibold rounded-input hover:bg-confirm/90 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Réhabiliter l&apos;affilié
            </button>
          ) : (
            <button
              onClick={handleRevoke}
              disabled={actionLoading}
              className="px-3.5 py-1.5 bg-danger/10 text-danger border border-danger/30 hover:bg-danger/20 text-xs font-semibold rounded-input flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              Révoquer le statut
            </button>
          )}

          <button
            onClick={handleDelete}
            disabled={actionLoading}
            className="px-3.5 py-1.5 bg-paper hover:bg-danger/15 text-danger border border-line rounded-input text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Supprimer définitivement l'affilié"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Supprimer l&apos;affilié
          </button>
        </div>
      </div>

      {/* Messages d'alerte feedback */}
      {errorMessage && (
        <div className="p-4 bg-danger/10 border border-danger/30 rounded-card text-danger text-xs flex items-center gap-2">
          <XCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
      {successMessage && (
        <div className="p-4 bg-confirm/10 border border-confirm/30 rounded-card text-confirm text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Alerte si compte révoqué */}
      {isRevoked && (
        <div className="p-5 bg-danger/10 border border-danger/30 rounded-card flex items-start gap-3 text-danger">
          <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-bold text-sm">Ce partenaire est actuellement révoqué</p>
            <p>
              Ayant atteint le seuil maximal de 3 manquements hebdomadaires (ou par décision admin),
              son statut a été suspendu le{" "}
              {affiliate.revokedAt ? new Date(affiliate.revokedAt).toLocaleDateString("fr-FR") : "récemment"}. Ses
              commissions en attente sont bloquées.
            </p>
          </div>
        </div>
      )}

      {/* SECTION 1: Statut Hebdomadaire & Règle des 3 Vidéos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Carte Quota Hebdomadaire */}
        <div className="lg:col-span-2 bg-surface border border-line rounded-card p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Video className="w-5 h-5 text-mark" />
              <div>
                <h2 className="font-bold text-sm text-ink font-serif">
                  Activité Vidéo de la Semaine ({currentWeek.weekKey})
                </h2>
                <p className="text-[11px] text-ink-quiet">
                  Cycle en cours : du lundi {new Date(currentWeek.startOfWeek).toLocaleDateString("fr-FR")} au dimanche {new Date(currentWeek.endOfWeek).toLocaleDateString("fr-FR")}
                </p>
              </div>
            </div>

            <span
              className={clsx(
                "px-3 py-1 rounded-full text-xs font-bold font-mono",
                weekVideos >= weekTarget
                  ? "bg-confirm/15 text-confirm"
                  : weekVideos > 0
                  ? "bg-warn/15 text-warn"
                  : "bg-danger/15 text-danger"
              )}
            >
              {weekVideos} / {weekTarget} vidéos postées
            </span>
          </div>

          {/* Jauge visuelle */}
          <div className="space-y-1.5">
            <div className="w-full bg-paper rounded-full h-3 overflow-hidden border border-line">
              <div
                className={clsx(
                  "h-full transition-all duration-500 rounded-full",
                  weekVideos >= weekTarget ? "bg-confirm" : weekVideos > 0 ? "bg-warn" : "bg-danger"
                )}
                style={{ width: `${Math.min(100, (weekVideos / weekTarget) * 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-ink-quiet">
              <span>0 vidéo</span>
              <span>1 vidéo</span>
              <span>2 vidéos</span>
              <span className="font-semibold text-confirm">3 vidéos (Objectif validé)</span>
            </div>
          </div>

          {/* Détail des stats hebdo */}
          <div className="grid grid-cols-3 gap-4 pt-3 border-t border-line">
            <div className="p-3 bg-paper rounded-input">
              <div className="text-[11px] text-ink-quiet flex items-center gap-1">
                <MousePointer className="w-3.5 h-3.5 text-mark" />
                Clics (cette semaine)
              </div>
              <div className="text-lg font-bold font-mono text-ink mt-1">
                {currentWeek.clicks}
              </div>
            </div>

            <div className="p-3 bg-paper rounded-input">
              <div className="text-[11px] text-ink-quiet flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-confirm" />
                Inscrits (cette semaine)
              </div>
              <div className="text-lg font-bold font-mono text-ink mt-1">
                {currentWeek.signups}
              </div>
            </div>

            <div className="p-3 bg-paper rounded-input">
              <div className="text-[11px] text-ink-quiet flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-mark" />
                Commissions (cette semaine)
              </div>
              <div className="text-lg font-bold font-mono text-confirm mt-1">
                {Number(currentWeek.salesAmount).toFixed(2)} $
              </div>
            </div>
          </div>
        </div>

        {/* Carte Compteur de Manquements & Ajustement */}
        <div className="bg-surface border border-line rounded-card p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warn" />
              <h2 className="font-bold text-sm text-ink font-serif">
                Manquements (Strikes)
              </h2>
            </div>
            <p className="text-[11px] text-ink-quiet mt-1">
              Règle : À 3 manquements hebdomadaires consécutifs ou cumulés, le statut d&apos;affilié est révoqué.
            </p>

            <div className="my-5 flex items-center justify-center gap-4">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={clsx(
                    "w-12 h-12 rounded-xl flex items-center justify-center font-mono font-bold text-lg border-2 transition-all",
                    step <= strikes
                      ? "bg-danger/15 border-danger text-danger shadow-sm scale-105"
                      : "bg-paper border-line text-ink-quiet"
                  )}
                >
                  {step}
                </div>
              ))}
            </div>

            <div className="text-center text-xs">
              <span className="font-bold text-ink">
                {strikes} / {rules.maxStrikes} manquements enregistrés
              </span>
              <p className="text-[11px] text-ink-quiet mt-0.5">
                {strikes === 0
                  ? "Compte exemplaire, aucun manquement"
                  : strikes === 1
                  ? "1er avertissement"
                  : strikes === 2
                  ? "2e avertissement (Dernière chance avant révocation)"
                  : "3 manquements : Statut révoqué"}
              </p>
            </div>
          </div>

          {/* Ajustement direct par l'admin */}
          <div className="pt-4 border-t border-line flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold text-ink-quiet">Ajuster :</span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleSetStrikes(Math.max(0, strikes - 1))}
                disabled={actionLoading || strikes <= 0}
                className="px-2.5 py-1 bg-paper hover:bg-paper-contrast disabled:opacity-40 border border-line rounded text-xs font-mono font-bold text-ink transition-colors cursor-pointer"
                title="Retirer un manquement (-1)"
              >
                -1
              </button>
              <button
                onClick={() => handleSetStrikes(Math.min(3, strikes + 1))}
                disabled={actionLoading || strikes >= 3}
                className="px-2.5 py-1 bg-warn/15 hover:bg-warn/25 disabled:opacity-40 border border-warn/30 rounded text-xs font-mono font-bold text-warn transition-colors cursor-pointer"
                title="Ajouter un manquement (+1)"
              >
                +1 Strike
              </button>
              <button
                onClick={() => handleSetStrikes(0)}
                disabled={actionLoading || strikes === 0}
                className="px-2.5 py-1 bg-confirm/15 hover:bg-confirm/25 disabled:opacity-40 border border-confirm/30 rounded text-xs font-semibold text-confirm transition-colors cursor-pointer"
                title="Remettre les strikes à zéro"
              >
                Reset à 0
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Tous les liens de vidéos postés (Historique Complet) */}
      <div className="bg-surface border border-line rounded-card overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-line flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Video className="w-4 h-4 text-mark" />
            <h2 className="font-semibold text-sm text-ink">
              Historique exhaustif des vidéos soumises ({allVideos.length})
            </h2>
          </div>
          <span className="text-xs text-ink-quiet">
            Toutes les publications déclarées par l&apos;affilié
          </span>
        </div>

        {allVideos.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-ink">
              <thead className="bg-paper border-b border-line text-ink-quiet font-medium">
                <tr>
                  <th className="px-5 py-3">Lien de la Vidéo</th>
                  <th className="px-5 py-3">Plateforme</th>
                  <th className="px-5 py-3">Semaine ISO</th>
                  <th className="px-5 py-3">Date de Soumission</th>
                  <th className="px-5 py-3">Statut</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {allVideos.map((vid: any) => {
                  const isCurrent = vid.weekKey === currentWeek.weekKey;
                  return (
                    <tr
                      key={vid.id}
                      className={clsx(
                        "hover:bg-paper/40 transition-colors",
                        isCurrent && "bg-mark/5"
                      )}
                    >
                      <td className="px-5 py-3.5 max-w-md">
                        <a
                          href={vid.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-mark hover:underline inline-flex items-center gap-1.5 truncate max-w-full font-medium"
                          title={vid.url}
                        >
                          <span className="truncate">{vid.url}</span>
                          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                        </a>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="px-2 py-0.5 rounded bg-paper border border-line text-[11px] font-medium capitalize">
                          {vid.platform || "Autre"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-mono">
                        <div className="flex items-center gap-1.5">
                          <span>{vid.weekKey}</span>
                          {isCurrent && (
                            <span className="px-1.5 py-0.2 rounded bg-confirm/15 text-confirm text-[9px] font-bold uppercase">
                              En cours
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-ink-quiet">
                        {new Date(vid.submittedAt).toLocaleString("fr-FR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1 text-confirm font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Validé
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <a
                          href={vid.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-mark/10 text-mark hover:bg-mark/20 font-semibold text-[11px] transition-colors"
                        >
                          Vérifier <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-ink-quiet">
            Cet affilié n&apos;a encore soumis aucune vidéo promotionnelle.
          </div>
        )}
      </div>

      {/* SECTION 3: Bilan Global & Performance Financière */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-surface border border-line rounded-card p-5 shadow-sm">
          <span className="text-xs text-ink-quiet">Total Clics à vie</span>
          <p className="text-2xl font-bold font-mono text-ink mt-1">
            {affiliate.totalClicks}
          </p>
          <span className="text-[11px] text-ink-quiet mt-1 block">Visites sur le lien affilié</span>
        </div>

        <div className="bg-surface border border-line rounded-card p-5 shadow-sm">
          <span className="text-xs text-ink-quiet">Inscriptions totales</span>
          <p className="text-2xl font-bold font-mono text-ink mt-1">
            {affiliate.totalSignups}
          </p>
          <span className="text-[11px] text-ink-quiet mt-1 block">Comptes créés via son code</span>
        </div>

        <div className="bg-surface border border-line rounded-card p-5 shadow-sm">
          <span className="text-xs text-ink-quiet">Total Commissions Gagnées</span>
          <p className="text-2xl font-bold font-mono text-confirm mt-1">
            {affiliate.totalEarned.toFixed(2)} $
          </p>
          <span className="text-[11px] text-ink-quiet mt-1 block">30% sur chaque paiement</span>
        </div>

        <div className="bg-surface border border-line rounded-card p-5 shadow-sm">
          <span className="text-xs text-ink-quiet">Solde Disponible (Seuil 75$)</span>
          <p className="text-2xl font-bold font-mono text-mark mt-1">
            {affiliate.availableBalance.toFixed(2)} $
          </p>
          <span className="text-[11px] text-ink-quiet mt-1 block">
            En attente de virement : {affiliate.pendingPayout.toFixed(2)} $
          </span>
        </div>
      </div>

      {/* SECTION 4: Dernières Commissions Enregistrées */}
      <div className="bg-surface border border-line rounded-card overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-line flex items-center justify-between">
          <h2 className="font-semibold text-sm text-ink">
            Dernières Commissions Récemment Créditées ({affiliate.commissions?.length || 0})
          </h2>
          <span className="text-xs text-ink-quiet">Gains à vie tant que l&apos;abonné renouvelle</span>
        </div>

        {affiliate.commissions && affiliate.commissions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-ink">
              <thead className="bg-paper border-b border-line text-ink-quiet font-medium">
                <tr>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Montant Vente</th>
                  <th className="px-5 py-3">Commission (30%)</th>
                  <th className="px-5 py-3">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {affiliate.commissions.map((c: any) => (
                  <tr key={c.id} className="hover:bg-paper/40 transition-colors">
                    <td className="px-5 py-3 text-ink-quiet">
                      {new Date(c.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-5 py-3 font-mono">{c.saleAmount.toFixed(2)} $</td>
                    <td className="px-5 py-3 font-mono font-bold text-confirm">
                      +{c.commissionAmount.toFixed(2)} $
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={clsx(
                          "px-2 py-0.5 rounded text-[10px] font-semibold uppercase",
                          c.status === "available"
                            ? "bg-confirm/15 text-confirm"
                            : c.status === "pending"
                            ? "bg-warn/15 text-warn"
                            : "bg-danger/15 text-danger"
                        )}
                      >
                        {c.status === "available"
                          ? "Disponible"
                          : c.status === "pending"
                          ? "En attente"
                          : "Annulé"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-ink-quiet">
            Aucune commission enregistrée pour le moment.
          </div>
        )}
      </div>
    </div>
  );
}

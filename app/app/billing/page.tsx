"use client";

import React, { useState, useEffect } from "react";
import { Progress } from "@/components/ui/Progress";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Check, ExternalLink, Sparkles, AlertCircle, ShieldCheck } from "lucide-react";
import clsx from "clsx";

export default function BillingPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [redirectingPortal, setRedirectingPortal] = useState(false);
  const [redirectingCheckout, setRedirectingCheckout] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBilling();
  }, []);

  const fetchBilling = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/billing");
      if (!res.ok) throw new Error("Erreur de chargement.");
      const json = await res.json();
      setData(json);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPortal = async () => {
    setRedirectingPortal(true);
    setError(null);
    try {
      const res = await fetch("/api/billing/create-portal-session", { method: "POST" });
      const json = await res.json();
      if (json.url) {
        window.location.href = json.url;
      } else {
        throw new Error(json.error || "Impossible d'ouvrir le portail de facturation.");
      }
    } catch (err: any) {
      setError(err.message);
      setRedirectingPortal(false);
    }
  };

  const handleSelectPlan = async (planKey: "pro" | "promax") => {
    setRedirectingCheckout(true);
    setError(null);
    try {
      const res = await fetch("/api/billing/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planKey }),
      });
      const json = await res.json();
      if (json.url) {
        window.location.href = json.url;
      } else {
        throw new Error(json.error || "Échec de création de session.");
      }
    } catch (err: any) {
      setError(err.message);
      setRedirectingCheckout(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center space-y-3">
        <div className="inline-block animate-spin w-6 h-6 border-2 border-mark border-t-transparent rounded-full" />
        <p className="text-xs text-ink-quiet">Chargement des informations de facturation...</p>
      </div>
    );
  }

  const plan = data?.plan || "free";
  const postsUsed = data?.postsUsedThisMonth || 0;
  const planLimit = plan === "free" ? 5 : plan === "pro" ? 30 : 999999;
  const isUnlimited = planLimit > 1000;

  const repurposesUsed = data?.repurposesUsedThisMonth || 0;
  const repurposeLimit = plan === "free" ? 1 : plan === "pro" ? 4 : 30;

  const renewalDateStr = data?.renewalDate
    ? new Date(data.renewalDate).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Prochain cycle dans 30 jours";

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="pb-4 border-b border-line">
        <h1 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight">Facturation & Quotas</h1>
        <p className="text-xs text-ink-quiet mt-0.5">Suivi de ta consommation et gestion de ton abonnement Stripe.</p>
      </div>

      {error && (
        <div className="p-3 bg-danger/10 border border-danger/20 rounded-input text-xs text-danger flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* BANNIÈRE MARKETING : AUCUN PRÉLÈVEMENT AUTOMATIQUE SOURNOIS */}
      <div className="bg-surface border border-line rounded-card p-4 sm:p-5 flex items-start gap-3.5 shadow-xs">
        <div className="w-8 h-8 rounded-full bg-confirm/10 text-confirm shrink-0 flex items-center justify-center mt-0.5 font-bold">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div className="space-y-1 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold text-ink text-sm">
              Engagement GhostAI : Paiement au mois sans reconduction automatique forcée
            </h3>
            <span className="text-[10px] font-mono uppercase bg-confirm/15 text-confirm px-2 py-0.5 rounded-full font-semibold">
              Liberté 100%
            </span>
          </div>
          <p className="text-ink-quiet leading-relaxed">
            Pour vous garantir une sérénité financière absolue et éliminer tout risque d&apos;abonnement oublié, <strong>vos paiements ne sont jamais prélevés automatiquement chaque mois</strong>. Votre formule couvre 30 jours complets d&apos;accès. À l&apos;échéance, vous recevez une simple notification et vous choisissez vous-même de recharger votre mois en un clic si vous êtes satisfait. Zéro mauvaise surprise bancaire.
          </p>
        </div>
      </div>

      {/* Carte principale */}
      <div className="bg-surface border border-line rounded-card p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-line/60">
          <div>
            <span className="text-xs font-semibold text-ink-quiet uppercase tracking-wider">Plan actuel</span>
            <div className="flex items-center gap-3 mt-1">
              <h2 className="text-2xl font-extrabold text-ink font-mono capitalize">
                {plan === "free" ? "Free ($0/mois)" : plan === "pro" ? "Pro ($49/mois)" : "ProMax ($99/mois)"}
              </h2>
              {plan !== "free" && (
                <span className="px-2 py-0.5 rounded bg-confirm/15 text-confirm text-xs font-semibold">
                  Actif
                </span>
              )}
            </div>
          </div>

          <div className="text-sm text-ink-quiet">
            {plan !== "free" ? "Période active jusqu'au : " : "Prochain cycle gratuit : "}
            <strong className="text-ink">{renewalDateStr}</strong>
            {plan !== "free" && (
              <span className="block text-[11px] text-confirm font-medium mt-0.5">
                ✓ Sans débit automatique à l&apos;échéance
              </span>
            )}
          </div>
        </div>

        {/* Jauges d'utilisation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Jauge posts */}
          <div className="space-y-2.5 p-4 bg-paper rounded-input border border-line">
            <div className="flex items-center justify-between text-xs">
              <span className="text-ink font-semibold">Posts rédigés :</span>
              <span className="font-mono font-bold text-ink">
                {postsUsed} / {isUnlimited ? "Illimité" : `${planLimit} posts`}
              </span>
            </div>

            <Progress
              value={isUnlimited ? 15 : postsUsed}
              max={isUnlimited ? 100 : planLimit}
              indicatorColor="mark"
            />
            <p className="text-[10px] text-ink-quiet">Génération individuelle avec vérification 3 juges.</p>
          </div>

          {/* Jauge Atomiseur */}
          <div className="space-y-2.5 p-4 bg-paper rounded-input border border-line">
            <div className="flex items-center justify-between text-xs">
              <span className="text-ink font-semibold">Packs Atomiseur :</span>
              <span className="font-mono font-bold text-ink">
                {repurposesUsed} / {repurposeLimit} packs
              </span>
            </div>

            <Progress
              value={repurposesUsed}
              max={repurposeLimit}
              indicatorColor="mark"
            />
            <p className="text-[10px] text-ink-quiet">Atomisation multi-formats d&apos;articles et vidéos YouTube.</p>
          </div>
        </div>

        <p className="text-[11px] text-ink-quiet">
          Les compteurs mensuels sont automatiquement réinitialisés à chaque cycle de facturation de 30 jours.
        </p>

        {/* Actions principales */}
        <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-line/60">
          <Button
            variant="secondary"
            size="md"
            onClick={() => setIsPlanModalOpen(true)}
          >
            Changer de plan
          </Button>

          {plan !== "free" && (
            <Button
              variant="outline"
              size="md"
              onClick={handleOpenPortal}
              loading={redirectingPortal}
              className="gap-2"
            >
              <span>{redirectingPortal ? "Redirection..." : "Gérer paiement & factures"}</span>
              <ExternalLink className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Modale de changement de plan inline */}
      <Modal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        title="Changer de formule d'abonnement"
        description="Choisis le forfait qui correspond au rythme de tes publications."
        maxWidth="lg"
      >
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Carte Pro */}
            <div
              className={clsx(
                "p-5 rounded-card border transition-colors flex flex-col justify-between",
                plan === "pro" ? "border-ink bg-paper" : "border-line bg-surface"
              )}
            >
              <div>
                <h4 className="text-base font-bold text-ink">Pro</h4>
                <p className="text-xs text-ink-quiet mt-0.5">Pour qui publie régulièrement.</p>
                <div className="my-4">
                  <span className="text-2xl font-mono font-bold text-ink">$49</span>
                  <span className="text-xs text-ink-quiet">/mois</span>
                  <span className="block text-[10px] text-confirm font-semibold mt-1">
                    ✓ 30 jours fermes • Zéro reconduction forcée
                  </span>
                </div>
                <ul className="text-xs text-ink space-y-2">
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-confirm" /> 30 posts par mois
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-confirm" /> 4 Packs Atomiseur complets / mois
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-confirm" /> Triple vérification qualité
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-confirm" /> Apprentissage continu de la voix
                  </li>
                </ul>
              </div>

              <div className="pt-5">
                {plan === "pro" ? (
                  <Button variant="outline" size="sm" className="w-full" disabled>
                    Plan actuel
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    loading={redirectingCheckout}
                    onClick={() => handleSelectPlan("pro")}
                  >
                    Passer au plan Pro
                  </Button>
                )}
              </div>
            </div>

            {/* Carte ProMax */}
            <div
              className={clsx(
                "p-5 rounded-card border transition-colors flex flex-col justify-between",
                plan === "promax" ? "border-ink bg-paper" : "border-line bg-surface"
              )}
            >
              <div>
                <h4 className="text-base font-bold text-ink">ProMax</h4>
                <p className="text-xs text-ink-quiet mt-0.5">Pour qui gère plusieurs voix.</p>
                <div className="my-4">
                  <span className="text-2xl font-mono font-bold text-ink">$99</span>
                  <span className="text-xs text-ink-quiet">/mois</span>
                  <span className="block text-[10px] text-confirm font-semibold mt-1">
                    ✓ 30 jours fermes • Zéro reconduction forcée
                  </span>
                </div>
                <ul className="text-xs text-ink space-y-2">
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-confirm" /> Posts illimités (usage raisonnable)
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-confirm" /> 30 Packs Atomiseur XXL / mois
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-confirm" /> Multi-voix et analyses avancées
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-confirm" /> Support prioritaire
                  </li>
                </ul>
              </div>

              <div className="pt-5">
                {plan === "promax" ? (
                  <Button variant="outline" size="sm" className="w-full" disabled>
                    Plan actuel
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    loading={redirectingCheckout}
                    onClick={() => handleSelectPlan("promax")}
                  >
                    Passer à ProMax
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

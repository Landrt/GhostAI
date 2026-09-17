"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Copy,
  Check,
  TrendingUp,
  Clock,
  Wallet,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Edit3,
  CreditCard,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  FileText,
  ExternalLink,
} from "lucide-react";
import clsx from "clsx";

export default function PartnerPage() {
  const [loading, setLoading] = useState(true);
  const [partnerData, setPartnerData] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [showSlugModal, setShowSlugModal] = useState(false);
  const [showPayoutModal, setShowPayoutModal] = useState(false);

  // Form states
  const [customSlug, setCustomSlug] = useState("");
  const [slugError, setSlugError] = useState("");
  const [slugSubmitting, setSlugSubmitting] = useState(false);

  const [payoutAmount, setPayoutAmount] = useState<number>(20);
  const [payoutMethod, setPayoutMethod] = useState<"mobile_money" | "bank">("mobile_money");
  const [payoutDetails, setPayoutDetails] = useState({
    operator: "Orange Money",
    phone: "",
    bankName: "",
    iban: "",
    bic: "",
    accountName: "",
  });
  const [payoutSubmitting, setPayoutSubmitting] = useState(false);
  const [payoutMessage, setPayoutMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Onboarding agreement
  const [agreed, setAgreed] = useState(false);
  const [activating, setActivating] = useState(false);
  const [activationError, setActivationError] = useState<string | null>(null);

  // Fetch partner data
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/partner");
      if (res.ok) {
        const data = await res.json();
        setPartnerData(data);
      }
    } catch (err) {
      console.error("Erreur chargement données partenaire:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleActivate = async () => {
    if (!agreed) {
      setActivationError("Veuillez cocher la case d'acceptation des conditions pour continuer.");
      return;
    }
    try {
      setActivating(true);
      setActivationError(null);
      const res = await fetch("/api/partner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agreedToTerms: true }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setActivationError(data.error || "Une erreur est survenue lors de l'activation.");
        return;
      }
      await fetchData();
    } catch (err: any) {
      console.error("Erreur activation:", err);
      setActivationError(err.message || "Erreur de communication avec le serveur.");
    } finally {
      setActivating(false);
    }
  };

  const handleCopyLink = () => {
    if (!partnerData?.partner?.code) return;
    const origin = typeof window !== "undefined" ? window.location.origin : "https://ghostai.app";
    const referralUrl = `${origin}/?ref=${partnerData.partner.code}`;
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSlugSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSlugError("");

    const clean = customSlug.trim().toLowerCase();
    if (!/^[a-z0-9-]{3,30}$/.test(clean)) {
      setSlugError("Le code doit contenir entre 3 et 30 caractères alphanumériques (minuscules, chiffres, tirets).");
      return;
    }

    try {
      setSlugSubmitting(true);
      const res = await fetch("/api/partner", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "customize_slug", slug: clean }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSlugError(data.error || "Impossible de mettre à jour le code.");
        return;
      }
      setShowSlugModal(false);
      await fetchData();
    } catch (err: any) {
      setSlugError(err.message || "Erreur de communication.");
    } finally {
      setSlugSubmitting(false);
    }
  };

  const handlePayoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPayoutMessage(null);

    if (payoutAmount < 20) {
      setPayoutMessage({ type: "error", text: "Le seuil minimum de retrait est de 20,00 $." });
      return;
    }

    if (payoutAmount > (partnerData?.metrics?.availableBalance || 0)) {
      setPayoutMessage({ type: "error", text: "Le montant dépasse votre solde disponible." });
      return;
    }

    try {
      setPayoutSubmitting(true);
      const res = await fetch("/api/partner/payout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: payoutAmount,
          payoutMethod,
          accountDetails: payoutDetails,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPayoutMessage({ type: "error", text: data.error || "Échec de la demande de retrait." });
        return;
      }
      setPayoutMessage({ type: "success", text: "Demande de retrait enregistrée avec succès !" });
      setTimeout(() => {
        setShowPayoutModal(false);
        setPayoutMessage(null);
        fetchData();
      }, 1500);
    } catch (err: any) {
      setPayoutMessage({ type: "error", text: err.message || "Erreur lors du retrait." });
    } finally {
      setPayoutSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-6xl mx-auto space-y-6">
        <div className="h-8 w-64 bg-line/40 rounded animate-pulse" />
        <div className="h-32 bg-line/20 rounded-card animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-28 bg-line/20 rounded-card animate-pulse" />
          <div className="h-28 bg-line/20 rounded-card animate-pulse" />
          <div className="h-28 bg-line/20 rounded-card animate-pulse" />
        </div>
      </div>
    );
  }

  // ÉTAT 1 : NON PARTENAIRE -> ONBOARDING 1-CLIC
  if (!partnerData?.partner) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="bg-surface border border-line rounded-card p-8 md:p-12 shadow-sm space-y-8">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-mark bg-mark-light px-2.5 py-1 rounded-full">
              <Users className="w-3.5 h-3.5" />
              Programme Partenaire Officiel
            </span>
            <h1 className="text-3xl font-bold tracking-tight text-ink font-serif">
              Touchez 30% chaque mois sur chaque abonné, à vie.
            </h1>
            <p className="text-ink-quiet text-base max-w-2xl leading-relaxed">
              Recommandez GhostAI à votre réseau de créateurs, dirigeants et professionnels. Recevez une rente mensuelle automatique sur chaque abonnement converti.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 bg-paper rounded-input border border-line/60 space-y-2">
              <div className="w-8 h-8 rounded-full bg-mark-light text-mark flex items-center justify-center font-bold text-sm">
                30%
              </div>
              <h3 className="font-semibold text-sm text-ink">Commission à vie</h3>
              <p className="text-xs text-ink-quiet leading-relaxed">
                Tant que votre filleul reste abonné, vous touchez votre commission chaque mois.
              </p>
            </div>
            <div className="p-4 bg-paper rounded-input border border-line/60 space-y-2">
              <div className="w-8 h-8 rounded-full bg-confirm/15 text-confirm flex items-center justify-center font-bold text-sm">
                60j
              </div>
              <h3 className="font-semibold text-sm text-ink">Attribution 60 jours</h3>
              <p className="text-xs text-ink-quiet leading-relaxed">
                Le cookie de suivi est conservé 60 jours. Dès l&apos;inscription, le lien est scellé à vie.
              </p>
            </div>
            <div className="p-4 bg-paper rounded-input border border-line/60 space-y-2">
              <div className="w-8 h-8 rounded-full bg-ink/10 text-ink flex items-center justify-center font-bold text-sm">
                20$
              </div>
              <h3 className="font-semibold text-sm text-ink">Retraits dès 20 $</h3>
              <p className="text-xs text-ink-quiet leading-relaxed">
                Versement rapide par Mobile Money (Orange, MTN, Wave) ou Virement bancaire direct.
              </p>
            </div>
          </div>

          {/* BLOC ACCEPTATION FORMELLE DES CONDITIONS D'AFFILIATION */}
          <div className="pt-6 border-t border-line space-y-5">
            <div className="bg-paper/70 border-2 border-line rounded-card p-5 space-y-4">
              <div className="flex items-center gap-2 text-ink font-semibold text-sm">
                <ShieldCheck className="w-5 h-5 text-mark" />
                <span>Cadre Juridique & Conditions d&apos;Éligibilité de l&apos;Affilié</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-ink-quiet">
                <div className="p-3 bg-surface rounded-input border border-line/50 space-y-1">
                  <span className="font-semibold text-ink block">Liberté & Marque</span>
                  <p className="text-[11px] leading-relaxed">
                    Liberté de création totale pour promouvoir GhostAI, sous réserve de ne pas altérer son image ou induire en erreur.
                  </p>
                </div>
                <div className="p-3 bg-surface rounded-input border border-line/50 space-y-1">
                  <span className="font-semibold text-ink block">Décharge de Responsabilité</span>
                  <p className="text-[11px] leading-relaxed">
                    GhostAI décline formellement toute responsabilité quant aux contenus, affirmations ou vidéos produits par le partenaire.
                  </p>
                </div>
                <div className="p-3 bg-surface rounded-input border border-line/50 space-y-1">
                  <span className="font-semibold text-ink block">Anti-Fraude</span>
                  <p className="text-[11px] leading-relaxed">
                    L&apos;auto-parrainage est strictement interdit sous peine d&apos;exclusion immédiate et d&apos;annulation des commissions.
                  </p>
                </div>
              </div>

              <label className="flex items-start gap-3 p-3 bg-surface border border-mark/30 rounded-input cursor-pointer hover:border-mark transition-colors">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => {
                    setAgreed(e.target.checked);
                    if (activationError) setActivationError(null);
                  }}
                  className="mt-1 w-4 h-4 text-mark rounded border-line focus:ring-mark cursor-pointer"
                />
                <span className="text-xs text-ink leading-relaxed">
                  <strong>J&apos;ai lu et j&apos;accepte sans réserve</strong> les{" "}
                  <Link
                    href="/legal/programme-partenaire"
                    target="_blank"
                    className="text-mark font-semibold underline hover:text-mark/80 inline-flex items-center gap-0.5"
                  >
                    Conditions du Programme Partenaire
                    <ExternalLink className="w-3 h-3" />
                  </Link>{" "}
                  ainsi que les{" "}
                  <Link
                    href="/legal/retraits-affiliation"
                    target="_blank"
                    className="text-mark font-semibold underline hover:text-mark/80 inline-flex items-center gap-0.5"
                  >
                    Règles Spécifiques de Retraits
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                  . Je confirme que GhostAI n&apos;assume aucun engagement envers mes publications ou vidéos et je m&apos;engage à respecter scrupuleusement les règles du programme.
                </span>
              </label>

              {activationError && (
                <div className="p-3 rounded-input text-xs font-medium bg-danger/10 text-danger border border-danger/30 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{activationError}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button
                onClick={handleActivate}
                disabled={!agreed || activating}
                className={clsx(
                  "w-full sm:w-auto px-6 py-3 rounded-input text-sm font-semibold transition-all shadow-sm flex items-center justify-center gap-2",
                  agreed && !activating
                    ? "bg-mark text-white hover:bg-mark/90 cursor-pointer shadow-mark/20"
                    : "bg-line text-ink-quiet cursor-not-allowed opacity-70"
                )}
              >
                {activating ? (
                  "Activation de votre compte..."
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    J&apos;accepte les conditions et j&apos;active mon espace Partenaire
                  </>
                )}
              </button>
              {!agreed && (
                <span className="text-xs text-ink-quiet italic text-center sm:text-left">
                  ← Cochez la case ci-dessus pour débloquer l&apos;accès au tableau de bord affilié
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ÉTAT 2 : PARTENAIRE ACTIF -> DASHBOARD COMPLET
  const { partner, metrics, commissions, payouts } = partnerData;
  const origin = typeof window !== "undefined" ? window.location.origin : "https://ghostai.app";
  const referralUrl = `${origin}/?ref=${partner.code}`;

  const clickChange =
    metrics.clicksPrev7Days > 0
      ? Math.round(((metrics.clicksLast7Days - metrics.clicksPrev7Days) / metrics.clicksPrev7Days) * 100)
      : metrics.clicksLast7Days > 0
      ? 100
      : 0;

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8">
      {/* Header & Statut */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-ink font-serif">
              Programme Partenaire GhostAI
            </h1>
            {partner.isActive ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-confirm bg-confirm/10 border border-confirm/20 px-2.5 py-0.5 rounded-full">
                <ShieldCheck className="w-3 h-3" />
                Actif (30% à vie)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-danger bg-danger/10 border border-danger/20 px-2.5 py-0.5 rounded-full">
                <AlertCircle className="w-3 h-3" />
                Suspendu
              </span>
            )}
          </div>
          <p className="text-sm text-ink-quiet mt-1">
            Partagez votre lien exclusif et suivez vos commissions et retraits en temps réel.
          </p>
        </div>

        <button
          onClick={() => setShowPayoutModal(true)}
          disabled={metrics.availableBalance < 20 || !partner.isActive}
          className={clsx(
            "px-4 py-2.5 rounded-input text-sm font-semibold flex items-center justify-center gap-2 transition-colors",
            metrics.availableBalance >= 20 && partner.isActive
              ? "bg-mark text-white hover:bg-mark/90 cursor-pointer shadow-sm"
              : "bg-paper text-ink-quiet border border-line cursor-not-allowed opacity-60"
          )}
        >
          <Wallet className="w-4 h-4" />
          Demander un retrait
        </button>
      </div>

      {/* Alerte dette éventuelle */}
      {metrics.pendingDebt > 0 && (
        <div className="bg-warn/10 border border-warn/30 p-4 rounded-input flex items-start gap-3 text-ink">
          <AlertCircle className="w-5 h-5 text-warn shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-semibold text-warn">Remboursement / Litige en cours ({metrics.pendingDebt.toFixed(2)} $)</p>
            <p className="text-ink-quiet">
              Un filleul a été remboursé après le versement de sa commission. Conformément aux règles de sécurité, le montant restant est automatiquement apuré en priorité sur vos prochaines commissions débloquées sans mettre votre solde en négatif.
            </p>
          </div>
        </div>
      )}

      {/* Boîte de partage du lien */}
      <div className="bg-surface border border-line rounded-card p-5 space-y-3 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="text-xs font-semibold text-ink-quiet uppercase tracking-wider">
            Votre lien de parrainage exclusif
          </span>
          {!partner.codeModified && (
            <button
              onClick={() => {
                setCustomSlug(partner.code);
                setShowSlugModal(true);
              }}
              className="text-xs text-mark hover:underline flex items-center gap-1 font-medium cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Personnaliser mon code (1 seule fois)
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1 bg-paper border border-line rounded-input px-3.5 py-2 text-sm text-ink font-mono truncate select-all">
            {referralUrl}
          </div>
          <button
            onClick={handleCopyLink}
            className="px-4 py-2 bg-ink text-white rounded-input text-xs font-semibold flex items-center gap-1.5 hover:bg-ink/90 transition-colors shrink-0 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-confirm" />
                Copié !
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copier
              </>
            )}
          </button>
        </div>
      </div>

      {/* 3 Cartes Financières Clés */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Gagné */}
        <div className="bg-surface border border-line rounded-card p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-xs text-ink-quiet">
            <span>Total Gagné (Cumul)</span>
            <TrendingUp className="w-4 h-4 text-confirm" />
          </div>
          <div className="text-2xl font-bold text-ink font-mono">
            {metrics.totalEarned.toFixed(2)} $
          </div>
          <p className="text-[11px] text-ink-quiet">
            Cumul historique de toutes vos commissions acquises.
          </p>
        </div>

        {/* Gel 30 jours */}
        <div className="bg-surface border border-line rounded-card p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-xs text-ink-quiet">
            <span>Gel 30 jours (En attente)</span>
            <Clock className="w-4 h-4 text-warn" />
          </div>
          <div className="text-2xl font-bold text-warn font-mono">
            {metrics.pendingFreeze.toFixed(2)} $
          </div>
          <p className="text-[11px] text-ink-quiet">
            {metrics.nextReleaseDate
              ? `Prochain déblocage estimé : ${new Date(metrics.nextReleaseDate).toLocaleDateString("fr-FR")}`
              : "Aucune commission en attente de dégel."}
          </p>
        </div>

        {/* Solde Retirable */}
        <div className="bg-surface border border-line rounded-card p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-xs text-ink-quiet">
            <span>Solde Disponible</span>
            <Wallet className="w-4 h-4 text-mark" />
          </div>
          <div className="text-2xl font-bold text-mark font-mono">
            {metrics.availableBalance.toFixed(2)} $
          </div>
          <p className="text-[11px] text-ink-quiet">
            {metrics.availableBalance >= 20 ? (
              <span className="text-confirm font-medium">Prêt pour un retrait (seuil 20 $ atteint)</span>
            ) : (
              `Encore ${(20 - metrics.availableBalance).toFixed(2)} $ avant le seuil de retrait (20 $).`
            )}
          </p>
        </div>
      </div>

      {/* Métriques de Trafic & Performance */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-paper border border-line/60 rounded-input p-4 space-y-1">
          <div className="text-xs text-ink-quiet">Clics sur 7 jours</div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-ink font-mono">{metrics.clicksLast7Days}</span>
            {clickChange !== 0 && (
              <span
                className={clsx(
                  "text-xs font-semibold flex items-center",
                  clickChange > 0 ? "text-confirm" : "text-danger"
                )}
              >
                {clickChange > 0 ? (
                  <ArrowUpRight className="w-3.5 h-3.5" />
                ) : (
                  <ArrowDownRight className="w-3.5 h-3.5" />
                )}
                {Math.abs(clickChange)}%
              </span>
            )}
          </div>
        </div>

        <div className="bg-paper border border-line/60 rounded-input p-4 space-y-1">
          <div className="text-xs text-ink-quiet">Inscriptions créées</div>
          <div className="text-xl font-bold text-ink font-mono">{metrics.totalSignups}</div>
        </div>

        <div className="bg-paper border border-line/60 rounded-input p-4 space-y-1">
          <div className="text-xs text-ink-quiet">Taux de conversion payant</div>
          <div className="text-xl font-bold text-confirm font-mono">{metrics.conversionRate}%</div>
        </div>
      </div>

      {/* Historique des commissions */}
      <div className="bg-surface border border-line rounded-card overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-line flex items-center justify-between">
          <h2 className="font-semibold text-sm text-ink">Historique des commissions</h2>
          <span className="text-xs text-ink-quiet">{commissions?.length || 0} transaction(s)</span>
        </div>

        {commissions && commissions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-ink">
              <thead className="bg-paper border-b border-line text-ink-quiet font-medium">
                <tr>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Réf. Vente</th>
                  <th className="px-6 py-3">Montant Vente</th>
                  <th className="px-6 py-3">Commission (30%)</th>
                  <th className="px-6 py-3">Statut</th>
                  <th className="px-6 py-3">Date Déblocage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {commissions.map((c: any) => (
                  <tr key={c.id} className="hover:bg-paper/40 transition-colors">
                    <td className="px-6 py-3.5 font-mono text-ink-quiet">
                      {new Date(c.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-6 py-3.5 font-mono text-ink-quiet max-w-[120px] truncate">
                      {c.txRef}
                    </td>
                    <td className="px-6 py-3.5 font-mono">
                      {Number(c.orderAmount).toFixed(2)} {c.currency}
                    </td>
                    <td className="px-6 py-3.5 font-mono font-bold text-mark">
                      +{Number(c.commissionAmount).toFixed(2)} {c.currency}
                    </td>
                    <td className="px-6 py-3.5">
                      <span
                        className={clsx(
                          "px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider",
                          c.status === "available" && "bg-confirm/15 text-confirm",
                          c.status === "pending" && "bg-warn/15 text-warn",
                          c.status === "paid" && "bg-ink/10 text-ink",
                          c.status === "canceled" && "bg-danger/15 text-danger"
                        )}
                      >
                        {c.status === "available"
                          ? "Disponible"
                          : c.status === "pending"
                          ? "Gel 30j"
                          : c.status === "paid"
                          ? "Versé"
                          : "Annulé"}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-ink-quiet font-mono">
                      {new Date(c.releaseAt).toLocaleDateString("fr-FR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-ink-quiet">
            Aucune commission pour le moment. Partagez votre lien de parrainage pour générer vos premières ventes !
          </div>
        )}
      </div>

      {/* Historique des retraits */}
      <div className="bg-surface border border-line rounded-card overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-line flex items-center justify-between">
          <h2 className="font-semibold text-sm text-ink">Historique des virements de retrait</h2>
          <span className="text-xs text-ink-quiet">{payouts?.length || 0} demande(s)</span>
        </div>

        {payouts && payouts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-ink">
              <thead className="bg-paper border-b border-line text-ink-quiet font-medium">
                <tr>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Référence</th>
                  <th className="px-6 py-3">Montant</th>
                  <th className="px-6 py-3">Moyen</th>
                  <th className="px-6 py-3">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {payouts.map((p: any) => (
                  <tr key={p.id} className="hover:bg-paper/40 transition-colors">
                    <td className="px-6 py-3.5 font-mono text-ink-quiet">
                      {new Date(p.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-6 py-3.5 font-mono">{p.reference}</td>
                    <td className="px-6 py-3.5 font-mono font-bold text-ink">
                      {Number(p.amount).toFixed(2)} {p.currency}
                    </td>
                    <td className="px-6 py-3.5 capitalize">
                      {p.payoutMethod === "mobile_money" ? "Mobile Money" : "Virement Bancaire"}
                    </td>
                    <td className="px-6 py-3.5">
                      <span
                        className={clsx(
                          "px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider",
                          p.status === "successful" && "bg-confirm/15 text-confirm",
                          p.status === "pending" && "bg-warn/15 text-warn",
                          p.status === "failed" && "bg-danger/15 text-danger"
                        )}
                      >
                        {p.status === "successful"
                          ? "Payé"
                          : p.status === "pending"
                          ? "En cours"
                          : "Échoué"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-ink-quiet">
            Aucun retrait demandé pour le moment.
          </div>
        )}
      </div>

      {/* CADRE JURIDIQUE & CONFORMITÉ PARTENAIRE */}
      <div className="bg-paper/60 border border-line rounded-card p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-ink font-semibold text-xs">
            <ShieldCheck className="w-4 h-4 text-mark" />
            <span>Cadre Juridique & Conformité Partenaire</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-[11px]">
            <Link
              href="/legal/programme-partenaire"
              target="_blank"
              className="text-mark hover:underline inline-flex items-center gap-1 font-medium"
            >
              <FileText className="w-3 h-3" />
              Conditions Partenaire
            </Link>
            <span className="text-line">•</span>
            <Link
              href="/legal/retraits-affiliation"
              target="_blank"
              className="text-mark hover:underline inline-flex items-center gap-1 font-medium"
            >
              <FileText className="w-3 h-3" />
              Règles Retraits
            </Link>
            <span className="text-line">•</span>
            <Link
              href="/legal/decharge-ia"
              target="_blank"
              className="text-mark hover:underline inline-flex items-center gap-1 font-medium"
            >
              <FileText className="w-3 h-3" />
              Décharge IA
            </Link>
            <span className="text-line">•</span>
            <Link
              href="/legal/cgu-cgv"
              target="_blank"
              className="text-ink-quiet hover:text-ink hover:underline inline-flex items-center gap-1"
            >
              CGU / CGV
            </Link>
          </div>
        </div>
        <p className="text-[11px] text-ink-quiet leading-relaxed">
          <strong>Rappel d&apos;engagement :</strong> En tant que partenaire, vous disposez d&apos;une totale liberté créative pour vos vidéos et partages, sous réserve de préserver l&apos;image et l&apos;éthique de GhostAI. GhostAI n&apos;assume aucun engagement ni responsabilité envers les déclarations ou contenus que vous publiez. L&apos;auto-parrainage direct ou indirect entraîne la suspension immédiate du compte et la restitution des gains indus.
        </p>
      </div>

      {/* MODAL PERSONNALISATION DU SLUG */}
      {showSlugModal && (
        <div className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface border border-line rounded-card max-w-md w-full p-6 space-y-4 shadow-lg animate-in fade-in">
            <h3 className="text-lg font-bold text-ink font-serif">Personnaliser votre code</h3>
            <p className="text-xs text-ink-quiet leading-relaxed">
              Attention : vous ne pouvez modifier votre code de parrainage <strong>qu&apos;une seule fois</strong>. Choisissez un identifiant clair et professionnel.
            </p>

            <form onSubmit={handleSlugSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-ink-quiet block mb-1">
                  Nouveau code (minuscules, chiffres, tirets)
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-ink-quiet font-mono">?ref=</span>
                  <input
                    type="text"
                    value={customSlug}
                    onChange={(e) => setCustomSlug(e.target.value)}
                    placeholder="mon-nom"
                    required
                    className="flex-1 border border-line rounded-input px-3 py-2 text-sm text-ink focus:border-mark focus:outline-hidden font-mono"
                  />
                </div>
                {slugError && <p className="text-xs text-danger mt-1.5">{slugError}</p>}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-line">
                <button
                  type="button"
                  onClick={() => setShowSlugModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-ink-quiet hover:text-ink cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={slugSubmitting}
                  className="px-4 py-2 bg-mark text-white text-xs font-semibold rounded-input hover:bg-mark/90 disabled:opacity-50 cursor-pointer"
                >
                  {slugSubmitting ? "Validation..." : "Valider définitivement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DEMANDE DE RETRAIT */}
      {showPayoutModal && (
        <div className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface border border-line rounded-card max-w-lg w-full p-6 space-y-5 shadow-lg animate-in fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-ink font-serif">Demander un retrait</h3>
              <span className="text-xs font-mono text-mark font-semibold">
                Disponible : {metrics.availableBalance.toFixed(2)} $
              </span>
            </div>

            {payoutMessage && (
              <div
                className={clsx(
                  "p-3 rounded-input text-xs font-medium",
                  payoutMessage.type === "success"
                    ? "bg-confirm/10 text-confirm border border-confirm/30"
                    : "bg-danger/10 text-danger border border-danger/30"
                )}
              >
                {payoutMessage.text}
              </div>
            )}

            <form onSubmit={handlePayoutSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-ink-quiet block mb-1">
                  Montant à retirer (Minimum : 20,00 $)
                </label>
                <input
                  type="number"
                  min="20"
                  max={metrics.availableBalance}
                  step="0.01"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(parseFloat(e.target.value) || 0)}
                  className="w-full border border-line rounded-input px-3 py-2 text-sm text-ink font-mono focus:border-mark focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-ink-quiet block mb-2">
                  Méthode de paiement
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPayoutMethod("mobile_money")}
                    className={clsx(
                      "p-3 border rounded-input flex items-center gap-2.5 text-xs font-semibold transition-colors cursor-pointer",
                      payoutMethod === "mobile_money"
                        ? "border-mark bg-mark-light text-mark"
                        : "border-line bg-paper text-ink hover:bg-paper/80"
                    )}
                  >
                    <Smartphone className="w-4 h-4" />
                    Mobile Money
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayoutMethod("bank")}
                    className={clsx(
                      "p-3 border rounded-input flex items-center gap-2.5 text-xs font-semibold transition-colors cursor-pointer",
                      payoutMethod === "bank"
                        ? "border-mark bg-mark-light text-mark"
                        : "border-line bg-paper text-ink hover:bg-paper/80"
                    )}
                  >
                    <CreditCard className="w-4 h-4" />
                    Virement Bancaire
                  </button>
                </div>
              </div>

              {payoutMethod === "mobile_money" ? (
                <div className="space-y-3 bg-paper p-3.5 rounded-input border border-line/60">
                  <div>
                    <label className="text-[11px] font-semibold text-ink-quiet block mb-1">
                      Opérateur Mobile Money
                    </label>
                    <select
                      value={payoutDetails.operator}
                      onChange={(e) => setPayoutDetails({ ...payoutDetails, operator: e.target.value })}
                      className="w-full border border-line rounded-input px-3 py-1.5 text-xs text-ink bg-surface focus:outline-hidden"
                    >
                      <option value="Orange Money">Orange Money</option>
                      <option value="MTN MoMo">MTN MoMo</option>
                      <option value="Wave">Wave</option>
                      <option value="Moov Money">Moov Money</option>
                      <option value="Airtel Money">Airtel Money</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-ink-quiet block mb-1">
                      Numéro de téléphone (avec indicatif pays, ex: +225...)
                    </label>
                    <input
                      type="tel"
                      placeholder="+225 07 00 00 00"
                      value={payoutDetails.phone}
                      onChange={(e) => setPayoutDetails({ ...payoutDetails, phone: e.target.value })}
                      className="w-full border border-line rounded-input px-3 py-1.5 text-xs text-ink bg-surface focus:outline-hidden"
                      required
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3 bg-paper p-3.5 rounded-input border border-line/60">
                  <div>
                    <label className="text-[11px] font-semibold text-ink-quiet block mb-1">
                      Nom du titulaire du compte
                    </label>
                    <input
                      type="text"
                      placeholder="Jean Dupont"
                      value={payoutDetails.accountName}
                      onChange={(e) => setPayoutDetails({ ...payoutDetails, accountName: e.target.value })}
                      className="w-full border border-line rounded-input px-3 py-1.5 text-xs text-ink bg-surface focus:outline-hidden"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-ink-quiet block mb-1">
                      IBAN / Numéro de compte
                    </label>
                    <input
                      type="text"
                      placeholder="FR76 3000..."
                      value={payoutDetails.iban}
                      onChange={(e) => setPayoutDetails({ ...payoutDetails, iban: e.target.value })}
                      className="w-full border border-line rounded-input px-3 py-1.5 text-xs text-ink bg-surface font-mono focus:outline-hidden"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-ink-quiet block mb-1">
                      Code BIC / SWIFT
                    </label>
                    <input
                      type="text"
                      placeholder="BNPAFRPP"
                      value={payoutDetails.bic}
                      onChange={(e) => setPayoutDetails({ ...payoutDetails, bic: e.target.value })}
                      className="w-full border border-line rounded-input px-3 py-1.5 text-xs text-ink bg-surface font-mono focus:outline-hidden"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-line">
                <button
                  type="button"
                  onClick={() => setShowPayoutModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-ink-quiet hover:text-ink cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={payoutSubmitting}
                  className="px-4 py-2 bg-mark text-white text-xs font-semibold rounded-input hover:bg-mark/90 disabled:opacity-50 cursor-pointer"
                >
                  {payoutSubmitting ? "Envoi en cours..." : "Confirmer la demande de retrait"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

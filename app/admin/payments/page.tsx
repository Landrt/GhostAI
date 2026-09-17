"use client";

import React, { useState, useEffect } from "react";
import { CreditCard, DollarSign, PlayCircle, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import clsx from "clsx";

export default function AdminPaymentsPage() {
  const [commissions, setCommissions] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"commissions" | "payouts">("commissions");

  // Simulation form state
  const [showSimModal, setShowSimModal] = useState(false);
  const [simEmail, setSimEmail] = useState("");
  const [simAmount, setSimAmount] = useState(29);
  const [simSubmitting, setSimSubmitting] = useState(false);
  const [simFeedback, setSimFeedback] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/payments");
      if (res.ok) {
        const data = await res.json();
        setCommissions(data.commissions || []);
        setPayouts(data.payouts || []);
      }
    } catch (err) {
      console.error("Erreur payments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSimulatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSimSubmitting(true);
      setSimFeedback(null);
      const res = await fetch("/api/admin/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "simulate_payment",
          payerEmail: simEmail,
          amount: simAmount,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSimFeedback(
          data.commission
            ? `Succès ! Transaction ${data.txRef} enregistrée avec commission 30% (${data.commission.commissionAmount} $).`
            : `Paiement enregistré (${data.txRef}), mais cet utilisateur n'a pas de parrain affilié.`
        );
        fetchData();
      } else {
        setSimFeedback(data.error || "Erreur lors de la simulation.");
      }
    } catch (err: any) {
      setSimFeedback(err.message || "Erreur.");
    } finally {
      setSimSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink font-serif">
            Journal des Paiements & Transactions
          </h1>
          <p className="text-xs text-ink-quiet mt-1">
            Consultez les flux financiers entrants et sortants de la plateforme.
          </p>
        </div>

        <button
          onClick={() => setShowSimModal(true)}
          className="px-4 py-2 bg-ink text-white text-xs font-semibold rounded-input hover:bg-ink/90 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <PlayCircle className="w-4 h-4 text-mark" />
          Simuler un Paiement de Test
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-line gap-4">
        <button
          onClick={() => setActiveTab("commissions")}
          className={clsx(
            "pb-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer",
            activeTab === "commissions"
              ? "border-mark text-mark"
              : "border-transparent text-ink-quiet hover:text-ink"
          )}
        >
          Commissions d&apos;Affiliation ({commissions.length})
        </button>
        <button
          onClick={() => setActiveTab("payouts")}
          className={clsx(
            "pb-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer",
            activeTab === "payouts"
              ? "border-mark text-mark"
              : "border-transparent text-ink-quiet hover:text-ink"
          )}
        >
          Demandes de Retraits ({payouts.length})
        </button>
      </div>

      {/* Table */}
      <div className="bg-surface border border-line rounded-card overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-xs text-ink-quiet animate-pulse">
            Chargement des transactions...
          </div>
        ) : activeTab === "commissions" ? (
          commissions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-ink">
                <thead className="bg-paper border-b border-line text-ink-quiet font-medium">
                  <tr>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3">Réf. Transaction</th>
                    <th className="px-5 py-3">Partenaire</th>
                    <th className="px-5 py-3">Montant Vente</th>
                    <th className="px-5 py-3">Commission (30%)</th>
                    <th className="px-5 py-3">Statut</th>
                    <th className="px-5 py-3">Date Déblocage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/60">
                  {commissions.map((c) => (
                    <tr key={c.id} className="hover:bg-paper/40 transition-colors">
                      <td className="px-5 py-3 font-mono text-ink-quiet">
                        {new Date(c.createdAt).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="px-5 py-3 font-mono text-ink-quiet max-w-[130px] truncate">
                        {c.txRef}
                      </td>
                      <td className="px-5 py-3 font-mono font-semibold text-mark">
                        {c.affiliate?.code}
                      </td>
                      <td className="px-5 py-3 font-mono">
                        {c.orderAmount.toFixed(2)} {c.currency}
                      </td>
                      <td className="px-5 py-3 font-mono font-bold text-confirm">
                        +{c.commissionAmount.toFixed(2)} {c.currency}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={clsx(
                            "px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider",
                            c.status === "available" && "bg-confirm/15 text-confirm",
                            c.status === "pending" && "bg-warn/15 text-warn",
                            c.status === "paid" && "bg-ink/10 text-ink",
                            c.status === "canceled" && "bg-danger/15 text-danger"
                          )}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 font-mono text-ink-quiet">
                        {new Date(c.releaseAt).toLocaleDateString("fr-FR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-ink-quiet">
              Aucune commission enregistrée.
            </div>
          )
        ) : payouts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-ink">
              <thead className="bg-paper border-b border-line text-ink-quiet font-medium">
                <tr>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Référence</th>
                  <th className="px-5 py-3">Partenaire</th>
                  <th className="px-5 py-3">Montant</th>
                  <th className="px-5 py-3">Méthode</th>
                  <th className="px-5 py-3">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {payouts.map((p) => (
                  <tr key={p.id} className="hover:bg-paper/40 transition-colors">
                    <td className="px-5 py-3 font-mono text-ink-quiet">
                      {new Date(p.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-5 py-3 font-mono">{p.reference}</td>
                    <td className="px-5 py-3 font-mono font-semibold text-mark">
                      {p.affiliate?.code}
                    </td>
                    <td className="px-5 py-3 font-mono font-bold text-ink">
                      {p.amount.toFixed(2)} {p.currency}
                    </td>
                    <td className="px-5 py-3 capitalize">
                      {p.payoutMethod === "mobile_money" ? "Mobile Money" : "Virement Bancaire"}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={clsx(
                          "px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider",
                          p.status === "successful" && "bg-confirm/15 text-confirm",
                          p.status === "pending" && "bg-warn/15 text-warn",
                          p.status === "failed" && "bg-danger/15 text-danger"
                        )}
                      >
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-ink-quiet">
            Aucun virement de retrait enregistré.
          </div>
        )}
      </div>

      {/* Modal de Simulation */}
      {showSimModal && (
        <div className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface border border-line rounded-card max-w-md w-full p-6 space-y-4 shadow-lg animate-in fade-in">
            <h3 className="text-lg font-bold text-ink font-serif">Simuler un Paiement Client</h3>
            <p className="text-xs text-ink-quiet">
              Simule un événement d&apos;achat sur un compte utilisateur pour tester le déclenchement de la commission 30% du parrain et la période de gel de 30 jours.
            </p>

            {simFeedback && (
              <div className="p-3 bg-paper border border-line rounded-input text-xs font-mono text-ink">
                {simFeedback}
              </div>
            )}

            <form onSubmit={handleSimulatePayment} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-ink-quiet block mb-1">
                  Email du client payeur
                </label>
                <input
                  type="email"
                  placeholder="client@exemple.com"
                  value={simEmail}
                  onChange={(e) => setSimEmail(e.target.value)}
                  className="w-full border border-line rounded-input px-3 py-2 text-xs text-ink bg-paper font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-ink-quiet block mb-1">
                  Montant de la transaction ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={simAmount}
                  onChange={(e) => setSimAmount(parseFloat(e.target.value) || 0)}
                  className="w-full border border-line rounded-input px-3 py-2 text-xs text-ink bg-paper font-mono"
                  required
                />
                <span className="text-[10px] text-ink-quiet mt-1 block">
                  Commission 30% calculée : {(simAmount * 0.3).toFixed(2)} $
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-line">
                <button
                  type="button"
                  onClick={() => {
                    setShowSimModal(false);
                    setSimFeedback(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-ink-quiet hover:text-ink cursor-pointer"
                >
                  Fermer
                </button>
                <button
                  type="submit"
                  disabled={simSubmitting}
                  className="px-4 py-2 bg-mark text-white text-xs font-semibold rounded-input hover:bg-mark/90 disabled:opacity-50 cursor-pointer"
                >
                  {simSubmitting ? "Simulation..." : "Déclencher le paiement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

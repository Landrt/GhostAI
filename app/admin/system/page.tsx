"use client";

import React, { useState, useEffect } from "react";
import {
  Server,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Shield,
  RefreshCw,
  Key,
  Lock,
  Copy,
  Check,
  Eye,
  EyeOff,
  LogOut,
  ShieldAlert,
} from "lucide-react";
import clsx from "clsx";

export default function AdminSystemPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Sécurité Dashboard
  const [securityData, setSecurityData] = useState<any>(null);
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Formulaire Clé
  const [newSecretKey, setNewSecretKey] = useState("");
  const [keySubmitting, setKeySubmitting] = useState(false);
  const [keyFeedback, setKeyFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Formulaire Mot de Passe Maître
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdSubmitting, setPwdSubmitting] = useState(false);
  const [pwdFeedback, setPwdFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const fetchHealth = async () => {
    try {
      setLoading(true);
      const [resHealth, resSecurity] = await Promise.all([
        fetch("/api/admin/system"),
        fetch("/api/admin/security"),
      ]);

      if (resHealth.ok) {
        const json = await resHealth.json();
        setData(json);
      }

      if (resSecurity.ok) {
        const secJson = await resSecurity.json();
        setSecurityData(secJson);
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

  const handleCopy = (text: string, isUrl: boolean) => {
    navigator.clipboard.writeText(text);
    if (isUrl) {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } else {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  const handleUpdateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setKeySubmitting(true);
    setKeyFeedback(null);

    try {
      const res = await fetch("/api/admin/security", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_secret_key",
          newSecretKey,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Erreur de mise à jour");

      setKeyFeedback({ type: "success", msg: "Clé secrète d'URL mise à jour avec succès !" });
      setNewSecretKey("");
      const secRes = await fetch("/api/admin/security");
      if (secRes.ok) setSecurityData(await secRes.json());
    } catch (err: any) {
      setKeyFeedback({ type: "error", msg: err.message });
    } finally {
      setKeySubmitting(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdSubmitting(true);
    setPwdFeedback(null);

    if (newPassword !== confirmPassword) {
      setPwdFeedback({ type: "error", msg: "Les deux mots de passe ne correspondent pas." });
      setPwdSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/security", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_master_password",
          oldPassword,
          newPassword,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Erreur de mise à jour");

      setPwdFeedback({ type: "success", msg: "Mot de passe maître mis à jour avec succès !" });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPwdFeedback({ type: "error", msg: err.message });
    } finally {
      setPwdSubmitting(false);
    }
  };

  const handleLockDashboard = async () => {
    if (!confirm("Voulez-vous verrouiller le dashboard ? Vous devrez saisir le mot de passe maître pour réentrer.")) {
      return;
    }

    try {
      await fetch("/api/admin/security", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "lock_dashboard" }),
      });
      window.location.href = "/admin-vault";
    } catch {
      window.location.href = "/admin-vault";
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

  const pings = data?.pings || [];
  const envStatus = data?.envStatus || [];
  const secretKey = securityData?.adminSecretKey || "ghost-admin-key-2026";
  const unlockUrl = typeof window !== "undefined" ? `${window.location.origin}/admin?key=${secretKey}` : `/admin?key=${secretKey}`;

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink font-serif">
            Santé du Système & Diagnostic
          </h1>
          <p className="text-xs text-ink-quiet mt-1">
            Vérification de la connectivité réseau, de la sécurité du dashboard et des variables.
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

      {/* SECTION SÉCURITÉ DU DASHBOARD (Double Sas) */}
      <div className="bg-surface border-2 border-mark/30 rounded-card overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-line bg-mark/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-mark" />
            <div>
              <h2 className="font-bold text-sm text-ink font-serif">
                Sécurité & Double Sas d&apos;Accès au Dashboard
              </h2>
              <p className="text-[11px] text-ink-quiet">
                Camouflage 404 (Clé secrète d&apos;URL) + Sas de Mot de Passe Maître
              </p>
            </div>
          </div>

          <button
            onClick={handleLockDashboard}
            className="px-3 py-1.5 bg-danger/10 hover:bg-danger/20 text-danger border border-danger/20 rounded-input text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
            title="Verrouille immédiatement le dashboard"
          >
            <LogOut className="w-3.5 h-3.5" />
            Verrouiller le Dashboard
          </button>
        </div>

        <div className="p-6 space-y-6 divide-y divide-line/60">
          {/* SAS 1 : Clé Secrète d'URL */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-mark" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-ink">
                  Sas 1 : Clé Secrète d&apos;URL (Masquage 404)
                </h3>
              </div>
              <span className="text-[11px] text-confirm font-semibold bg-confirm/10 px-2 py-0.5 rounded">
                Actif (Erreur 404 pour les inconnus)
              </span>
            </div>
            <p className="text-xs text-ink-quiet">
              Toute personne ou robot qui tente d&apos;accéder à <code className="text-ink font-mono bg-paper px-1.5 py-0.5 rounded">/admin</code> sans cette clé reçoit une fausse page 404 Introuvable.
            </p>

            {/* Affichage de la clé actuelle et bouton copier */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-paper rounded-input border border-line flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-ink-quiet block uppercase">Clé secrète actuelle</span>
                  <span className="font-mono font-bold text-xs text-ink">
                    {showSecretKey ? secretKey : "••••••••••••••••••••"}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setShowSecretKey(!showSecretKey)}
                    className="p-1.5 text-ink-quiet hover:text-ink rounded transition-colors cursor-pointer"
                    title={showSecretKey ? "Masquer" : "Afficher"}
                  >
                    {showSecretKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => handleCopy(secretKey, false)}
                    className="p-1.5 text-ink-quiet hover:text-mark rounded transition-colors cursor-pointer"
                    title="Copier la clé"
                  >
                    {copiedKey ? <Check className="w-3.5 h-3.5 text-confirm" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="p-3 bg-paper rounded-input border border-line flex items-center justify-between">
                <div className="truncate mr-2">
                  <span className="text-[10px] text-ink-quiet block uppercase">Lien d&apos;accès direct</span>
                  <span className="font-mono text-xs text-mark truncate block">
                    {unlockUrl}
                  </span>
                </div>
                <button
                  onClick={() => handleCopy(unlockUrl, true)}
                  className="px-2.5 py-1.5 bg-mark text-white rounded text-xs font-semibold hover:bg-mark-hover flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                >
                  {copiedUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedUrl ? "Copié !" : "Copier le lien"}
                </button>
              </div>
            </div>

            {/* Formulaire de changement de la clé */}
            <form onSubmit={handleUpdateKey} className="flex flex-col sm:flex-row gap-2 pt-2">
              <input
                type="text"
                value={newSecretKey}
                onChange={(e) => setNewSecretKey(e.target.value)}
                placeholder="Nouvelle clé secrète (ex: ma-cle-ultra-privee-99)"
                className="flex-1 px-3.5 py-2 bg-paper text-ink text-xs rounded-input border border-line focus:outline-none focus:border-mark font-mono"
                required
                minLength={8}
              />
              <button
                type="submit"
                disabled={keySubmitting || !newSecretKey}
                className="px-4 py-2 bg-ink text-surface hover:bg-ink/90 disabled:opacity-50 text-xs font-semibold rounded-input transition-colors cursor-pointer"
              >
                {keySubmitting ? "Enregistrement..." : "Modifier la clé"}
              </button>
            </form>
            {keyFeedback && (
              <p className={clsx("text-xs font-semibold", keyFeedback.type === "success" ? "text-confirm" : "text-danger")}>
                {keyFeedback.msg}
              </p>
            )}
          </div>

          {/* SAS 2 : Mot de Passe Maître Administrateur */}
          <div className="space-y-4 pt-6">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-mark" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-ink">
                Sas 2 : Mot de Passe Maître Administrateur (Vault)
              </h3>
            </div>
            <p className="text-xs text-ink-quiet">
              Ce mot de passe est demandé après déverrouillage de la clé pour accéder au dashboard. Vous pouvez le modifier ici.
            </p>

            <form onSubmit={handleUpdatePassword} className="space-y-3 max-w-lg">
              <div>
                <label className="text-[11px] font-semibold text-ink block mb-1">Mot de passe maître actuel</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full px-3.5 py-2 bg-paper text-ink text-xs rounded-input border border-line focus:outline-none focus:border-mark font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-ink block mb-1">Nouveau mot de passe</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Au moins 8 caractères"
                    required
                    minLength={8}
                    className="w-full px-3.5 py-2 bg-paper text-ink text-xs rounded-input border border-line focus:outline-none focus:border-mark font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-ink block mb-1">Confirmer le nouveau</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Répéter le mot de passe"
                    required
                    minLength={8}
                    className="w-full px-3.5 py-2 bg-paper text-ink text-xs rounded-input border border-line focus:outline-none focus:border-mark font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={pwdSubmitting || !oldPassword || !newPassword}
                className="px-4 py-2 bg-mark hover:bg-mark-hover disabled:opacity-50 text-white text-xs font-semibold rounded-input transition-colors cursor-pointer shadow-sm"
              >
                {pwdSubmitting ? "Mise à jour en cours..." : "Mettre à jour le mot de passe maître"}
              </button>
            </form>
            {pwdFeedback && (
              <p className={clsx("text-xs font-semibold", pwdFeedback.type === "success" ? "text-confirm" : "text-danger")}>
                {pwdFeedback.msg}
              </p>
            )}
          </div>
        </div>
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

"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, ShieldCheck, Eye, EyeOff, AlertTriangle } from "lucide-react";

function LoginVaultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/security", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ masterPassword: password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Mot de passe incorrect.");
      }

      // Succès : redirection vers le dashboard admin
      router.push(callbackUrl);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Erreur de connexion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[420px] bg-surface border border-line rounded-card p-6 sm:p-8 space-y-6 shadow-sm">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-mark/10 text-mark border border-mark/20 flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-ink tracking-tight font-serif">
          Sas Administrateur — GhostAI
        </h1>
        <p className="text-xs text-ink-quiet">
          Porte d&apos;accès déverrouillée. Veuillez saisir votre mot de passe maître pour accéder au tableau de bord.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-ink flex items-center justify-between">
            <span>Mot de passe maître</span>
            <span className="text-[10px] text-ink-quiet font-normal">Accès console sécurisé</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              autoFocus
              className="w-full px-3.5 py-2.5 bg-paper text-ink text-sm rounded-input border border-line focus:outline-none focus:border-mark focus:ring-1 focus:ring-mark font-mono pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-quiet hover:text-ink cursor-pointer"
              title={showPassword ? "Masquer" : "Afficher"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-danger/10 border border-danger/25 rounded-input text-xs text-danger flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !password}
          className="w-full py-2.5 px-4 bg-mark hover:bg-mark-hover disabled:opacity-50 text-white rounded-input text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
        >
          {loading ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Vérification...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              <span>Déverrouiller le Dashboard</span>
            </>
          )}
        </button>
      </form>

      <div className="pt-2 text-center text-[11px] text-ink-quiet border-t border-line/60">
        Session sécurisée • Chiffrement SHA-256 / Bcrypt
      </div>
    </div>
  );
}

export default function AdminLoginVaultPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-paper py-12">
      <Suspense
        fallback={
          <div className="p-8 text-center text-xs text-ink-quiet">
            Chargement du sas de sécurité...
          </div>
        }
      >
        <LoginVaultContent />
      </Suspense>
    </div>
  );
}

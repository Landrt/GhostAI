"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Email ou mot de passe incorrect.");
      } else {
        router.push("/app");
        router.refresh();
      }
    } catch {
      setError("Une erreur est survenue lors de la connexion.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/app" });
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-paper py-12">
      <div className="w-full max-w-[400px] bg-surface border border-line rounded-card p-6 sm:p-8 space-y-6">
        {/* En-tête */}
        <div className="text-center space-y-1">
          <Link href="/" className="inline-block">
            <span className="font-bold text-2xl text-ink tracking-tight">GhostAI</span>
          </Link>
          <p className="text-xs text-ink-quiet">Your Voice. Your Ideas.</p>
          <h1 className="text-lg font-semibold text-ink pt-3">Connexion</h1>
        </div>

        {/* Bouton Google */}
        <Button
          type="button"
          variant="outline"
          className="w-full gap-2.5"
          onClick={handleGoogleSignIn}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continuer avec Google</span>
        </Button>

        {/* Séparateur */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-line w-full" />
          <span className="bg-surface px-3 text-xs text-ink-quiet uppercase tracking-wider relative">ou</span>
        </div>

        {/* Formulaire Credentials */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nom@entreprise.com"
            required
          />

          <Input
            label="Mot de passe"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          {error && (
            <div className="p-2.5 rounded bg-danger/10 border border-danger/20 text-xs text-danger text-center">
              {error}
            </div>
          )}

          <Button type="submit" variant="primary" className="w-full" loading={loading}>
            Se connecter
          </Button>

          {/* Acceptation et information légale */}
          <p className="text-[11px] text-ink-quiet text-center leading-relaxed pt-1">
            En vous connectant, vous acceptez nos{" "}
            <Link href="/legal/cgu-cgv" className="text-mark underline hover:text-ink transition-colors">
              Conditions d&apos;Utilisation
            </Link>{" "}
            et confirmez avoir pris connaissance de notre{" "}
            <Link href="/legal/confidentialite" className="text-mark underline hover:text-ink transition-colors">
              Politique de Confidentialité
            </Link>
            .
          </p>
        </form>

        {/* Liens bas de page */}
        <div className="text-center pt-2 space-y-2 text-xs text-ink-quiet">
          <p>
            Pas encore de compte ?{" "}
            <Link href="/register" className="text-ink font-semibold hover:text-mark transition-colors">
              Créer un compte
            </Link>
          </p>
        </div>
      </div>

      <footer className="mt-8 text-center text-xs text-ink-quiet flex flex-wrap items-center justify-center gap-3">
        <Link href="/" className="hover:text-ink transition-colors">
          Accueil
        </Link>
        <span>•</span>
        <Link href="/legal/cgu-cgv" className="hover:text-ink transition-colors">
          CGU / CGV
        </Link>
        <span>•</span>
        <Link href="/legal/confidentialite" className="hover:text-ink transition-colors">
          Confidentialité
        </Link>
        <span>•</span>
        <Link href="/legal/mentions-legales" className="hover:text-ink transition-colors">
          Mentions Légales
        </Link>
      </footer>
    </div>
  );
}

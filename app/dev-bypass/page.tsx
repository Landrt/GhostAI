"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Zap, ShieldCheck, ArrowRight } from "lucide-react";

function DevBypassContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const callbackUrl = searchParams.get("callbackUrl") || "/app";
  const [status, setStatus] = useState<"connecting" | "success" | "error">("connecting");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function triggerBypass() {
      try {
        const res = await signIn("credentials", {
          isDevBypass: "true",
          redirect: false,
          callbackUrl,
        });

        if (!isMounted) return;

        if (res?.error) {
          setStatus("error");
          setErrorMsg(res.error || "Échec de l'auto-connexion dev");
        } else {
          setStatus("success");
          router.push(callbackUrl);
          router.refresh();
        }
      } catch (err: any) {
        if (!isMounted) return;
        setStatus("error");
        setErrorMsg(err.message || "Erreur inattendue");
      }
    }

    triggerBypass();

    return () => {
      isMounted = false;
    };
  }, [callbackUrl, router]);

  return (
    <div className="w-full max-w-[420px] bg-surface border border-line rounded-card p-6 sm:p-8 space-y-6 text-center shadow-sm">
      <div className="w-12 h-12 rounded-2xl bg-mark/15 text-mark flex items-center justify-center mx-auto">
        <Zap className="w-6 h-6 fill-mark" />
      </div>

      <div className="space-y-1.5">
        <h1 className="text-lg font-bold text-ink font-serif">
          Mode Développeur — Accès Direct
        </h1>
        <p className="text-xs text-ink-quiet">
          Initialisation du compte SuperAdmin & déblocage de toutes les fonctionnalités...
        </p>
      </div>

      {status === "connecting" && (
        <div className="p-4 bg-paper rounded-input border border-line flex items-center justify-center gap-2 text-xs text-ink">
          <div className="w-4 h-4 border-2 border-mark border-t-transparent rounded-full animate-spin" />
          <span>Génération de la session locale...</span>
        </div>
      )}

      {status === "success" && (
        <div className="p-4 bg-confirm/10 border border-confirm/30 rounded-input flex items-center justify-center gap-2 text-xs text-confirm font-semibold">
          <ShieldCheck className="w-4 h-4" />
          <span>Connecté ! Redirection vers {callbackUrl}...</span>
        </div>
      )}

      {status === "error" && (
        <div className="space-y-3">
          <div className="p-3 bg-danger/10 border border-danger/30 rounded-input text-xs text-danger">
            {errorMsg}
          </div>
          <button
            onClick={() => router.push("/login")}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-mark hover:underline"
          >
            Aller à la page de connexion <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function DevBypassPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-paper py-12">
      <Suspense
        fallback={
          <div className="w-full max-w-[420px] bg-surface border border-line rounded-card p-8 text-center text-xs text-ink-quiet">
            Chargement de l&apos;environnement de développement...
          </div>
        }
      >
        <DevBypassContent />
      </Suspense>
    </div>
  );
}

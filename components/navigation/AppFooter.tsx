import React from "react";
import Link from "next/link";

export function AppFooter() {
  return (
    <footer className="border-t border-line bg-surface/50 mt-auto py-5 px-4 sm:px-8 text-xs text-ink-quiet">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-ink">GhostAI</span>
          <span>•</span>
          <span>Your Voice. Your Ideas.</span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">© {new Date().getFullYear()}</span>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <Link href="/privacy" className="hover:text-ink transition-colors">
            Confidentialité
          </Link>
          <Link href="/pricing" className="hover:text-ink transition-colors">
            Tarifs
          </Link>
          <Link href="/app/settings" className="hover:text-ink transition-colors">
            Paramètres
          </Link>
        </div>
      </div>
    </footer>
  );
}

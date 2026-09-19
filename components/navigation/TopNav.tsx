"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import {
  LayoutDashboard,
  PenSquare,
  FileText,
  Mic2,
  SlidersHorizontal,
  BarChart2,
  Settings,
  CreditCard,
  LogOut,
  Sparkles,
  Menu,
  X,
  User,
  RotateCcw,
} from "lucide-react";
import { signOut } from "next-auth/react";

interface TopNavProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  postsUsedThisMonth?: number;
  planLimit?: number;
}

const NAV_ITEMS = [
  { href: "/app", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/app/create", label: "Créer un post", icon: PenSquare, highlight: true },
  { href: "/app/repurpose", label: "Atomiseur", icon: Sparkles },
  { href: "/app/posts", label: "Mes posts", icon: FileText },
  { href: "/app/voice", label: "Ta voix", icon: Mic2 },
  { href: "/app/personality", label: "Communication", icon: SlidersHorizontal },
  { href: "/app/analytics", label: "Analytics", icon: BarChart2 },
];

export function TopNav({
  user,
  postsUsedThisMonth = 0,
  planLimit = 5,
}: TopNavProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleResetFlow = async () => {
    if (
      !confirm(
        "Voulez-vous réinitialiser votre profil développeur pour re-tester le flow complet d'Onboarding de zéro ?"
      )
    ) {
      return;
    }
    setResetting(true);
    try {
      const res = await fetch("/api/dev/reset-flow", { method: "POST" });
      if (res.ok) {
        window.location.href = "/onboarding";
      }
    } finally {
      setResetting(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur border-b border-line select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo Marque */}
          <div className="flex items-center gap-6 shrink-0">
            <Link href="/app" className="flex flex-col group">
              <span className="font-bold text-lg tracking-tight text-ink group-hover:text-mark transition-colors">
                GhostAI
              </span>
              <span className="text-[10px] text-ink-quiet font-normal -mt-1 hidden sm:inline">
                Your Voice. Your Ideas.
              </span>
            </Link>

            {/* Navigation Desktop Principale */}
            <nav className="hidden xl:flex items-center gap-1">
              {NAV_ITEMS.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/app" && pathname.startsWith(item.href));
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={clsx(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-input text-xs font-medium transition-colors whitespace-nowrap",
                      isActive
                        ? "bg-mark-light text-mark font-semibold"
                        : item.highlight
                        ? "text-mark bg-mark/10 hover:bg-mark/15 font-semibold"
                        : "text-ink hover:text-mark hover:bg-paper"
                    )}
                  >
                    <Icon
                      className={clsx(
                        "w-3.5 h-3.5 shrink-0",
                        isActive
                          ? "text-mark"
                          : item.highlight
                          ? "text-mark"
                          : "text-ink-quiet"
                      )}
                    />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Navigation intermédiare (lg) avec moins d'espaces */}
          <nav className="hidden lg:flex xl:hidden items-center gap-1">
            {NAV_ITEMS.slice(0, 5).map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/app" && pathname.startsWith(item.href));
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "flex items-center gap-1.5 px-2.5 py-1.5 rounded-input text-xs font-medium transition-colors whitespace-nowrap",
                    isActive
                      ? "bg-mark-light text-mark font-semibold"
                      : item.highlight
                      ? "text-mark bg-mark/10 font-semibold"
                      : "text-ink hover:text-mark hover:bg-paper"
                  )}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Section Droite : Quota, Facturation, Profil & Déconnexion */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Quota badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-paper border border-line rounded text-xs text-ink">
              <Sparkles className="w-3.5 h-3.5 text-mark" />
              <span className="font-mono text-[11px]">
                {postsUsedThisMonth} / {planLimit > 1000 ? "Illimité" : planLimit}
              </span>
              <span className="text-[10px] text-ink-quiet hidden md:inline">posts</span>
            </div>

            {/* Facturation */}
            <Link
              href="/app/billing"
              title="Abonnement & Facturation"
              className={clsx(
                "p-2 rounded-input transition-colors",
                pathname === "/app/billing"
                  ? "bg-mark-light text-mark"
                  : "text-ink-quiet hover:text-ink hover:bg-paper"
              )}
            >
              <CreditCard className="w-4 h-4" />
            </Link>

            {/* Paramètres */}
            <Link
              href="/app/settings"
              title="Paramètres du compte"
              className={clsx(
                "p-2 rounded-input transition-colors",
                pathname === "/app/settings"
                  ? "bg-mark-light text-mark"
                  : "text-ink-quiet hover:text-ink hover:bg-paper"
              )}
            >
              <Settings className="w-4 h-4" />
            </Link>

            {/* Profil Utilisateur */}
            <Link
              href="/app/settings"
              className="flex items-center gap-2 pl-1 group"
            >
              <div className="w-7 h-7 rounded-full bg-paper border border-line flex items-center justify-center text-ink overflow-hidden group-hover:border-mark transition-colors">
                {user?.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.image}
                    alt={user.name || "Avatar"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-3.5 h-3.5 text-ink-quiet" />
                )}
              </div>
              <span className="hidden md:inline font-medium text-xs text-ink max-w-[100px] truncate group-hover:text-mark transition-colors">
                {user?.name || user?.email || "Mon compte"}
              </span>
            </Link>

            {/* Bouton Dev : Re-tester le flow de zéro */}
            <button
              onClick={handleResetFlow}
              disabled={resetting}
              title="Mode Dev : Réinitialiser mon profil pour re-tester l'onboarding et les quotas de zéro"
              className="p-1.5 text-[11px] font-semibold text-mark hover:bg-mark-light/50 border border-mark/25 rounded-input transition-colors cursor-pointer hidden md:inline-flex items-center gap-1"
            >
              <RotateCcw className={clsx("w-3 h-3", resetting && "animate-spin")} />
              <span>Reset Flow</span>
            </button>

            {/* Bouton Déconnexion rapide */}
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              title="Se déconnecter"
              className="p-2 text-ink-quiet hover:text-danger rounded-input transition-colors cursor-pointer hidden sm:inline-flex"
            >
              <LogOut className="w-4 h-4" />
            </button>

            {/* Hamburger Mobile Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 text-ink hover:text-mark rounded-input transition-colors lg:hidden cursor-pointer"
              aria-label="Menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menu Déroulant Mobile / Tablette */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-line bg-surface px-4 py-4 space-y-3 shadow-lg">
          {/* Quota mobile */}
          <div className="flex items-center justify-between p-2.5 bg-paper rounded-input border border-line text-xs">
            <span className="text-ink-quiet">Quota du mois :</span>
            <div className="flex items-center gap-1.5 font-medium text-ink">
              <Sparkles className="w-3.5 h-3.5 text-mark" />
              <span>
                {postsUsedThisMonth} / {planLimit > 1000 ? "Illimité" : planLimit} posts
              </span>
            </div>
          </div>

          {/* Liens de navigation */}
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/app" && pathname.startsWith(item.href));
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={clsx(
                    "flex items-center gap-3 px-3 py-2.5 rounded-input text-sm font-medium transition-colors",
                    isActive
                      ? "bg-mark-light text-mark font-semibold"
                      : item.highlight
                      ? "text-mark font-semibold"
                      : "text-ink hover:bg-paper"
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="pt-2 border-t border-line space-y-1">
            <Link
              href="/app/billing"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-input text-xs font-medium text-ink hover:bg-paper"
            >
              <CreditCard className="w-4 h-4 text-ink-quiet" />
              <span>Facturation & Abonnements</span>
            </Link>
            <Link
              href="/app/settings"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-input text-xs font-medium text-ink hover:bg-paper"
            >
              <Settings className="w-4 h-4 text-ink-quiet" />
              <span>Paramètres & Profil</span>
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-input text-xs font-semibold text-danger hover:bg-danger/10 text-left cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Se déconnecter</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

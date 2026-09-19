"use client";

import React, { useState, useRef, useEffect } from "react";
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
  RotateCcw,
  ChevronDown,
  Plus,
  Zap,
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
  plan?: string;
}

const NAV_ITEMS = [
  { href: "/app", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/app/create", label: "Créer un post", icon: PenSquare },
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
  plan = "free",
}: TopNavProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fermeture du dropdown profil au clic extérieur
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fermeture du menu mobile lors d'un changement d'URL
  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

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

  const isUnlimited = planLimit > 1000;
  const progressPercent = isUnlimited
    ? 100
    : Math.min(100, Math.round((postsUsedThisMonth / (planLimit || 1)) * 100));

  const isFreePlan = plan.toLowerCase() === "free";

  return (
    <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-line/70 select-none shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3 lg:gap-6">
          
          {/* =========================================
              1. Brand Block (Mobbin Clean Typographic Lockup)
             ========================================= */}
          <div className="flex items-center gap-6 shrink-0">
            <Link
              href="/app"
              className="flex items-center gap-2.5 group transition-opacity hover:opacity-90"
            >
              {/* Emblème Graphique GhostAI */}
              <div className="w-8 h-8 rounded-lg bg-ink text-surface flex items-center justify-center font-serif font-bold text-sm tracking-tighter shadow-xs group-hover:bg-mark transition-colors">
                G
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base tracking-tight text-ink font-sans">
                  GhostAI
                </span>
                <span className="text-[10px] text-ink-quiet tracking-wide hidden sm:block -mt-1 font-medium">
                  Your Voice. Your Ideas.
                </span>
              </div>
            </Link>

            {/* =========================================
                2. Desktop Navigation Rail (Mobbin Segmented Pill Track)
               ========================================= */}
            <nav className="hidden xl:flex items-center gap-0.5 p-1 bg-paper/60 rounded-xl border border-line/40">
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
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap",
                      isActive
                        ? "bg-surface text-ink font-semibold shadow-xs border border-line/60"
                        : "text-ink-quiet hover:text-ink hover:bg-surface/50"
                    )}
                  >
                    <Icon
                      className={clsx(
                        "w-3.5 h-3.5 shrink-0 transition-colors",
                        isActive ? "text-mark" : "text-ink-quiet"
                      )}
                    />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Version intermédiaire (lg) */}
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
                      "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap",
                      isActive
                        ? "bg-mark-light text-mark font-semibold"
                        : "text-ink-quiet hover:text-ink hover:bg-paper"
                    )}
                  >
                    <Icon
                      className={clsx(
                        "w-3.5 h-3.5 shrink-0",
                        isActive ? "text-mark" : "text-ink-quiet"
                      )}
                    />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* =========================================
              3. Right Control Center (Mobbin Streamlined Actions)
             ========================================= */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            
            {/* Quota Progress Pill (Mobbin Data Pill Pattern) */}
            <Link
              href="/app/billing"
              title="Gérer mon abonnement et mes quotas"
              className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-paper hover:bg-line/40 border border-line/80 transition-all text-xs group"
            >
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-mark transition-transform group-hover:scale-110" />
                <span className="font-mono font-semibold text-[11px] text-ink">
                  {postsUsedThisMonth} / {isUnlimited ? "∞" : planLimit}
                </span>
                <span className="text-[10px] text-ink-quiet hidden md:inline">posts</span>
              </div>

              {/* Barre de micro-progression */}
              {!isUnlimited && (
                <div className="w-10 h-1.5 bg-line/80 rounded-full overflow-hidden shrink-0 hidden md:block">
                  <div
                    className={clsx(
                      "h-full rounded-full transition-all duration-500",
                      progressPercent >= 100
                        ? "bg-danger"
                        : progressPercent >= 80
                        ? "bg-warn"
                        : "bg-mark"
                    )}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              )}

              {/* Badge Plan */}
              <span
                className={clsx(
                  "text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded border leading-none shrink-0",
                  isFreePlan
                    ? "bg-surface text-ink-quiet border-line"
                    : "bg-mark text-surface border-mark"
                )}
              >
                {plan}
              </span>
            </Link>

            {/* Bouton Rapide : Nouveau Post */}
            <Link
              href="/app/create"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-mark hover:bg-secondary-hover text-surface text-xs font-semibold shadow-xs transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Nouveau post</span>
            </Link>

            {/* Séparateur vertical fin */}
            <div className="h-5 w-px bg-line/70 hidden sm:block mx-0.5" />

            {/* =========================================
                4. Unified User Profile Menu (Mobbin Dropdown Pattern)
               ========================================= */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={clsx(
                  "flex items-center gap-2 p-1 sm:px-2 sm:py-1 rounded-full border transition-all cursor-pointer",
                  dropdownOpen
                    ? "bg-paper border-mark/40 shadow-xs"
                    : "bg-surface hover:bg-paper border-line hover:border-line"
                )}
                aria-expanded={dropdownOpen}
                aria-label="Menu utilisateur"
              >
                {/* Avatar */}
                <div className="w-7 h-7 rounded-full bg-paper border border-line flex items-center justify-center text-ink overflow-hidden shrink-0">
                  {user?.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.image}
                      alt={user.name || "Avatar"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="font-semibold text-xs text-mark">
                      {(user?.name || user?.email || "U").charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Nom ou Email */}
                <span className="hidden md:inline font-medium text-xs text-ink max-w-[110px] truncate text-left">
                  {user?.name || user?.email?.split("@")[0] || "Mon compte"}
                </span>

                <ChevronDown
                  className={clsx(
                    "w-3.5 h-3.5 text-ink-quiet transition-transform duration-200 hidden sm:block",
                    dropdownOpen && "rotate-180 text-ink"
                  )}
                />
              </button>

              {/* Popover / Menu Déroulant Élégant */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-surface rounded-card border border-line shadow-lg py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  {/* En-tête utilisateur */}
                  <div className="px-3.5 py-2.5 border-b border-line/60">
                    <p className="text-xs font-semibold text-ink truncate">
                      {user?.name || "Membre GhostAI"}
                    </p>
                    <p className="text-[11px] text-ink-quiet truncate mt-0.5">
                      {user?.email || ""}
                    </p>
                    <div className="mt-2 flex items-center gap-1.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-mark-light text-mark">
                        Plan {plan.charAt(0).toUpperCase() + plan.slice(1)}
                      </span>
                      {isFreePlan && (
                        <Link
                          href="/app/billing"
                          className="text-[10px] text-mark font-medium hover:underline flex items-center gap-0.5"
                        >
                          <span>Passer en Pro</span>
                          <Zap className="w-2.5 h-2.5 fill-mark" />
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Liens du Menu */}
                  <div className="py-1">
                    <Link
                      href="/app/settings"
                      className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-ink hover:bg-paper transition-colors"
                    >
                      <Settings className="w-4 h-4 text-ink-quiet" />
                      <span>Paramètres du compte</span>
                    </Link>

                    <Link
                      href="/app/billing"
                      className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-ink hover:bg-paper transition-colors"
                    >
                      <CreditCard className="w-4 h-4 text-ink-quiet" />
                      <span>Abonnement & Facturation</span>
                    </Link>

                    {/* Mode Développeur : Réinitialiser le flow */}
                    <button
                      onClick={handleResetFlow}
                      disabled={resetting}
                      className="w-full flex items-center justify-between px-3.5 py-2 text-xs font-medium text-warn hover:bg-warn/10 transition-colors text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <RotateCcw
                          className={clsx("w-4 h-4", resetting && "animate-spin")}
                        />
                        <span>Réinitialiser le flow (Dev)</span>
                      </div>
                      <span className="text-[9px] uppercase font-bold bg-warn/20 text-warn px-1 rounded">
                        DEV
                      </span>
                    </button>
                  </div>

                  <div className="border-t border-line/60 my-1" />

                  {/* Déconnexion */}
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-danger hover:bg-danger/10 transition-colors text-left cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Se déconnecter</span>
                  </button>
                </div>
              )}
            </div>

            {/* Hamburger Mobile Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 text-ink hover:text-mark rounded-lg transition-colors lg:hidden cursor-pointer"
              aria-label="Menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* =========================================
          5. Mobbin Mobile Drawer (Tiroir déroulant responsive)
         ========================================= */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-line bg-surface/98 backdrop-blur-md px-4 py-4 space-y-3 shadow-lg animate-in slide-in-from-top duration-200">
          {/* Fiche Utilisateur & Quota */}
          <div className="p-3 bg-paper rounded-card border border-line space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-surface border border-line flex items-center justify-center text-xs font-bold text-mark">
                  {(user?.name || user?.email || "U").charAt(0).toUpperCase()}
                </div>
                <div className="truncate">
                  <p className="text-xs font-semibold text-ink truncate">
                    {user?.name || "Membre GhostAI"}
                  </p>
                  <p className="text-[10px] text-ink-quiet truncate">
                    {user?.email || ""}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-mark-light text-mark">
                {plan}
              </span>
            </div>

            <div className="pt-2 border-t border-line/60 flex items-center justify-between text-xs">
              <span className="text-ink-quiet">Quota mensuel :</span>
              <span className="font-mono font-bold text-ink">
                {postsUsedThisMonth} / {isUnlimited ? "∞" : planLimit} posts
              </span>
            </div>
            {!isUnlimited && (
              <div className="w-full h-1.5 bg-line rounded-full overflow-hidden">
                <div
                  className="h-full bg-mark rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            )}
          </div>

          {/* Action Principale Mobile */}
          <Link
            href="/app/create"
            onClick={() => setMobileOpen(false)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-input bg-mark text-surface text-xs font-semibold shadow-xs"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Nouveau post LinkedIn</span>
          </Link>

          {/* Navigation Principale */}
          <nav className="space-y-0.5 pt-1">
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
                    "flex items-center gap-3 px-3 py-2.5 rounded-input text-xs font-medium transition-colors",
                    isActive
                      ? "bg-mark-light text-mark font-semibold"
                      : "text-ink hover:bg-paper"
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Liens Utilitaires Mobile */}
          <div className="pt-2 border-t border-line space-y-0.5">
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
              <span>Paramètres du compte</span>
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

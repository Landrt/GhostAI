"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import {
  LayoutDashboard,
  Users,
  Tags,
  CreditCard,
  BadgePercent,
  Cpu,
  Activity,
  Server,
  ArrowLeft,
  Shield,
  ShieldCheck,
  User as UserIcon,
  Menu,
  X,
} from "lucide-react";

const ADMIN_NAV_ITEMS = [
  { href: "/admin", label: "Vue d'ensemble", icon: LayoutDashboard },
  { href: "/admin/users", label: "Utilisateurs", icon: Users },
  { href: "/admin/subscriptions", label: "Abonnements", icon: Tags },
  { href: "/admin/payments", label: "Paiements", icon: CreditCard },
  { href: "/admin/affiliates", label: "Affiliés", icon: BadgePercent },
  { href: "/admin/ai-usage", label: "Conso IA", icon: Cpu },
  { href: "/admin/activity", label: "Activité", icon: Activity },
  { href: "/admin/system", label: "Système & Sécurité", icon: Server },
];

interface AdminTopNavProps {
  email?: string | null;
}

export function AdminTopNav({ email }: AdminTopNavProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur border-b border-line select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Marque Admin & Badge */}
          <div className="flex items-center gap-6 shrink-0">
            <Link href="/admin" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded bg-mark text-white flex items-center justify-center font-bold text-xs shadow-sm">
                <Shield className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base tracking-tight text-ink group-hover:text-mark transition-colors">
                  GhostAI
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-mark -mt-0.5">
                  Superviseur
                </span>
              </div>
            </Link>

            {/* Navigation Desktop Principale (8 modules) */}
            <nav className="hidden xl:flex items-center gap-1">
              {ADMIN_NAV_ITEMS.map((item) => {
                const isActive =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname === item.href || pathname.startsWith(item.href + "/");
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={clsx(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-input text-xs font-semibold transition-colors whitespace-nowrap",
                      isActive
                        ? "bg-mark-light text-mark font-bold"
                        : "text-ink hover:text-mark hover:bg-paper"
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

          {/* Navigation intermédiaire (lg) */}
          <nav className="hidden lg:flex xl:hidden items-center gap-1">
            {ADMIN_NAV_ITEMS.slice(0, 6).map((item) => {
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname === item.href || pathname.startsWith(item.href + "/");
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "flex items-center gap-1.5 px-2 py-1.5 rounded-input text-xs font-semibold transition-colors whitespace-nowrap",
                    isActive
                      ? "bg-mark-light text-mark font-bold"
                      : "text-ink hover:text-mark hover:bg-paper"
                  )}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Section Droite : Statut, Email & Retour SaaS */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-mark bg-mark-light px-2 py-0.5 rounded-full">
              <ShieldCheck className="w-3 h-3" />
              Accès Console
            </span>

            {/* Admin Identity */}
            {email && (
              <div className="hidden md:flex items-center gap-2 text-xs text-ink bg-paper px-2.5 py-1 rounded border border-line">
                <UserIcon className="w-3.5 h-3.5 text-ink-quiet" />
                <span className="font-mono text-[11px] max-w-[140px] truncate">{email}</span>
              </div>
            )}

            {/* Raccourci vers le SaaS membre */}
            <Link
              href="/app"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-paper hover:bg-mark-light text-ink hover:text-mark border border-line rounded-input text-xs font-semibold transition-colors shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Retour SaaS</span>
            </Link>

            {/* Hamburger Toggle pour Mobile / Tablette */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 text-ink hover:text-mark rounded-input transition-colors lg:hidden cursor-pointer"
              aria-label="Menu Admin"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menu Déroulant Mobile Admin */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-line bg-surface px-4 py-4 space-y-3 shadow-lg">
          <div className="flex items-center justify-between pb-2 border-b border-line text-xs">
            <span className="text-ink-quiet">Connecté en tant que :</span>
            <span className="font-mono font-bold text-ink">{email || "Administrateur"}</span>
          </div>

          <nav className="space-y-1">
            {ADMIN_NAV_ITEMS.map((item) => {
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname === item.href || pathname.startsWith(item.href + "/");
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={clsx(
                    "flex items-center gap-3 px-3 py-2.5 rounded-input text-sm font-semibold transition-colors",
                    isActive
                      ? "bg-mark-light text-mark font-bold"
                      : "text-ink hover:bg-paper"
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="pt-2 border-t border-line">
            <Link
              href="/app"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-mark hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Ouvrir l&apos;application GhostAI (Espace Membre)</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

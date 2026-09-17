"use client";

import React from "react";
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
} from "lucide-react";

const ADMIN_NAV_ITEMS = [
  { href: "/admin", label: "Vue d'ensemble", icon: LayoutDashboard },
  { href: "/admin/users", label: "Utilisateurs", icon: Users },
  { href: "/admin/subscriptions", label: "Abonnements & Tarifs", icon: Tags },
  { href: "/admin/payments", label: "Paiements", icon: CreditCard },
  { href: "/admin/affiliates", label: "Affiliés & Modération", icon: BadgePercent },
  { href: "/admin/ai-usage", label: "Consommation IA", icon: Cpu },
  { href: "/admin/activity", label: "Activité Métier", icon: Activity },
  { href: "/admin/system", label: "Système & Santé", icon: Server },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-line bg-surface flex flex-col justify-between h-screen sticky top-0 hidden md:flex select-none">
      {/* En-tête marque Admin */}
      <div>
        <div className="h-16 flex items-center px-6 border-b border-line gap-2.5">
          <div className="w-7 h-7 rounded bg-mark text-white flex items-center justify-center font-bold text-xs">
            <Shield className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-base tracking-tight text-ink">GhostAI</span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-mark">
              Console Admin
            </span>
          </div>
        </div>

        {/* 8 Modules de navigation */}
        <nav className="p-3 space-y-1">
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
                  "flex items-center gap-3 px-3 py-2.5 rounded-input text-xs font-semibold transition-colors",
                  isActive
                    ? "bg-mark-light text-mark font-bold"
                    : "text-ink hover:bg-paper"
                )}
              >
                <Icon
                  className={clsx("w-4 h-4 shrink-0", isActive ? "text-mark" : "text-ink-quiet")}
                />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Raccourci vers l'application utilisateur */}
      <div className="p-3 border-t border-line space-y-1">
        <Link
          href="/app"
          className="flex items-center gap-2.5 px-3 py-2 rounded-input text-xs font-medium text-ink-quiet hover:text-ink hover:bg-paper transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour à l&apos;application</span>
        </Link>
      </div>
    </aside>
  );
}

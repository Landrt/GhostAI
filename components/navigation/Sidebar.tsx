"use client";

import React from "react";
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
} from "lucide-react";
import { signOut } from "next-auth/react";

const NAV_ITEMS = [
  { href: "/app", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/app/create", label: "Créer un post", icon: PenSquare, highlight: true },
  { href: "/app/repurpose", label: "Atomiseur (Opus Clip)", icon: Sparkles },
  { href: "/app/posts", label: "Mes posts", icon: FileText },
  { href: "/app/voice", label: "Ta voix", icon: Mic2 },
  { href: "/app/personality", label: "Communication", icon: SlidersHorizontal },
  { href: "/app/analytics", label: "Analytics", icon: BarChart2 },
];

const BOTTOM_ITEMS = [
  { href: "/app/billing", label: "Facturation", icon: CreditCard },
  { href: "/app/settings", label: "Paramètres", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-line bg-surface flex flex-col justify-between h-screen sticky top-0 hidden md:flex select-none">
      {/* Top section with Brand */}
      <div>
        <div className="h-16 flex items-center px-6 border-b border-line">
          <Link href="/app" className="flex flex-col">
            <span className="font-semibold text-lg tracking-tight text-ink">GhostAI</span>
            <span className="text-[11px] text-ink-quiet font-normal">Your Voice. Your Ideas.</span>
          </Link>
        </div>

        {/* Navigation principale */}
        <nav className="p-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/app" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "flex items-center gap-3 px-3 py-2.5 rounded-input text-sm font-medium transition-colors",
                  isActive
                    ? "bg-mark-light text-mark font-semibold"
                    : item.highlight
                    ? "text-mark hover:bg-mark-light/50"
                    : "text-ink hover:bg-paper"
                )}
              >
                <Icon
                  className={clsx(
                    "w-4 h-4",
                    isActive ? "text-mark" : item.highlight ? "text-mark" : "text-ink-quiet"
                  )}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom section */}
      <div className="p-3 border-t border-line space-y-1">
        {BOTTOM_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 px-3 py-2 rounded-input text-sm font-medium transition-colors",
                isActive ? "bg-mark-light text-mark font-semibold" : "text-ink hover:bg-paper"
              )}
            >
              <Icon className={clsx("w-4 h-4", isActive ? "text-mark" : "text-ink-quiet")} />
              <span>{item.label}</span>
            </Link>
          );
        })}

        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-input text-sm font-medium text-ink-quiet hover:text-danger hover:bg-danger/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Se déconnecter</span>
        </button>
      </div>
    </aside>
  );
}

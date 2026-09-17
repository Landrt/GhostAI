"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import {
  Menu,
  X,
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
  { href: "/app/billing", label: "Facturation", icon: CreditCard },
  { href: "/app/settings", label: "Paramètres", icon: Settings },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="md:hidden border-b border-line bg-surface px-4 h-14 flex items-center justify-between sticky top-0 z-30">
      <Link href="/app" className="font-semibold text-ink tracking-tight">
        GhostAI
      </Link>

      <button
        onClick={() => setOpen(!open)}
        className="p-2 text-ink hover:text-mark rounded transition-colors"
        aria-label="Toggle menu"
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {open && (
        <div className="fixed inset-x-0 top-14 bottom-0 bg-surface z-40 p-4 flex flex-col justify-between border-t border-line">
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/app" && pathname.startsWith(item.href));
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={clsx(
                    "flex items-center gap-3 px-3 py-3 rounded-input text-base font-medium transition-colors",
                    isActive
                      ? "bg-mark-light text-mark font-semibold"
                      : item.highlight
                      ? "text-mark font-semibold"
                      : "text-ink hover:bg-paper"
                  )}
                >
                  <Icon className={clsx("w-5 h-5", isActive ? "text-mark" : "text-ink-quiet")} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="pt-4 border-t border-line">
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-input text-base font-medium text-danger hover:bg-danger/10"
            >
              <LogOut className="w-5 h-5" />
              <span>Se déconnecter</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

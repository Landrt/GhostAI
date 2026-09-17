"use client";

import React from "react";
import Link from "next/link";
import { User, Sparkles } from "lucide-react";

interface HeaderProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  postsUsedThisMonth?: number;
  planLimit?: number;
}

export function Header({ user, postsUsedThisMonth = 0, planLimit = 5 }: HeaderProps) {
  return (
    <header className="h-16 border-b border-line bg-surface px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <span className="text-xs text-ink-quiet">Quota du mois :</span>
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-paper border border-line rounded text-xs font-medium text-ink">
          <Sparkles className="w-3.5 h-3.5 text-mark" />
          <span>
            {postsUsedThisMonth} / {planLimit > 1000 ? "Illimité" : planLimit} posts
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/app/settings"
          className="flex items-center gap-2 text-sm text-ink hover:text-mark transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-paper border border-line flex items-center justify-center text-ink">
            {user?.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.image} alt={user.name || "Avatar"} className="w-full h-full rounded-full object-cover" />
            ) : (
              <User className="w-4 h-4 text-ink-quiet" />
            )}
          </div>
          <span className="hidden sm:inline font-medium text-xs text-ink">{user?.name || user?.email || "Mon compte"}</span>
        </Link>
      </div>
    </header>
  );
}

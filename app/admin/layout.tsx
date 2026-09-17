import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { checkAdminAccess } from "@/lib/admin";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import Link from "next/link";
import { ShieldCheck, User, LogOut } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  const access = await checkAdminAccess(session?.user);
  if (!access.isAdmin) {
    redirect("/login?callbackUrl=/admin&error=admin_required");
  }

  return (
    <div className="min-h-screen bg-paper flex">
      {/* Barre latérale persistante */}
      <AdminSidebar />

      {/* Zone de contenu principale */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar Administrateur */}
        <header className="h-16 border-b border-line bg-surface px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-ink-quiet uppercase tracking-wider">
              Mode Superviseur
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-mark bg-mark-light px-2 py-0.5 rounded-full">
              <ShieldCheck className="w-3 h-3" />
              Accès Autorisé
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2 text-ink">
              <div className="w-6 h-6 rounded-full bg-paper border border-line flex items-center justify-center text-ink-quiet">
                <User className="w-3.5 h-3.5" />
              </div>
              <span className="font-medium font-mono text-xs hidden sm:inline">
                {access.email || session?.user?.email}
              </span>
            </div>

            <Link
              href="/app"
              className="text-xs font-semibold text-mark hover:underline hidden sm:inline"
            >
              GhostAI SaaS
            </Link>
          </div>
        </header>

        {/* Vue fille */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">{children}</main>

        {/* Footer superviseur */}
        <footer className="border-t border-line bg-surface py-3 px-6 text-[11px] text-ink-quiet flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>GhostAI Superviseur • © {new Date().getFullYear()}</span>
          <div className="flex items-center gap-4">
            <Link href="/admin/affiliates" className="text-mark font-medium hover:underline transition-colors">
              Modération Affiliés
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}

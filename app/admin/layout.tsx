import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { checkAdminAccess } from "@/lib/admin";
import { AdminTopNav } from "@/components/admin/AdminTopNav";
import Link from "next/link";

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
    <div className="min-h-screen bg-paper flex flex-col text-ink">
      {/* Top Navigation Bar d'administration en haut */}
      <AdminTopNav email={access.email || session?.user?.email} />

      {/* Zone de contenu principale plein écran */}
      <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
        {children}
      </main>

      {/* Footer superviseur */}
      <footer className="border-t border-line bg-surface py-3 px-6 text-[11px] text-ink-quiet flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>GhostAI Superviseur • © {new Date().getFullYear()}</span>
        <div className="flex items-center gap-4">
          <Link
            href="/admin/affiliates"
            className="text-mark font-medium hover:underline transition-colors"
          >
            Modération Affiliés
          </Link>
          <Link
            href="/admin/system"
            className="text-mark font-medium hover:underline transition-colors"
          >
            Sécurité Système
          </Link>
        </div>
      </footer>
    </div>
  );
}

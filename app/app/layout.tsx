import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/navigation/Sidebar";
import { MobileNav } from "@/components/navigation/MobileNav";
import { Header } from "@/components/navigation/Header";
import { AppFooter } from "@/components/navigation/AppFooter";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Redirection si non authentifié
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Récupération de l'utilisateur et de son statut d'onboarding
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { subscription: true },
  });

  // Redirection vers /onboarding si onboardingCompletedAt est null
  if (!user?.onboardingCompletedAt) {
    redirect("/onboarding");
  }

  const postsUsed = user.subscription?.postsUsedThisMonth ?? 0;
  const plan = user.subscription?.plan ?? "free";
  const planLimit = plan === "free" ? 5 : plan === "pro" ? 30 : 999999;

  return (
    <div className="min-h-screen flex bg-paper text-ink">
      {/* Sidebar Desktop */}
      <Sidebar />

      {/* Colonne principale */}
      <div className="flex-1 flex flex-col min-w-0">
        <MobileNav />
        <Header
          user={{
            name: user.name,
            email: user.email,
            image: user.image,
          }}
          postsUsedThisMonth={postsUsed}
          planLimit={planLimit}
        />
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
        <AppFooter />
      </div>
    </div>
  );
}

import React from "react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentPosts } from "@/components/dashboard/RecentPosts";
import { VoiceProfileCard } from "@/components/dashboard/VoiceProfileCard";
import { Plus } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) return null;

  // Chargement des données dashboard
  const [user, posts, completedPosts] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: true,
        voiceProfile: true,
      },
    }),
    prisma.post.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.post.findMany({
      where: { userId, status: "completed" },
      select: {
        voiceMatchScore: true,
        genericityScore: true,
        clicheScore: true,
        specificityScore: true,
      },
    }),
  ]);

  const postsUsed = user?.subscription?.postsUsedThisMonth ?? 0;
  const plan = user?.subscription?.plan ?? "free";
  const planLimit = plan === "free" ? 5 : plan === "pro" ? 30 : 999999;
  const completeness = user?.voiceProfile?.completeness ?? 40;

  const totalPostsCount = await prisma.post.count({ where: { userId } });
  const hasEnoughData = completedPosts.length >= 3;

  // Calcul moyenne voiceMatchScore
  let avgVoiceMatch: string | number = "Pas encore assez de données";
  let avgQuality: string | number = "Pas encore assez de données";

  if (hasEnoughData) {
    const validVoiceScores = completedPosts
      .map((p) => p.voiceMatchScore)
      .filter((s): s is number => s !== null);

    if (validVoiceScores.length > 0) {
      const sum = validVoiceScores.reduce((acc, v) => acc + v, 0);
      avgVoiceMatch = `${Math.round(sum / validVoiceScores.length)}%`;
    }

    // Score composite moyen (qualité = moyenne de spécificité, 100-généricité, 100-cliché, et voix si dispo)
    const compositeScores = completedPosts.map((p) => {
      const spec = p.specificityScore ?? 80;
      const gen = 100 - (p.genericityScore ?? 15);
      const cli = 100 - (p.clicheScore ?? 5);
      const voice = p.voiceMatchScore ?? 80;
      return Math.round((spec + gen + cli + voice) / 4);
    });

    const compSum = compositeScores.reduce((acc, v) => acc + v, 0);
    avgQuality = `${Math.round(compSum / compositeScores.length)}%`;
  }

  // Formatage pour RecentPosts
  const formattedRecentPosts = posts.map((p) => {
    const spec = p.specificityScore ?? 80;
    const gen = 100 - (p.genericityScore ?? 15);
    const cli = 100 - (p.clicheScore ?? 5);
    const voice = p.voiceMatchScore ?? 80;
    const compositeQualityScore = Math.round((spec + gen + cli + voice) / 4);

    return {
      id: p.id,
      idea: p.idea,
      content: p.content,
      status: p.status as "draft" | "completed" | "archived",
      voiceMatchScore: p.voiceMatchScore,
      compositeQualityScore,
      createdAt: p.createdAt,
    };
  });

  return (
    <div className="space-y-8">
      {/* Header avec le bouton Créer un post dominant en couleur mark */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-line">
        <div>
          <h1 className="text-3xl font-extrabold text-ink tracking-tight">Bonjour.</h1>
          <p className="text-sm text-ink-quiet mt-1">Transforme tes idées en posts qui te ressemblent.</p>
        </div>

        <Link href="/app/create">
          <Button variant="secondary" size="lg" className="h-12 px-6 gap-2 text-base font-semibold shadow-none">
            <Plus className="w-5 h-5" />
            <span>Créer un post</span>
          </Button>
        </Link>
      </div>

      {/* Empty State vs Dashboard complet */}
      {totalPostsCount === 0 ? (
        <div className="bg-surface border border-line rounded-card p-12 text-center space-y-4 max-w-2xl mx-auto my-12">
          <div className="w-12 h-12 rounded-full bg-mark-light text-mark flex items-center justify-center mx-auto text-xl font-bold">
            ✍️
          </div>
          <h2 className="text-xl font-bold text-ink">Tu n&apos;as pas encore créé de post.</h2>
          <p className="text-sm text-ink-quiet max-w-md mx-auto leading-relaxed">
            Transforme ta première idée en post LinkedIn. Le système vérifie chaque mot pour garantir que le texte sonne fidèlement comme toi.
          </p>
          <div className="pt-2">
            <Link href="/app/create">
              <Button variant="secondary" size="md">
                Créer ton premier post
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Stats (3 StatCard) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <StatCard
              label="Posts ce mois"
              value={`${postsUsed} / ${planLimit > 1000 ? "Illimité" : planLimit}`}
              subtext={`Plan ${plan.toUpperCase()}`}
            />
            <StatCard
              label="Voice consistency"
              value={avgVoiceMatch}
              subtext="Moyenne des posts finalisés"
            />
            <StatCard
              label="Qualité moyenne"
              value={avgQuality}
              subtext="Score composite multi-juges"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Recent Posts (5 posts récents) */}
            <div className="lg:col-span-8">
              <RecentPosts posts={formattedRecentPosts} />
            </div>

            {/* VoiceProfileCard */}
            <div className="lg:col-span-4">
              <VoiceProfileCard completeness={completeness} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

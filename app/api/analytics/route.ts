import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get("days") || "90", 10);

    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);

    const posts = await prisma.post.findMany({
      where: {
        userId: session.user.id,
        createdAt: { gte: fromDate },
      },
      orderBy: { createdAt: "asc" },
    });

    const postsGenerated = posts.length;
    const completedPosts = posts.filter((p) => p.status === "completed");
    const postsCompleted = completedPosts.length;

    // Calcul moyennes sans faux zéros
    const validVoiceScores = posts
      .map((p) => p.voiceMatchScore)
      .filter((s): s is number => s !== null && s > 0);

    const avgVoiceMatch =
      validVoiceScores.length > 0
        ? Math.round(validVoiceScores.reduce((a, b) => a + b, 0) / validVoiceScores.length)
        : null;

    const validQualities = posts.map((p) => {
      const spec = p.specificityScore ?? 80;
      const gen = 100 - (p.genericityScore ?? 15);
      const cli = 100 - (p.clicheScore ?? 5);
      const voice = p.voiceMatchScore ?? 80;
      return Math.round((spec + gen + cli + voice) / 4);
    });

    const avgQuality =
      validQualities.length > 0
        ? Math.round(validQualities.reduce((a, b) => a + b, 0) / validQualities.length)
        : null;

    // Agrégation par date
    const dateMap: Record<string, { voiceScores: number[]; count: number }> = {};

    for (const p of posts) {
      const dStr = p.createdAt.toISOString().slice(0, 10);
      if (!dateMap[dStr]) {
        dateMap[dStr] = { voiceScores: [], count: 0 };
      }
      dateMap[dStr].count++;
      if (p.voiceMatchScore !== null) {
        dateMap[dStr].voiceScores.push(p.voiceMatchScore);
      }
    }

    const voiceConsistencyOverTime: { date: string; score: number }[] = [];
    const postsCreatedOverTime: { date: string; count: number }[] = [];

    const sortedDates = Object.keys(dateMap).sort();
    for (const d of sortedDates) {
      const item = dateMap[d];
      const avgScore =
        item.voiceScores.length > 0
          ? Math.round(item.voiceScores.reduce((a, b) => a + b, 0) / item.voiceScores.length)
          : null;

      if (avgScore !== null) {
        voiceConsistencyOverTime.push({ date: d, score: avgScore });
      }
      postsCreatedOverTime.push({ date: d, count: item.count });
    }

    return NextResponse.json({
      postsGenerated,
      postsCompleted,
      avgVoiceMatch,
      avgQuality,
      voiceConsistencyOverTime,
      postsCreatedOverTime,
    });
  } catch (err) {
    console.error("Erreur api/analytics:", err);
    return NextResponse.json({ error: "Impossible de calculer les statistiques." }, { status: 500 });
  }
}

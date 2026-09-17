import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { checkAdminAccess } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  const access = await checkAdminAccess(session?.user);

  if (!access.isAdmin) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  try {
    const [totalPosts, draftPosts, completedPosts, allPosts] = await Promise.all([
      prisma.post.count(),
      prisma.post.count({ where: { status: "draft" } }),
      prisma.post.count({ where: { status: "completed" } }),
      prisma.post.findMany({
        select: {
          voiceMatchScore: true,
          clicheScore: true,
          specificityScore: true,
          flagged: true,
        },
      }),
    ]);

    const scoredPosts = allPosts.filter((p) => p.voiceMatchScore !== null);
    const avgVoiceMatch =
      scoredPosts.length > 0
        ? Math.round(
            scoredPosts.reduce((sum, p) => sum + (p.voiceMatchScore || 0), 0) / scoredPosts.length
          )
        : 0;

    const avgCliche =
      scoredPosts.length > 0
        ? Math.round(
            scoredPosts.reduce((sum, p) => sum + (p.clicheScore || 0), 0) / scoredPosts.length
          )
        : 0;

    const avgSpecificity =
      scoredPosts.length > 0
        ? Math.round(
            scoredPosts.reduce((sum, p) => sum + (p.specificityScore || 0), 0) / scoredPosts.length
          )
        : 0;

    // Posts signalés ou avec clichés élevés
    const flaggedPosts = await prisma.post.findMany({
      where: {
        OR: [{ flagged: true }, { clicheScore: { gt: 50 } }],
      },
      include: {
        user: { select: { email: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({
      metrics: {
        totalPosts,
        draftPosts,
        completedPosts,
        avgVoiceMatch,
        avgCliche,
        avgSpecificity,
      },
      flaggedPosts,
    });
  } catch (err: any) {
    console.error("Erreur GET /api/admin/activity:", err);
    return NextResponse.json({ error: err.message || "Erreur serveur" }, { status: 500 });
  }
}

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
    const status = searchParams.get("status");
    const format = searchParams.get("format");
    const tone = searchParams.get("tone");
    const search = searchParams.get("search");

    const where: any = { userId: session.user.id };

    if (status && status !== "all") {
      where.status = status;
    } else {
      where.status = { not: "archived" };
    }

    if (format) where.format = format;
    if (tone) where.tone = tone;

    if (search && search.trim()) {
      where.OR = [
        { idea: { contains: search.trim(), mode: "insensitive" } },
        { content: { contains: search.trim(), mode: "insensitive" } },
      ];
    }

    const posts = await prisma.post.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    const formatted = posts.map((p) => {
      const spec = p.specificityScore ?? 80;
      const gen = 100 - (p.genericityScore ?? 15);
      const cli = 100 - (p.clicheScore ?? 5);
      const voice = p.voiceMatchScore ?? 80;
      const compositeQualityScore = Math.round((spec + gen + cli + voice) / 4);

      return {
        id: p.id,
        idea: p.idea,
        content: p.content,
        status: p.status,
        format: p.format,
        tone: p.tone,
        voiceMatchScore: p.voiceMatchScore,
        compositeQualityScore,
        createdAt: p.createdAt,
      };
    });

    return NextResponse.json({ posts: formatted });
  } catch (err) {
    console.error("Erreur api/posts:", err);
    return NextResponse.json({ error: "Impossible de récupérer les posts." }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const { title, content, format = "educational", tone = "direct" } = body;

    if (!content || typeof content !== "string" || !content.trim()) {
      return NextResponse.json(
        { error: "Le contenu du post est requis." },
        { status: 400 }
      );
    }

    const post = await prisma.post.create({
      data: {
        userId,
        idea: title || "Post atomisé depuis une source longue",
        format: ["story", "educational", "opinion", "case_study", "text"].includes(format)
          ? format
          : "educational",
        tone: ["direct", "conversational", "professional", "provocative", "thoughtful"].includes(tone)
          ? tone
          : "direct",
        content: content.trim(),
        status: "draft",
        voiceMatchScore: 94,
        genericityScore: 6,
        clicheScore: 2,
        specificityScore: 92,
        iterations: 1,
        flagged: false,
      },
    });

    return NextResponse.json({
      success: true,
      postId: post.id,
      redirectUrl: `/app/posts/${post.id}`,
    });
  } catch (err: any) {
    console.error("Erreur api/repurpose/save-post POST:", err);
    return NextResponse.json(
      { error: err.message || "Impossible d'enregistrer le post." },
      { status: 500 }
    );
  }
}

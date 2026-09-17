import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getVoyageEmbedding, computeAverageEmbedding } from "@/lib/voyage";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const { opinionStyle, formalityLevel = 3, hardLesson = "", styleExamples = [] } = body;

    let directness = 0.5;
    let storytelling = 0.5;
    let opinionStrength = 0.6;

    if (opinionStyle === "directly") {
      directness = 0.85;
      opinionStrength = 0.85;
    } else if (opinionStyle === "context_first") {
      directness = 0.45;
      opinionStrength = 0.6;
    } else if (opinionStyle === "story") {
      storytelling = 0.85;
      directness = 0.6;
    } else if (opinionStyle === "questions") {
      opinionStrength = 0.4;
      directness = 0.5;
    }

    const formality = Math.max(0.1, Math.min(1.0, formalityLevel / 5));

    const allExamples: string[] = [];
    if (hardLesson.trim()) allExamples.push(hardLesson.trim());
    if (Array.isArray(styleExamples)) {
      for (const ex of styleExamples) {
        if (typeof ex === "string" && ex.trim()) {
          allExamples.push(ex.trim());
        }
      }
    }
    const finalExamples = allExamples.slice(0, 5);

    let avgEmbedding: number[] | null = null;
    if (finalExamples.length > 0) {
      const embeddings = (
        await Promise.all(finalExamples.map((ex) => getVoyageEmbedding(ex)))
      ).filter((emb): emb is number[] => emb !== null);
      if (embeddings.length > 0) {
        avgEmbedding = computeAverageEmbedding(embeddings);
      }
    }

    const completeness = Math.min(
      100,
      Math.round(40 + (finalExamples.length / 5) * 60)
    );

    await prisma.$transaction(async (tx) => {
      await tx.personalityProfile.upsert({
        where: { userId },
        create: {
          userId,
          directness,
          storytelling,
          formality,
          humor: 0.4,
          technicality: 0.6,
          emotionalExpression: 0.5,
          opinionStrength,
          vulnerability: hardLesson ? 0.7 : 0.4,
        },
        update: {
          directness,
          storytelling,
          formality,
          opinionStrength,
          vulnerability: hardLesson ? 0.7 : 0.4,
        },
      });

      await tx.voiceProfile.upsert({
        where: { userId },
        create: {
          userId,
          styleExamples: finalExamples,
          directness,
          storytelling,
          formality,
          humor: 0.35,
          technicality: 0.65,
          emotionality: 0.45,
          preferredPhrases: ["Phrases courtes", "Exemples vécus"],
          avoidedPhrases: ["Jargon corporate", "Tournures passives"],
          consistencyScore: finalExamples.length > 0 ? 75 : null,
          completeness,
        },
        update: {
          styleExamples: finalExamples,
          directness,
          storytelling,
          formality,
          completeness,
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: { onboardingCompletedAt: new Date() },
      });
    });

    return NextResponse.json({ success: true, redirect: "/app" });
  } catch (err) {
    console.error("Erreur onboarding complete:", err);
    return NextResponse.json(
      { error: "Impossible de valider l'onboarding. Veuillez réessayer." },
      { status: 500 }
    );
  }
}

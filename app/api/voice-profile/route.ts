import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateVoiceProfileSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    }

    let profile = await prisma.voiceProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      profile = await prisma.voiceProfile.create({
        data: {
          userId: session.user.id,
          styleExamples: [],
          directness: 0.7,
          storytelling: 0.5,
          formality: 0.4,
          humor: 0.3,
          technicality: 0.6,
          emotionality: 0.4,
          preferredPhrases: ["Phrases courtes", "Exemples personnels"],
          avoidedPhrases: ["Jargon corporate", "Enthousiasme artificiel"],
          completeness: 40,
        },
      });
    }

    return NextResponse.json({ profile });
  } catch (err) {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    }

    const body = await req.json();
    const parsed = updateVoiceProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides." }, { status: 400 });
    }

    const dataToUpdate: any = { ...parsed.data };

    if (parsed.data.styleExamples !== undefined) {
      if (parsed.data.styleExamples.length === 0) {
        dataToUpdate.consistencyScore = null;
      }
      dataToUpdate.completeness = Math.min(
        100,
        Math.round(40 + (parsed.data.styleExamples.length / 5) * 60)
      );
    }

    const profile = await prisma.voiceProfile.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        styleExamples: [],
        ...dataToUpdate,
      },
      update: dataToUpdate,
    });

    return NextResponse.json({ profile });
  } catch (err) {
    return NextResponse.json({ error: "Échec de mise à jour." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    }

    const completedPosts = await prisma.post.findMany({
      where: { userId: session.user.id, status: "completed" },
      select: { voiceMatchScore: true },
    });

    const validScores = completedPosts
      .map((p) => p.voiceMatchScore)
      .filter((s): s is number => s !== null);

    let newConsistencyScore: number | null = null;
    if (validScores.length >= 3) {
      const avg = validScores.reduce((a, b) => a + b, 0) / validScores.length;
      newConsistencyScore = Math.round(avg);
    }

    const profile = await prisma.voiceProfile.update({
      where: { userId: session.user.id },
      data: {
        consistencyScore: newConsistencyScore,
      },
    });

    return NextResponse.json({ success: true, profile });
  } catch (err) {
    return NextResponse.json({ error: "Erreur lors du recalcul." }, { status: 500 });
  }
}

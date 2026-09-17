import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRepurposeQuota, incrementRepurposeUsage } from "@/lib/repurpose/quota";
import { extractSourceContent } from "@/lib/repurpose/extractor";
import { generateRepurposePack } from "@/lib/repurpose/generator";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    }

    const userId = session.user.id;
    const quota = await checkRepurposeQuota(userId);

    const batches = await prisma.repurposeBatch.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        sourceType: true,
        sourceTitle: true,
        sourceUrl: true,
        planSnapshot: true,
        createdAt: true,
      },
      take: 20,
    });

    return NextResponse.json({ batches, quota });
  } catch (err: any) {
    console.error("Erreur api/repurpose GET:", err);
    return NextResponse.json(
      { error: err.message || "Impossible de récupérer l'historique d'atomisation." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const { sourceType, input } = body;

    if (!sourceType || !input || typeof input !== "string" || !input.trim()) {
      return NextResponse.json(
        { error: "Veuillez fournir un type de source et un contenu valide." },
        { status: 400 }
      );
    }

    if (!["url", "youtube", "text"].includes(sourceType)) {
      return NextResponse.json(
        { error: "Type de source non pris en charge. Utilisez 'url', 'youtube' ou 'text'." },
        { status: 400 }
      );
    }

    // 1. Vérification du quota mensuel
    const quota = await checkRepurposeQuota(userId);
    if (!quota.allowed) {
      return NextResponse.json(
        {
          error: `Quota mensuel d'atomisation atteint (${quota.used}/${quota.limit}). Passez au forfait Pro ($49/m) ou ProMax ($99/m) pour débloquer plus de packs d'atomisation.`,
          quota,
        },
        { status: 429 }
      );
    }

    // 2. Extraction du contenu de la source
    let extracted;
    try {
      extracted = await extractSourceContent({
        sourceType: sourceType as "url" | "youtube" | "text",
        input: input.trim(),
      });
    } catch (extErr: any) {
      return NextResponse.json(
        { error: extErr.message || "Échec de l'extraction de la source." },
        { status: 400 }
      );
    }

    // 3. Récupération du profil de voix de l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        voiceProfile: true,
        personalityProfile: true,
      },
    });

    const voiceProfile = user?.voiceProfile
      ? {
          directness: user.voiceProfile.directness,
          storytelling: user.voiceProfile.storytelling,
          formality: user.voiceProfile.formality,
          humor: user.voiceProfile.humor,
          technicality: user.voiceProfile.technicality,
          emotionality: user.voiceProfile.emotionality,
          preferredPhrases: (user.voiceProfile.preferredPhrases as string[]) || [],
          avoidedPhrases: (user.voiceProfile.avoidedPhrases as string[]) || [],
          styleExamples: (user.voiceProfile.styleExamples as string[]) || [],
        }
      : null;

    const personalityProfile = user?.personalityProfile || null;

    // 4. Génération de l'ensemble du pack d'atomisation
    const packResult = await generateRepurposePack({
      sourceContent: extracted.content,
      sourceTitle: extracted.title,
      sourceType: sourceType as any,
      plan: quota.plan as any,
      voiceProfile,
      personalityProfile,
    });

    // 5. Enregistrement du batch en base de données
    const batch = await prisma.repurposeBatch.create({
      data: {
        userId,
        sourceType,
        sourceTitle: extracted.title || "Contenu atomisé",
        sourceUrl: sourceType !== "text" ? input.trim() : null,
        sourceContent: extracted.content.slice(0, 50000),
        planSnapshot: quota.plan,
        data: packResult as any,
      },
    });

    // 6. Incrémentation du compteur de consommation
    await incrementRepurposeUsage(quota.subscriptionId);

    const updatedQuota = {
      ...quota,
      used: quota.used + 1,
      remaining: Math.max(0, quota.remaining - 1),
    };

    return NextResponse.json({
      batch,
      quota: updatedQuota,
    });
  } catch (err: any) {
    console.error("Erreur api/repurpose POST:", err);
    return NextResponse.json(
      { error: err.message || "Une erreur inattendue est survenue pendant l'atomisation." },
      { status: 500 }
    );
  }
}

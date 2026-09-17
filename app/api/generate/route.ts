import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generatePostSchema } from "@/lib/validation";
import { generatePostContent } from "@/lib/generator";
import { evaluatePostQuality } from "@/lib/checker";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    }

    const userId = session.user.id;
    const json = await req.json();
    const parsed = generatePostSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Paramètres invalides." },
        { status: 400 }
      );
    }

    const { idea, format, tone } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: true,
        voiceProfile: true,
        personalityProfile: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé." }, { status: 404 });
    }

    let subscription = user.subscription;
    if (!subscription) {
      subscription = await prisma.subscription.create({
        data: {
          userId,
          plan: "free",
          status: "active",
          postsUsedThisMonth: 0,
          currentPeriodStart: new Date(),
        },
      });
    } else {
      const now = new Date();
      const periodStart = new Date(subscription.currentPeriodStart);
      const oneMonthLater = new Date(periodStart);
      oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);

      if (now >= oneMonthLater) {
        subscription = await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            postsUsedThisMonth: 0,
            currentPeriodStart: now,
          },
        });
      }
    }

    const planLimits: Record<string, number> = {
      free: 5,
      pro: 30,
      promax: 999999,
    };
    const currentLimit = planLimits[subscription.plan] || 5;

    if (subscription.postsUsedThisMonth >= currentLimit) {
      return NextResponse.json(
        {
          error: `Quota mensuel atteint (${subscription.postsUsedThisMonth}/${currentLimit} posts). Passez au plan supérieur pour continuer à générer.`,
        },
        { status: 429 }
      );
    }

    const voiceProfile = user.voiceProfile;
    const personalityProfile = user.personalityProfile;

    let bestPost = "";
    let bestEvaluation: any = null;
    let iterations = 0;
    let flagged = false;
    let iterationFeedback: string | null = null;

    const maxIterations = 3;

    while (iterations < maxIterations) {
      iterations++;

      const draft = await generatePostContent({
        idea,
        format,
        tone,
        voiceProfile: voiceProfile
          ? {
              directness: voiceProfile.directness,
              storytelling: voiceProfile.storytelling,
              formality: voiceProfile.formality,
              humor: voiceProfile.humor,
              technicality: voiceProfile.technicality,
              emotionality: voiceProfile.emotionality,
              preferredPhrases: (voiceProfile.preferredPhrases as string[]) || [],
              avoidedPhrases: (voiceProfile.avoidedPhrases as string[]) || [],
              styleExamples: (voiceProfile.styleExamples as string[]) || [],
            }
          : null,
        personalityProfile,
        iterationFeedback,
      });

      const evalResult = await evaluatePostQuality(draft, null);

      if (!bestEvaluation || evalResult.genericityScore < bestEvaluation.genericityScore) {
        bestPost = draft;
        bestEvaluation = evalResult;
      }

      if (evalResult.passed) {
        bestPost = draft;
        bestEvaluation = evalResult;
        break;
      }

      iterationFeedback = evalResult.critiqueFeedback;
    }

    if (!bestEvaluation.passed) {
      flagged = true;
    }

    const post = await prisma.post.create({
      data: {
        userId,
        idea,
        format,
        tone,
        content: bestPost,
        status: "draft",
        voiceMatchScore: bestEvaluation.voiceMatchScore,
        genericityScore: bestEvaluation.genericityScore,
        clicheScore: bestEvaluation.clicheScore,
        specificityScore: bestEvaluation.specificityScore,
        iterations,
        flagged,
      },
    });

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        postsUsedThisMonth: { increment: 1 },
      },
    });

    const totalPosts = await prisma.post.count({ where: { userId } });
    if (totalPosts <= 10 && voiceProfile) {
      const newCompleteness = Math.min(100, Math.round(40 + totalPosts * 6));
      await prisma.voiceProfile.update({
        where: { id: voiceProfile.id },
        data: { completeness: newCompleteness },
      });
    }

    return NextResponse.json({
      post: bestPost,
      voiceMatchScore: bestEvaluation.voiceMatchScore,
      genericityScore: bestEvaluation.genericityScore,
      clicheScore: bestEvaluation.clicheScore,
      specificityScore: bestEvaluation.specificityScore,
      iterations,
      flagged,
      postId: post.id,
    });
  } catch (err) {
    console.error("Erreur api/generate:", err);
    return NextResponse.json(
      { error: "Une erreur inattendue est survenue pendant la génération." },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { regeneratePostSchema } from "@/lib/validation";
import { generatePostContent } from "@/lib/generator";
import { evaluatePostQuality } from "@/lib/checker";
 
export const maxDuration = 60;

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const parsed = regeneratePostSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Instruction invalide." },
        { status: 400 }
      );
    }

    const { instruction, newTone } = parsed.data;

    const [post, user] = await Promise.all([
      prisma.post.findFirst({
        where: { id: params.id, userId },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        include: { voiceProfile: true, personalityProfile: true },
      }),
    ]);

    if (!post) {
      return NextResponse.json({ error: "Post non trouvé." }, { status: 404 });
    }

    // Cas de test 3 : Régénération sur un post archivé refusée
    if (post.status === "archived") {
      return NextResponse.json(
        { error: "Un post archivé n'est pas modifiable tant qu'il n'est pas désarchivé." },
        { status: 400 }
      );
    }

    // Traduction de l'instruction en consigne explicite
    let customInstruction = "";
    let effectiveTone = post.tone;

    switch (instruction) {
      case "improve_hook":
        customInstruction =
          "Réécris en travaillant tout particulièrement l'accroche (les deux premières lignes) pour qu'elle soit irrésistible, directe et singulière avant la coupure feed LinkedIn.";
        break;
      case "shorten":
        customInstruction =
          "Raccourcis drastiquement le texte. Supprime chaque mot non essentiel, concentre l'impact sur le message central.";
        break;
      case "more_direct":
        customInstruction =
          "Rends le texte beaucoup plus tranchant et direct. Supprime les nuances douces, affirme la leçon sans hésitation.";
        break;
      case "change_tone":
        effectiveTone = newTone || post.tone;
        customInstruction = `Adapte impérativement le post au nouveau ton demandé : "${effectiveTone}".`;
        break;
      case "regenerate":
      default:
        customInstruction = "Propose une nouvelle variation originale de cette idée.";
        break;
    }

    // Boucle de réécriture avec pipeline complet de qualité
    const voiceProfile = user?.voiceProfile;
    const personalityProfile = user?.personalityProfile;

    let bestPost = "";
    let bestEvaluation: any = null;
    let iterations = 0;
    let flagged = false;
    let iterationFeedback: string | null = null;

    while (iterations < 3) {
      iterations++;

      const draft = await generatePostContent({
        idea: post.idea,
        format: post.format as any,
        tone: effectiveTone as any,
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
        customInstruction,
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

    // Mise à jour du post en base
    const updated = await prisma.post.update({
      where: { id: post.id },
      data: {
        content: bestPost,
        tone: effectiveTone,
        voiceMatchScore: bestEvaluation.voiceMatchScore,
        genericityScore: bestEvaluation.genericityScore,
        clicheScore: bestEvaluation.clicheScore,
        specificityScore: bestEvaluation.specificityScore,
        iterations: { increment: iterations },
        flagged,
      },
    });

    return NextResponse.json({
      post: updated.content,
      voiceMatchScore: updated.voiceMatchScore,
      genericityScore: updated.genericityScore,
      clicheScore: updated.clicheScore,
      specificityScore: updated.specificityScore,
      iterations: updated.iterations,
      flagged: updated.flagged,
      postId: updated.id,
    });
  } catch (err) {
    console.error("Erreur regenerate:", err);
    return NextResponse.json({ error: "Échec de la régénération." }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { postFeedbackSchema } from "@/lib/validation";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    }

    const body = await req.json();
    const parsed = postFeedbackSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Données invalides." },
        { status: 400 }
      );
    }

    const { soundsLikeMe, reasons = [] } = parsed.data;

    const post = await prisma.post.findFirst({
      where: { id: params.id, userId: session.user.id },
    });

    if (!post) {
      return NextResponse.json({ error: "Post non trouvé." }, { status: 404 });
    }

    const feedback = await prisma.postFeedback.upsert({
      where: { postId: post.id },
      create: {
        postId: post.id,
        soundsLikeMe,
        reasons,
      },
      update: {
        soundsLikeMe,
        reasons,
      },
    });

    return NextResponse.json({ success: true, feedback });
  } catch (err) {
    console.error("Erreur feedback:", err);
    return NextResponse.json({ error: "Erreur enregistrement feedback." }, { status: 500 });
  }
}

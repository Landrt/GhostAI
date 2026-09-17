import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updatePersonalityProfileSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    }

    let profile = await prisma.personalityProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      profile = await prisma.personalityProfile.create({
        data: {
          userId: session.user.id,
          directness: 0.7,
          storytelling: 0.5,
          formality: 0.4,
          humor: 0.3,
          technicality: 0.6,
          emotionalExpression: 0.4,
          opinionStrength: 0.65,
          vulnerability: 0.5,
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
    const parsed = updatePersonalityProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides." }, { status: 400 });
    }

    const profile = await prisma.personalityProfile.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        ...parsed.data,
      },
      update: parsed.data,
    });

    return NextResponse.json({ profile });
  } catch (err) {
    return NextResponse.json({ error: "Échec de mise à jour." }, { status: 500 });
  }
}

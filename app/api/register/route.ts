import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validation";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Données d'inscription invalides." },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Vérification existence utilisateur
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Un compte existe déjà avec cet email." },
        { status: 400 }
      );
    }

    // Hash sécurisé
    const passwordHash = await bcrypt.hash(password, 12);

    // Lecture du cookie de parrainage éventuel
    const { cookies } = await import("next/headers");
    const cookieStore = cookies();
    const refCode = cookieStore.get("ghostai_ref")?.value;
    let partnerIdToAssign: string | null = null;

    if (refCode) {
      const partner = await prisma.affiliate.findUnique({
        where: { code: refCode.trim().toLowerCase() },
        select: { id: true, email: true, isActive: true },
      });

      // Règle anti-auto-parrainage : interdiction si même email
      if (partner && partner.isActive && partner.email.toLowerCase() !== normalizedEmail) {
        partnerIdToAssign = partner.id;
      }
    }

    // Création de l'utilisateur avec son abonnement Free par défaut et attribution parrain
    const user = await prisma.$transaction(
      async (tx) => {
        const newUser = await tx.user.create({
          data: {
            email: normalizedEmail,
            passwordHash,
            referredByPartnerId: partnerIdToAssign,
            referredAt: partnerIdToAssign ? new Date() : null,
            subscription: {
              create: {
                plan: "free",
                status: "active",
                postsUsedThisMonth: 0,
                currentPeriodStart: new Date(),
              },
            },
          },
        });

        if (partnerIdToAssign) {
          await tx.affiliate.update({
            where: { id: partnerIdToAssign },
            data: { totalSignups: { increment: 1 } },
          });
        }

        return newUser;
      },
      { timeout: 25000, maxWait: 15000 }
    );

    return NextResponse.json(
      { success: true, userId: user.id },
      { status: 201 }
    );
  } catch (err) {
    console.error("Erreur register:", err);
    return NextResponse.json(
      { error: "Impossible de créer le compte pour le moment. Veuillez réessayer." },
      { status: 500 }
    );
  }
}

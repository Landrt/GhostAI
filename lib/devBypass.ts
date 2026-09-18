import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const DEV_USER_EMAIL = "dev@ghostai.local";

/**
 * Récupère ou crée automatiquement l'utilisateur développeur "SuperAdmin"
 * avec tous les privilèges débloqués (Admin, ProMax, Voix calibrée, Affilié actif).
 */
export async function getOrCreateDevUser() {
  const existingUser = await prisma.user.findUnique({
    where: { email: DEV_USER_EMAIL },
    include: {
      subscription: true,
      voiceProfile: true,
      affiliateProfile: true,
    },
  });

  if (existingUser) {
    // S'assurer qu'il a les privilèges Admin et non suspendu
    if (!existingUser.isAdmin || existingUser.isSuspended) {
      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          isAdmin: true,
          isSuspended: false,
          onboardingCompletedAt: existingUser.onboardingCompletedAt || new Date(),
        },
      });
    }

    // S'assurer que sa souscription est active sur le plan promax
    if (!existingUser.subscription) {
      await prisma.subscription.create({
        data: {
          userId: existingUser.id,
          plan: "promax",
          status: "active",
        },
      });
    } else if (existingUser.subscription.plan !== "promax") {
      await prisma.subscription.update({
        where: { id: existingUser.subscription.id },
        data: { plan: "promax", status: "active" },
      });
    }

    // S'assurer qu'il a un profil vocal configuré pour pouvoir générer immédiatement
    if (!existingUser.voiceProfile) {
      await prisma.voiceProfile.create({
        data: {
          userId: existingUser.id,
          styleExamples: [
            "La plupart des créateurs publient trop et pensent trop peu. Voici ce qui compte vraiment.",
            "Voici les 3 leviers qui changent la donne pour votre autorité LinkedIn.",
          ],
          directness: 0.9,
          storytelling: 0.7,
          formality: 0.4,
          completeness: 100,
          consistencyScore: 95,
        },
      });
    }

    // S'assurer qu'il a un profil affilié actif pour tester /app/partner
    if (!existingUser.affiliateProfile) {
      await prisma.affiliate.create({
        data: {
          userId: existingUser.id,
          code: "DEV",
          name: existingUser.name || "Dev SuperAdmin",
          email: existingUser.email,
          isActive: true,
          status: "active",
          isRevoked: false,
          strikesCount: 0,
        },
      });
    }

    return existingUser;
  }

  // Création initiale du compte Dev SuperAdmin
  const passwordHash = await bcrypt.hash("devpassword123", 10);

  const newUser = await prisma.user.create({
    data: {
      email: DEV_USER_EMAIL,
      name: "Dev SuperAdmin",
      passwordHash,
      isAdmin: true,
      onboardingCompletedAt: new Date(),
      subscription: {
        create: {
          plan: "promax",
          status: "active",
          postsUsedThisMonth: 0,
          repurposesUsedThisMonth: 0,
        },
      },
      voiceProfile: {
        create: {
          styleExamples: [
            "La plupart des créateurs publient trop et pensent trop peu. Voici ce qui compte vraiment.",
            "Voici les 3 leviers qui changent la donne pour votre autorité LinkedIn.",
          ],
          directness: 0.9,
          storytelling: 0.7,
          formality: 0.4,
          completeness: 100,
          consistencyScore: 95,
        },
      },
      personalityProfile: {
        create: {
          directness: 0.8,
          storytelling: 0.7,
          formality: 0.4,
        },
      },
      affiliateProfile: {
        create: {
          code: "DEV",
          name: "Dev SuperAdmin",
          email: DEV_USER_EMAIL,
          isActive: true,
          status: "active",
          isRevoked: false,
          strikesCount: 0,
        },
      },
    },
  });

  return newUser;
}

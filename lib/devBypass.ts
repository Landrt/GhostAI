import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const DEV_USER_EMAIL = "dev@ghostai.local";

/**
 * Récupère ou crée l'utilisateur développeur.
 * Note : En mode dev, l'utilisateur suit désormais le MÊME flow qu'un utilisateur réel :
 * - Plan Free par défaut (5 crédits de posts)
 * - Onboarding obligatoire à compléter (les 4 questions) pour tester le vrai calibrage de voix
 * - Droits Admin conservés pour accéder à la console superviseur si nécessaire.
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
        },
      });
    }

    // S'assurer que sa souscription existe (plan Free par défaut pour tester les quotas réels)
    if (!existingUser.subscription) {
      await prisma.subscription.create({
        data: {
          userId: existingUser.id,
          plan: "free",
          status: "active",
          postsUsedThisMonth: 0,
        },
      });
    }

    return existingUser;
  }

  // Création initiale du compte Dev : démarre avec Onboarding à faire et Plan Free
  const passwordHash = await bcrypt.hash("devpassword123", 10);

  const newUser = await prisma.user.create({
    data: {
      email: DEV_USER_EMAIL,
      name: "Dev Landry",
      passwordHash,
      isAdmin: true,
      onboardingCompletedAt: null, // Doit faire le vrai onboarding !
      subscription: {
        create: {
          plan: "free",
          status: "active",
          postsUsedThisMonth: 0,
          repurposesUsedThisMonth: 0,
        },
      },
    },
  });

  return newUser;
}

/**
 * Réinitialise complètement l'utilisateur développeur pour lui permettre
 * de re-tester le flow utilisateur de zéro (retour à l'Onboarding).
 */
export async function resetDevUserFlow() {
  const user = await prisma.user.findUnique({
    where: { email: DEV_USER_EMAIL },
  });

  if (!user) return null;

  await prisma.$transaction([
    prisma.voiceProfile.deleteMany({ where: { userId: user.id } }),
    prisma.personalityProfile.deleteMany({ where: { userId: user.id } }),
    prisma.subscription.upsert({
      where: { userId: user.id },
      create: { userId: user.id, plan: "free", status: "active", postsUsedThisMonth: 0 },
      update: { plan: "free", status: "active", postsUsedThisMonth: 0 },
    }),
    prisma.user.update({
      where: { id: user.id },
      data: { onboardingCompletedAt: null },
    }),
  ]);

  return true;
}


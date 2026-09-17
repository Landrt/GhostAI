import { prisma } from "@/lib/prisma";

export const REPURPOSE_PLAN_LIMITS: Record<string, number> = {
  free: 1,
  pro: 4,
  promax: 30,
};

export interface QuotaCheckResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  used: number;
  plan: string;
  subscriptionId: string;
}

/**
 * Vérifie le quota mensuel de repurposing pour l'utilisateur
 * Réinitialise automatiquement le compteur mensuel si le mois est écoulé.
 */
export async function checkRepurposeQuota(userId: string): Promise<QuotaCheckResult> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { subscription: true },
  });

  if (!user) {
    throw new Error("Utilisateur non trouvé.");
  }

  let subscription = user.subscription;

  if (!subscription) {
    subscription = await prisma.subscription.create({
      data: {
        userId,
        plan: "free",
        status: "active",
        postsUsedThisMonth: 0,
        repurposesUsedThisMonth: 0,
        currentPeriodStart: new Date(),
      },
    });
  } else {
    // Vérification du reset mensuel
    const now = new Date();
    const periodStart = new Date(subscription.currentPeriodStart);
    const oneMonthLater = new Date(periodStart);
    oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);

    if (now >= oneMonthLater) {
      subscription = await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          postsUsedThisMonth: 0,
          repurposesUsedThisMonth: 0,
          currentPeriodStart: now,
        },
      });
    }
  }

  const plan = subscription.plan.toLowerCase();
  const limit = REPURPOSE_PLAN_LIMITS[plan] ?? REPURPOSE_PLAN_LIMITS.free;
  const used = subscription.repurposesUsedThisMonth;
  const remaining = Math.max(0, limit - used);
  const allowed = used < limit;

  return {
    allowed,
    remaining,
    limit,
    used,
    plan,
    subscriptionId: subscription.id,
  };
}

/**
 * Incrémente le compteur d'utilisation après une atomisation réussie
 */
export async function incrementRepurposeUsage(subscriptionId: string): Promise<void> {
  await prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      repurposesUsedThisMonth: { increment: 1 },
    },
  });
}

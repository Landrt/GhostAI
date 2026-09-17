import { prisma } from "@/lib/prisma";

const RESERVED_SLUGS = new Set([
  "admin",
  "api",
  "app",
  "auth",
  "login",
  "register",
  "settings",
  "pricing",
  "dashboard",
  "partner",
  "checkout",
  "stripe",
  "terms",
  "privacy",
  "legal",
  "help",
  "support",
  "billing",
  "posts",
  "voice",
  "personality",
  "analytics",
  "create",
  "onboarding",
]);

/**
 * Nettoie une chaîne pour en faire un slug sûr.
 */
function cleanSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // supprime les accents
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Récupère ou active le profil partenaire d'un utilisateur (onboarding 1-clic).
 */
export async function getOrCreatePartner(userId: string) {
  const existing = await prisma.affiliate.findUnique({
    where: { userId },
  });

  if (existing) {
    return existing;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true },
  });

  if (!user) {
    throw new Error("Utilisateur introuvable");
  }

  // Génération automatique d'un slug de base
  const baseCandidate = cleanSlug(user.name || user.email.split("@")[0] || "partner");
  let candidate = baseCandidate.length >= 3 ? baseCandidate : `partner-${user.id.slice(-4).toLowerCase()}`;
  if (RESERVED_SLUGS.has(candidate)) {
    candidate = `${candidate}-${user.id.slice(-4).toLowerCase()}`;
  }

  // Gestion des collisions de slug
  let counter = 1;
  let finalSlug = candidate;
  while (true) {
    const slugTaken = await prisma.affiliate.findUnique({
      where: { code: finalSlug },
    });
    if (!slugTaken) break;
    counter++;
    finalSlug = `${candidate}-${counter}`;
  }

  return await prisma.affiliate.create({
    data: {
      userId: user.id,
      code: finalSlug,
      name: user.name || user.email.split("@")[0] || "Partenaire",
      email: user.email,
      commissionRate: 30.0,
      availableBalance: 0.0,
      pendingDebt: 0.0,
      payoutMethod: "mobile_money",
      payoutDetails: {},
      codeModified: false,
      isActive: true,
      status: "active",
    },
  });
}

/**
 * Évaluation Paresseuse (Lazy Evaluation) sans cron :
 * Débloque les commissions arrivées à échéance (> 30 jours),
 * apure la dette en cours (pendingDebt) en priorité, et crédite le solde disponible.
 */
export async function processMaturedCommissions(affiliateId: string) {
  const now = new Date();

  // 1. Trouver les commissions arrivées à échéance
  const maturedCommissions = await prisma.affiliateCommission.findMany({
    where: {
      affiliateId,
      status: "pending",
      releaseAt: { lte: now },
    },
    select: { id: true, commissionAmount: true },
  });

  if (maturedCommissions.length === 0) {
    return;
  }

  const matureIds = maturedCommissions.map((c) => c.id);
  const totalMatured = maturedCommissions.reduce((sum, c) => sum + Number(c.commissionAmount), 0);

  // 2. Traitement transactionnel du déblocage et apurement de la dette
  await prisma.$transaction(async (tx) => {
    // Basculer les commissions échues en 'available'
    await tx.affiliateCommission.updateMany({
      where: { id: { in: matureIds } },
      data: { status: "available" },
    });

    const affiliate = await tx.affiliate.findUnique({
      where: { id: affiliateId },
      select: { availableBalance: true, pendingDebt: true },
    });

    if (!affiliate) return;

    let currentBalance = Number(affiliate.availableBalance || 0);
    let debt = Number(affiliate.pendingDebt || 0);
    let remainingAfterDebt = totalMatured;

    if (debt > 0) {
      if (remainingAfterDebt >= debt) {
        remainingAfterDebt -= debt;
        debt = 0;
      } else {
        debt -= remainingAfterDebt;
        remainingAfterDebt = 0;
      }
    }

    const newBalance = Math.round((currentBalance + remainingAfterDebt) * 100) / 100;
    const newDebt = Math.round(debt * 100) / 100;

    await tx.affiliate.update({
      where: { id: affiliateId },
      data: {
        availableBalance: newBalance,
        pendingDebt: newDebt,
      },
    });
  });
}

/**
 * Personnalisation unique du slug partenaire.
 */
export async function customizeSlug(partnerId: string, rawSlug: string) {
  const affiliate = await prisma.affiliate.findUnique({
    where: { id: partnerId },
  });

  if (!affiliate) {
    throw new Error("Profil partenaire introuvable");
  }

  if (affiliate.codeModified) {
    throw new Error("Vous avez déjà personnalisé votre code partenaire (1 seule modification autorisée).");
  }

  const newSlug = rawSlug.trim().toLowerCase();

  // Validation regex : minuscules, chiffres, tirets, entre 3 et 30 caractères
  const slugRegex = /^[a-z0-9-]{3,30}$/;
  if (!slugRegex.test(newSlug)) {
    throw new Error("Le code doit contenir entre 3 et 30 caractères alphanumériques (lettres minuscules, chiffres et tirets uniquement).");
  }

  if (RESERVED_SLUGS.has(newSlug)) {
    throw new Error("Ce code est réservé par le système. Veuillez en choisir un autre.");
  }

  const exists = await prisma.affiliate.findUnique({
    where: { code: newSlug },
  });

  if (exists && exists.id !== partnerId) {
    throw new Error("Ce code est déjà utilisé par un autre partenaire.");
  }

  return await prisma.affiliate.update({
    where: { id: partnerId },
    data: {
      code: newSlug,
      codeModified: true,
    },
  });
}

/**
 * Soumission d'une demande de retrait (Seuil minimum : 20$).
 */
export async function requestPayout(
  partnerId: string,
  amount: number,
  payoutMethod: "mobile_money" | "bank",
  accountDetails: any
) {
  if (amount < 20) {
    throw new Error("Le seuil minimum de retrait est de 20,00 $.");
  }

  return await prisma.$transaction(async (tx) => {
    const affiliate = await tx.affiliate.findUnique({
      where: { id: partnerId },
      select: { id: true, availableBalance: true, pendingPayout: true, isActive: true },
    });

    if (!affiliate) {
      throw new Error("Partenaire introuvable");
    }

    if (!affiliate.isActive) {
      throw new Error("Votre compte partenaire est suspendu. Veuillez contacter le support.");
    }

    if (affiliate.availableBalance < amount) {
      throw new Error("Solde disponible insuffisant pour effectuer ce retrait.");
    }

    const reference = `PAY-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // Déduction atomique sécurisée
    await tx.affiliate.update({
      where: { id: partnerId },
      data: {
        availableBalance: { decrement: amount },
        pendingPayout: { increment: amount },
      },
    });

    const payout = await tx.affiliatePayout.create({
      data: {
        affiliateId: partnerId,
        amount,
        currency: "USD",
        reference,
        status: "pending",
        payoutMethod,
        accountDetails: accountDetails || {},
      },
    });

    return payout;
  });
}

/**
 * Attribution d'une commission (30% à vie, gel 30 jours, idempotence sur txRef).
 */
export async function recordCommission(
  payerUserId: string,
  txRef: string,
  orderAmount: number,
  currency: string = "USD",
  details: any = {}
) {
  // Idempotence : ignorer si déjà enregistrée
  const existingComm = await prisma.affiliateCommission.findUnique({
    where: { txRef },
  });
  if (existingComm) {
    return existingComm;
  }

  // Recherche du parrain
  const payer = await prisma.user.findUnique({
    where: { id: payerUserId },
    select: { id: true, email: true, referredByPartnerId: true },
  });

  if (!payer || !payer.referredByPartnerId) {
    return null;
  }

  const partner = await prisma.affiliate.findUnique({
    where: { id: payer.referredByPartnerId },
    select: { id: true, userId: true, email: true, commissionRate: true, isActive: true },
  });

  if (!partner || !partner.isActive) {
    return null;
  }

  // Règle anti-auto-parrainage
  if (partner.userId === payer.id || partner.email.toLowerCase() === payer.email.toLowerCase()) {
    return null;
  }

  const rate = partner.commissionRate || 30.0;
  const commissionAmount = Math.round(((orderAmount * rate) / 100) * 100) / 100;
  const releaseAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 jours

  return await prisma.$transaction(async (tx) => {
    const commission = await tx.affiliateCommission.create({
      data: {
        affiliateId: partner.id,
        payerUserId,
        txRef,
        orderAmount,
        commissionRate: rate,
        commissionAmount,
        currency,
        status: "pending",
        releaseAt,
        details: details || {},
      },
    });

    await tx.affiliate.update({
      where: { id: partner.id },
      data: {
        totalEarned: { increment: commissionAmount },
        totalConversions: { increment: 1 },
      },
    });

    return commission;
  });
}

/**
 * Gestion des litiges et remboursements (Protection anti-solde négatif).
 */
export async function handleRefund(txRef: string) {
  const commission = await prisma.affiliateCommission.findUnique({
    where: { txRef },
    include: { affiliate: true },
  });

  if (!commission || commission.status === "canceled") {
    return;
  }

  const { affiliate, commissionAmount, status } = commission;

  await prisma.$transaction(async (tx) => {
    if (status === "pending") {
      // 1. Si encore gelée : annulation directe sans toucher au solde disponible
      await tx.affiliateCommission.update({
        where: { id: commission.id },
        data: { status: "canceled" },
      });

      await tx.affiliate.update({
        where: { id: affiliate.id },
        data: {
          totalEarned: { decrement: commissionAmount },
        },
      });
    } else if (status === "available" || status === "paid") {
      // 2. Si déjà débloquée : débit plafonné à 0, le surplus est versé dans pendingDebt
      const available = Number(affiliate.availableBalance || 0);

      if (available >= commissionAmount) {
        await tx.affiliate.update({
          where: { id: affiliate.id },
          data: {
            availableBalance: { decrement: commissionAmount },
          },
        });
      } else {
        const deficit = Math.round((commissionAmount - available) * 100) / 100;
        await tx.affiliate.update({
          where: { id: affiliate.id },
          data: {
            availableBalance: 0,
            pendingDebt: { increment: deficit },
          },
        });
      }

      await tx.affiliateCommission.update({
        where: { id: commission.id },
        data: { status: "canceled" },
      });
    }
  });
}

/**
 * Mise à jour des coordonnées de retrait par défaut.
 */
export async function updatePayoutDetails(
  partnerId: string,
  payoutMethod: "mobile_money" | "bank",
  payoutDetails: any
) {
  return await prisma.affiliate.update({
    where: { id: partnerId },
    data: {
      payoutMethod,
      payoutDetails: payoutDetails || {},
    },
  });
}

/**
 * Récupère l'intégralité des données du dashboard partenaire.
 */
export async function getPartnerDashboardData(userId: string) {
  const partner = await getOrCreatePartner(userId);

  // Exécution de l'évaluation paresseuse à chaque consultation
  await processMaturedCommissions(partner.id);

  // Re-lecture des données fraîches
  const freshPartner = await prisma.affiliate.findUnique({
    where: { id: partner.id },
    include: {
      commissions: {
        orderBy: { createdAt: "desc" },
        take: 50,
      },
      payouts: {
        orderBy: { createdAt: "desc" },
        take: 50,
      },
    },
  });

  if (!freshPartner) {
    throw new Error("Partenaire introuvable");
  }

  // Calcul du montant en cours de gel
  const pendingCommissions = await prisma.affiliateCommission.findMany({
    where: {
      affiliateId: freshPartner.id,
      status: "pending",
    },
    select: { commissionAmount: true, releaseAt: true },
    orderBy: { releaseAt: "asc" },
  });

  const pendingFreeze = pendingCommissions.reduce((sum, c) => sum + Number(c.commissionAmount), 0);
  const nextReleaseDate = pendingCommissions[0]?.releaseAt || null;

  // Calcul des clics sur les 7 derniers jours vs les 7 jours précédents
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const clicksLast7Days = await prisma.affiliateClick.count({
    where: {
      affiliateId: freshPartner.id,
      createdAt: { gte: sevenDaysAgo },
    },
  });

  const clicksPrev7Days = await prisma.affiliateClick.count({
    where: {
      affiliateId: freshPartner.id,
      createdAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo },
    },
  });

  const conversionRate =
    freshPartner.totalSignups > 0
      ? Math.round((freshPartner.totalConversions / freshPartner.totalSignups) * 1000) / 10
      : 0;

  return {
    partner: {
      id: freshPartner.id,
      code: freshPartner.code,
      name: freshPartner.name,
      email: freshPartner.email,
      commissionRate: freshPartner.commissionRate,
      availableBalance: freshPartner.availableBalance,
      pendingDebt: freshPartner.pendingDebt,
      payoutMethod: freshPartner.payoutMethod,
      payoutDetails: freshPartner.payoutDetails,
      codeModified: freshPartner.codeModified,
      isActive: freshPartner.isActive,
      status: freshPartner.status,
      totalClicks: freshPartner.totalClicks,
      totalSignups: freshPartner.totalSignups,
      totalConversions: freshPartner.totalConversions,
      totalEarned: freshPartner.totalEarned,
      pendingPayout: freshPartner.pendingPayout,
      createdAt: freshPartner.createdAt,
    },
    metrics: {
      totalEarned: freshPartner.totalEarned,
      pendingFreeze,
      nextReleaseDate,
      availableBalance: freshPartner.availableBalance,
      pendingDebt: freshPartner.pendingDebt,
      clicksLast7Days,
      clicksPrev7Days,
      totalSignups: freshPartner.totalSignups,
      totalConversions: freshPartner.totalConversions,
      conversionRate,
    },
    commissions: freshPartner.commissions,
    payouts: freshPartner.payouts,
  };
}

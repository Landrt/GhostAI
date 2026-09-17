import { prisma } from "@/lib/prisma";

export async function checkAdminAccess(user?: { id?: string; email?: string | null } | null): Promise<{
  isAdmin: boolean;
  email?: string;
  id?: string;
}> {
  if (!user || !user.email) {
    // Si nous sommes en local et qu'aucun utilisateur n'est fourni
    if (process.env.NODE_ENV !== "production") {
      const firstAdmin = await prisma.user.findFirst({
        where: { isAdmin: true },
        select: { id: true, email: true },
      });
      if (firstAdmin) {
        return { isAdmin: true, email: firstAdmin.email, id: firstAdmin.id };
      }
    }
    return { isAdmin: false };
  }

  const rawAdminEmails = process.env.ADMIN_EMAILS || "admin@ghostai.com,landry@ghostai.com";
  const adminEmails = rawAdminEmails
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  const emailLower = user.email.toLowerCase();

  // 1. Vérification par liste blanche d'emails
  if (adminEmails.includes(emailLower)) {
    return { isAdmin: true, email: user.email, id: user.id };
  }

  // 2. Vérification par attribut booléen isAdmin en base de données
  if (user.id) {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { isAdmin: true, email: true },
    });

    if (dbUser?.isAdmin) {
      return { isAdmin: true, email: dbUser.email, id: user.id };
    }
  }

  // 3. Secours en développement : si le premier utilisateur connecté se trouve en dev
  if (process.env.NODE_ENV !== "production") {
    const adminCount = await prisma.user.count({ where: { isAdmin: true } });
    if (adminCount === 0 && user.id) {
      // Auto-promotion du premier utilisateur de dev
      await prisma.user.update({
        where: { id: user.id },
        data: { isAdmin: true },
      });
      return { isAdmin: true, email: user.email, id: user.id };
    }
  }

  return { isAdmin: false };
}

export async function recordAuditLog(params: {
  adminEmail: string;
  action: string;
  targetUserId?: string;
  details?: any;
  ipAddress?: string;
  severity?: "info" | "warning" | "critical";
}) {
  try {
    return await prisma.adminAuditLog.create({
      data: {
        adminEmail: params.adminEmail,
        action: params.action,
        targetUserId: params.targetUserId,
        details: params.details || {},
        ipAddress: params.ipAddress,
        severity: params.severity || "info",
      },
    });
  } catch (err) {
    console.error("Erreur enregistrement audit log:", err);
    return null;
  }
}

export async function getAdminOverview() {
  const [
    totalUsers,
    activeAffiliates,
    subscriptions,
    auditLogs,
    commissions,
    pricingConfig,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.affiliate.count({ where: { isActive: true } }),
    prisma.subscription.findMany({
      select: { plan: true, status: true },
    }),
    prisma.adminAuditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.affiliateCommission.findMany({
      where: { status: { in: ["available", "paid"] } },
      select: { commissionAmount: true },
    }),
    getAdminPricingConfig(),
  ]);

  // Calcul du MRR estimé
  const proCount = subscriptions.filter((s) => s.plan === "pro" && s.status === "active").length;
  const promaxCount = subscriptions.filter((s) => s.plan === "promax" && s.status === "active").length;
  const proPrice = pricingConfig.monthlyPrice || 29;
  const promaxPrice = 79; // ou formule promax
  const estimatedMrr = proCount * proPrice + promaxCount * promaxPrice;

  // Calcul du taux de conversion
  const paidUsersCount = proCount + promaxCount;
  const conversionRate = totalUsers > 0 ? Math.round((paidUsersCount / totalUsers) * 1000) / 10 : 0;

  // Total des commissions versées/disponibles
  const totalCommissions = commissions.reduce((sum, c) => sum + Number(c.commissionAmount), 0);

  // Génération des points de revenus sur 30 jours (courbe SVG native)
  const chartData = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const day = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateLabel = day.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
    // Calcul ou projection basée sur les commissions et abonnements
    const baseRev = Math.round(estimatedMrr / 30);
    // Légère variation réaliste pour la démo
    const variation = Math.sin(i * 0.7) * (baseRev * 0.25);
    const dayRevenue = Math.max(0, Math.round(baseRev + variation));
    chartData.push({ date: dateLabel, revenue: dayRevenue });
  }

  return {
    kpis: {
      mrr: estimatedMrr,
      totalUsers,
      paidUsers: paidUsersCount,
      conversionRate,
      activeAffiliates,
      totalCommissions: Math.round(totalCommissions * 100) / 100,
    },
    chartData,
    auditLogs,
  };
}

export async function getAdminPricingConfig() {
  let config = await prisma.adminPricingConfig.findUnique({
    where: { id: "default" },
  });

  if (!config) {
    config = await prisma.adminPricingConfig.create({
      data: {
        id: "default",
        sprintPrice: 13.0,
        monthlyPrice: 29.0,
        lifetimePrice: 99.0,
        founderQuotaTotal: 200,
        founderQuotaUsed: 0,
      },
    });
  }

  return config;
}

export async function updateAdminPricingConfig(data: {
  sprintPrice?: number;
  monthlyPrice?: number;
  lifetimePrice?: number;
  founderQuotaTotal?: number;
  founderQuotaUsed?: number;
}) {
  return await prisma.adminPricingConfig.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      sprintPrice: data.sprintPrice ?? 13.0,
      monthlyPrice: data.monthlyPrice ?? 29.0,
      lifetimePrice: data.lifetimePrice ?? 99.0,
      founderQuotaTotal: data.founderQuotaTotal ?? 200,
      founderQuotaUsed: data.founderQuotaUsed ?? 0,
    },
    update: data,
  });
}

export async function getAdminSystemConfig() {
  let config = await prisma.adminSystemConfig.findUnique({
    where: { id: "default" },
  });

  if (!config) {
    config = await prisma.adminSystemConfig.create({
      data: {
        id: "default",
        rateLimitCapacity: 80,
        rateLimitDurationHours: 5,
        rateLimitEnabled: true,
      },
    });
  }

  return config;
}

export async function updateAdminSystemConfig(data: {
  rateLimitCapacity?: number;
  rateLimitDurationHours?: number;
  rateLimitEnabled?: boolean;
}) {
  return await prisma.adminSystemConfig.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      rateLimitCapacity: data.rateLimitCapacity ?? 80,
      rateLimitDurationHours: data.rateLimitDurationHours ?? 5,
      rateLimitEnabled: data.rateLimitEnabled ?? true,
    },
    update: data,
  });
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  checkAdminAccess,
  getAdminPricingConfig,
  updateAdminPricingConfig,
  recordAuditLog,
} from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  const access = await checkAdminAccess(session?.user);

  if (!access.isAdmin) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  try {
    const config = await getAdminPricingConfig();

    // Abonnements expirant sous 72h
    const in72h = new Date(Date.now() + 72 * 60 * 60 * 1000);
    const expiringSoon = await prisma.subscription.findMany({
      where: {
        status: "active",
        renewalDate: {
          lte: in72h,
          gte: new Date(),
        },
      },
      include: {
        user: { select: { id: true, email: true, name: true } },
      },
      take: 20,
    });

    return NextResponse.json({ config, expiringSoon });
  } catch (err: any) {
    console.error("Erreur GET /api/admin/subscriptions:", err);
    return NextResponse.json({ error: err.message || "Erreur serveur" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  const access = await checkAdminAccess(session?.user);

  if (!access.isAdmin) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  try {
    const body = await req.json();

    if (body.action === "update_pricing") {
      const updated = await updateAdminPricingConfig({
        sprintPrice: body.sprintPrice,
        monthlyPrice: body.monthlyPrice,
        lifetimePrice: body.lifetimePrice,
        founderQuotaTotal: body.founderQuotaTotal,
        founderQuotaUsed: body.founderQuotaUsed,
      });

      await recordAuditLog({
        adminEmail: access.email || "admin",
        action: "PRICING_CONFIG_UPDATED",
        severity: "warning",
        details: body,
      });

      return NextResponse.json({ success: true, config: updated });
    }

    if (body.action === "extend_subscription") {
      const { subscriptionId } = body;
      const sub = await prisma.subscription.findUnique({
        where: { id: subscriptionId },
      });

      if (!sub) {
        return NextResponse.json({ error: "Abonnement introuvable" }, { status: 404 });
      }

      const currentRenewal = sub.renewalDate || new Date();
      const extendedRenewal = new Date(currentRenewal.getTime() + 7 * 24 * 60 * 60 * 1000);

      await prisma.subscription.update({
        where: { id: subscriptionId },
        data: { renewalDate: extendedRenewal },
      });

      await recordAuditLog({
        adminEmail: access.email || "admin",
        action: "SUBSCRIPTION_EXTENDED_7D",
        targetUserId: sub.userId,
        severity: "info",
        details: { subscriptionId, extendedTo: extendedRenewal.toISOString() },
      });

      return NextResponse.json({ success: true, renewalDate: extendedRenewal });
    }

    return NextResponse.json({ error: "Action non supportée" }, { status: 400 });
  } catch (err: any) {
    console.error("Erreur PATCH /api/admin/subscriptions:", err);
    return NextResponse.json({ error: err.message || "Erreur serveur" }, { status: 500 });
  }
}

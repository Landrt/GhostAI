import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { checkAdminAccess, recordAuditLog } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  const access = await checkAdminAccess(session?.user);

  if (!access.isAdmin) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  try {
    const affiliates = await prisma.affiliate.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { clicks: true, referrals: true, commissions: true, payouts: true },
        },
      },
    });

    const pendingPayouts = await prisma.affiliatePayout.findMany({
      where: { status: "pending" },
      orderBy: { createdAt: "desc" },
      include: {
        affiliate: {
          select: { id: true, code: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json({ affiliates, pendingPayouts });
  } catch (err: any) {
    console.error("Erreur GET /api/admin/affiliates:", err);
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
    const { action } = body;

    // 1. Suspension / Réactivation d'un partenaire
    if (action === "toggle_partner_status") {
      const { affiliateId, isActive } = body;
      const updated = await prisma.affiliate.update({
        where: { id: affiliateId },
        data: { isActive, status: isActive ? "active" : "paused" },
      });

      await recordAuditLog({
        adminEmail: access.email || "admin",
        action: isActive ? "PARTNER_REACTIVATED" : "PARTNER_SUSPENDED",
        severity: isActive ? "info" : "warning",
        details: { affiliateId, code: updated.code },
      });

      return NextResponse.json({ success: true, affiliate: updated });
    }

    // 2. Traitement d'une demande de retrait (Valider ou Rejeter)
    if (action === "moderate_payout") {
      const { payoutId, decision } = body; // 'approve' | 'reject'

      const payout = await prisma.affiliatePayout.findUnique({
        where: { id: payoutId },
        include: { affiliate: true },
      });

      if (!payout) {
        return NextResponse.json({ error: "Demande de retrait introuvable" }, { status: 404 });
      }

      if (decision === "approve") {
        await prisma.$transaction([
          prisma.affiliatePayout.update({
            where: { id: payoutId },
            data: { status: "successful" },
          }),
          prisma.affiliate.update({
            where: { id: payout.affiliateId },
            data: { pendingPayout: { decrement: payout.amount } },
          }),
        ]);

        await recordAuditLog({
          adminEmail: access.email || "admin",
          action: "PAYOUT_APPROVED",
          severity: "info",
          details: { payoutId, amount: payout.amount, affiliateCode: payout.affiliate.code },
        });

        return NextResponse.json({ success: true, status: "successful" });
      }

      if (decision === "reject") {
        // En cas de rejet : remboursement du solde débité
        await prisma.$transaction([
          prisma.affiliatePayout.update({
            where: { id: payoutId },
            data: { status: "failed" },
          }),
          prisma.affiliate.update({
            where: { id: payout.affiliateId },
            data: {
              availableBalance: { increment: payout.amount },
              pendingPayout: { decrement: payout.amount },
            },
          }),
        ]);

        await recordAuditLog({
          adminEmail: access.email || "admin",
          action: "PAYOUT_REJECTED",
          severity: "warning",
          details: { payoutId, amount: payout.amount, affiliateCode: payout.affiliate.code },
        });

        return NextResponse.json({ success: true, status: "failed" });
      }
    }

    return NextResponse.json({ error: "Action non supportée" }, { status: 400 });
  } catch (err: any) {
    console.error("Erreur PATCH /api/admin/affiliates:", err);
    return NextResponse.json({ error: err.message || "Erreur serveur" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { checkAdminAccess, recordAuditLog } from "@/lib/admin";
import { recordCommission } from "@/lib/partner";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  const access = await checkAdminAccess(session?.user);

  if (!access.isAdmin) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  try {
    const commissions = await prisma.affiliateCommission.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        affiliate: {
          select: { code: true, name: true, email: true },
        },
      },
    });

    const payouts = await prisma.affiliatePayout.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        affiliate: {
          select: { code: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json({ commissions, payouts });
  } catch (err: any) {
    console.error("Erreur GET /api/admin/payments:", err);
    return NextResponse.json({ error: err.message || "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  const access = await checkAdminAccess(session?.user);

  if (!access.isAdmin) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { action } = body;

    if (action === "simulate_payment") {
      const { payerEmail, amount, currency } = body;

      const payer = await prisma.user.findUnique({
        where: { email: payerEmail.toLowerCase().trim() },
        select: { id: true, email: true, referredByPartnerId: true },
      });

      if (!payer) {
        return NextResponse.json({ error: "Utilisateur payeur introuvable" }, { status: 404 });
      }

      const txRef = `SIM-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      const comm = await recordCommission(
        payer.id,
        txRef,
        Number(amount) || 29,
        currency || "USD",
        { simulatedBy: access.email, note: "Paiement simulé depuis la console admin" }
      );

      await recordAuditLog({
        adminEmail: access.email || "admin",
        action: "PAYMENT_SIMULATED",
        targetUserId: payer.id,
        severity: "info",
        details: { txRef, amount, payerEmail },
      });

      return NextResponse.json({ success: true, txRef, commission: comm });
    }

    return NextResponse.json({ error: "Action non supportée" }, { status: 400 });
  } catch (err: any) {
    console.error("Erreur POST /api/admin/payments:", err);
    return NextResponse.json({ error: err.message || "Erreur serveur" }, { status: 500 });
  }
}

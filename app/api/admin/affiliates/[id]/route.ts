import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { checkAdminAccess, recordAuditLog } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { getWeekKey, REQUIRED_WEEKLY_VIDEOS, MAX_STRIKES } from "@/lib/partner";

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/admin/affiliates/[id]
 * Récupère le profil détaillé d'un affilié, ses stats hebdo et toutes ses vidéos.
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  const access = await checkAdminAccess(session?.user);

  if (!access.isAdmin) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { id } = params;

  try {
    const affiliate = await prisma.affiliate.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true, createdAt: true },
        },
        videos: {
          orderBy: { submittedAt: "desc" },
        },
        commissions: {
          orderBy: { createdAt: "desc" },
          take: 50,
        },
        payouts: {
          orderBy: { createdAt: "desc" },
          take: 30,
        },
        _count: {
          select: {
            clicks: true,
            referrals: true,
            commissions: true,
            payouts: true,
            videos: true,
          },
        },
      },
    });

    if (!affiliate) {
      return NextResponse.json({ error: "Affilié introuvable" }, { status: 404 });
    }

    // Statistiques de la semaine en cours
    const currentWeek = getWeekKey();
    const currentWeekVideos = affiliate.videos.filter(
      (v) => v.weekKey === currentWeek.weekKey
    );

    const weekClicks = await prisma.affiliateClick.count({
      where: {
        affiliateId: id,
        createdAt: {
          gte: currentWeek.startOfWeek,
          lte: currentWeek.endOfWeek,
        },
      },
    });

    const weekSignups = await prisma.user.count({
      where: {
        referredByPartnerId: id,
        createdAt: {
          gte: currentWeek.startOfWeek,
          lte: currentWeek.endOfWeek,
        },
      },
    });

    const weekCommissions = await prisma.affiliateCommission.aggregate({
      where: {
        affiliateId: id,
        createdAt: {
          gte: currentWeek.startOfWeek,
          lte: currentWeek.endOfWeek,
        },
      },
      _sum: {
        commissionAmount: true,
      },
      _count: true,
    });

    return NextResponse.json({
      affiliate,
      currentWeek: {
        weekKey: currentWeek.weekKey,
        year: currentWeek.year,
        weekNumber: currentWeek.weekNumber,
        startOfWeek: currentWeek.startOfWeek,
        endOfWeek: currentWeek.endOfWeek,
        videosCount: currentWeekVideos.length,
        requiredVideos: REQUIRED_WEEKLY_VIDEOS,
        isCompleted: currentWeekVideos.length >= REQUIRED_WEEKLY_VIDEOS,
        clicks: weekClicks,
        signups: weekSignups,
        salesCount: weekCommissions._count,
        salesAmount: weekCommissions._sum.commissionAmount || 0,
      },
      rules: {
        requiredWeeklyVideos: REQUIRED_WEEKLY_VIDEOS,
        maxStrikes: MAX_STRIKES,
      },
    });
  } catch (err: any) {
    console.error(`Erreur GET /api/admin/affiliates/${id}:`, err);
    return NextResponse.json({ error: err.message || "Erreur serveur" }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/affiliates/[id]
 * Ajuste les strikes ou le statut de révocation de l'affilié.
 */
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  const access = await checkAdminAccess(session?.user);

  if (!access.isAdmin) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { id } = params;

  try {
    const body = await req.json();
    const { action } = body;

    const affiliate = await prisma.affiliate.findUnique({
      where: { id },
      select: { id: true, userId: true, code: true, name: true, strikesCount: true },
    });

    if (!affiliate) {
      return NextResponse.json({ error: "Affilié introuvable" }, { status: 404 });
    }

    if (action === "set_strikes") {
      const strikesCount = Math.max(0, Math.min(MAX_STRIKES, Number(body.strikesCount) || 0));
      const shouldRevoke = strikesCount >= MAX_STRIKES;

      const updated = await prisma.affiliate.update({
        where: { id },
        data: {
          strikesCount,
          isRevoked: shouldRevoke,
          status: shouldRevoke ? "revoked" : "active",
          isActive: !shouldRevoke,
          revokedAt: shouldRevoke ? new Date() : null,
        },
      });

      await recordAuditLog({
        adminEmail: session?.user?.email || "admin",
        action: "update_affiliate_strikes",
        targetUserId: affiliate.userId,
        details: { affiliateCode: affiliate.code, previousStrikes: affiliate.strikesCount, newStrikes: strikesCount, isRevoked: shouldRevoke },
      });

      return NextResponse.json({ success: true, affiliate: updated });
    }

    if (action === "revoke") {
      const updated = await prisma.$transaction(async (tx) => {
        const aff = await tx.affiliate.update({
          where: { id },
          data: {
            isRevoked: true,
            status: "revoked",
            isActive: false,
            strikesCount: MAX_STRIKES,
            revokedAt: new Date(),
          },
        });

        // Annuler les commissions en attente
        await tx.affiliateCommission.updateMany({
          where: { affiliateId: id, status: "pending" },
          data: { status: "canceled" },
        });

        return aff;
      });

      await recordAuditLog({
        adminEmail: session?.user?.email || "admin",
        action: "revoke_affiliate",
        targetUserId: affiliate.userId,
        details: { affiliateCode: affiliate.code, reason: body.reason || "Décision administrateur" },
      });

      return NextResponse.json({ success: true, affiliate: updated });
    }

    if (action === "reinstate") {
      const updated = await prisma.affiliate.update({
        where: { id },
        data: {
          isRevoked: false,
          status: "active",
          isActive: true,
          strikesCount: 0,
          revokedAt: null,
        },
      });

      await recordAuditLog({
        adminEmail: session?.user?.email || "admin",
        action: "reinstate_affiliate",
        targetUserId: affiliate.userId,
        details: { affiliateCode: affiliate.code, resetStrikes: true },
      });

      return NextResponse.json({ success: true, affiliate: updated });
    }

    return NextResponse.json({ error: "Action non reconnue" }, { status: 400 });
  } catch (err: any) {
    console.error(`Erreur PATCH /api/admin/affiliates/${id}:`, err);
    return NextResponse.json({ error: err.message || "Erreur serveur" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/affiliates/[id]
 * Supprime définitivement le profil affilié.
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  const access = await checkAdminAccess(session?.user);

  if (!access.isAdmin) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { id } = params;

  try {
    const affiliate = await prisma.affiliate.findUnique({
      where: { id },
      select: { id: true, userId: true, code: true, name: true, email: true },
    });

    if (!affiliate) {
      return NextResponse.json({ error: "Affilié introuvable" }, { status: 404 });
    }

    // Dissocier les utilisateurs parrainés pour ne pas violer les contraintes de clés
    await prisma.user.updateMany({
      where: { referredByPartnerId: id },
      data: { referredByPartnerId: null },
    });

    // Supprimer l'affilié (cascade supprimera clicks, commissions, payouts, videos)
    await prisma.affiliate.delete({
      where: { id },
    });

    await recordAuditLog({
      adminEmail: session?.user?.email || "admin",
      action: "delete_affiliate",
      targetUserId: affiliate.userId,
      details: { affiliateCode: affiliate.code, deletedEmail: affiliate.email, name: affiliate.name },
    });

    return NextResponse.json({ success: true, message: `L'affilié ${affiliate.name} (?ref=${affiliate.code}) a été supprimé.` });
  } catch (err: any) {
    console.error(`Erreur DELETE /api/admin/affiliates/${id}:`, err);
    return NextResponse.json({ error: err.message || "Erreur lors de la suppression de l'affilié" }, { status: 500 });
  }
}

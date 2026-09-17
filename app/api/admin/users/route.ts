import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { checkAdminAccess, recordAuditLog } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await auth();
  const access = await checkAdminAccess(session?.user);

  if (!access.isAdmin) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const plan = searchParams.get("plan") || "all";
  const status = searchParams.get("status") || "all";

  const where: any = {};

  if (search) {
    where.OR = [
      { email: { contains: search, mode: "insensitive" } },
      { name: { contains: search, mode: "insensitive" } },
    ];
  }

  if (status === "suspended") {
    where.isSuspended = true;
  } else if (status === "active") {
    where.isSuspended = false;
  }

  if (plan !== "all") {
    where.subscription = { plan };
  }

  try {
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        isAdmin: true,
        isSuspended: true,
        createdAt: true,
        referredAt: true,
        referredByPartner: {
          select: { id: true, code: true, name: true },
        },
        subscription: {
          select: {
            plan: true,
            status: true,
            postsUsedThisMonth: true,
            renewalDate: true,
          },
        },
        _count: {
          select: { posts: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ users });
  } catch (err: any) {
    console.error("Erreur GET /api/admin/users:", err);
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
    const { userId, action, value } = body;

    if (!userId) {
      return NextResponse.json({ error: "Identifiant utilisateur manquant" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    if (action === "toggle_suspend") {
      const isSuspended = Boolean(value);
      await prisma.user.update({
        where: { id: userId },
        data: { isSuspended },
      });

      await recordAuditLog({
        adminEmail: access.email || "admin",
        action: isSuspended ? "USER_SUSPENDED" : "USER_REACTIVATED",
        targetUserId: userId,
        severity: isSuspended ? "warning" : "info",
        details: { targetEmail: user.email },
      });

      return NextResponse.json({ success: true, isSuspended });
    }

    if (action === "change_plan") {
      const plan = String(value); // 'free' | 'pro' | 'promax'
      await prisma.subscription.upsert({
        where: { userId },
        create: {
          userId,
          plan,
          status: "active",
        },
        update: {
          plan,
          status: "active",
        },
      });

      await recordAuditLog({
        adminEmail: access.email || "admin",
        action: "FORCE_PLAN_UPGRADE",
        targetUserId: userId,
        severity: "warning",
        details: { targetEmail: user.email, newPlan: plan },
      });

      return NextResponse.json({ success: true, plan });
    }

    if (action === "toggle_admin") {
      const isAdmin = Boolean(value);
      await prisma.user.update({
        where: { id: userId },
        data: { isAdmin },
      });

      await recordAuditLog({
        adminEmail: access.email || "admin",
        action: isAdmin ? "ADMIN_PROMOTION" : "ADMIN_REVOCATION",
        targetUserId: userId,
        severity: "critical",
        details: { targetEmail: user.email },
      });

      return NextResponse.json({ success: true, isAdmin });
    }

    return NextResponse.json({ error: "Action non supportée" }, { status: 400 });
  } catch (err: any) {
    console.error("Erreur PATCH /api/admin/users:", err);
    return NextResponse.json({ error: err.message || "Erreur serveur" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    }

    let sub = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });

    if (!sub) {
      sub = await prisma.subscription.create({
        data: {
          userId: session.user.id,
          plan: "free",
          status: "active",
          postsUsedThisMonth: 0,
          currentPeriodStart: new Date(),
        },
      });
    }

    return NextResponse.json({
      plan: sub.plan,
      status: sub.status,
      postsUsedThisMonth: sub.postsUsedThisMonth,
      repurposesUsedThisMonth: sub.repurposesUsedThisMonth,
      currentPeriodStart: sub.currentPeriodStart,
      renewalDate: sub.renewalDate,
    });
  } catch (err) {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

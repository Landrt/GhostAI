import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const referrer = searchParams.get("referrer") || req.headers.get("referer") || "";
    const source = searchParams.get("source") || "";

    if (!code) {
      return NextResponse.json({ error: "Code manquant" }, { status: 400 });
    }

    const partner = await prisma.affiliate.findUnique({
      where: { code: code.trim().toLowerCase() },
      select: { id: true, totalClicks: true, isActive: true },
    });

    if (partner && partner.isActive) {
      // Insertion du clic et incrémentation atomique
      await prisma.$transaction([
        prisma.affiliateClick.create({
          data: {
            affiliateId: partner.id,
            referrer,
            source,
          },
        }),
        prisma.affiliate.update({
          where: { id: partner.id },
          data: { totalClicks: { increment: 1 } },
        }),
      ]);

      return NextResponse.json({ tracked: true, partnerId: partner.id });
    }

    return NextResponse.json({ tracked: false });
  } catch (err) {
    console.error("Erreur track-ref:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

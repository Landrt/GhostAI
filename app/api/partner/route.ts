import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getPartnerDashboardData,
  getOrCreatePartner,
  customizeSlug,
  updatePayoutDetails,
} from "@/lib/partner";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const data = await getPartnerDashboardData(session.user.id);
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("Erreur GET /api/partner:", err);
    return NextResponse.json({ error: err.message || "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    if (!body?.agreedToTerms) {
      return NextResponse.json(
        {
          error:
            "Vous devez accepter expressément les Conditions du Programme Partenaire et les Modalités Spécifiques de Retraits pour activer votre espace affilié.",
        },
        { status: 400 }
      );
    }

    const partner = await getOrCreatePartner(session.user.id);
    return NextResponse.json({ success: true, partner });
  } catch (err: any) {
    console.error("Erreur POST /api/partner:", err);
    return NextResponse.json({ error: err.message || "Erreur serveur" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const partner = await getOrCreatePartner(session.user.id);
    const body = await req.json();

    if (body.action === "customize_slug") {
      if (!body.slug) {
        return NextResponse.json({ error: "Code manquant" }, { status: 400 });
      }
      const updated = await customizeSlug(partner.id, body.slug);
      return NextResponse.json({ success: true, partner: updated });
    }

    if (body.action === "update_payout") {
      const { payoutMethod, payoutDetails } = body;
      if (!payoutMethod || !["mobile_money", "bank"].includes(payoutMethod)) {
        return NextResponse.json({ error: "Méthode de retrait invalide" }, { status: 400 });
      }
      const updated = await updatePayoutDetails(partner.id, payoutMethod, payoutDetails);
      return NextResponse.json({ success: true, partner: updated });
    }

    return NextResponse.json({ error: "Action non reconnue" }, { status: 400 });
  } catch (err: any) {
    console.error("Erreur PATCH /api/partner:", err);
    return NextResponse.json({ error: err.message || "Erreur serveur" }, { status: 400 });
  }
}

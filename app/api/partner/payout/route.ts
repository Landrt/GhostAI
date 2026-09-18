import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getOrCreatePartner, requestPayout, MIN_PAYOUT_AMOUNT } from "@/lib/partner";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const partner = await getOrCreatePartner(session.user.id);
    const body = await req.json();

    const amount = Number(body.amount);
    const payoutMethod = body.payoutMethod;
    const accountDetails = body.accountDetails;

    if (!amount || isNaN(amount) || amount < MIN_PAYOUT_AMOUNT) {
      return NextResponse.json(
        { error: `Le montant minimum de retrait est de ${MIN_PAYOUT_AMOUNT},00 $.` },
        { status: 400 }
      );
    }

    if (!payoutMethod || !["mobile_money", "bank"].includes(payoutMethod)) {
      return NextResponse.json(
        { error: "Veuillez choisir une méthode valide (Mobile Money ou Virement Bancaire)." },
        { status: 400 }
      );
    }

    if (!accountDetails || Object.keys(accountDetails).length === 0) {
      return NextResponse.json(
        { error: "Veuillez renseigner vos coordonnées de paiement." },
        { status: 400 }
      );
    }

    const payout = await requestPayout(partner.id, amount, payoutMethod, accountDetails);

    return NextResponse.json({ success: true, payout });
  } catch (err: any) {
    console.error("Erreur POST /api/partner/payout:", err);
    return NextResponse.json({ error: err.message || "Erreur serveur" }, { status: 400 });
  }
}

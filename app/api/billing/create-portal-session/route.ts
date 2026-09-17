import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { subscription: true },
    });

    const customerId = user?.subscription?.stripeCustomerId;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    if (!customerId || !process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.startsWith("sk_test_mock")) {
      return NextResponse.json({ url: `${appUrl}/app/billing?mock_portal=true` });
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${appUrl}/app/billing`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (err) {
    console.error("Erreur portal session:", err);
    return NextResponse.json({ error: "Impossible d'accéder au portail Stripe." }, { status: 500 });
  }
}

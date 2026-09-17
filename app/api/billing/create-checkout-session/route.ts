import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe, PLANS, PlanKey } from "@/lib/stripe";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session.user.email) {
      return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    }

    const { plan } = (await req.json()) as { plan: PlanKey };
    if (!plan || (plan !== "pro" && plan !== "promax")) {
      return NextResponse.json({ error: "Plan invalide." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { subscription: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable." }, { status: 404 });
    }

    // Récupération ou création du Stripe Customer
    let customerId = user.subscription?.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || undefined,
        metadata: { userId: user.id },
      });
      customerId = customer.id;

      await prisma.subscription.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          stripeCustomerId: customerId,
          plan: "free",
        },
        update: {
          stripeCustomerId: customerId,
        },
      });
    }

    const priceId = PLANS[plan].stripePriceId;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Si nous sommes en mode mock / clés de test non connectées, on simule l'activation directe pour un test local
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.startsWith("sk_test_mock")) {
      await prisma.subscription.update({
        where: { userId: user.id },
        data: { plan, status: "active" },
      });
      return NextResponse.json({ url: `${appUrl}/app/billing?success=true` });
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId || undefined,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/app/billing?success=true`,
      cancel_url: `${appUrl}/app/billing?canceled=true`,
      metadata: { userId: user.id, plan },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    console.error("Erreur checkout session:", err);
    return NextResponse.json({ error: "Impossible de démarrer le paiement." }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    }

    const { email } = await req.json();

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { subscription: true },
    });

    if (!user || user.email.toLowerCase() !== email.toLowerCase().trim()) {
      return NextResponse.json({ error: "L'adresse email ne correspond pas." }, { status: 400 });
    }

    // 1. Annulation de l'abonnement Stripe s'il existe
    if (user.subscription?.stripeSubscriptionId) {
      try {
        await stripe.subscriptions.cancel(user.subscription.stripeSubscriptionId);
      } catch (stripeErr) {
        console.error("Erreur annulation abonnement Stripe:", stripeErr);
        // On continue la suppression même si Stripe signale que l'abonnement était déjà clos
      }
    }

    // 2. Suppression en cascade Prisma du User
    await prisma.user.delete({
      where: { id: user.id },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Erreur delete-account:", err);
    return NextResponse.json({ error: "Échec de la suppression du compte." }, { status: 500 });
  }
}

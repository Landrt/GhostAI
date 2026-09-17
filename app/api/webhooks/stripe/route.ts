import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Signature Stripe manquante." }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    console.error("Signature Stripe invalide:", err.message);
    return NextResponse.json({ error: "Signature Stripe invalide." }, { status: 400 });
  }

  try {
    switch (event.type) {
      // 1. Activation de l'abonnement après paiement Checkout réussi
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan || "pro";

        if (userId) {
          await prisma.subscription.upsert({
            where: { userId },
            create: {
              userId,
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: session.subscription as string,
              plan,
              status: "active",
            },
            update: {
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: session.subscription as string,
              plan,
              status: "active",
            },
          });

          // Attribution de la commission 30% au parrain si existant
          if (session.amount_total && session.amount_total > 0) {
            const { recordCommission } = await import("@/lib/partner");
            await recordCommission(
              userId,
              session.id,
              session.amount_total / 100,
              (session.currency || "usd").toUpperCase(),
              { plan, event: "checkout.session.completed" }
            );
          }
        }
        break;
      }

      // 2. Facture payée (renouvellement mensuel) -> reset quota et commission récurrente
      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        const subscriptionId = invoice.subscription as string;

        // Date de renouvellement estimée (30 jours plus tard)
        const nextRenewal = new Date();
        nextRenewal.setDate(nextRenewal.getDate() + 30);

        if (customerId) {
          await prisma.subscription.updateMany({
            where: { stripeCustomerId: customerId },
            data: {
              postsUsedThisMonth: 0,
              currentPeriodStart: new Date(),
              renewalDate: nextRenewal,
              stripeSubscriptionId: subscriptionId,
            },
          });

          // Attribution de la commission 30% récurrente au parrain
          if (invoice.amount_paid && invoice.amount_paid > 0) {
            const sub = await prisma.subscription.findFirst({
              where: { stripeCustomerId: customerId },
              select: { userId: true },
            });
            if (sub?.userId) {
              const { recordCommission } = await import("@/lib/partner");
              await recordCommission(
                sub.userId,
                invoice.id,
                invoice.amount_paid / 100,
                (invoice.currency || "usd").toUpperCase(),
                { invoiceNumber: invoice.number, event: "invoice.paid" }
              );
            }
          }
        }
        break;
      }

      // 3. Litige ou remboursement reçu -> protection anti-solde négatif
      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const txRef = (charge.payment_intent as string) || charge.id;
        if (txRef) {
          const { handleRefund } = await import("@/lib/partner");
          await handleRefund(txRef);
        }
        break;
      }

      // 4. Résiliation de l'abonnement -> repasse plan à 'free'
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;

        if (customerId) {
          await prisma.subscription.updateMany({
            where: { stripeCustomerId: customerId },
            data: {
              plan: "free",
              status: "canceled",
              stripeSubscriptionId: null,
            },
          });
        }
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Erreur traitement webhook Stripe:", err);
    return NextResponse.json({ error: "Erreur traitement webhook." }, { status: 500 });
  }
}

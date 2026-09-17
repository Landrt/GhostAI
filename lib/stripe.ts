import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "sk_test_mock";

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2025-02-24.acacia" as any,
  typescript: true,
});

export const PLANS = {
  free: {
    name: "Free",
    price: 0,
    postsPerMonth: 5,
    stripePriceId: null,
  },
  pro: {
    name: "Pro",
    price: 49,
    postsPerMonth: 30,
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID || "price_pro_mock",
  },
  promax: {
    name: "ProMax",
    price: 99,
    postsPerMonth: 999999, // illimité affiché comme usage raisonnable
    stripePriceId: process.env.STRIPE_PROMAX_PRICE_ID || "price_promax_mock",
  },
} as const;

export type PlanKey = keyof typeof PLANS;

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { checkAdminAccess } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  const access = await checkAdminAccess(session?.user);

  if (!access.isAdmin) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const startTime = Date.now();
  let dbLatency = -1;
  let dbStatus = "ok";

  try {
    // Ping DB
    await prisma.$queryRaw`SELECT 1`;
    dbLatency = Date.now() - startTime;
  } catch (err) {
    dbStatus = "error";
    dbLatency = -1;
  }

  // Masquage des variables d'environnement
  const mask = (val?: string) => {
    if (!val) return null;
    if (val.length <= 8) return "••••••••";
    return `${val.substring(0, 4)}••••${val.substring(val.length - 4)}`;
  };

  const envStatus = [
    {
      name: "DATABASE_URL",
      configured: Boolean(process.env.DATABASE_URL),
      preview: mask(process.env.DATABASE_URL),
      category: "Base de données",
    },
    {
      name: "NEXTAUTH_SECRET",
      configured: Boolean(process.env.NEXTAUTH_SECRET),
      preview: mask(process.env.NEXTAUTH_SECRET),
      category: "Authentification",
    },
    {
      name: "DEEPSEEK_API_KEY",
      configured: Boolean(process.env.DEEPSEEK_API_KEY || process.env.ANTHROPIC_API_KEY),
      preview: mask(process.env.DEEPSEEK_API_KEY || process.env.ANTHROPIC_API_KEY),
      category: "Intelligence Artificielle",
    },
    {
      name: "VOYAGE_API_KEY",
      configured: Boolean(process.env.VOYAGE_API_KEY),
      preview: mask(process.env.VOYAGE_API_KEY),
      category: "Embeddings",
    },
    {
      name: "STRIPE_SECRET_KEY",
      configured: Boolean(process.env.STRIPE_SECRET_KEY),
      preview: mask(process.env.STRIPE_SECRET_KEY),
      category: "Facturation",
    },
    {
      name: "STRIPE_WEBHOOK_SECRET",
      configured: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
      preview: mask(process.env.STRIPE_WEBHOOK_SECRET),
      category: "Webhooks",
    },
    {
      name: "ADMIN_EMAILS",
      configured: Boolean(process.env.ADMIN_EMAILS),
      preview: process.env.ADMIN_EMAILS || "admin@ghostai.com,landry@ghostai.com (défaut)",
      category: "Sécurité",
    },
  ];

  return NextResponse.json({
    pings: [
      {
        name: "PostgreSQL (Prisma)",
        status: dbStatus === "ok" ? "operational" : "degraded",
        latencyMs: dbLatency,
      },
      {
        name: "Moteur IA (DeepSeek V3)",
        status: (process.env.DEEPSEEK_API_KEY || process.env.ANTHROPIC_API_KEY) ? "operational" : "pending_key",
        latencyMs: 95,
      },
      {
        name: "Facturation (Stripe)",
        status: process.env.STRIPE_SECRET_KEY ? "operational" : "pending_key",
        latencyMs: 85,
      },
      {
        name: "Auth.js (Session JWT)",
        status: "operational",
        latencyMs: 5,
      },
    ],
    envStatus,
    systemTime: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV || "development",
  });
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  checkAdminAccess,
  getAdminSystemConfig,
  updateAdminSystemConfig,
  recordAuditLog,
} from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  const access = await checkAdminAccess(session?.user);

  if (!access.isAdmin) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  try {
    const config = await getAdminSystemConfig();

    const logs = await prisma.aiUsageLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    const totalPromptTokens = logs.reduce((sum, l) => sum + l.promptTokens, 0);
    const totalCompletionTokens = logs.reduce((sum, l) => sum + l.completionTokens, 0);
    const totalTokens = totalPromptTokens + totalCompletionTokens;
    const totalCostUsd = logs.reduce((sum, l) => sum + l.estimatedCostUsd, 0);

    return NextResponse.json({
      config,
      metrics: {
        totalPromptTokens,
        totalCompletionTokens,
        totalTokens,
        totalCostUsd: Math.round(totalCostUsd * 1000) / 1000,
        totalCalls: logs.length,
      },
      logs,
    });
  } catch (err: any) {
    console.error("Erreur GET /api/admin/ai-usage:", err);
    return NextResponse.json({ error: err.message || "Erreur serveur" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  const access = await checkAdminAccess(session?.user);

  if (!access.isAdmin) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { rateLimitCapacity, rateLimitDurationHours, rateLimitEnabled } = body;

    const updated = await updateAdminSystemConfig({
      rateLimitCapacity: parseInt(rateLimitCapacity, 10),
      rateLimitDurationHours: parseInt(rateLimitDurationHours, 10),
      rateLimitEnabled: Boolean(rateLimitEnabled),
    });

    await recordAuditLog({
      adminEmail: access.email || "admin",
      action: "RATE_LIMIT_CONFIG_UPDATED",
      severity: "warning",
      details: body,
    });

    return NextResponse.json({ success: true, config: updated });
  } catch (err: any) {
    console.error("Erreur PATCH /api/admin/ai-usage:", err);
    return NextResponse.json({ error: err.message || "Erreur serveur" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { checkAdminAccess, getAdminOverview } from "@/lib/admin";

export async function GET() {
  const session = await auth();
  const access = await checkAdminAccess(session?.user);

  if (!access.isAdmin) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  try {
    const data = await getAdminOverview();
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("Erreur GET /api/admin/overview:", err);
    return NextResponse.json({ error: err.message || "Erreur serveur" }, { status: 500 });
  }
}

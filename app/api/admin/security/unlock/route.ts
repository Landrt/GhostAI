import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSecretKey, generateSignedSecurityToken } from "@/lib/adminSecurity";

const GATE_COOKIE_NAME = "ghost_gate_unlocked";
const GATE_MAX_AGE = 7 * 24 * 60 * 60; // 7 jours

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const key = searchParams.get("key");
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";

  if (!key) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const isValid = await verifyAdminSecretKey(key);

  if (!isValid) {
    // Si la clé est fausse, renvoyer une réponse 404 stricte
    return new NextResponse("Not Found", { status: 404 });
  }

  // Clé valide : génération du jeton signé et pose du cookie
  const gateToken = generateSignedSecurityToken("gate");
  const destination = new URL(callbackUrl, req.url);

  const response = NextResponse.redirect(destination);
  response.cookies.set(GATE_COOKIE_NAME, gateToken, {
    maxAge: GATE_MAX_AGE,
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  return response;
}

import { NextResponse } from "next/server";
import { resetDevUserFlow } from "@/lib/devBypass";

export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Interdit en production" }, { status: 403 });
  }

  try {
    await resetDevUserFlow();
    return NextResponse.json({
      success: true,
      message: "Profil dev réinitialisé. Redirection vers l'onboarding...",
      redirect: "/onboarding",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

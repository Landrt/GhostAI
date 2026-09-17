import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    }

    const batch = await prisma.repurposeBatch.findUnique({
      where: { id: params.id },
    });

    if (!batch || batch.userId !== session.user.id) {
      return NextResponse.json({ error: "Pack introuvable." }, { status: 404 });
    }

    return NextResponse.json({ batch });
  } catch (err: any) {
    console.error("Erreur api/repurpose/[id] GET:", err);
    return NextResponse.json(
      { error: err.message || "Impossible de récupérer ce pack." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    }

    const batch = await prisma.repurposeBatch.findUnique({
      where: { id: params.id },
    });

    if (!batch || batch.userId !== session.user.id) {
      return NextResponse.json({ error: "Pack introuvable." }, { status: 404 });
    }

    await prisma.repurposeBatch.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Erreur api/repurpose/[id] DELETE:", err);
    return NextResponse.json(
      { error: err.message || "Impossible de supprimer ce pack." },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        accounts: true,
        subscription: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé." }, { status: 404 });
    }

    const isOAuth = user.accounts.some((acc) => acc.provider === "google");

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        isOAuth,
        subscription: user.subscription,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    }

    const body = await req.json();
    const { name, password, newPassword } = body;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé." }, { status: 404 });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;

    if (newPassword) {
      if (!user.passwordHash) {
        return NextResponse.json(
          { error: "Impossible de modifier le mot de passe pour un compte OAuth." },
          { status: 400 }
        );
      }

      if (!password) {
        return NextResponse.json(
          { error: "Le mot de passe actuel est requis." },
          { status: 400 }
        );
      }

      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) {
        return NextResponse.json(
          { error: "Le mot de passe actuel est incorrect." },
          { status: 400 }
        );
      }

      if (newPassword.length < 8) {
        return NextResponse.json(
          { error: "Le nouveau mot de passe doit contenir au moins 8 caractères." },
          { status: 400 }
        );
      }

      updateData.passwordHash = await bcrypt.hash(newPassword, 12);
    }

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (err) {
    return NextResponse.json({ error: "Échec de la mise à jour." }, { status: 500 });
  }
}

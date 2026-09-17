import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    }

    const post = await prisma.post.findFirst({
      where: { id: params.id, userId: session.user.id },
    });

    if (!post) {
      return NextResponse.json({ error: "Post non trouvé." }, { status: 404 });
    }

    return NextResponse.json({ post });
  } catch (err) {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    }

    const body = await req.json();

    if (body.action === "duplicate") {
      const original = await prisma.post.findFirst({
        where: { id: params.id, userId: session.user.id },
      });

      if (!original) {
        return NextResponse.json({ error: "Post original non trouvé." }, { status: 404 });
      }

      const duplicate = await prisma.post.create({
        data: {
          userId: session.user.id,
          idea: original.idea,
          format: original.format,
          tone: original.tone,
          content: original.content,
          status: "draft",
        },
      });

      return NextResponse.json({ post: duplicate });
    }

    const updateData: any = {};
    if (body.content !== undefined) updateData.content = body.content;
    if (body.status !== undefined) updateData.status = body.status;

    const updated = await prisma.post.update({
      where: { id: params.id, userId: session.user.id },
      data: updateData,
    });

    return NextResponse.json({ post: updated });
  } catch (err) {
    console.error("Erreur PATCH /api/posts/[id]:", err);
    return NextResponse.json({ error: "Échec de la mise à jour." }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    }

    await prisma.post.delete({
      where: { id: params.id, userId: session.user.id },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Échec de la suppression." }, { status: 500 });
  }
}

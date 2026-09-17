import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    }

    const userId = session.user.id;

    const [user, voiceProfile, personalityProfile, posts] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, name: true, createdAt: true },
      }),
      prisma.voiceProfile.findUnique({ where: { userId } }),
      prisma.personalityProfile.findUnique({ where: { userId } }),
      prisma.post.findMany({
        where: { userId },
        include: { feedback: true },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const exportData = {
      exportDate: new Date().toISOString(),
      user,
      voiceProfile,
      personalityProfile,
      posts,
    };

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="ghostai-export-${userId}.json"`,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: "Échec de l'exportation." }, { status: 500 });
  }
}

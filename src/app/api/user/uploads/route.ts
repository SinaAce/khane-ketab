import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { contentInclude, mapContent } from "@/lib/content";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "ابتدا وارد شوید." }, { status: 401 });
    }

    const contents = await prisma.content.findMany({
      where: { authorId: session.user.id },
      include: contentInclude,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      uploads: contents.map((item) => ({
        ...mapContent(item),
        createdAt: item.createdAt,
      })),
    });
  } catch {
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}

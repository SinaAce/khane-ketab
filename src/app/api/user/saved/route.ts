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

    const saved = await prisma.savedContent.findMany({
      where: { userId: session.user.id },
      include: {
        content: { include: contentInclude },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      saved: saved
        .filter((item) => item.content.status === "APPROVED")
        .map((item) => ({
          savedAt: item.createdAt,
          ...mapContent(item.content),
        })),
    });
  } catch {
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "ابتدا وارد شوید." }, { status: 401 });
    }

    const { contentId } = (await request.json()) as { contentId?: string };
    if (!contentId) {
      return NextResponse.json({ error: "شناسه محتوا الزامی است." }, { status: 400 });
    }

    const content = await prisma.content.findFirst({
      where: { id: contentId, status: "APPROVED" },
    });

    if (!content) {
      return NextResponse.json({ error: "محتوا یافت نشد." }, { status: 404 });
    }

    await prisma.savedContent.upsert({
      where: {
        userId_contentId: {
          userId: session.user.id,
          contentId,
        },
      },
      update: {},
      create: {
        userId: session.user.id,
        contentId,
      },
    });

    return NextResponse.json({ message: "به کتابخانه اضافه شد.", saved: true });
  } catch {
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}

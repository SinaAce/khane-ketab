import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ contentId: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ saved: false });
    }

    const { contentId } = await params;
    const saved = await prisma.savedContent.findUnique({
      where: {
        userId_contentId: {
          userId: session.user.id,
          contentId,
        },
      },
    });

    return NextResponse.json({ saved: Boolean(saved) });
  } catch {
    return NextResponse.json({ saved: false });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "ابتدا وارد شوید." }, { status: 401 });
    }

    const { contentId } = await params;

    await prisma.savedContent.deleteMany({
      where: {
        userId: session.user.id,
        contentId,
      },
    });

    return NextResponse.json({ message: "از کتابخانه حذف شد.", saved: false });
  } catch {
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string; reviewId: string }> };

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "ابتدا وارد شوید." }, { status: 401 });
    }

    const { id, reviewId } = await params;
    const review = await prisma.review.findFirst({
      where: { id: reviewId, contentId: id },
    });

    if (!review) {
      return NextResponse.json({ error: "نظر یافت نشد." }, { status: 404 });
    }

    const isOwner = review.userId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "اجازه حذف این نظر را ندارید." }, { status: 403 });
    }

    await prisma.review.delete({ where: { id: reviewId } });

    return NextResponse.json({ message: "نظر با موفقیت حذف شد." });
  } catch {
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}

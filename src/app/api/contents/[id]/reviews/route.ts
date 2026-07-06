import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { reviewSchema } from "@/lib/validators";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "ابتدا وارد شوید." }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = reviewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "اطلاعات نامعتبر" }, { status: 400 });
    }

    const content = await prisma.content.findFirst({
      where: { id, status: "APPROVED" },
    });

    if (!content) {
      return NextResponse.json({ error: "محتوا یافت نشد." }, { status: 404 });
    }

    const review = await prisma.review.upsert({
      where: {
        userId_contentId: {
          userId: session.user.id,
          contentId: id,
        },
      },
      update: {
        rating: parsed.data.rating,
        comment: parsed.data.comment,
        status: "PENDING",
      },
      create: {
        userId: session.user.id,
        contentId: id,
        rating: parsed.data.rating,
        comment: parsed.data.comment,
        status: "PENDING",
      },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(
      {
        review,
        message: "نظر شما ثبت شد و پس از تأیید مدیر نمایش داده می‌شود.",
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}

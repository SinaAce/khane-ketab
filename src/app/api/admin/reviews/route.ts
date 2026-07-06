import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { isPrismaConnectionError, prisma, withPrismaRetry } from "@/lib/prisma";

export async function GET() {
  try {
    await requireAdmin();

    const reviews = await withPrismaRetry(() =>
      prisma.review.findMany({
        where: { status: "PENDING" },
        include: {
          user: { select: { name: true, email: true } },
          content: { select: { id: true, title: true, type: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
    );

    return NextResponse.json({ reviews });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "ابتدا وارد شوید." }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "دسترسی مجاز نیست." }, { status: 403 });
    }
    if (isPrismaConnectionError(error)) {
      return NextResponse.json({ error: "اتصال به دیتابیس برقرار نیست." }, { status: 503 });
    }
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}

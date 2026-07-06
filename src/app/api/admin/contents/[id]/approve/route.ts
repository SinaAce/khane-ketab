import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { notifyContentApproved } from "@/lib/notifications";
import { prisma, withPrismaRetry } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(_request: Request, { params }: Params) {
  try {
    await requireAdmin();
    const { id } = await params;

    const content = await withPrismaRetry(() =>
      prisma.content.update({
        where: { id },
        data: { status: "APPROVED" },
        select: { id: true, title: true, authorId: true },
      }),
    );

    await withPrismaRetry(() => notifyContentApproved(content));

    return NextResponse.json({ content, message: "محتوا تأیید شد." });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "ابتدا وارد شوید." }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "دسترسی مجاز نیست." }, { status: 403 });
    }
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}

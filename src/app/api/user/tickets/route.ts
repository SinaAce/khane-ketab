import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { isPrismaConnectionError, prisma, withPrismaRetry } from "@/lib/prisma";
import { createTicketSchema } from "@/lib/validators";

export async function GET() {
  try {
    const session = await requireAuth();

    const tickets = await withPrismaRetry(() =>
      prisma.ticket.findMany({
        where: { userId: session.user.id },
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          subject: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: { body: true, isStaff: true, createdAt: true },
          },
        },
      }),
    );

    return NextResponse.json({ tickets });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "ابتدا وارد شوید." }, { status: 401 });
    }
    if (isPrismaConnectionError(error)) {
      return NextResponse.json({ error: "اتصال به دیتابیس برقرار نیست." }, { status: 503 });
    }
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const parsed = createTicketSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "اطلاعات نامعتبر است." },
        { status: 400 },
      );
    }

    const ticket = await withPrismaRetry(() =>
      prisma.ticket.create({
        data: {
          subject: parsed.data.subject.trim(),
          userId: session.user.id,
          messages: {
            create: {
              authorId: session.user.id,
              body: parsed.data.body.trim(),
              isStaff: false,
            },
          },
        },
        select: {
          id: true,
          subject: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
    );

    return NextResponse.json({ ticket, message: "تیکت با موفقیت ثبت شد." }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "ابتدا وارد شوید." }, { status: 401 });
    }
    if (isPrismaConnectionError(error)) {
      return NextResponse.json({ error: "اتصال به دیتابیس برقرار نیست." }, { status: 503 });
    }
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}

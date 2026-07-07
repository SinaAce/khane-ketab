import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { isPrismaConnectionError, prisma, withPrismaRetry } from "@/lib/prisma";
import { adminTicketStatusSchema, ticketMessageSchema } from "@/lib/validators";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    await requireAdmin();
    const { id } = await params;

    const ticket = await withPrismaRetry(() =>
      prisma.ticket.findUnique({
        where: { id },
        select: {
          id: true,
          subject: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          user: { select: { id: true, name: true, email: true } },
          messages: {
            orderBy: { createdAt: "asc" },
            select: {
              id: true,
              body: true,
              isStaff: true,
              createdAt: true,
              author: { select: { name: true, role: true } },
            },
          },
        },
      }),
    );

    if (!ticket) {
      return NextResponse.json({ error: "تیکت یافت نشد." }, { status: 404 });
    }

    return NextResponse.json({ ticket });
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

export async function PATCH(request: Request, { params }: Params) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const parsed = adminTicketStatusSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "وضعیت نامعتبر است." }, { status: 400 });
    }

    const ticket = await withPrismaRetry(() =>
      prisma.ticket.update({
        where: { id },
        data: { status: parsed.data.status },
        select: { id: true, status: true },
      }),
    );

    return NextResponse.json({ ticket, message: "وضعیت تیکت به‌روز شد." });
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

export async function POST(request: Request, { params }: Params) {
  try {
    const session = await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const parsed = ticketMessageSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "پیام نامعتبر است." },
        { status: 400 },
      );
    }

    const existing = await withPrismaRetry(() =>
      prisma.ticket.findUnique({
        where: { id },
        select: { id: true, userId: true, subject: true, status: true },
      }),
    );

    if (!existing) {
      return NextResponse.json({ error: "تیکت یافت نشد." }, { status: 404 });
    }

    const message = await withPrismaRetry(() =>
      prisma.$transaction(async (tx) => {
        const created = await tx.ticketMessage.create({
          data: {
            ticketId: existing.id,
            authorId: session.user.id,
            body: parsed.data.body.trim(),
            isStaff: true,
          },
          select: {
            id: true,
            body: true,
            isStaff: true,
            createdAt: true,
            author: { select: { name: true, role: true } },
          },
        });

        await tx.ticket.update({
          where: { id: existing.id },
          data: { status: "ANSWERED", updatedAt: new Date() },
        });

        await tx.notification.create({
          data: {
            userId: existing.userId,
            type: "TICKET_REPLY",
            message: `پاسخ جدید برای تیکت «${existing.subject}»`,
            relatedId: existing.id,
          },
        });

        return created;
      }),
    );

    return NextResponse.json({ message, ticketMessage: "پاسخ ارسال شد." });
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

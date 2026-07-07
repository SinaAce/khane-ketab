import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { isPrismaConnectionError, prisma, withPrismaRetry } from "@/lib/prisma";
import { ticketMessageSchema } from "@/lib/validators";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    const ticket = await withPrismaRetry(() =>
      prisma.ticket.findFirst({
        where: { id, userId: session.user.id },
        select: {
          id: true,
          subject: true,
          status: true,
          createdAt: true,
          updatedAt: true,
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
    if (isPrismaConnectionError(error)) {
      return NextResponse.json({ error: "اتصال به دیتابیس برقرار نیست." }, { status: 503 });
    }
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    const body = await request.json();
    const parsed = ticketMessageSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "پیام نامعتبر است." },
        { status: 400 },
      );
    }

    const ticket = await withPrismaRetry(() =>
      prisma.ticket.findFirst({
        where: { id, userId: session.user.id },
        select: { id: true, status: true },
      }),
    );

    if (!ticket) {
      return NextResponse.json({ error: "تیکت یافت نشد." }, { status: 404 });
    }

    if (ticket.status === "CLOSED") {
      return NextResponse.json({ error: "این تیکت بسته شده است." }, { status: 400 });
    }

    const message = await withPrismaRetry(() =>
      prisma.$transaction(async (tx) => {
        const created = await tx.ticketMessage.create({
          data: {
            ticketId: ticket.id,
            authorId: session.user.id,
            body: parsed.data.body.trim(),
            isStaff: false,
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
          where: { id: ticket.id },
          data: { status: "OPEN", updatedAt: new Date() },
        });

        return created;
      }),
    );

    return NextResponse.json({ message, ticketMessage: "پیام ارسال شد." });
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

import { NextResponse } from "next/server";
import type { TicketStatus } from "@/generated/prisma/client";
import { requireAdmin } from "@/lib/auth";
import { isPrismaConnectionError, prisma, withPrismaRetry } from "@/lib/prisma";

const PAGE_SIZE = 10;
const VALID_STATUSES: TicketStatus[] = ["OPEN", "ANSWERED", "CLOSED"];

export async function GET(request: Request) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const statusParam = searchParams.get("status");
    const skip = (page - 1) * PAGE_SIZE;

    const where =
      statusParam && VALID_STATUSES.includes(statusParam as TicketStatus)
        ? { status: statusParam as TicketStatus }
        : undefined;

    const [total, tickets] = await withPrismaRetry(async () => {
      const [count, rows] = await Promise.all([
        prisma.ticket.count({ where }),
        prisma.ticket.findMany({
          where,
          skip,
          take: PAGE_SIZE,
          orderBy: { updatedAt: "desc" },
          select: {
            id: true,
            subject: true,
            status: true,
            createdAt: true,
            updatedAt: true,
            user: { select: { id: true, name: true, email: true } },
            messages: {
              orderBy: { createdAt: "desc" },
              take: 1,
              select: { body: true, isStaff: true, createdAt: true },
            },
            _count: { select: { messages: true } },
          },
        }),
      ]);
      return [count, rows] as const;
    });

    return NextResponse.json({
      tickets,
      total,
      page,
      pageSize: PAGE_SIZE,
      totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    });
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

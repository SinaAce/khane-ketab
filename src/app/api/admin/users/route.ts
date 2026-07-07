import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { isPrismaConnectionError, prisma, withPrismaRetry } from "@/lib/prisma";

const PAGE_SIZE = 10;

export async function GET(request: Request) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const pageSize = PAGE_SIZE;
    const skip = (page - 1) * pageSize;
    const q = searchParams.get("q")?.trim() || "";

    const where = q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { email: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : undefined;

    const [total, users] = await withPrismaRetry(async () => {
      const [count, rows] = await Promise.all([
        prisma.user.count({ where }),
        prisma.user.findMany({
          where,
          skip,
          take: pageSize,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            blocked: true,
            createdAt: true,
            _count: {
              select: {
                contents: true,
                reviews: true,
                saved: true,
                notifications: true,
              },
            },
          },
        }),
      ]);
      return [count, rows] as const;
    });

    return NextResponse.json({
      users: users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        blocked: user.blocked,
        createdAt: user.createdAt,
        stats: {
          uploads: user._count.contents,
          reviews: user._count.reviews,
          saved: user._count.saved,
          notifications: user._count.notifications,
        },
      })),
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
      q,
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

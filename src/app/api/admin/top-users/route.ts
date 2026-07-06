import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { isPrismaConnectionError, prisma, withPrismaRetry } from "@/lib/prisma";

const PAGE_SIZE = 10;
const VALID_CATEGORIES = ["uploads", "reviews", "saved", "downloads"] as const;

type TopCategory = (typeof VALID_CATEGORIES)[number];

type RankedGroup = {
  userId: string;
  value: number;
};

async function fetchUsersForGroups(groups: RankedGroup[], skip: number, pageSize: number) {
  const total = groups.length;
  const slice = groups.slice(skip, skip + pageSize);
  const userIds = slice.map((item) => item.userId);

  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, email: true, role: true, blocked: true },
  });

  const userMap = Object.fromEntries(users.map((user) => [user.id, user]));

  return {
    total,
    items: slice.map((item, index) => ({
      rank: skip + index + 1,
      user: userMap[item.userId],
      value: item.value,
    })),
  };
}

export async function GET(request: Request) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const category = (searchParams.get("category") || "uploads") as TopCategory;
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const pageSize = PAGE_SIZE;
    const skip = (page - 1) * pageSize;

    if (!VALID_CATEGORIES.includes(category)) {
      return NextResponse.json({ error: "دسته نامعتبر است." }, { status: 400 });
    }

    const result = await withPrismaRetry(async () => {
      if (category === "downloads") {
        const grouped = await prisma.content.groupBy({
          by: ["authorId"],
          where: { status: "APPROVED" },
          _sum: { downloadCount: true },
          orderBy: { _sum: { downloadCount: "desc" } },
        });

        const groups = grouped
          .filter((item) => (item._sum.downloadCount || 0) > 0)
          .map((item) => ({
            userId: item.authorId,
            value: item._sum.downloadCount || 0,
          }));

        return fetchUsersForGroups(groups, skip, pageSize);
      }

      if (category === "uploads") {
        const grouped = await prisma.content.groupBy({
          by: ["authorId"],
          _count: { id: true },
          orderBy: { _count: { id: "desc" } },
        });

        const groups = grouped
          .filter((item) => item._count.id > 0)
          .map((item) => ({
            userId: item.authorId,
            value: item._count.id,
          }));

        return fetchUsersForGroups(groups, skip, pageSize);
      }

      if (category === "reviews") {
        const grouped = await prisma.review.groupBy({
          by: ["userId"],
          _count: { id: true },
          orderBy: { _count: { id: "desc" } },
        });

        const groups = grouped
          .filter((item) => item._count.id > 0)
          .map((item) => ({
            userId: item.userId,
            value: item._count.id,
          }));

        return fetchUsersForGroups(groups, skip, pageSize);
      }

      const grouped = await prisma.savedContent.groupBy({
        by: ["userId"],
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
      });

      const groups = grouped
        .filter((item) => item._count.id > 0)
        .map((item) => ({
          userId: item.userId,
          value: item._count.id,
        }));

      return fetchUsersForGroups(groups, skip, pageSize);
    });

    const totalPages = Math.max(1, Math.ceil(result.total / pageSize));

    return NextResponse.json({
      category,
      items: result.items.filter((item) => item.user),
      total: result.total,
      page,
      pageSize,
      totalPages,
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
    console.error("top-users error:", error);
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}

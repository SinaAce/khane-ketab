import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { isPrismaConnectionError, prisma, withPrismaRetry } from "@/lib/prisma";

export async function GET() {
  try {
    await requireAdmin();

    const stats = await withPrismaRetry(async () => {
      const [
        usersTotal,
        usersAdmin,
        usersBlocked,
        usersActive,
        contentsTotal,
        contentsApproved,
        contentsPending,
        contentsRejected,
        contentsEbook,
        contentsAudiobook,
        reviewsTotal,
        reviewsApproved,
        reviewsPending,
        savedTotal,
        notificationsTotal,
        notificationsUnread,
        categoriesTotal,
        downloadsSum,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { role: "ADMIN" } }),
        prisma.user.count({ where: { blocked: true } }),
        prisma.user.count({ where: { blocked: false } }),
        prisma.content.count(),
        prisma.content.count({ where: { status: "APPROVED" } }),
        prisma.content.count({ where: { status: "PENDING" } }),
        prisma.content.count({ where: { status: "REJECTED" } }),
        prisma.content.count({ where: { type: "EBOOK" } }),
        prisma.content.count({ where: { type: "AUDIOBOOK" } }),
        prisma.review.count(),
        prisma.review.count({ where: { status: "APPROVED" } }),
        prisma.review.count({ where: { status: "PENDING" } }),
        prisma.savedContent.count(),
        prisma.notification.count(),
        prisma.notification.count({ where: { read: false } }),
        prisma.category.count(),
        prisma.content.aggregate({ _sum: { downloadCount: true } }),
      ]);

      return {
        users: {
          total: usersTotal,
          admins: usersAdmin,
          blocked: usersBlocked,
          active: usersActive,
        },
        contents: {
          total: contentsTotal,
          approved: contentsApproved,
          pending: contentsPending,
          rejected: contentsRejected,
          ebooks: contentsEbook,
          audiobooks: contentsAudiobook,
          downloads: downloadsSum._sum.downloadCount || 0,
        },
        reviews: {
          total: reviewsTotal,
          approved: reviewsApproved,
          pending: reviewsPending,
        },
        engagement: {
          saved: savedTotal,
          notifications: notificationsTotal,
          unreadNotifications: notificationsUnread,
        },
        categories: categoriesTotal,
      };
    });

    return NextResponse.json({ stats });
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

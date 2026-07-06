import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { enrichNotification } from "@/lib/notifications";
import { prisma, withPrismaRetry } from "@/lib/prisma";

function authError(error: unknown) {
  if (error instanceof Error && error.message === "UNAUTHORIZED") {
    return NextResponse.json({ error: "ابتدا وارد شوید." }, { status: 401 });
  }
  return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "ابتدا وارد شوید." }, { status: 401 });
    }

    const { notifications, unreadCount } = await withPrismaRetry(async () => {
      const [rows, unreadCount] = await Promise.all([
        prisma.notification.findMany({
          where: { userId: session.user.id },
          orderBy: { createdAt: "desc" },
          take: 50,
        }),
        prisma.notification.count({
          where: { userId: session.user.id, read: false },
        }),
      ]);

      const notifications = await Promise.all(rows.map((row) => enrichNotification(row)));
      return { notifications, unreadCount };
    });

    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    return authError(error);
  }
}

export async function PATCH() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "ابتدا وارد شوید." }, { status: 401 });
    }

    await withPrismaRetry(() =>
      prisma.notification.updateMany({
        where: { userId: session.user.id, read: false },
        data: { read: true },
      }),
    );

    return NextResponse.json({ message: "همه نوتیف‌ها خوانده شدند." });
  } catch (error) {
    return authError(error);
  }
}

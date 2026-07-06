import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { isPrismaConnectionError, prisma, withPrismaRetry } from "@/lib/prisma";

const updateUserSchema = z
  .object({
    role: z.enum(["USER", "ADMIN"]).optional(),
    blocked: z.boolean().optional(),
  })
  .refine((data) => data.role !== undefined || data.blocked !== undefined, {
    message: "حداقل یک فیلد برای به‌روزرسانی لازم است.",
  });

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    const session = await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const parsed = updateUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "داده نامعتبر است." }, { status: 400 });
    }

    const { role, blocked } = parsed.data;

    if (session.user.id === id) {
      if (role === "USER") {
        return NextResponse.json(
          { error: "نمی‌توانید دسترسی مدیر خودتان را حذف کنید." },
          { status: 400 },
        );
      }
      if (blocked === true) {
        return NextResponse.json({ error: "نمی‌توانید حساب خودتان را مسدود کنید." }, { status: 400 });
      }
    }

    const target = await withPrismaRetry(() =>
      prisma.user.findUnique({
        where: { id },
        select: { id: true, name: true, role: true, blocked: true },
      }),
    );

    if (!target) {
      return NextResponse.json({ error: "کاربر یافت نشد." }, { status: 404 });
    }

    if (role === "USER" && target.role === "ADMIN") {
      const adminCount = await withPrismaRetry(() =>
        prisma.user.count({ where: { role: "ADMIN" } }),
      );

      if (adminCount <= 1) {
        return NextResponse.json(
          { error: "حداقل یک مدیر باید در سیستم باقی بماند." },
          { status: 400 },
        );
      }
    }

    if (blocked === true && target.role === "ADMIN") {
      return NextResponse.json(
        { error: "ابتدا نقش مدیر را از کاربر بگیرید، سپس مسدود کنید." },
        { status: 400 },
      );
    }

    const user = await withPrismaRetry(() =>
      prisma.user.update({
        where: { id },
        data: {
          ...(role !== undefined ? { role } : {}),
          ...(blocked !== undefined ? { blocked } : {}),
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          blocked: true,
          createdAt: true,
        },
      }),
    );

    let message = "کاربر به‌روز شد.";
    if (blocked === true) message = `${user.name} مسدود شد.`;
    else if (blocked === false) message = `مسدودیت ${user.name} برداشته شد.`;
    else if (role === "ADMIN") message = `${user.name} به مدیر ارتقا یافت.`;
    else if (role === "USER") message = `دسترسی مدیر ${user.name} برداشته شد.`;

    return NextResponse.json({ user, message });
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

import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { clearPasswordResetTokens } from "@/lib/password-reset";
import { isPrismaConnectionError, prisma, withPrismaRetry } from "@/lib/prisma";

const resetPasswordSchema = z.object({
  password: z.string().min(6, "رمز عبور باید حداقل ۶ کاراکتر باشد"),
});

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const parsed = resetPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "رمز عبور نامعتبر است." },
        { status: 400 },
      );
    }

    const target = await withPrismaRetry(() =>
      prisma.user.findUnique({
        where: { id },
        select: { id: true, name: true },
      }),
    );

    if (!target) {
      return NextResponse.json({ error: "کاربر یافت نشد." }, { status: 404 });
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);

    await withPrismaRetry(async () => {
      await clearPasswordResetTokens(id);
      await prisma.user.update({
        where: { id },
        data: { passwordHash },
      });
    });

    return NextResponse.json({
      message: `رمز عبور ${target.name} با موفقیت تغییر کرد.`,
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
    console.error("[admin-reset-password]", error);
    return NextResponse.json({ error: "تغییر رمز عبور ناموفق بود." }, { status: 500 });
  }
}

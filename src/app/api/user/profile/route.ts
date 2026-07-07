import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { clearPasswordResetTokens } from "@/lib/password-reset";
import { prisma } from "@/lib/prisma";
import { profileUpdateSchema } from "@/lib/validators";

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

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: { select: { saved: true, contents: true, reviews: true } },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "کاربر یافت نشد." }, { status: 404 });
    }

    const uploadStats = await prisma.content.groupBy({
      by: ["status"],
      where: { authorId: session.user.id },
      _count: true,
    });

    const stats = {
      saved: user._count.saved,
      uploads: user._count.contents,
      reviews: user._count.reviews,
      pending: uploadStats.find((s) => s.status === "PENDING")?._count ?? 0,
      approved: uploadStats.find((s) => s.status === "APPROVED")?._count ?? 0,
      rejected: uploadStats.find((s) => s.status === "REJECTED")?._count ?? 0,
    };

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
      stats,
    });
  } catch (error) {
    return authError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "ابتدا وارد شوید." }, { status: 401 });
    }

    const body = await request.json();
    const parsed = profileUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "اطلاعات نامعتبر" },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) {
      return NextResponse.json({ error: "کاربر یافت نشد." }, { status: 404 });
    }

    const data: { name?: string; passwordHash?: string } = {};

    if (parsed.data.name) {
      data.name = parsed.data.name;
    }

    if (parsed.data.newPassword) {
      const valid = await bcrypt.compare(parsed.data.currentPassword!, user.passwordHash);
      if (!valid) {
        return NextResponse.json({ error: "رمز عبور فعلی اشتباه است." }, { status: 400 });
      }
      data.passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
      await clearPasswordResetTokens(session.user.id);
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "تغییری ارسال نشده است." }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data,
      select: { id: true, name: true, email: true },
    });

    return NextResponse.json({ user: updated, message: "پروفایل با موفقیت به‌روز شد." });
  } catch (error) {
    return authError(error);
  }
}

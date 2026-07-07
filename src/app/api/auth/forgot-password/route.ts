import { NextResponse } from "next/server";
import { sendPasswordResetEmail } from "@/lib/email";
import { normalizeEmail } from "@/lib/email-utils";
import { buildResetPasswordUrl, createPasswordResetToken } from "@/lib/password-reset";
import { prisma, withPrismaRetry } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validators";

const GENERIC_MESSAGE =
  "اگر حسابی با این ایمیل وجود داشته باشد، لینک بازیابی رمز ارسال شد.";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "ایمیل معتبر نیست." },
        { status: 400 },
      );
    }

    const email = normalizeEmail(parsed.data.email);

    const user = await withPrismaRetry(() =>
      prisma.user.findFirst({
        where: { email: { equals: email, mode: "insensitive" } },
        select: { id: true, name: true, email: true, blocked: true },
      }),
    );

    let devResetUrl: string | undefined;

    if (user && !user.blocked) {
      const { token } = await withPrismaRetry(() => createPasswordResetToken(user.id));
      const resetUrl = buildResetPasswordUrl(token);

      try {
        const mailResult = await sendPasswordResetEmail({
          to: user.email,
          name: user.name,
          resetUrl,
        });

        if (!mailResult.sent && process.env.NODE_ENV !== "production") {
          devResetUrl = mailResult.previewUrl;
        }
      } catch {
        if (process.env.NODE_ENV !== "production") {
          devResetUrl = resetUrl;
        } else {
          return NextResponse.json(
            { error: "ارسال ایمیل ناموفق بود. تنظیمات SMTP را در Vercel بررسی کنید." },
            { status: 503 },
          );
        }
      }
    }

    return NextResponse.json({
      message: GENERIC_MESSAGE,
      ...(devResetUrl ? { devResetUrl } : {}),
    });
  } catch (error) {
    console.error("[forgot-password]", error);
    return NextResponse.json(
      {
        error:
          "ارسال لینک بازیابی ناموفق بود. اگر تازه deploy کرده‌اید، schema دیتابیس production را sync کنید.",
      },
      { status: 500 },
    );
  }
}

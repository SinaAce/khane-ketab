import { NextResponse } from "next/server";
import { resetPasswordWithToken } from "@/lib/password-reset";
import { resetPasswordSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = resetPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "اطلاعات نامعتبر است." },
        { status: 400 },
      );
    }

    const result = await resetPasswordWithToken(parsed.data.token, parsed.data.password);

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      message: "رمز عبور با موفقیت تغییر کرد. اکنون می‌توانید وارد شوید.",
    });
  } catch (error) {
    console.error("[reset-password]", error);
    return NextResponse.json({ error: "تغییر رمز عبور ناموفق بود." }, { status: 500 });
  }
}

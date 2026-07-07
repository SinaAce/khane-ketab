import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { runArchiveImport } from "@/lib/archive-import";
import { isPrismaConnectionError, prisma, withPrismaRetry } from "@/lib/prisma";

export const maxDuration = 60;

export async function POST() {
  try {
    await requireAdmin();

    const result = await withPrismaRetry(() => runArchiveImport(prisma));

    return NextResponse.json({
      ok: true,
      message: `${result.catalogImported + result.onlineImported} محتوای جدید وارد شد.`,
      ...result,
    });
  } catch (error) {
    if (isPrismaConnectionError(error)) {
      return NextResponse.json({ error: "اتصال به دیتابیس برقرار نیست." }, { status: 503 });
    }

    console.error("[admin/import-archive]", error);
    return NextResponse.json({ error: "واردات محتوا ناموفق بود." }, { status: 500 });
  }
}

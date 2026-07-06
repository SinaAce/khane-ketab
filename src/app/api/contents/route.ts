import { NextResponse } from "next/server";
import { getApprovedContents } from "@/lib/content";
import { searchSchema } from "@/lib/validators";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = searchSchema.safeParse({
      q: searchParams.get("q") || undefined,
      type: searchParams.get("type") || undefined,
      category: searchParams.get("category") || undefined,
      sort: searchParams.get("sort") || undefined,
      page: searchParams.get("page") || undefined,
      pageSize: searchParams.get("pageSize") || undefined,
    });

    if (!parsed.success) {
      return NextResponse.json({ error: "پارامترهای نامعتبر" }, { status: 400 });
    }

    const result = await getApprovedContents({
      ...parsed.data,
      page: parsed.data.page ?? 1,
      pageSize: parsed.data.pageSize ?? 20,
    });

    return NextResponse.json({
      contents: result.items,
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
    });
  } catch {
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { getContentById } from "@/lib/content";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const content = await getContentById(id, "APPROVED");

    if (!content) {
      return NextResponse.json({ error: "محتوا یافت نشد." }, { status: 404 });
    }

    return NextResponse.json({ content });
  } catch {
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}

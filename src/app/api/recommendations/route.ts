import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getRecommendations } from "@/lib/content";

export async function GET() {
  try {
    const session = await auth();
    const contents = await getRecommendations(session?.user?.id, 6);
    return NextResponse.json({ contents });
  } catch {
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}

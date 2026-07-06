import { NextResponse } from "next/server";

function isAllowedUrl(rawUrl: string) {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== "https:") return false;
    const host = parsed.hostname;
    return host === "archive.org" || host.endsWith(".archive.org");
  } catch {
    return false;
  }
}

export async function GET(request: Request) {
  try {
    const target = new URL(request.url).searchParams.get("url");
    if (!target || !isAllowedUrl(target)) {
      return NextResponse.json({ error: "آدرس مجاز نیست." }, { status: 400 });
    }

    const upstream = await fetch(target, {
      headers: { "User-Agent": "ebook-marketplace/1.0" },
      signal: AbortSignal.timeout(30000),
    });

    if (!upstream.ok) {
      return NextResponse.json({ error: "فایل یافت نشد." }, { status: upstream.status });
    }

    const contentType = upstream.headers.get("content-type") || "application/octet-stream";

    return new NextResponse(upstream.body, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": "inline",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "خطا در دریافت فایل" }, { status: 502 });
  }
}

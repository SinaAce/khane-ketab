import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isPrismaConnectionError, prisma, withPrismaRetry } from "@/lib/prisma";
import { buildFileKey, StorageNotConfiguredError, uploadFile } from "@/lib/storage";
import { contentUploadSchema } from "@/lib/validators";

function isAllowedUploadFile(type: "EBOOK" | "AUDIOBOOK", file: File) {
  const mime = file.type.toLowerCase();
  const name = file.name.toLowerCase();

  if (type === "EBOOK") {
    return (
      mime === "application/pdf" ||
      mime === "application/octet-stream" ||
      mime === "" ||
      name.endsWith(".pdf")
    );
  }

  return (
    mime.startsWith("audio/") ||
    mime === "application/octet-stream" ||
    mime === "" ||
    [".mp3", ".wav", ".ogg", ".m4a", ".aac"].some((ext) => name.endsWith(ext))
  );
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "ابتدا وارد شوید." }, { status: 401 });
    }

    const formData = await request.formData();
    const parsed = contentUploadSchema.safeParse({
      title: formData.get("title"),
      description: formData.get("description") || undefined,
      type: formData.get("type"),
      categoryId: formData.get("categoryId"),
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "اطلاعات نامعتبر" },
        { status: 400 },
      );
    }

    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "فایل الزامی است." }, { status: 400 });
    }

    if (!isAllowedUploadFile(parsed.data.type, file)) {
      return NextResponse.json(
        {
          error:
            parsed.data.type === "EBOOK"
              ? "فقط فایل PDF مجاز است."
              : "فقط فایل‌های صوتی مجاز هستند.",
        },
        { status: 400 },
      );
    }

    const category = await withPrismaRetry(() =>
      prisma.category.findUnique({
        where: { id: parsed.data.categoryId },
      }),
    );

    if (!category) {
      return NextResponse.json({ error: "دسته‌بندی یافت نشد." }, { status: 404 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileKey = buildFileKey(session.user.id, file.name);
    const contentType =
      file.type ||
      (parsed.data.type === "EBOOK" ? "application/pdf" : "audio/mpeg");

    await uploadFile(buffer, fileKey, contentType);

    const content = await withPrismaRetry(() =>
      prisma.content.create({
        data: {
          title: parsed.data.title,
          description: parsed.data.description,
          type: parsed.data.type,
          categoryId: parsed.data.categoryId,
          authorId: session.user.id,
          fileKey,
          fileSize: file.size,
          status: "PENDING",
        },
        include: {
          category: true,
          author: { select: { id: true, name: true } },
        },
      }),
    );

    return NextResponse.json(
      {
        content,
        message: "محتوا با موفقیت آپلود شد و در انتظار تأیید مدیر است.",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[upload]", error);

    if (isPrismaConnectionError(error)) {
      return NextResponse.json(
        {
          error: process.env.VERCEL
            ? "اتصال به دیتابیس برقرار نیست. لطفاً چند لحظه بعد دوباره تلاش کنید."
            : "اتصال به دیتابیس برقرار نیست. Prisma Dev را اجرا کنید و سرور را ری‌استارت کنید.",
        },
        { status: 503 },
      );
    }

    if (error instanceof StorageNotConfiguredError) {
      return NextResponse.json(
        { error: "ذخیره‌سازی فایل روی سرور پیکربندی نشده است. با پشتیبانی تماس بگیرید." },
        { status: 503 },
      );
    }

    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error.code === "P2003" || error.code === "P2025")
    ) {
      return NextResponse.json(
        { error: "نشست شما منقضی شده. یک‌بار خارج شوید و دوباره وارد شوید." },
        { status: 401 },
      );
    }

    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}

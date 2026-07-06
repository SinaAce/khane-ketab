import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildFileKey, uploadFile } from "@/lib/storage";
import { contentUploadSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
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

    const allowedTypes =
      parsed.data.type === "EBOOK"
        ? ["application/pdf"]
        : ["audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", "audio/mp4"];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "نوع فایل مجاز نیست." }, { status: 400 });
    }

    const category = await prisma.category.findUnique({
      where: { id: parsed.data.categoryId },
    });

    if (!category) {
      return NextResponse.json({ error: "دسته‌بندی یافت نشد." }, { status: 404 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileKey = buildFileKey(session.user.id, file.name);
    await uploadFile(buffer, fileKey, file.type);

    const content = await prisma.content.create({
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
    });

    return NextResponse.json(
      {
        content,
        message: "محتوا با موفقیت آپلود شد و در انتظار تأیید مدیر است.",
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}

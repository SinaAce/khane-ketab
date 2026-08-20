import { readFile } from "fs/promises";
import { NextResponse } from "next/server";
import { prisma, withPrismaRetry } from "@/lib/prisma";
import {
  getBlobUrl,
  getDbContentId,
  getFileUrl,
  getLocalFilePath,
  isBlobFileKey,
  isDbFileKey,
} from "@/lib/storage";

type Params = { params: Promise<{ key: string[] }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { key } = await params;
    const fileKey = decodeURIComponent(key.join("/"));

    if (isBlobFileKey(fileKey)) {
      return NextResponse.redirect(getBlobUrl(fileKey));
    }

    if (isDbFileKey(fileKey)) {
      const content = await withPrismaRetry(() =>
        prisma.content.findUnique({
          where: { id: getDbContentId(fileKey) },
          select: { fileData: true, fileMimeType: true, title: true },
        }),
      );

      if (!content?.fileData) {
        return NextResponse.json({ error: "فایل یافت نشد." }, { status: 404 });
      }

      return new NextResponse(content.fileData, {
        headers: {
          "Content-Type": content.fileMimeType || "application/octet-stream",
          "Content-Disposition": `inline; filename="${encodeURIComponent(content.title)}"`,
          "Cache-Control": "public, max-age=3600",
        },
      });
    }

    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && process.env.AWS_S3_BUCKET) {
      const url = await getFileUrl(fileKey);
      return NextResponse.redirect(url);
    }

    const filePath = getLocalFilePath(fileKey);
    const buffer = await readFile(filePath);
    const extension = fileKey.split(".").pop()?.toLowerCase();

    const contentType =
      extension === "pdf"
        ? "application/pdf"
        : extension === "mp3"
          ? "audio/mpeg"
          : extension === "wav"
            ? "audio/wav"
            : "application/octet-stream";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": "inline",
      },
    });
  } catch {
    return NextResponse.json({ error: "فایل یافت نشد." }, { status: 404 });
  }
}

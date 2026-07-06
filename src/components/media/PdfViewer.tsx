"use client";

import { ExternalLink } from "lucide-react";
import { isArchiveFileKey } from "@/lib/utils";

type PdfViewerProps = {
  fileUrl: string;
  fileKey?: string;
};

export function PdfViewer({ fileUrl, fileKey }: PdfViewerProps) {
  const isArchive = fileKey ? isArchiveFileKey(fileKey) : fileUrl.includes("archive.org/embed");
  const archiveId = fileKey ? fileKey.replace("archive:", "") : "";
  const openUrl = isArchive && archiveId ? `https://archive.org/details/${archiveId}` : fileUrl;

  return (
    <div className="space-y-4">
      <div className="surface-panel overflow-hidden rounded-2xl">
        <iframe
          src={fileUrl}
          title="PDF Viewer"
          className="h-[80vh] w-full bg-surface-muted"
          loading="lazy"
          allowFullScreen
        />
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-teal-brand hover:underline"
        >
          <ExternalLink size={14} />
          باز کردن در تب جدید
        </a>
        {isArchive && (
          <a
            href={openUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-teal-brand hover:underline"
          >
            <ExternalLink size={14} />
            مشاهده در آرشیو اینترنت
          </a>
        )}
      </div>
    </div>
  );
}

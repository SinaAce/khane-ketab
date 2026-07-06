import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ContentGrid } from "@/components/content/ContentGrid";

type SavedItem = Parameters<typeof ContentGrid>[0]["items"][number];

type SavedListProps = {
  items: SavedItem[];
};

export function SavedList({ items }: SavedListProps) {
  if (items.length === 0) {
    return (
      <Card>
        <p className="text-muted">هنوز کتابی ذخیره نکرده‌اید.</p>
        <Link href="/browse" className="mt-3 inline-block text-sm text-teal-brand hover:underline">
          برو کتاب پیدا کن
        </Link>
      </Card>
    );
  }

  return <ContentGrid items={items} emptyMessage="کتاب ذخیره‌شده‌ای ندارید." />;
}

type UploadItem = SavedItem & {
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
};

const statusLabels = {
  PENDING: { label: "در انتظار تأیید", variant: "warning" as const },
  APPROVED: { label: "تأیید شده", variant: "success" as const },
  REJECTED: { label: "رد شده", variant: "danger" as const },
};

type UploadsListProps = {
  items: UploadItem[];
};

export function UploadsList({ items }: UploadsListProps) {
  if (items.length === 0) {
    return (
      <Card>
        <p className="text-muted">هنوز محتوایی آپلود نکرده‌اید.</p>
        <Link href="/upload" className="mt-3 inline-block text-sm text-teal-brand hover:underline">
          آپلود محتوا
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const status = statusLabels[item.status];
        const href =
          item.status === "APPROVED"
            ? item.type === "EBOOK"
              ? `/content/${item.id}/read`
              : `/content/${item.id}/listen`
            : null;

        return (
          <Card key={item.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-1 flex flex-wrap items-center gap-2">
                {href ? (
                  <Link href={href} className="font-semibold text-foreground hover:text-teal-brand">
                    {item.title}
                  </Link>
                ) : (
                  <span className="font-semibold text-foreground">{item.title}</span>
                )}
                <Badge variant={item.type === "EBOOK" ? "default" : "success"}>
                  {item.type === "EBOOK" ? "کتاب" : "صوتی"}
                </Badge>
                <Badge variant={status.variant}>{status.label}</Badge>
              </div>
              <p className="text-sm text-muted">
                {item.category.name} ·{" "}
                {new Date(item.createdAt).toLocaleDateString("fa-IR")}
              </p>
            </div>
            {item.status === "APPROVED" && href && (
              <Link href={href} className="text-sm text-teal-brand hover:underline">
                مشاهده
              </Link>
            )}
          </Card>
        );
      })}
    </div>
  );
}

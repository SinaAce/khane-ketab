import Link from "next/link";
import { BookOpen, Headphones } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { StarRating } from "@/components/content/StarRating";
import { formatDuration, formatFileSize } from "@/lib/utils";

const categoryAccents: Record<string, string> = {
  literature: "from-teal-700 via-teal-600 to-emerald-600",
  science: "from-sky-800 via-blue-700 to-indigo-700",
  history: "from-amber-700 via-orange-700 to-red-800",
  philosophy: "from-violet-800 via-purple-700 to-indigo-800",
  podcast: "from-rose-700 via-red-700 to-amber-800",
  children: "from-cyan-700 via-teal-600 to-sky-600",
};

type ContentCardProps = {
  content: {
    id: string;
    title: string;
    description?: string | null;
    type: "EBOOK" | "AUDIOBOOK";
    author: { name: string };
    category: { name: string; slug?: string };
    averageRating: number;
    reviewCount: number;
    downloadCount: number;
    fileSize?: number | null;
    duration?: number | null;
  };
};

export function ContentCard({ content }: ContentCardProps) {
  const href =
    content.type === "EBOOK"
      ? `/content/${content.id}/read`
      : `/content/${content.id}/listen`;

  const accent =
    categoryAccents[content.category.slug || "literature"] || categoryAccents.literature;

  return (
    <Link
      href={href}
      className="surface-card group flex h-full flex-col overflow-hidden rounded-xl shadow-sm transition active:scale-[0.98] hover:-translate-y-0.5 hover:border-teal-brand/40 hover:shadow-md dark:hover:border-teal-brand/30"
    >
      <div className={`relative h-16 bg-gradient-to-bl ${accent} persian-pattern`}>
        <div className="absolute inset-x-0 top-0 h-0.5 bg-gold-brand/70" />
        <div className="absolute bottom-2 right-2 rounded-md bg-surface/90 p-1 text-teal-brand shadow-sm">
          {content.type === "EBOOK" ? <BookOpen size={14} /> : <Headphones size={14} />}
        </div>
        <Badge
          variant={content.type === "EBOOK" ? "default" : "success"}
          className="absolute left-2 top-2 scale-90"
        >
          {content.type === "EBOOK" ? "کتاب" : "صوتی"}
        </Badge>
      </div>

      <div className="flex flex-1 flex-col p-3 sm:p-3.5">
        <h3 className="mb-1 line-clamp-2 text-[13px] font-bold leading-snug text-foreground group-hover:text-teal-brand sm:text-sm">
          {content.title}
        </h3>
        <p className="mb-2 line-clamp-2 flex-1 text-xs leading-relaxed text-muted">
          {content.description || "بدون توضیحات"}
        </p>

        <div className="space-y-1 border-t border-border-persian pt-2 text-[11px] text-muted">
          <p className="truncate text-foreground/80">{content.author.name}</p>
          <div className="flex items-center justify-between gap-2">
            <span className="rounded bg-surface-muted px-1.5 py-0.5 text-[10px] text-gold-brand">
              {content.category.name}
            </span>
            <StarRating value={content.averageRating} size={11} showValue={false} />
          </div>
          <div className="flex items-center justify-between pt-0.5">
            <span>{content.reviewCount} نظر</span>
            <span>
              {content.type === "EBOOK"
                ? formatFileSize(content.fileSize)
                : formatDuration(content.duration)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

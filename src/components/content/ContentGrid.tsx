import { ContentCard } from "@/components/content/ContentCard";

type ContentGridProps = {
  items: Parameters<typeof ContentCard>[0]["content"][];
  emptyMessage?: string;
};

export function ContentGrid({ items, emptyMessage = "محتوایی یافت نشد." }: ContentGridProps) {
  if (items.length === 0) {
    return (
      <div className="surface-panel rounded-xl border-dashed px-6 py-12 text-center text-sm text-muted">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {items.map((item) => (
        <ContentCard key={item.id} content={item} />
      ))}
    </div>
  );
}

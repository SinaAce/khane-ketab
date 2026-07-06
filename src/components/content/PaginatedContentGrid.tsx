"use client";

import { useEffect, useMemo, useState } from "react";
import { ContentCard } from "@/components/content/ContentCard";
import { Pagination } from "@/components/ui/Pagination";

type ContentItem = Parameters<typeof ContentCard>[0]["content"];

type PaginatedContentGridProps = {
  items: ContentItem[];
  pageSize?: number;
  emptyMessage?: string;
  columns?: "home" | "browse";
};

export function PaginatedContentGrid({
  items,
  pageSize = 4,
  emptyMessage = "محتوایی یافت نشد.",
  columns = "home",
}: PaginatedContentGridProps) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  useEffect(() => {
    setPage(1);
  }, [items, pageSize]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const visibleItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  if (items.length === 0) {
    return (
      <div className="surface-panel rounded-xl border-dashed px-6 py-12 text-center text-sm text-muted">
        {emptyMessage}
      </div>
    );
  }

  const gridClass =
    columns === "home"
      ? "grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4"
      : "grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";

  return (
    <>
      <div className={gridClass}>
        {visibleItems.map((item) => (
          <ContentCard key={item.id} content={item} />
        ))}
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </>
  );
}

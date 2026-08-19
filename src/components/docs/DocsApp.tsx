"use client";

import { useCallback, useEffect, useState } from "react";
import { Search, X, BookOpen, ChevronLeft, Filter, Loader2 } from "lucide-react";
import { CATEGORY_LABELS, type DocCategory, type DocEntry } from "@/lib/docs/types";
import { DocsBody } from "@/components/docs/DocsBody";
import { cn } from "@/lib/utils";

const CATEGORIES: DocCategory[] = [
  "concepts",
  "database",
  "api",
  "backend",
  "frontend",
  "pages",
  "config",
  "flows",
];

type IndexItem = {
  id: string;
  category: DocCategory;
  categoryLabel: string;
  title: string;
  filePath?: string;
};

type SearchResult = IndexItem & { snippet: string };

export function DocsApp() {
  const [query, setQuery] = useState("");
  const [filterCat, setFilterCat] = useState<DocCategory | "all">("all");
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [index, setIndex] = useState<IndexItem[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [activeEntry, setActiveEntry] = useState<DocEntry | null>(null);
  const [entryLoading, setEntryLoading] = useState(false);

  const loadIndex = useCallback(async (cat: DocCategory | "all") => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (cat !== "all") params.set("category", cat);
      const res = await fetch(`/api/docs?${params}`);
      const data = await res.json();
      setIndex(data.index || []);
      setTotalCount(data.count || 0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadIndex(filterCat);
  }, [filterCat, loadIndex]);

  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await fetch(`/api/docs?q=${encodeURIComponent(query.trim())}`);
        const data = await res.json();
        setSearchResults(data.results || []);
      } finally {
        setSearchLoading(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [query]);

  const openEntry = useCallback(async (id: string) => {
    setEntryLoading(true);
    setQuery("");
    window.scrollTo({ top: 0, behavior: "smooth" });
    try {
      const res = await fetch(`/api/docs?id=${encodeURIComponent(id)}`);
      const data = await res.json();
      setActiveEntry(data.entry || null);
    } finally {
      setEntryLoading(false);
    }
  }, []);

  const showSearch = query.trim().length > 0;
  const grouped = CATEGORIES.map((cat) => ({
    cat,
    items: index.filter((i) => i.category === cat),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="mx-auto max-w-3xl px-4 pb-28 pt-4 sm:max-w-4xl sm:px-6 md:pb-8">
      <div className="mb-4 text-center">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-teal-brand/10 px-3 py-1 text-xs font-medium text-teal-brand">
          <BookOpen size={14} />
          {totalCount || "…"} بخش · توضیح خط‌به‌خط
        </div>
        <h1 className="text-xl font-bold text-teal-brand sm:text-2xl">راهنمای کامل پروژه</h1>
        <p className="mt-1 text-sm text-muted">
          فرانت · بک‌اند · API · دیتابیس · کد خط‌به‌خط
        </p>
      </div>

      <div className="sticky top-[52px] z-40 -mx-4 mb-4 border-b border-border-persian bg-surface/95 px-4 py-3 backdrop-blur-md sm:top-[60px]">
        <div className="relative">
          <Search size={18} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="جستجو: jwt prisma api upload SaveButton …"
            className="surface-input w-full rounded-xl border border-border-persian py-3 pl-10 pr-10 text-sm focus:border-teal-brand focus:outline-none focus:ring-2 focus:ring-teal-brand/20"
            autoComplete="off"
          />
          {(query || searchLoading) && (
            <div className="absolute left-3 top-1/2 flex -translate-y-1/2 items-center gap-1">
              {searchLoading && <Loader2 size={16} className="animate-spin text-muted" />}
              {query && !searchLoading && (
                <button type="button" onClick={() => setQuery("")} className="rounded-lg p-1 text-muted">
                  <X size={16} />
                </button>
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setShowFilters((v) => !v)}
          className="mt-2 flex items-center gap-1.5 text-xs text-muted hover:text-teal-brand"
        >
          <Filter size={14} />
          فیلتر دسته
        </button>

        {showFilters && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            <CatChip label="همه" active={filterCat === "all"} onClick={() => setFilterCat("all")} />
            {CATEGORIES.map((c) => (
              <CatChip
                key={c}
                label={CATEGORY_LABELS[c]}
                active={filterCat === c}
                onClick={() => setFilterCat(c)}
              />
            ))}
          </div>
        )}
      </div>

      {showSearch && (
        <section className="mb-6">
          <p className="mb-2 text-xs text-muted">
            {searchLoading ? "در حال جستجو…" : `${searchResults.length} نتیجه`}
          </p>
          <ul className="space-y-2">
            {searchResults.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => openEntry(r.id)}
                  className="w-full rounded-xl border border-border-persian bg-surface-panel p-3 text-right hover:border-teal-brand/50"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="shrink-0 rounded-md bg-teal-brand/10 px-2 py-0.5 text-[10px] text-teal-brand">
                      {r.categoryLabel}
                    </span>
                    <span className="flex-1 text-sm font-medium">{r.title}</span>
                  </div>
                  {r.filePath && (
                    <code className="mt-1 block truncate font-mono text-[10px] text-rose-600" dir="ltr">
                      {r.filePath}
                    </code>
                  )}
                  <p className="mt-1.5 text-xs text-muted">{r.snippet}</p>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {entryLoading && (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-teal-brand" size={32} />
        </div>
      )}

      {activeEntry && !showSearch && !entryLoading && (
        <article className="mb-8 rounded-2xl border border-border-persian bg-surface-panel p-4 sm:p-6">
          <button
            type="button"
            onClick={() => setActiveEntry(null)}
            className="mb-3 flex items-center gap-1 text-xs text-teal-brand"
          >
            <ChevronLeft size={14} />
            بازگشت
          </button>
          <span className="mb-2 inline-block rounded-md bg-teal-brand/10 px-2 py-0.5 text-xs text-teal-brand">
            {CATEGORY_LABELS[activeEntry.category]}
          </span>
          <h2 className="mb-1 text-lg font-bold text-teal-brand">{activeEntry.title}</h2>
          {activeEntry.filePath && (
            <code className="mb-4 block rounded-lg bg-surface-muted px-3 py-2 font-mono text-xs text-rose-700" dir="ltr">
              {activeEntry.filePath}
            </code>
          )}
          <DocsBody body={activeEntry.body} />
        </article>
      )}

      {!showSearch && !activeEntry && !entryLoading && (
        <>
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="animate-spin text-teal-brand" size={28} />
            </div>
          ) : (
            <div className="space-y-6">
              {grouped.map(({ cat, items }) => (
                <section key={cat}>
                  <h2 className="mb-3 border-r-4 border-teal-brand pr-3 text-base font-bold text-teal-brand">
                    {CATEGORY_LABELS[cat]}
                    <span className="mr-2 text-xs font-normal text-muted">({items.length})</span>
                  </h2>
                  <ul className="space-y-2">
                    {items.map((item) => (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => openEntry(item.id)}
                          className="flex w-full flex-col gap-0.5 rounded-xl border border-border-persian bg-surface-panel px-3 py-2.5 text-right hover:border-teal-brand/40 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <span className="text-sm font-medium">{item.title}</span>
                          {item.filePath && (
                            <code className="truncate font-mono text-[10px] text-muted" dir="ltr">
                              {item.filePath}
                            </code>
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}

          <div className="mt-8 rounded-xl border border-dashed border-teal-brand/40 bg-teal-brand/5 p-4 text-sm">
            <p className="font-medium text-teal-brand">💡 جستجوی پیشنهادی</p>
            <p className="mt-1 text-xs text-muted">
              <code>jwt</code> · <code>prisma user</code> · <code>api upload</code> ·{" "}
              <code>schema content</code> · <code>SaveButton</code> · <code>route.ts</code>
            </p>
          </div>
        </>
      )}
    </div>
  );
}

function CatChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg px-2.5 py-1 text-[11px] font-medium",
        active ? "bg-teal-brand text-white" : "bg-surface-muted text-muted",
      )}
    >
      {label}
    </button>
  );
}

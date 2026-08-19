"use client";

import { useCallback, useMemo, useState } from "react";
import { Search, X, BookOpen, ChevronLeft, Filter } from "lucide-react";
import { DOC_ENTRIES, DOC_COUNT } from "@/lib/docs/entries";
import { CATEGORY_LABELS, type DocCategory, type DocEntry } from "@/lib/docs/types";
import { highlightSnippet, searchDocs } from "@/lib/docs/search";
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

export function DocsApp() {
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [filterCat, setFilterCat] = useState<DocCategory | "all">("all");
  const [showFilters, setShowFilters] = useState(false);

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    return searchDocs(query, DOC_ENTRIES);
  }, [query]);

  const activeEntry = useMemo(() => {
    if (activeId) return DOC_ENTRIES.find((e) => e.id === activeId) ?? null;
    return null;
  }, [activeId]);

  const openEntry = useCallback((entry: DocEntry) => {
    setActiveId(entry.id);
    setQuery("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const showSearch = query.trim().length > 0;

  return (
    <div className="mx-auto max-w-3xl px-4 pb-28 pt-4 sm:px-6 md:pb-8">
      {/* Header */}
      <div className="mb-4 text-center">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-teal-brand/10 px-3 py-1 text-xs font-medium text-teal-brand">
          <BookOpen size={14} />
          {DOC_COUNT} بخش آموزشی
        </div>
        <h1 className="text-xl font-bold text-teal-brand sm:text-2xl">راهنمای کامل پروژه</h1>
        <p className="mt-1 text-sm text-muted">
          فرانت، بک‌اند، API، دیتابیس — از صفر تا صد · مخصوص موبایل
        </p>
      </div>

      {/* Search — sticky */}
      <div className="sticky top-[52px] z-40 -mx-4 mb-4 border-b border-border-persian bg-surface/95 px-4 py-3 backdrop-blur-md sm:top-[60px]">
        <div className="relative">
          <Search
            size={18}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="جستجو کلمه به کلمه… (مثلاً jwt api prisma)"
            className="surface-input w-full rounded-xl border border-border-persian py-3 pl-10 pr-10 text-sm focus:border-teal-brand focus:outline-none focus:ring-2 focus:ring-teal-brand/20"
            autoComplete="off"
            enterKeyHint="search"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-muted hover:bg-surface-muted"
              aria-label="پاک کردن"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setShowFilters((v) => !v)}
          className="mt-2 flex items-center gap-1.5 text-xs text-muted hover:text-teal-brand"
        >
          <Filter size={14} />
          فیلتر دسته‌بندی
        </button>

        {showFilters && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            <CatChip
              label="همه"
              active={filterCat === "all"}
              onClick={() => setFilterCat("all")}
            />
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

      {/* Search results */}
      {showSearch && (
        <section className="mb-6">
          <p className="mb-2 text-xs text-muted">
            {searchResults.length
              ? `${searchResults.length} نتیجه برای «${query}»`
              : `نتیجه‌ای برای «${query}» یافت نشد`}
          </p>
          <ul className="space-y-2">
            {searchResults.map((entry) => (
              <li key={entry.id}>
                <button
                  type="button"
                  onClick={() => openEntry(entry)}
                  className="w-full rounded-xl border border-border-persian bg-surface-panel p-3 text-right transition hover:border-teal-brand/50 hover:bg-teal-brand/5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="shrink-0 rounded-md bg-teal-brand/10 px-2 py-0.5 text-[10px] font-medium text-teal-brand">
                      {CATEGORY_LABELS[entry.category]}
                    </span>
                    <span className="min-w-0 flex-1 font-medium text-sm">{entry.title}</span>
                  </div>
                  {entry.filePath && (
                    <code className="mt-1 block truncate font-mono text-[10px] text-rose-600 dark:text-rose-400" dir="ltr">
                      {entry.filePath}
                    </code>
                  )}
                  <p className="mt-1.5 text-xs leading-relaxed text-muted">
                    {highlightSnippet(entry, query)}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Active article */}
      {activeEntry && !showSearch && (
        <article className="mb-8 rounded-2xl border border-border-persian bg-surface-panel p-4 sm:p-6">
          <button
            type="button"
            onClick={() => setActiveId(null)}
            className="mb-3 flex items-center gap-1 text-xs text-teal-brand hover:underline"
          >
            <ChevronLeft size={14} />
            بازگشت به فهرست
          </button>
          <span className="mb-2 inline-block rounded-md bg-teal-brand/10 px-2 py-0.5 text-xs font-medium text-teal-brand">
            {CATEGORY_LABELS[activeEntry.category]}
          </span>
          <h2 className="mb-1 text-lg font-bold text-teal-brand">{activeEntry.title}</h2>
          {activeEntry.filePath && (
            <code
              className="mb-4 block rounded-lg bg-surface-muted px-3 py-2 font-mono text-xs text-rose-700 dark:text-rose-300"
              dir="ltr"
            >
              {activeEntry.filePath}
            </code>
          )}
          <DocsBody body={activeEntry.body} />
        </article>
      )}

      {/* Category browse (when no search and no active article) */}
      {!showSearch && !activeEntry && (
        <div className="space-y-6">
          {(filterCat === "all" ? CATEGORIES : [filterCat]).map((cat) => {
            const items = DOC_ENTRIES.filter((e) => e.category === cat);
            if (!items.length) return null;
            return (
              <section key={cat}>
                <h2 className="mb-3 border-r-4 border-teal-brand pr-3 text-base font-bold text-teal-brand">
                  {CATEGORY_LABELS[cat]}
                  <span className="mr-2 text-xs font-normal text-muted">({items.length})</span>
                </h2>
                <ul className="space-y-2">
                  {items.map((entry) => (
                    <li key={entry.id}>
                      <button
                        type="button"
                        onClick={() => openEntry(entry)}
                        className="flex w-full items-center justify-between gap-2 rounded-xl border border-border-persian bg-surface-panel px-3 py-2.5 text-right transition hover:border-teal-brand/40 hover:bg-teal-brand/5"
                      >
                        <span className="text-sm font-medium">{entry.title}</span>
                        {entry.filePath && (
                          <code className="hidden max-w-[45%] truncate font-mono text-[10px] text-muted sm:block" dir="ltr">
                            {entry.filePath}
                          </code>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}

      {/* Quick tips when browsing */}
      {!showSearch && !activeEntry && (
        <div className="mt-8 rounded-xl border border-dashed border-teal-brand/40 bg-teal-brand/5 p-4 text-sm">
          <p className="font-medium text-teal-brand">💡 نکته جستجو</p>
          <p className="mt-1 text-muted">
            چند کلمه بنویسید — همه باید در متن باشند. مثال:{" "}
            <code className="text-xs">jwt cookie</code> ·{" "}
            <code className="text-xs">api upload</code> ·{" "}
            <code className="text-xs">prisma user</code> ·{" "}
            <code className="text-xs">BrowseSearch</code>
          </p>
        </div>
      )}
    </div>
  );
}

function CatChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg px-2.5 py-1 text-[11px] font-medium transition",
        active
          ? "bg-teal-brand text-white"
          : "bg-surface-muted text-muted hover:bg-teal-brand/10 hover:text-teal-brand",
      )}
    >
      {label}
    </button>
  );
}

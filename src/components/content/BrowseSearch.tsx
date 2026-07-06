"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ContentCard } from "@/components/content/ContentCard";
import { PageSizeSelect, Pagination } from "@/components/ui/Pagination";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { PersianLoader } from "@/components/ui/PersianLoader";

type Category = { id: string; name: string; slug: string };

type ContentItem = Parameters<typeof ContentCard>[0]["content"];

type SortOption = "newest" | "popular" | "rating";

type BrowseSearchProps = {
  categories: Category[];
  initialContents: ContentItem[];
  initialTotal: number;
  initialTotalPages: number;
  initialParams: {
    q?: string;
    type?: "EBOOK" | "AUDIOBOOK";
    category?: string;
    sort?: SortOption;
    page?: number;
    pageSize?: number;
  };
};

export function BrowseSearch({
  categories,
  initialContents,
  initialTotal,
  initialTotalPages,
  initialParams,
}: BrowseSearchProps) {
  const router = useRouter();

  const [q, setQ] = useState(initialParams.q || "");
  const [type, setType] = useState(initialParams.type || "");
  const [category, setCategory] = useState(initialParams.category || "");
  const [sort, setSort] = useState<SortOption>(initialParams.sort || "newest");
  const [page, setPage] = useState(initialParams.page || 1);
  const [pageSize, setPageSize] = useState(initialParams.pageSize || 20);
  const [contents, setContents] = useState(initialContents);
  const [total, setTotal] = useState(initialTotal);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [loading, setLoading] = useState(false);
  const isFirstRender = useRef(true);
  const filterKey = useMemo(
    () => `${q}|${type}|${category}|${sort}|${pageSize}`,
    [q, type, category, sort, pageSize],
  );
  const previousFilterKey = useRef(filterKey);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (type) params.set("type", type);
    if (category) params.set("category", category);
    if (sort) params.set("sort", sort);
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));
    return params.toString();
  }, [q, type, category, sort, page, pageSize]);

  const fetchContents = useCallback(async (query: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/contents?${query}`);
      const data = await response.json();
      setContents(data.contents || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch {
      setContents([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isFirstRender.current) {
        isFirstRender.current = false;
        return;
      }

      router.replace(`/browse?${queryString}`, { scroll: false });
      void fetchContents(queryString);
    }, 300);

    return () => clearTimeout(timer);
  }, [queryString, fetchContents, router]);

  useEffect(() => {
    if (previousFilterKey.current === filterKey) return;
    previousFilterKey.current = filterKey;
    setPage(1);
  }, [filterKey]);

  return (
    <>
      <ScrollReveal variant="up" delay={80}>
        <div className="mb-6 grid gap-3 surface-panel rounded-xl p-4 sm:mb-8 sm:p-5 lg:grid-cols-4">
          <input
            value={q}
            onChange={(event) => setQ(event.target.value)}
            placeholder="جستجو در عنوان و توضیحات..."
            className="mobile-input surface-input rounded-lg focus:border-teal-brand focus:outline-none lg:col-span-2"
          />
          <select
            value={type}
            onChange={(event) => setType(event.target.value)}
            className="mobile-input surface-input rounded-lg focus:border-teal-brand focus:outline-none"
          >
            <option value="">همه انواع</option>
            <option value="EBOOK">کتاب</option>
            <option value="AUDIOBOOK">صوتی</option>
          </select>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="mobile-input surface-input rounded-lg focus:border-teal-brand focus:outline-none"
          >
            <option value="">همه دسته‌ها</option>
            {categories.map((item) => (
              <option key={item.id} value={item.slug}>
                {item.name}
              </option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as SortOption)}
            className="mobile-input surface-input rounded-lg focus:border-teal-brand focus:outline-none lg:col-span-2"
          >
            <option value="newest">جدیدترین</option>
            <option value="popular">محبوب‌ترین</option>
            <option value="rating">بیشترین امتیاز</option>
          </select>
          <PageSizeSelect
            value={pageSize}
            onChange={setPageSize}
            className="lg:col-span-2 lg:justify-self-end"
          />
          {loading && <p className="text-xs text-teal-brand lg:col-span-4">در حال جستجو...</p>}
        </div>
      </ScrollReveal>

      <ScrollReveal variant="fade" delay={120}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
          <span>
            {total.toLocaleString("fa-IR")} نتیجه
            {totalPages > 1 && ` — صفحه ${page.toLocaleString("fa-IR")} از ${totalPages.toLocaleString("fa-IR")}`}
          </span>
        </div>
      </ScrollReveal>

      {loading && contents.length === 0 ? (
        <PersianLoader label="در حال جستجو..." />
      ) : contents.length === 0 ? (
        <div className="surface-panel rounded-xl border-dashed px-6 py-12 text-center text-sm text-muted">
          محتوایی یافت نشد.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {contents.map((item, index) => (
              <ScrollReveal key={item.id} delay={index * 60} variant="up">
                <ContentCard content={item} />
              </ScrollReveal>
            ))}
          </div>

          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </>
  );
}

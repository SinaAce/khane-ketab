export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { BrowseSearch } from "@/components/content/BrowseSearch";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { PersianLoader } from "@/components/ui/PersianLoader";
import { prisma } from "@/lib/prisma";
import { getApprovedContents } from "@/lib/content";

type BrowsePageProps = {
  searchParams: Promise<{
    q?: string;
    type?: "EBOOK" | "AUDIOBOOK";
    category?: string;
    sort?: "newest" | "popular" | "rating";
    page?: string;
    pageSize?: string;
  }>;
};

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const params = await searchParams;
  const page = Number(params.page) > 0 ? Number(params.page) : 1;
  const pageSize = Number(params.pageSize) > 0 ? Number(params.pageSize) : 20;

  let result: Awaited<ReturnType<typeof getApprovedContents>> = {
    items: [],
    total: 0,
    page: 1,
    pageSize: 20,
    totalPages: 1,
  };
  let categories: Awaited<ReturnType<typeof prisma.category.findMany>> = [];
  let dbError = false;

  try {
    [result, categories] = await Promise.all([
      getApprovedContents({ ...params, page, pageSize }),
      prisma.category.findMany({ orderBy: { name: "asc" } }),
    ]);
  } catch {
    dbError = true;
  }

  return (
    <div className="page-shell mx-auto max-w-7xl py-6 sm:py-10">
      <ScrollReveal variant="up">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl font-bold text-teal-brand sm:text-2xl">کتاب‌ها و پادکست‌ها</h1>
          <p className="mt-2 text-sm text-muted">همینجا جستجو کن، فیلتر بزن، چیزی که می‌خوای پیدا کن</p>
        </div>
      </ScrollReveal>

      {dbError && (
        <div className="mb-6 rounded-xl border border-amber-300/40 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
          اتصال به دیتابیس برقرار نیست. ابتدا این دستور را اجرا کنید:{" "}
          <code className="rounded bg-black/5 px-1 dark:bg-white/10">npx prisma dev -d -n ebook-marketplace</code>
        </div>
      )}

      <Suspense fallback={<PersianLoader label="در حال بارگذاری فیلترها..." />}>
        <BrowseSearch
          categories={categories}
          initialContents={result.items}
          initialTotal={result.total}
          initialTotalPages={result.totalPages}
          initialParams={{ ...params, page, pageSize }}
        />
      </Suspense>
    </div>
  );
}

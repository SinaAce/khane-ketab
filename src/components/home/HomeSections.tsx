"use client";

import Link from "next/link";
import { BookMarked, Sparkles } from "lucide-react";
import { PaginatedContentGrid } from "@/components/content/PaginatedContentGrid";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

type ContentItem = Parameters<typeof PaginatedContentGrid>[0]["items"][number];

type HomeSectionsProps = {
  recommended: ContentItem[];
  latest: ContentItem[];
};

export function HomeSections({ recommended, latest }: HomeSectionsProps) {
  const historyItems = latest.filter(
    (item) =>
      item.category.slug === "history" ||
      item.title.includes("ایران") ||
      item.title.includes("جهان") ||
      item.title.includes("تاریخ"),
  );

  return (
    <>
      <ScrollReveal variant="blur">
        <section className="page-shell mx-auto max-w-7xl py-8 sm:py-12">
          <div className="mb-4 flex items-center gap-2 sm:mb-6">
            <BookMarked className="shrink-0 text-gold-brand" size={20} />
            <h2 className="text-lg font-bold text-teal-brand sm:text-xl">تاریخ ایران و جهان</h2>
          </div>
          <PaginatedContentGrid
            items={historyItems.length > 0 ? historyItems : latest}
            pageSize={4}
            emptyMessage="محتوای تاریخی هنوز ثبت نشده است."
          />
        </section>
      </ScrollReveal>

      <ScrollReveal variant="rise" delay={80}>
        <section className="page-shell mx-auto max-w-7xl pb-8 sm:pb-12">
          <div className="mb-4 flex items-center gap-2 sm:mb-6">
            <Sparkles className="shrink-0 text-gold-brand" size={20} />
            <h2 className="text-lg font-bold text-teal-brand sm:text-xl">پیشنهاد برای شما</h2>
          </div>
          <PaginatedContentGrid
            items={recommended}
            pageSize={4}
            emptyMessage="هنوز محتوای تأییدشده‌ای وجود ندارد."
          />
        </section>
      </ScrollReveal>

      <ScrollReveal variant="blur" delay={120}>
        <section className="persian-section py-8 sm:py-12">
          <div className="page-shell mx-auto max-w-7xl">
            <div className="mb-4 flex flex-col gap-2 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-bold text-teal-brand sm:text-xl">جدیدترین کتاب‌ها و پادکست‌ها</h2>
              <Link
                href="/browse"
                className="inline-flex min-h-[2.75rem] items-center text-sm font-medium text-teal-brand hover:underline sm:min-h-0"
              >
                همه رو ببین
              </Link>
            </div>
            <PaginatedContentGrid items={latest} pageSize={4} />
          </div>
        </section>
      </ScrollReveal>
    </>
  );
}

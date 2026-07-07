"use client";

import Link from "next/link";
import { BookMarked, Sparkles } from "lucide-react";
import { ContentCard } from "@/components/content/ContentCard";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

type ContentItem = Parameters<typeof ContentCard>[0]["content"];

type HomeSectionsProps = {
  recommended: ContentItem[];
  latest: ContentItem[];
};

const GRID_CLASS = "grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4";

function ContentGrid({ items, emptyMessage }: { items: ContentItem[]; emptyMessage: string }) {
  if (items.length === 0) {
    return (
      <div className="surface-panel rounded-xl border-dashed px-6 py-12 text-center text-sm text-muted">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={GRID_CLASS}>
      {items.slice(0, 4).map((item) => (
        <ContentCard key={item.id} content={item} />
      ))}
    </div>
  );
}

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
          <ContentGrid
            items={historyItems.length > 0 ? historyItems : latest}
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
          <ContentGrid
            items={recommended}
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
                مشاهده همه
              </Link>
            </div>
            <ContentGrid items={latest} emptyMessage="محتوایی یافت نشد." />
          </div>
        </section>
      </ScrollReveal>
    </>
  );
}

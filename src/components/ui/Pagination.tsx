"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { buttonInteraction, buttonNavClass } from "@/lib/button-styles";
import { cn } from "@/lib/utils";

type PaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  showDots?: boolean;
};

export function Pagination({
  page,
  totalPages,
  onPageChange,
  className,
  showDots = true,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  const navButtonClass = cn(buttonNavClass, buttonInteraction);

  return (
    <div className={cn("mt-5 flex flex-wrap items-center justify-center gap-2 sm:mt-6 sm:gap-3", className)}>
      <button
        type="button"
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page <= 1}
        aria-label="صفحه قبل"
        className={navButtonClass}
      >
        <ChevronRight size={16} />
        قبل
      </button>

      {showDots && (
        <div className="hidden items-center gap-2 sm:flex">
          {pages.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              aria-label={`صفحه ${item}`}
              aria-current={item === page ? "page" : undefined}
              className={cn(
                "h-2.5 rounded-full transition-all duration-200 hover:scale-110",
                item === page
                  ? "w-8 bg-teal-brand"
                  : "w-2.5 bg-border-persian hover:bg-gold-brand/70",
              )}
            />
          ))}
        </div>
      )}

      <span className="min-w-14 rounded-lg bg-surface-muted px-2 py-1.5 text-center text-sm tabular-nums text-muted sm:min-w-16 sm:bg-transparent sm:py-0">
        {page.toLocaleString("fa-IR")} / {totalPages.toLocaleString("fa-IR")}
      </span>

      <button
        type="button"
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page >= totalPages}
        aria-label="صفحه بعد"
        className={navButtonClass}
      >
        بعد
        <ChevronLeft size={16} />
      </button>
    </div>
  );
}

type PageSizeSelectProps = {
  value: number;
  onChange: (value: number) => void;
  options?: number[];
  className?: string;
};

export function PageSizeSelect({
  value,
  onChange,
  options = [10, 20, 40, 60],
  className,
}: PageSizeSelectProps) {
  return (
    <label
      className={cn(
        "inline-flex w-auto items-center gap-1.5 text-xs text-muted sm:gap-2",
        className,
      )}
    >
      <span className="whitespace-nowrap">تعداد در صفحه:</span>
      <select
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="surface-input w-14 rounded-lg px-2 py-1 text-xs text-foreground focus:border-teal-brand focus:outline-none sm:w-16 sm:py-1.5 sm:text-sm"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option.toLocaleString("fa-IR")}
          </option>
        ))}
      </select>
    </label>
  );
}

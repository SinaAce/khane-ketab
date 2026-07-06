"use client";

import type { CSSProperties } from "react";
import { Crown, Download, Inbox, MessageSquare, Save, Upload } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimateOnView } from "@/components/admin/AnimateOnView";
import { AnimatedNumber } from "@/components/admin/AnimatedNumber";
import { useAnimateOnView } from "@/components/admin/useAnimateOnView";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Pagination } from "@/components/ui/Pagination";
import { cn } from "@/lib/utils";

type TopCategory = "uploads" | "reviews" | "saved" | "downloads";

type TopUserItem = {
  rank: number;
  value: number;
  user: {
    id: string;
    name: string;
    email: string;
    role: "USER" | "ADMIN";
    blocked: boolean;
  };
};

const categories: {
  id: TopCategory;
  label: string;
  shortLabel: string;
  unit: string;
  icon: typeof Upload;
}[] = [
  { id: "uploads", label: "بیشترین آپلود", shortLabel: "آپلود", unit: "آپلود", icon: Upload },
  { id: "reviews", label: "بیشترین نظر", shortLabel: "نظر", unit: "نظر", icon: MessageSquare },
  { id: "saved", label: "بیشترین ذخیره", shortLabel: "ذخیره", unit: "ذخیره", icon: Save },
  { id: "downloads", label: "بیشترین دانلود", shortLabel: "دانلود", unit: "دانلود", icon: Download },
];

function rankClass(rank: number) {
  if (rank === 1) return "admin-rank-1";
  if (rank === 2) return "admin-rank-2";
  if (rank === 3) return "admin-rank-3";
  return "";
}

function podiumClass(rank: number) {
  if (rank === 1) return "admin-podium-gold";
  if (rank === 2) return "admin-podium-silver";
  if (rank === 3) return "admin-podium-bronze";
  return "";
}

function TopUsersSkeleton() {
  return (
    <div className="space-y-3">
      <div className="admin-shimmer h-28 rounded-xl sm:h-32" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="admin-user-skeleton" />
      ))}
    </div>
  );
}

function PodiumCard({
  item,
  rank,
  unit,
  delay,
}: {
  item: TopUserItem;
  rank: number;
  unit: string;
  delay: number;
}) {
  const { setRef, visible, animationClass } = useAnimateOnView();

  return (
    <div
      ref={setRef}
      className={animationClass("podium", cn("admin-podium-card", podiumClass(rank)))}
      style={{ animationDelay: visible ? `${delay}s` : undefined }}
    >
      <span
        className={cn(
          "admin-rank-medal mx-auto mb-2 h-9 w-9 text-sm sm:h-10 sm:w-10",
          rankClass(rank),
          visible && "admin-animate-medal admin-is-visible",
        )}
        style={{ animationDelay: visible ? `${delay + 0.15}s` : undefined }}
      >
        {rank.toLocaleString("fa-IR")}
      </span>
      <p className="truncate text-sm font-semibold text-foreground">{item.user.name}</p>
      <p className="mt-1 text-lg font-bold text-gold-brand sm:text-xl">
        <AnimatedNumber value={item.value} duration={900} active={visible} />
      </p>
      <p className="text-[10px] text-muted sm:text-xs">{unit}</p>
    </div>
  );
}

export function AdminTopUsers() {
  const [category, setCategory] = useState<TopCategory>("uploads");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<TopUserItem[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [headerVisible, setHeaderVisible] = useState(false);

  const activeCategory = categories.find((item) => item.id === category)!;

  const loadTopUsers = useCallback(async (cat: TopCategory, targetPage: number) => {
    setLoading(true);
    setError(null);

    const response = await fetch(`/api/admin/top-users?category=${cat}&page=${targetPage}`);
    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.error || "خطا در بارگذاری کاربران برتر.");
      setItems([]);
      return;
    }

    setItems(data.items || []);
    setTotal(data.total || 0);
    setTotalPages(data.totalPages || 1);
    setPage(data.page || targetPage);
  }, []);

  useEffect(() => {
    void loadTopUsers(category, page);
  }, [category, page, loadTopUsers]);

  const maxValue = useMemo(() => Math.max(...items.map((item) => item.value), 1), [items]);

  const topThree = page === 1 ? items.filter((item) => item.rank <= 3) : [];
  const listItems = page === 1 ? items.filter((item) => item.rank > 3) : items;

  function changeCategory(next: TopCategory) {
    setCategory(next);
    setPage(1);
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="scroll-tabs">
        {categories.map((item) => {
          const Icon = item.icon;
          const isActive = category === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => changeCategory(item.id)}
              className={cn(
                "touch-target inline-flex min-h-[2.75rem] shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300 sm:min-h-0 sm:px-4 sm:py-2",
                isActive
                  ? "admin-main-tab-active bg-teal-brand text-white shadow-md shadow-teal-brand/25"
                  : "surface-panel text-muted hover:scale-[1.02] hover:text-foreground",
              )}
            >
              <Icon size={15} />
              <span className="hidden sm:inline">{item.label}</span>
              <span className="sm:hidden">{item.shortLabel}</span>
            </button>
          );
        })}
      </div>

      <AnimateOnView animation="rise" onVisibleChange={setHeaderVisible}>
        <Card className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex items-center gap-2">
            <Crown size={18} className="admin-empty-icon text-gold-brand" />
            <p className="text-sm font-medium text-foreground sm:text-base">{activeCategory.label}</p>
          </div>
          <p className="text-xs text-muted">
            <AnimatedNumber value={total} duration={700} active={headerVisible} /> کاربر — صفحه{" "}
            {page.toLocaleString("fa-IR")} از {totalPages.toLocaleString("fa-IR")}
          </p>
        </Card>
      </AnimateOnView>

      {loading ? (
        <TopUsersSkeleton />
      ) : error ? (
        <AnimateOnView animation="rise">
          <Card className="border-amber-300/40 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
            <p className="text-sm">{error}</p>
          </Card>
        </AnimateOnView>
      ) : items.length === 0 ? (
        <AnimateOnView animation="rise">
          <Card className="flex flex-col items-center gap-3 py-10 text-center">
            <Inbox size={40} className="admin-empty-icon text-muted" />
            <p className="text-muted">هنوز کاربری در این بخش ثبت نشده.</p>
          </Card>
        </AnimateOnView>
      ) : (
        <AnimateOnView animation="category" className="space-y-4" key={`${category}-${page}`}>
          {topThree.length > 0 && (
            <>
              {topThree.length === 1 ? (
                <div className="admin-top-podium-single">
                  <PodiumCard item={topThree[0]} rank={1} unit={activeCategory.unit} delay={0.05} />
                </div>
              ) : (
                <div className="admin-top-podium">
                  {[2, 1, 3].map((rank) => {
                    const item = topThree.find((entry) => entry.rank === rank);
                    if (!item) return null;
                    return (
                      <PodiumCard
                        key={item.user.id}
                        item={item}
                        rank={rank}
                        unit={activeCategory.unit}
                        delay={rank * 0.1}
                      />
                    );
                  })}
                </div>
              )}
            </>
          )}

          <div className="space-y-3">
            {listItems.map((item, index) => (
              <TopUserCard
                key={`${item.user.id}-${item.rank}`}
                item={item}
                index={index}
                maxValue={maxValue}
                unit={activeCategory.unit}
              />
            ))}
          </div>
        </AnimateOnView>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} showDots={false} />
    </div>
  );
}

function TopUserCard({
  item,
  index,
  maxValue,
  unit,
}: {
  item: TopUserItem;
  index: number;
  maxValue: number;
  unit: string;
}) {
  const { setRef, visible, animationClass } = useAnimateOnView();
  const pct = Math.round((item.value / maxValue) * 100);
  const isMedal = item.rank <= 3;

  return (
    <Card
      ref={setRef}
      className={animationClass(
        "slide",
        cn(
          "flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-5",
          item.rank === 1 && "border-gold-brand/30",
        ),
      )}
      style={{ animationDelay: visible ? `${0.05 + index * 0.06}s` : undefined }}
    >
      <div className="flex min-w-0 items-center gap-3">
        <span
          className={cn(
            "admin-rank-medal h-9 w-9 text-sm sm:h-10 sm:w-10",
            isMedal ? rankClass(item.rank) : "bg-surface-muted text-teal-brand",
          )}
        >
          {item.rank.toLocaleString("fa-IR")}
        </span>
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground">{item.user.name}</p>
          <p className="truncate text-xs text-muted">{item.user.email}</p>
          <div className="mt-1.5 flex flex-wrap gap-1">
            <Badge variant={item.user.role === "ADMIN" ? "success" : "default"}>
              {item.user.role === "ADMIN" ? "مدیر" : "کاربر"}
            </Badge>
            {item.user.blocked && <Badge variant="danger">مسدود</Badge>}
          </div>
        </div>
      </div>

      <div className="w-full sm:w-44 lg:w-52">
        <div className="mb-1 flex items-center justify-between gap-2">
          <span className="text-lg font-bold text-gold-brand sm:text-xl">
            <AnimatedNumber value={item.value} duration={800} active={visible} />
          </span>
          <span className="text-[10px] text-muted sm:text-xs">{unit}</span>
        </div>
        <div className="admin-progress-track">
          <div
            className={cn("admin-animate-progress admin-progress-fill", visible && "admin-is-visible")}
            style={
              {
                "--bar-width": `${pct}%`,
                animationDelay: visible ? `${0.15 + index * 0.07}s` : undefined,
              } as CSSProperties
            }
          />
        </div>
      </div>
    </Card>
  );
}

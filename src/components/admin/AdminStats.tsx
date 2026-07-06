"use client";

import {
  BookOpen,
  Download,
  FolderOpen,
  Headphones,
  MessageSquare,
  Shield,
  UserX,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { AnimateOnView } from "@/components/admin/AnimateOnView";
import { AdminBarChart } from "@/components/admin/AdminBarChart";
import { AdminDonutChart } from "@/components/admin/AdminDonutChart";
import { AdminStatsHero } from "@/components/admin/AdminStatsHero";
import { AnimatedNumber } from "@/components/admin/AnimatedNumber";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

type SiteStats = {
  users: { total: number; admins: number; blocked: number; active: number };
  contents: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
    ebooks: number;
    audiobooks: number;
    downloads: number;
  };
  reviews: { total: number; approved: number; pending: number };
  engagement: { saved: number; notifications: number; unreadNotifications: number };
  categories: number;
};

const KPI_CARDS = [
  { key: "users", label: "کاربران", icon: Users, accent: "admin-kpi-teal" },
  { key: "contents", label: "محتوا", icon: BookOpen, accent: "admin-kpi-gold" },
  { key: "reviews", label: "نظرات", icon: MessageSquare, accent: "admin-kpi-emerald" },
  { key: "downloads", label: "دانلود", icon: Download, accent: "admin-kpi-sky" },
] as const;

function StatsSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="admin-stats-hero admin-shimmer h-36 rounded-2xl sm:h-44" />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="admin-shimmer h-28 rounded-xl sm:h-32" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="admin-shimmer h-64 rounded-xl" />
        <div className="admin-shimmer h-64 rounded-xl" />
      </div>
    </div>
  );
}

function KpiCard({
  card,
  value,
  index,
}: {
  card: (typeof KPI_CARDS)[number];
  value: number;
  index: number;
}) {
  const [visible, setVisible] = useState(false);
  const Icon = card.icon;

  return (
    <AnimateOnView animation="rise" delay={0.05 + index * 0.08} onVisibleChange={setVisible} className="h-full">
      <Card
        className={cn(
          "admin-kpi-card relative h-full overflow-hidden border-0 p-4 sm:p-5",
          card.accent,
        )}
      >
        <div className="admin-kpi-glow" />
        <div className="relative z-10">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs text-muted sm:text-sm">{card.label}</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/60 dark:bg-white/10">
              <Icon size={16} className="text-teal-brand" />
            </span>
          </div>
          <p className="text-2xl font-bold text-foreground sm:text-3xl">
            <AnimatedNumber value={value} duration={1000 + index * 150} active={visible} />
          </p>
        </div>
      </Card>
    </AnimateOnView>
  );
}

function MiniStatCard({
  label,
  value,
  icon: Icon,
  index,
}: {
  label: string;
  value: number;
  icon: typeof Shield;
  index: number;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <AnimateOnView animation="rise" delay={0.45 + index * 0.05} onVisibleChange={setVisible} className="h-full">
      <Card className="admin-mini-stat flex h-full flex-col items-center gap-1 p-3 text-center sm:p-4">
        <Icon size={18} className="text-gold-brand" />
        <p className="text-lg font-bold text-foreground sm:text-xl">
          <AnimatedNumber value={value} duration={900} active={visible} />
        </p>
        <p className="text-[10px] text-muted sm:text-xs">{label}</p>
      </Card>
    </AnimateOnView>
  );
}

export function AdminStats() {
  const [stats, setStats] = useState<SiteStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const response = await fetch("/api/admin/stats");
      const data = await response.json();
      setLoading(false);

      if (!response.ok) {
        setError(data.error || "خطا در بارگذاری آمار.");
        return;
      }

      setStats(data.stats);
    }

    void load();
  }, []);

  if (loading) return <StatsSkeleton />;

  if (error || !stats) {
    return (
      <Card className="border-amber-300/40 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
        <p className="text-sm">{error || "آمار در دسترس نیست."}</p>
      </Card>
    );
  }

  const kpiValues = {
    users: stats.users.total,
    contents: stats.contents.total,
    reviews: stats.reviews.total,
    downloads: stats.contents.downloads,
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <AdminStatsHero
        activeUsers={stats.users.active}
        approvedContents={stats.contents.approved}
        categories={stats.categories}
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {KPI_CARDS.map((card, index) => (
          <KpiCard key={card.key} card={card} value={kpiValues[card.key]} index={index} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <AnimateOnView animation="rise" delay={0.2}>
          <Card className="h-full overflow-hidden p-4 sm:p-6">
            <h4 className="mb-4 flex items-center gap-2 text-sm font-semibold text-teal-brand sm:text-base">
              <BookOpen size={18} />
              وضعیت محتوا
            </h4>
            <AdminDonutChart
              centerLabel="کل محتوا"
              centerValue={stats.contents.total}
              segments={[
                { label: "تأیید شده", value: stats.contents.approved, color: "#0d7377" },
                { label: "در انتظار", value: stats.contents.pending, color: "#c9a227" },
                { label: "رد شده", value: stats.contents.rejected, color: "#e11d48" },
              ]}
            />
          </Card>
        </AnimateOnView>

        <AnimateOnView animation="rise" delay={0.28}>
          <Card className="h-full overflow-hidden p-4 sm:p-6">
            <h4 className="mb-4 flex items-center gap-2 text-sm font-semibold text-teal-brand sm:text-base">
              <Users size={18} />
              وضعیت کاربران
            </h4>
            <AdminDonutChart
              centerLabel="کل کاربران"
              centerValue={stats.users.total}
              segments={[
                {
                  label: "کاربر عادی",
                  value: Math.max(0, stats.users.total - stats.users.admins - stats.users.blocked),
                  color: "#10b981",
                },
                { label: "مدیران", value: stats.users.admins, color: "#0d7377" },
                { label: "مسدود", value: stats.users.blocked, color: "#e11d48" },
              ]}
            />
          </Card>
        </AnimateOnView>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <AnimateOnView animation="rise" delay={0.34}>
          <Card className="h-full p-4 sm:p-6">
            <h4 className="mb-4 flex items-center gap-2 text-sm font-semibold text-teal-brand sm:text-base">
              <Headphones size={18} />
              نوع محتوا
            </h4>
            <AdminBarChart
              items={[
                { label: "کتاب الکترونیکی", value: stats.contents.ebooks, color: "#0d7377" },
                { label: "پادکست و صوتی", value: stats.contents.audiobooks, color: "#c9a227" },
              ]}
            />
          </Card>
        </AnimateOnView>

        <AnimateOnView animation="rise" delay={0.4}>
          <Card className="h-full p-4 sm:p-6">
            <h4 className="mb-4 flex items-center gap-2 text-sm font-semibold text-teal-brand sm:text-base">
              <MessageSquare size={18} />
              نظرات و تعامل
            </h4>
            <AdminBarChart
              items={[
                { label: "نظر تأیید شده", value: stats.reviews.approved, color: "#10b981" },
                { label: "نظر در انتظار", value: stats.reviews.pending, color: "#c9a227" },
                { label: "ذخیره‌شده‌ها", value: stats.engagement.saved, color: "#0d7377" },
                { label: "نوتیف خوانده‌نشده", value: stats.engagement.unreadNotifications, color: "#e11d48" },
              ]}
            />
          </Card>
        </AnimateOnView>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
        {[
          { label: "مدیران", value: stats.users.admins, icon: Shield },
          { label: "مسدود", value: stats.users.blocked, icon: UserX },
          { label: "نوتیف‌ها", value: stats.engagement.notifications, icon: MessageSquare },
          { label: "دسته‌ها", value: stats.categories, icon: FolderOpen },
          { label: "کتاب", value: stats.contents.ebooks, icon: BookOpen },
          { label: "صوتی", value: stats.contents.audiobooks, icon: Headphones },
        ].map((item, index) => (
          <MiniStatCard key={item.label} {...item} index={index} />
        ))}
      </div>
    </div>
  );
}

"use client";

import { BookOpen, FolderOpen, UserCheck } from "lucide-react";
import { AnimatedNumber } from "@/components/admin/AnimatedNumber";
import { useAnimateOnView } from "@/components/admin/useAnimateOnView";
import { cn } from "@/lib/utils";

type AdminStatsHeroProps = {
  activeUsers: number;
  approvedContents: number;
  categories: number;
};

function HeroPill({
  icon: Icon,
  value,
  label,
  active,
  delay,
}: {
  icon: typeof UserCheck;
  value: number;
  label: string;
  active: boolean;
  delay: number;
}) {
  return (
    <span
      className="admin-hero-pill inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] text-white backdrop-blur sm:text-xs"
      style={{ animationDelay: active ? `${delay}s` : undefined }}
    >
      <Icon size={13} className="admin-hero-pill-icon" />
      <AnimatedNumber value={value} duration={900} active={active} /> {label}
    </span>
  );
}

export function AdminStatsHero({
  activeUsers,
  approvedContents,
  categories,
}: AdminStatsHeroProps) {
  const { setRef, visible } = useAnimateOnView({ threshold: 0.2, rootMargin: "0px 0px -2% 0px" });

  return (
    <div
      ref={setRef}
      className={cn(
        "admin-stats-hero relative overflow-hidden rounded-2xl px-4 py-6 sm:px-6 sm:py-8",
        visible && "admin-stats-hero-active",
      )}
    >
      <div className="admin-stats-grid-lines" aria-hidden />
      <div className="admin-stats-hero-shine" aria-hidden />
      <div className="admin-stats-orb admin-stats-orb-gold" aria-hidden />
      <div className="admin-stats-orb admin-stats-orb-teal" aria-hidden />

      <div className="relative z-10">
        <p
          className="admin-hero-line mb-1 text-xs font-medium text-teal-100/90 sm:text-sm"
          style={{ animationDelay: visible ? "0.05s" : undefined }}
        >
          داشبورد مدیریت
        </p>
        <h3
          className="admin-hero-line admin-hero-line-title text-xl font-bold text-white sm:text-2xl lg:text-3xl"
          style={{ animationDelay: visible ? "0.12s" : undefined }}
        >
          <span className="admin-hero-title-gradient">نمای کلی سایت</span>
        </h3>
        <p
          className="admin-hero-line mt-2 max-w-xl text-xs leading-relaxed text-white/75 sm:text-sm"
          style={{ animationDelay: visible ? "0.2s" : undefined }}
        >
          آمار لحظه‌ای کاربران، محتوا، نظرات و تعامل — با نمودارهای زنده
        </p>
        <div className="mt-4 flex flex-wrap gap-2 sm:mt-5">
          <HeroPill icon={UserCheck} value={activeUsers} label="فعال" active={visible} delay={0.28} />
          <HeroPill icon={BookOpen} value={approvedContents} label="تأیید شده" active={visible} delay={0.36} />
          <HeroPill icon={FolderOpen} value={categories} label="دسته" active={visible} delay={0.44} />
        </div>
      </div>
    </div>
  );
}

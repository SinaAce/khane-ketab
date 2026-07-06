"use client";

import Link from "next/link";
import { BookOpen, Globe2, Headphones, Landmark, Upload } from "lucide-react";
import { AnimatedNumber } from "@/components/admin/AnimatedNumber";
import { useAnimateOnView } from "@/components/admin/useAnimateOnView";
import { Button } from "@/components/ui/Button";
import { SITE_SLOGAN } from "@/lib/site";
import { cn } from "@/lib/utils";

type HeroStats = {
  ebooks: number;
  audiobooks: number;
  iranHistory: number;
  worldHistory: number;
};

type HomeHeroProps = {
  stats: HeroStats;
};

const statCards = [
  {
    key: "ebooks" as const,
    label: "کتاب الکترونیکی",
    shortLabel: "کتاب",
    icon: BookOpen,
    accent: "from-teal-600/30 to-teal-400/10",
  },
  {
    key: "audiobooks" as const,
    label: "پادکست و صوتی",
    shortLabel: "صوتی",
    icon: Headphones,
    accent: "from-amber-500/30 to-amber-300/10",
  },
  {
    key: "iranHistory" as const,
    label: "تاریخ ایران",
    shortLabel: "ایران",
    icon: Landmark,
    accent: "from-emerald-600/30 to-emerald-400/10",
  },
  {
    key: "worldHistory" as const,
    label: "تاریخ جهان",
    shortLabel: "جهان",
    icon: Globe2,
    accent: "from-sky-600/30 to-sky-400/10",
  },
];

export function HomeHero({ stats }: HomeHeroProps) {
  const { setRef, visible } = useAnimateOnView({ threshold: 0.12, rootMargin: "0px 0px -2% 0px" });

  return (
    <section
      ref={setRef}
      className={cn("persian-hero home-hero relative overflow-hidden text-white", visible && "home-hero-active")}
    >
      <div className="hero-orb hero-orb-gold" aria-hidden />
      <div className="hero-orb hero-orb-teal" aria-hidden />
      <div className="hero-grid-lines" aria-hidden />
      <div className="home-hero-shine" aria-hidden />

      <div className="page-shell relative mx-auto max-w-7xl py-10 sm:py-14 lg:py-16">
        <div className="grid items-center gap-8 lg:grid-cols-[1.2fr_1fr] lg:gap-10">
          <div>
            <p
              className="home-hero-line mb-3 inline-block max-w-full rounded-full border border-amber-300/40 bg-white/10 px-3 py-1 text-[11px] font-medium text-amber-100 backdrop-blur sm:text-xs"
              style={{ animationDelay: visible ? "0.05s" : undefined }}
            >
              {SITE_SLOGAN}
            </p>
            <h1
              className="home-hero-line mb-3 text-2xl font-bold leading-snug sm:mb-4 sm:text-3xl sm:leading-tight lg:text-5xl"
              style={{ animationDelay: visible ? "0.12s" : undefined }}
            >
              گنجینه‌ای از ادبیات،
              <span className="home-hero-title-gradient block">تاریخ ایران و جهان</span>
            </h1>
            <p
              className="home-hero-line mb-6 max-w-2xl text-sm leading-relaxed text-teal-50/90 sm:mb-7 sm:text-base lg:text-lg"
              style={{ animationDelay: visible ? "0.2s" : undefined }}
            >
              از شاهنامه و تاریخ بیهقی تا تمدن‌های کهن جهان — کتاب بخوانید، پادکست بشنوید و دانش را
              به اشتراک بگذارید.
            </p>
            <div
              className="home-hero-line flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-3"
              style={{ animationDelay: visible ? "0.28s" : undefined }}
            >
              <Link href="/browse" className="w-full sm:w-auto">
                <Button size="lg" variant="accent" className="touch-target w-full sm:w-auto">
                  <BookOpen size={18} className="ml-2" />
                  کتاب‌ها و پادکست‌ها
                </Button>
              </Link>
              <Link href="/upload" className="w-full sm:w-auto">
                <Button size="lg" variant="hero" className="touch-target w-full sm:w-auto">
                  <Upload size={18} className="ml-2" />
                  آپلود
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {statCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.key}
                  className="home-hero-stat-card rounded-xl border border-white/15 bg-white/10 p-3 backdrop-blur-md sm:rounded-2xl sm:p-4"
                  style={{ animationDelay: visible ? `${0.15 + index * 0.1}s` : undefined }}
                >
                  <div
                    className={`home-hero-stat-icon mb-2 inline-flex rounded-lg bg-gradient-to-br sm:mb-3 sm:rounded-xl ${card.accent} p-1.5 sm:p-2`}
                  >
                    <Icon size={16} className="sm:hidden" />
                    <Icon size={18} className="hidden sm:block" />
                  </div>
                  <p className="text-xl font-bold tabular-nums sm:text-2xl">
                    <AnimatedNumber value={stats[card.key]} duration={1000 + index * 120} active={visible} />
                  </p>
                  <p className="mt-0.5 text-[10px] text-teal-50/80 sm:hidden">{card.shortLabel}</p>
                  <p className="mt-1 hidden text-xs text-teal-50/80 sm:block">{card.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

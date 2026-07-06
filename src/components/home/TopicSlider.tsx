"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Baby,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  FlaskConical,
  Headphones,
  Landmark,
  Lightbulb,
  Sparkles,
} from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import type { TopicSlide } from "@/lib/topic-slides";
import { cn } from "@/lib/utils";

const iconMap = {
  literature: BookOpen,
  science: FlaskConical,
  history: Landmark,
  philosophy: Lightbulb,
  podcast: Headphones,
  children: Baby,
  ebook: BookOpen,
  audiobook: Headphones,
};

const AUTO_PLAY_MS = 3000;
const TRACK_GAP_PX = 14;
const LOOP_COPIES = 3;

type TopicSliderProps = {
  slides: TopicSlide[];
};

export function TopicSlider({ slides }: TopicSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const jumpingRef = useRef(false);
  const [isPaused, setIsPaused] = useState(false);
  const [ready, setReady] = useState(false);

  const loopSlides = useMemo(() => {
    if (slides.length === 0) return [];

    return Array.from({ length: LOOP_COPIES }, (_, copyIndex) =>
      slides.map((slide, slideIndex) => ({
        ...slide,
        loopKey: `${slide.id}-${copyIndex}-${slideIndex}`,
      })),
    ).flat();
  }, [slides]);

  const getSetWidth = useCallback(() => {
    const track = trackRef.current;
    if (!track || slides.length === 0) return 0;
    return track.scrollWidth / LOOP_COPIES;
  }, [slides.length]);

  const getStep = useCallback(() => {
    const track = trackRef.current;
    const card = track?.querySelector(".topic-slide-card") as HTMLElement | null;
    return (card?.offsetWidth ?? 288) + TRACK_GAP_PX;
  }, []);

  const normalizeLoop = useCallback(() => {
    const track = trackRef.current;
    if (!track || slides.length === 0 || jumpingRef.current) return;

    const setWidth = getSetWidth();
    if (setWidth <= 0) return;

    const buffer = 12;
    const maxLeft = setWidth * (LOOP_COPIES - 1);

    if (track.scrollLeft >= maxLeft - buffer) {
      jumpingRef.current = true;
      track.scrollLeft -= setWidth;
      requestAnimationFrame(() => {
        jumpingRef.current = false;
      });
    } else if (track.scrollLeft <= buffer) {
      jumpingRef.current = true;
      track.scrollLeft += setWidth;
      requestAnimationFrame(() => {
        jumpingRef.current = false;
      });
    }
  }, [getSetWidth, slides.length]);

  const scrollStep = useCallback(
    (direction: "prev" | "next") => {
      const track = trackRef.current;
      if (!track) return;

      const step = getStep();
      track.scrollBy({
        left: direction === "next" ? step : -step,
        behavior: "smooth",
      });

      window.setTimeout(normalizeLoop, 400);
    },
    [getStep, normalizeLoop],
  );

  useEffect(() => {
    const track = trackRef.current;
    if (!track || slides.length === 0) return;

    const init = () => {
      const setWidth = getSetWidth();
      if (setWidth <= 0) return;
      track.scrollLeft = setWidth;
      setReady(true);
    };

    init();
    window.addEventListener("resize", init);

    const onScroll = () => normalizeLoop();
    track.addEventListener("scroll", onScroll, { passive: true });
    track.addEventListener("scrollend", onScroll);

    return () => {
      window.removeEventListener("resize", init);
      track.removeEventListener("scroll", onScroll);
      track.removeEventListener("scrollend", onScroll);
    };
  }, [getSetWidth, loopSlides, normalizeLoop, slides.length]);

  useEffect(() => {
    if (!ready || isPaused || slides.length <= 1) return;

    const interval = window.setInterval(() => {
      scrollStep("next");
    }, AUTO_PLAY_MS);

    return () => window.clearInterval(interval);
  }, [ready, isPaused, slides.length, scrollStep]);

  if (slides.length === 0) return null;

  return (
    <ScrollReveal variant="up">
      <section className="page-shell mx-auto max-w-7xl pb-2 pt-4 sm:pb-4 sm:pt-6">
        <div className="mb-4 flex items-end justify-between gap-3 sm:mb-5">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <Sparkles className="text-gold-brand" size={18} />
              <h2 className="text-lg font-bold text-teal-brand sm:text-xl">موضوعات کتاب و پادکست</h2>
            </div>
            <p className="text-sm text-muted">یک موضوع انتخاب کن و مستقیم برو سراغش</p>
          </div>

          {slides.length > 1 && (
            <div className="hidden shrink-0 items-center gap-2 sm:flex">
              <button
                type="button"
                aria-label="اسلاید قبل"
                onClick={() => scrollStep("prev")}
                className="topic-slider-nav"
              >
                <ChevronRight size={18} />
              </button>
              <button
                type="button"
                aria-label="اسلاید بعد"
                onClick={() => scrollStep("next")}
                className="topic-slider-nav"
              >
                <ChevronLeft size={18} />
              </button>
            </div>
          )}
        </div>

        <div
          className="topic-slider-wrap"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => {
            window.setTimeout(() => setIsPaused(false), AUTO_PLAY_MS);
          }}
        >
          <div ref={trackRef} className="topic-slider-track">
            {loopSlides.map((slide, index) => {
              const Icon = iconMap[slide.icon];

              return (
                <Link
                  key={slide.loopKey}
                  href={slide.href}
                  className="topic-slide-card group"
                  style={{ animationDelay: `${index * 70}ms` }}
                >
                  <div
                    className="topic-slide-photo"
                    style={{ backgroundImage: `url(${slide.image})` }}
                    aria-hidden
                  />
                  <div className={cn("topic-slide-tint bg-gradient-to-t", slide.accent)} />
                  <div className="topic-slide-overlay" />
                  <div className="topic-slide-content flex h-full flex-col justify-between p-4 text-white sm:p-5">
                    <div className="flex items-start justify-between gap-3">
                      <span className="inline-flex rounded-xl border border-white/25 bg-black/25 p-2.5 backdrop-blur-md">
                        <Icon size={20} />
                      </span>
                      {slide.count > 0 && (
                        <span className="rounded-full border border-white/15 bg-black/30 px-2.5 py-1 text-xs font-medium backdrop-blur-md">
                          {slide.count.toLocaleString("fa-IR")} مورد
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col items-end text-right">
                      <h3 className="w-full text-base font-bold leading-snug drop-shadow-sm sm:text-lg">{slide.title}</h3>
                      <p className="mt-1 w-full line-clamp-2 text-xs leading-relaxed text-white/90 drop-shadow-sm sm:text-sm">
                        {slide.subtitle}
                      </p>
                      <span className="mt-3 inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-amber-50 backdrop-blur-sm transition group-hover:bg-white/20 sm:text-sm">
                        ببین
                        <ChevronLeft size={14} className="transition group-hover:-translate-x-0.5" aria-hidden />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </ScrollReveal>
  );
}

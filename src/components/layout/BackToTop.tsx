"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";
import { buttonInteraction } from "@/lib/button-styles";
import { cn } from "@/lib/utils";

const SHOW_AFTER_PX = 120;

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      setVisible(scrollTop > SHOW_AFTER_PX);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("scroll", onScroll);
    };
  }, []);

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="برگشت به بالای صفحه"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      className={cn(
        "safe-bottom fixed left-4 z-[100] flex h-11 w-11 items-center justify-center rounded-full border-2 border-gold-brand/50 bg-surface text-teal-brand shadow-sm backdrop-blur hover:border-gold-brand/70 hover:bg-teal-brand hover:text-white hover:shadow-teal-brand/25 sm:left-6 sm:h-12 sm:w-12",
        buttonInteraction,
        visible
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-3 opacity-0",
      )}
    >
      <ArrowUp size={22} strokeWidth={2.5} />
    </button>
  );
}

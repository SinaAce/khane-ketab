"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type AdminAnimation =
  | "rise"
  | "slide"
  | "podium"
  | "category"
  | "medal"
  | "header"
  | "message"
  | "bar"
  | "donut"
  | "progress";

type UseAnimateOnViewOptions = {
  threshold?: number;
  rootMargin?: string;
};

export function useAnimateOnView(options: UseAnimateOnViewOptions = {}) {
  const { threshold = 0.12, rootMargin = "0px 0px -4% 0px" } = options;
  const [visible, setVisible] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const setRef = useCallback(
    (node: Element | null) => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }

      if (!node) return;

      observerRef.current = new IntersectionObserver(
        ([entry]) => setVisible(entry.isIntersecting),
        { threshold, rootMargin },
      );
      observerRef.current.observe(node);
    },
    [threshold, rootMargin],
  );

  useEffect(() => () => observerRef.current?.disconnect(), []);

  function animationClass(animation: AdminAnimation, className?: string) {
    return cn(`admin-animate-${animation}`, visible && "admin-is-visible", className);
  }

  return { setRef, visible, animationClass };
}

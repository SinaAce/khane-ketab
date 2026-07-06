"use client";

import type { CSSProperties } from "react";
import { useAnimateOnView } from "@/components/admin/useAnimateOnView";
import { AnimatedNumber } from "@/components/admin/AnimatedNumber";
import { cn } from "@/lib/utils";

export type BarItem = {
  label: string;
  value: number;
  color: string;
};

type AdminBarChartProps = {
  items: BarItem[];
  className?: string;
};

function BarRow({ item, index, max }: { item: BarItem; index: number; max: number }) {
  const { setRef, visible, animationClass } = useAnimateOnView();
  const pct = Math.round((item.value / max) * 100);

  return (
    <div
      ref={setRef}
      className={animationClass("rise", "space-y-1.5")}
      style={{ animationDelay: visible ? `${0.08 + index * 0.07}s` : undefined }}
    >
      <div className="flex items-center justify-between gap-2 text-xs sm:text-sm">
        <span className="truncate text-muted">{item.label}</span>
        <span className="shrink-0 font-semibold text-foreground">
          <AnimatedNumber value={item.value} duration={800} active={visible} />
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-surface-muted sm:h-3">
        <div
          className={cn("admin-animate-bar h-full rounded-full", visible && "admin-is-visible")}
          style={
            {
              "--bar-width": `${pct}%`,
              backgroundColor: item.color,
              animationDelay: visible ? `${0.15 + index * 0.1}s` : undefined,
            } as CSSProperties
          }
        />
      </div>
    </div>
  );
}

export function AdminBarChart({ items, className }: AdminBarChartProps) {
  const max = Math.max(...items.map((item) => item.value), 1);

  return (
    <div className={cn("space-y-3", className)}>
      {items.map((item, index) => (
        <BarRow key={item.label} item={item} index={index} max={max} />
      ))}
    </div>
  );
}

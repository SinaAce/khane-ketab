"use client";

import type { CSSProperties } from "react";
import { useAnimateOnView } from "@/components/admin/useAnimateOnView";
import { AnimatedNumber } from "@/components/admin/AnimatedNumber";
import { cn } from "@/lib/utils";

export type DonutSegment = {
  label: string;
  value: number;
  color: string;
};

type AdminDonutChartProps = {
  segments: DonutSegment[];
  centerLabel?: string;
  centerValue?: number;
  size?: number;
  className?: string;
};

const RADIUS = 38;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function AdminDonutChart({
  segments,
  centerLabel,
  centerValue,
  size = 168,
  className,
}: AdminDonutChartProps) {
  const { setRef, visible } = useAnimateOnView({ threshold: 0.2 });
  const total = segments.reduce((sum, item) => sum + item.value, 0);
  const arcSegments = segments.filter((item) => item.value > 0);
  let cumulative = 0;

  return (
    <div
      ref={setRef}
      className={cn("flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6", className)}
    >
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" aria-hidden>
          <circle
            cx="50"
            cy="50"
            r={RADIUS}
            fill="none"
            stroke="currentColor"
            strokeWidth="11"
            className="text-surface-muted"
          />
          {total > 0 &&
            arcSegments.map((segment, index) => {
              const length = (segment.value / total) * CIRCUMFERENCE;
              const offset = cumulative;
              cumulative += length;

              return (
                <circle
                  key={segment.label}
                  cx="50"
                  cy="50"
                  r={RADIUS}
                  fill="none"
                  stroke={segment.color}
                  strokeWidth="11"
                  strokeLinecap="butt"
                  strokeDasharray={
                    visible ? `${length} ${CIRCUMFERENCE - length}` : `0 ${CIRCUMFERENCE}`
                  }
                  strokeDashoffset={-offset}
                  style={{
                    transition: `stroke-dasharray 0.9s cubic-bezier(0.22, 1, 0.36, 1) ${index * 0.12}s, opacity 0.35s ease`,
                    opacity: visible ? 1 : 0.25,
                  }}
                />
              );
            })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          {centerValue !== undefined && (
            <span className="text-xl font-bold text-foreground sm:text-2xl">
              <AnimatedNumber value={centerValue} duration={1000} active={visible} />
            </span>
          )}
          {centerLabel && <span className="text-[10px] text-muted sm:text-xs">{centerLabel}</span>}
        </div>
      </div>

      <ul className="grid w-full flex-1 grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1">
        {segments.map((segment, index) => {
          const pct = total > 0 ? Math.round((segment.value / total) * 100) : 0;
          return (
            <LegendItem
              key={segment.label}
              segment={segment}
              pct={pct}
              index={index}
            />
          );
        })}
      </ul>
    </div>
  );
}

function LegendItem({
  segment,
  pct,
  index,
}: {
  segment: DonutSegment;
  pct: number;
  index: number;
}) {
  const { setRef, visible, animationClass } = useAnimateOnView({ threshold: 0.15 });

  return (
    <li
      ref={setRef}
      className={animationClass(
        "rise",
        "flex items-center justify-between gap-2 rounded-lg bg-surface-muted/80 px-3 py-2",
      )}
      style={{ animationDelay: visible ? `${0.1 + index * 0.08}s` : undefined } as CSSProperties}
    >
      <div className="flex min-w-0 items-center gap-2">
        <span
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: segment.color }}
        />
        <span className="truncate text-xs text-muted sm:text-sm">{segment.label}</span>
      </div>
      <div className="shrink-0 text-left">
        <span className="text-sm font-semibold text-foreground">
          <AnimatedNumber value={segment.value} duration={700} active={visible} />
        </span>
        <span className="mr-1 text-[10px] text-muted">({pct.toLocaleString("fa-IR")}٪)</span>
      </div>
    </li>
  );
}

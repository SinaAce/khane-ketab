"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

type StarRatingProps = {
  value: number;
  size?: number;
  showValue?: boolean;
};

export function StarRating({ value, size = 16, showValue = true }: StarRatingProps) {
  return (
    <div className="flex items-center gap-1 text-gold-brand">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          size={size}
          className={cn(index < Math.round(value) ? "fill-current" : "text-muted/40")}
        />
      ))}
      {showValue && <span className="mr-1 text-sm text-muted">{value.toFixed(1)}</span>}
    </div>
  );
}

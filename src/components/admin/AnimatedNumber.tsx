"use client";

import { useEffect, useState } from "react";

type AnimatedNumberProps = {
  value: number;
  duration?: number;
  className?: string;
  active?: boolean;
};

export function AnimatedNumber({
  value,
  duration = 1200,
  className,
  active = true,
}: AnimatedNumberProps) {
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    if (!active) {
      setDisplay(value);
      return;
    }

    let frame = 0;
    const start = performance.now();
    setDisplay(0);

    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setDisplay(Math.round(value * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, duration, active]);

  return <span className={className}>{display.toLocaleString("fa-IR")}</span>;
}

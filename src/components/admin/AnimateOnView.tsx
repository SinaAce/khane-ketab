"use client";

import { useEffect } from "react";
import type { CSSProperties, ElementType, ReactNode } from "react";
import { useAnimateOnView, type AdminAnimation } from "@/components/admin/useAnimateOnView";

type AnimateOnViewProps = {
  children: ReactNode;
  animation?: AdminAnimation;
  delay?: number;
  className?: string;
  style?: CSSProperties;
  as?: ElementType;
  onVisibleChange?: (visible: boolean) => void;
};

export function AnimateOnView({
  children,
  animation = "rise",
  delay = 0,
  className,
  style,
  as: Tag = "div",
  onVisibleChange,
}: AnimateOnViewProps) {
  const { setRef, visible, animationClass } = useAnimateOnView();

  useEffect(() => {
    onVisibleChange?.(visible);
  }, [visible, onVisibleChange]);

  const Component = Tag as ElementType;

  return (
    <Component
      ref={setRef}
      className={animationClass(animation, className)}
      style={{
        ...style,
        animationDelay: visible && delay > 0 ? `${delay}s` : undefined,
      }}
    >
      {children}
    </Component>
  );
}

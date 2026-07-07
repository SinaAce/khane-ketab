"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

const MobileBottomNav = dynamic(
  () => import("@/components/layout/MobileBottomNav").then((mod) => mod.MobileBottomNav),
  { ssr: false },
);

export function MobileBottomNavShell() {
  return (
    <Suspense fallback={null}>
      <MobileBottomNav />
    </Suspense>
  );
}

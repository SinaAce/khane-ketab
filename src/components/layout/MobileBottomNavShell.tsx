"use client";

import { Suspense } from "react";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";

export function MobileBottomNavShell() {
  return (
    <Suspense fallback={null}>
      <MobileBottomNav />
    </Suspense>
  );
}

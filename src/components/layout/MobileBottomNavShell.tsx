"use client";

import { Suspense } from "react";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { PersianLoader } from "@/components/ui/PersianLoader";

export function MobileBottomNavShell() {
  return (
    <Suspense fallback={null}>
      <MobileBottomNav />
    </Suspense>
  );
}

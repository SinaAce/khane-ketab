"use client";

import type { ReactNode } from "react";

type AdminTabPanelProps = {
  panelKey: string;
  children: ReactNode;
  className?: string;
};

export function AdminTabPanel({ panelKey, children, className }: AdminTabPanelProps) {
  return (
    <div key={panelKey} className={className ?? "admin-tab-panel"}>
      {children}
    </div>
  );
}

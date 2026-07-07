import type { ReactNode } from "react";

export function PageEntrance({ children }: { children: ReactNode }) {
  return <div className="page-enter page-enter-active">{children}</div>;
}

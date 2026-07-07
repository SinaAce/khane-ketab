"use client";

import { useEffect, useState } from "react";
import { isAppShellMode } from "@/lib/app-shell";

export function useAppShellMode() {
  const [isAppShell, setIsAppShell] = useState(false);

  useEffect(() => {
    function syncAppShell() {
      setIsAppShell(isAppShellMode());
    }

    syncAppShell();

    const standaloneQuery = window.matchMedia("(display-mode: standalone)");
    const fullscreenQuery = window.matchMedia("(display-mode: fullscreen)");

    standaloneQuery.addEventListener("change", syncAppShell);
    fullscreenQuery.addEventListener("change", syncAppShell);

    return () => {
      standaloneQuery.removeEventListener("change", syncAppShell);
      fullscreenQuery.removeEventListener("change", syncAppShell);
    };
  }, []);

  return isAppShell;
}

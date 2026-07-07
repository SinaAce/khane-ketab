export function isStandaloneDisplay(): boolean {
  if (typeof window === "undefined") return false;

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    ("standalone" in window.navigator &&
      Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone))
  );
}

export function isNativeCapacitorApp(): boolean {
  if (typeof window === "undefined") return false;

  const capacitor = (window as Window & { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
  return Boolean(capacitor?.isNativePlatform?.());
}

export function isAppShellMode(): boolean {
  return isStandaloneDisplay() || isNativeCapacitorApp();
}

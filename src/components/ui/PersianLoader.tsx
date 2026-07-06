import { SITE_NAME } from "@/lib/site";

export function PersianLoader({ label = "در حال بارگذاری..." }: { label?: string }) {
  return (
    <div className="loader-stage flex min-h-[50vh] flex-col items-center justify-center gap-8 px-4">
      <div className="loader-orbit relative flex h-28 w-28 items-center justify-center">
        <div className="loader-ring loader-ring-outer" />
        <div className="loader-ring loader-ring-middle" />
        <div className="loader-ring loader-ring-inner" />
        <svg viewBox="0 0 64 64" className="relative z-10 h-14 w-14 text-teal-brand" fill="currentColor" aria-hidden>
          <path d="M32 4 L56 32 L32 60 L8 32 Z" opacity="0.2" />
          <path d="M32 12 L48 32 L32 52 L16 32 Z" />
          <circle cx="32" cy="32" r="4" className="fill-gold-brand" />
        </svg>
      </div>

      <div className="loader-text text-center">
        <p className="text-sm font-semibold tracking-wide text-teal-brand">{label}</p>
        <p className="mt-2 text-xs text-muted">{SITE_NAME}</p>
        <div className="loader-dots mx-auto mt-4 flex gap-1.5">
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  );
}

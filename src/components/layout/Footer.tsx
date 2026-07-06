import { SiteLogo } from "@/components/layout/SiteLogo";
import { SITE_NAME, SITE_SLOGAN } from "@/lib/site";

export function Footer() {
  return (
    <footer className="relative mt-auto border-t border-border-persian bg-surface">
      <div className="page-shell mx-auto flex max-w-7xl flex-col items-center gap-3 py-6 text-center sm:flex-row sm:items-start sm:text-right">
        <SiteLogo size={44} className="sm:hidden" />
        <SiteLogo size={52} className="mt-0.5 hidden sm:block" />
        <div className="flex flex-col gap-1 text-sm text-muted">
          <p className="font-medium text-teal-brand">{SITE_SLOGAN}</p>
          <p>{SITE_NAME} — پروژه دانشگاهی</p>
        </div>
      </div>
    </footer>
  );
}

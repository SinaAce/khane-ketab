"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { BookOpen, Home, LifeBuoy, Shield, Smartphone, Upload, UserRound } from "lucide-react";
import { useAppShellMode } from "@/hooks/useAppShellMode";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: typeof Home;
  isActive: (pathname: string) => boolean;
  show?: boolean;
};

function hideBottomNav(pathname: string) {
  return (
    pathname.startsWith("/auth/") ||
    pathname.includes("/read") ||
    pathname.includes("/listen")
  );
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");
  const { data: session } = useSession();
  const isAppShell = useAppShellMode();

  if (!isAppShell || hideBottomNav(pathname)) return null;

  const accountHref = session ? "/dashboard" : "/auth/login";
  const supportHref = session ? "/dashboard?tab=tickets" : "/auth/login?callbackUrl=/dashboard?tab=tickets";

  const items: NavItem[] = [
    {
      href: "/",
      label: "خانه",
      icon: Home,
      isActive: (path: string) => path === "/",
    },
    {
      href: "/browse",
      label: "کتاب",
      icon: BookOpen,
      isActive: (path: string) => path.startsWith("/browse") || path.startsWith("/content"),
    },
    {
      href: session ? "/upload" : "/auth/login?callbackUrl=/upload",
      label: "آپلود",
      icon: Upload,
      isActive: (path: string) => path === "/upload",
    },
    {
      href: "/download",
      label: "اپ",
      icon: Smartphone,
      isActive: (path: string) => path === "/download",
    },
    {
      href: supportHref,
      label: "پشتیبانی",
      icon: LifeBuoy,
      isActive: (path: string) => path.startsWith("/dashboard") && tab === "tickets",
    },
    {
      href: accountHref,
      label: session ? "حساب" : "ورود",
      icon: UserRound,
      isActive: (path: string) => path.startsWith("/dashboard") && tab !== "tickets",
    },
    {
      href: "/admin",
      label: "مدیر",
      icon: Shield,
      isActive: (path: string) => path.startsWith("/admin"),
      show: session?.user?.role === "ADMIN",
    },
  ].filter((item): item is NavItem => item.show !== false);

  return (
    <nav className="mobile-bottom-nav safe-bottom md:hidden" aria-label="ناوبری اصلی">
      <div className="mobile-bottom-nav__pattern" aria-hidden />
      <ul className="mobile-bottom-nav__list">
        {items.map((item) => {
          const Icon = item.icon;
          const active = item.isActive(pathname);

          return (
            <li key={item.href + item.label} className="mobile-bottom-nav__item">
              <Link
                href={item.href}
                className={cn("mobile-bottom-nav__link", active && "mobile-bottom-nav__link--active")}
                aria-current={active ? "page" : undefined}
              >
                <span className={cn("mobile-bottom-nav__icon-wrap", active && "persian-pattern")}>
                  <Icon size={20} strokeWidth={active ? 2.4 : 2} />
                </span>
                <span className="mobile-bottom-nav__label">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

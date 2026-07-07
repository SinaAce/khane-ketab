"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { BookOpen, Home, LifeBuoy, Shield, Upload, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: typeof Home;
  isActive: (pathname: string, tab: string | null) => boolean;
  center?: boolean;
  iconOnly?: boolean;
};

function hideBottomNav(pathname: string) {
  return (
    pathname.startsWith("/auth/") ||
    pathname.includes("/read") ||
    pathname.includes("/listen")
  );
}

function NavLink({ item, pathname, tab }: { item: NavItem; pathname: string; tab: string | null }) {
  const Icon = item.icon;
  const active = item.isActive(pathname, tab);

  return (
    <li className={cn("mobile-bottom-nav__item", item.center && "mobile-bottom-nav__item--center")}>
      <Link
        href={item.href}
        className={cn(
          "mobile-bottom-nav__link",
          item.center && "mobile-bottom-nav__link--center",
          active && "mobile-bottom-nav__link--active",
        )}
        aria-current={active ? "page" : undefined}
        aria-label={item.iconOnly ? item.label : undefined}
        title={item.iconOnly ? item.label : undefined}
      >
        <span
          className={cn(
            "mobile-bottom-nav__icon-wrap",
            item.center && "mobile-bottom-nav__icon-wrap--center",
            active && "persian-pattern",
          )}
        >
          <Icon size={item.center ? 28 : 20} strokeWidth={active ? 2.4 : 2} />
        </span>
        {!item.iconOnly && <span className="mobile-bottom-nav__label">{item.label}</span>}
      </Link>
    </li>
  );
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  if (hideBottomNav(pathname)) return null;

  const items: NavItem[] = [
    {
      href: session ? "/dashboard" : "/auth/login",
      label: session ? "حساب" : "ورود",
      icon: UserRound,
      isActive: (path, currentTab) =>
        session
          ? path.startsWith("/dashboard") && currentTab !== "tickets"
          : path.startsWith("/auth/login"),
    },
    {
      href: isAdmin
        ? "/admin"
        : session
          ? "/dashboard?tab=tickets"
          : "/auth/login?callbackUrl=/dashboard?tab=tickets",
      label: isAdmin ? "مدیریت" : "پشتیبانی",
      icon: isAdmin ? Shield : LifeBuoy,
      isActive: (path, currentTab) =>
        isAdmin ? path.startsWith("/admin") : path.startsWith("/dashboard") && currentTab === "tickets",
    },
    {
      href: "/",
      label: "خانه",
      icon: Home,
      center: true,
      iconOnly: true,
      isActive: (path) => path === "/",
    },
    {
      href: "/browse",
      label: "کتاب",
      icon: BookOpen,
      isActive: (path) => path.startsWith("/browse") || path.startsWith("/content"),
    },
    {
      href: session ? "/upload" : "/auth/login?callbackUrl=/upload",
      label: "آپلود",
      icon: Upload,
      isActive: (path) => path === "/upload",
    },
  ];

  return (
    <nav className="mobile-bottom-nav safe-bottom md:hidden" aria-label="ناوبری اصلی">
      <div className="mobile-bottom-nav__pattern" aria-hidden />
      <ul className="mobile-bottom-nav__list">
        {items.map((item) => (
          <NavLink key={item.label} item={item} pathname={pathname} tab={tab} />
        ))}
      </ul>
    </nav>
  );
}

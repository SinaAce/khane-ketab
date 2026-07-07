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
  iconOnly?: boolean;
  center?: boolean;
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
          active && "mobile-bottom-nav__icon-wrap--active",
        )}
      >
        <Icon size={item.center ? 22 : 17} strokeWidth={active ? 2.3 : 1.9} />
      </span>
      {!item.iconOnly && <span className="mobile-bottom-nav__label">{item.label}</span>}
    </Link>
  );
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  if (hideBottomNav(pathname)) return null;

  const accountItem: NavItem = {
    href: session ? "/dashboard?tab=profile" : "/auth/login",
    label: session ? "حساب" : "ورود",
    icon: UserRound,
    isActive: (path, currentTab) =>
      session ? path.startsWith("/dashboard") && currentTab === "profile" : path.startsWith("/auth/login"),
  };

  const secondItem: NavItem = {
    href: isAdmin
      ? "/admin"
      : session
        ? "/dashboard?tab=tickets"
        : "/auth/login?callbackUrl=/dashboard?tab=tickets",
    label: isAdmin ? "مدیریت" : "پشتیبانی",
    icon: isAdmin ? Shield : LifeBuoy,
    isActive: (path, currentTab) =>
      isAdmin ? path.startsWith("/admin") : path.startsWith("/dashboard") && currentTab === "tickets",
  };

  const homeItem: NavItem = {
    href: "/",
    label: "خانه",
    icon: Home,
    iconOnly: true,
    center: true,
    isActive: (path) => path === "/",
  };

  const bookItem: NavItem = {
    href: "/browse",
    label: "کتاب",
    icon: BookOpen,
    isActive: (path) => path.startsWith("/browse") || path.startsWith("/content"),
  };

  const uploadItem: NavItem = {
    href: session ? "/upload" : "/auth/login?callbackUrl=/upload",
    label: "آپلود",
    icon: Upload,
    isActive: (path) => path === "/upload",
  };

  return (
    <nav className="mobile-bottom-nav md:hidden" aria-label="ناوبری اصلی">
      <div className="mobile-bottom-nav__bar" aria-hidden>
        <div className="mobile-bottom-nav__pattern" />
      </div>

      <div className="mobile-bottom-nav__content">
        <div className="mobile-bottom-nav__side">
          <NavLink item={accountItem} pathname={pathname} tab={tab} />
          <NavLink item={secondItem} pathname={pathname} tab={tab} />
        </div>

        <div className="mobile-bottom-nav__home">
          <NavLink item={homeItem} pathname={pathname} tab={tab} />
        </div>

        <div className="mobile-bottom-nav__side">
          <NavLink item={bookItem} pathname={pathname} tab={tab} />
          <NavLink item={uploadItem} pathname={pathname} tab={tab} />
        </div>
      </div>
    </nav>
  );
}

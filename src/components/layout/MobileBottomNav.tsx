"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { BookOpen, Home, LifeBuoy, LogOut, Shield, Upload, UserRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAppShellMode } from "@/hooks/useAppShellMode";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: typeof Home;
  isActive: (pathname: string, tab: string | null) => boolean;
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
    <li className={cn("mobile-bottom-nav__item", item.center && "mobile-bottom-nav__item--center")}>
      <Link
        href={item.href}
        className={cn(
          "mobile-bottom-nav__link",
          item.center && "mobile-bottom-nav__link--center",
          active && "mobile-bottom-nav__link--active",
        )}
        aria-current={active ? "page" : undefined}
      >
        <span
          className={cn(
            "mobile-bottom-nav__icon-wrap",
            item.center && "mobile-bottom-nav__icon-wrap--center",
            active && "persian-pattern",
          )}
        >
          <Icon size={item.center ? 26 : 20} strokeWidth={active ? 2.4 : 2} />
        </span>
        <span className={cn("mobile-bottom-nav__label", item.center && "mobile-bottom-nav__label--center")}>
          {item.label}
        </span>
      </Link>
    </li>
  );
}

function AccountNavItem({ pathname, tab }: { pathname: string; tab: string | null }) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLLIElement>(null);
  const active = pathname.startsWith("/dashboard") && tab !== "tickets";

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent | TouchEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [open]);

  if (!session) {
    return (
      <li className="mobile-bottom-nav__item">
        <Link
          href="/auth/login"
          className={cn("mobile-bottom-nav__link", pathname.startsWith("/auth/login") && "mobile-bottom-nav__link--active")}
        >
          <span className="mobile-bottom-nav__icon-wrap">
            <UserRound size={20} />
          </span>
          <span className="mobile-bottom-nav__label">ورود</span>
        </Link>
      </li>
    );
  }

  return (
    <li ref={rootRef} className="mobile-bottom-nav__item relative">
      <button
        type="button"
        className={cn("mobile-bottom-nav__link mobile-bottom-nav__button", active && "mobile-bottom-nav__link--active")}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
      >
        <span className={cn("mobile-bottom-nav__icon-wrap", active && "persian-pattern")}>
          <UserRound size={20} strokeWidth={active ? 2.4 : 2} />
        </span>
        <span className="mobile-bottom-nav__label">حساب</span>
      </button>

      {open && (
        <div className="mobile-bottom-nav__menu" role="menu">
          <Link
            href="/dashboard"
            className="mobile-bottom-nav__menu-item"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            <UserRound size={16} />
            حساب من
          </Link>
          <Link
            href="/dashboard?tab=profile"
            className="mobile-bottom-nav__menu-item"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            <UserRound size={16} />
            پروفایل
          </Link>
          <button
            type="button"
            className="mobile-bottom-nav__menu-item mobile-bottom-nav__menu-item--danger"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              void signOut({ callbackUrl: "/" });
            }}
          >
            <LogOut size={16} />
            خروج
          </button>
        </div>
      )}
    </li>
  );
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");
  const { data: session } = useSession();
  const isAppShell = useAppShellMode();
  const isAdmin = session?.user?.role === "ADMIN";

  if (!isAppShell || hideBottomNav(pathname)) return null;

  const sideItems: NavItem[] = [
    {
      href: isAdmin ? "/admin" : session ? "/dashboard?tab=tickets" : "/auth/login?callbackUrl=/dashboard?tab=tickets",
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
        <AccountNavItem pathname={pathname} tab={tab} />
        <NavLink item={sideItems[0]} pathname={pathname} tab={tab} />
        <NavLink item={sideItems[1]} pathname={pathname} tab={tab} />
        <NavLink item={sideItems[2]} pathname={pathname} tab={tab} />
        <NavLink item={sideItems[3]} pathname={pathname} tab={tab} />
      </ul>
    </nav>
  );
}

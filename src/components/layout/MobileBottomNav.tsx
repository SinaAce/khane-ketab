"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { BookOpen, Home, LifeBuoy, LogOut, Shield, Upload, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  href?: string;
  label: string;
  icon: typeof Home;
  isActive: (pathname: string, tab: string | null) => boolean;
  center?: boolean;
  action?: () => void;
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
  const className = cn(
    "mobile-bottom-nav__link",
    item.center && "mobile-bottom-nav__link--center",
    active && "mobile-bottom-nav__link--active",
    item.action && "mobile-bottom-nav__link--logout",
  );
  const content = (
    <>
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
    </>
  );

  return (
    <li className={cn("mobile-bottom-nav__item", item.center && "mobile-bottom-nav__item--center")}>
      {item.action ? (
        <button type="button" className={cn(className, "mobile-bottom-nav__button")} onClick={item.action}>
          {content}
        </button>
      ) : (
        <Link href={item.href!} className={className} aria-current={active ? "page" : undefined}>
          {content}
        </Link>
      )}
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
    ...(session
      ? [
          {
            label: "خروج",
            icon: LogOut,
            action: () => signOut({ callbackUrl: "/" }),
            isActive: () => false,
          } satisfies NavItem,
          {
            href: "/dashboard",
            label: "حساب",
            icon: UserRound,
            isActive: (path: string, currentTab: string | null) =>
              path.startsWith("/dashboard") && currentTab !== "tickets",
          } satisfies NavItem,
        ]
      : [
          {
            href: "/auth/login",
            label: "ورود",
            icon: UserRound,
            isActive: (path: string) => path.startsWith("/auth/login"),
          } satisfies NavItem,
        ]),
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
      <ul className={cn("mobile-bottom-nav__list", session && "mobile-bottom-nav__list--signed-in")}>
        {items.map((item) => (
          <NavLink key={item.label} item={item} pathname={pathname} tab={tab} />
        ))}
      </ul>
    </nav>
  );
}

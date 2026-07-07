"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SiteLogo } from "@/components/layout/SiteLogo";
import { UserAccountButton } from "@/components/layout/UserAccountButton";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { cn } from "@/lib/utils";
import { SITE_NAME, SITE_SLOGAN } from "@/lib/site";

const links = [
  { href: "/", label: "خانه" },
  { href: "/browse", label: "کتاب و پادکست" },
  { href: "/upload", label: "آپلود" },
  { href: "/download", label: "دانلود اپ" },
];

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <header className="safe-top sticky top-0 z-50 border-b border-border-persian bg-surface/95 backdrop-blur-md">
      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-l from-gold-brand via-teal-brand to-gold-brand" />
      <div className="page-shell mx-auto flex max-w-7xl items-center justify-between gap-3 py-2.5 sm:py-3">
        <Link href="/" className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3 sm:flex-none">
          <SiteLogo size={44} className="shrink-0 sm:hidden" />
          <SiteLogo size={64} className="hidden shrink-0 sm:block" />
          <div className="min-w-0 leading-tight">
            <span className="block truncate text-base font-bold text-teal-brand sm:text-lg">{SITE_NAME}</span>
            <span className="hidden text-xs font-normal text-muted sm:block">{SITE_SLOGAN}</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition hover:text-teal-brand",
                pathname === link.href ? "text-teal-brand" : "text-muted",
              )}
            >
              {link.label}
            </Link>
          ))}
          {session?.user?.role === "ADMIN" && (
            <Link href="/admin" className="text-sm font-medium text-muted hover:text-teal-brand">
              مدیریت
            </Link>
          )}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <div className="md:hidden">
            <ThemeToggle />
          </div>

          {!session && (
            <Link href="/auth/login" className="md:hidden">
              <Button size="sm" className="touch-target px-3">
                ورود
              </Button>
            </Link>
          )}

          <div className="hidden items-center gap-3 md:flex">
            <ThemeToggle />
            {session ? (
              <>
                <UserAccountButton />
                <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: "/" })}>
                  <LogOut size={16} className="ml-1" />
                  خروج
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">
                    ورود
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm">ثبت‌نام</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

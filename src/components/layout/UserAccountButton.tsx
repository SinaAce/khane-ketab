"use client";

import Link from "next/link";
import { Bell, User } from "lucide-react";
import { useSession } from "next-auth/react";
import { useNotifications } from "@/components/dashboard/NotificationList";
import { Button } from "@/components/ui/Button";

export function UserAccountButton() {
  const { data: session } = useSession();
  const { unreadCount } = useNotifications(Boolean(session));

  if (!session) return null;

  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      <Link href="/dashboard">
        <Button variant="ghost" size="sm" className="relative max-w-[7.5rem] px-2.5 sm:max-w-none sm:px-3">
          <User size={16} className="ml-1 shrink-0" />
          <span className="truncate">{session.user?.name ?? "حساب من"}</span>
        </Button>
      </Link>

      {unreadCount > 0 && (
        <Link href="/dashboard?tab=notifications" aria-label={`${unreadCount} نوتیف خوانده‌نشده`}>
          <span className="notif-pulse relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-gold-brand/40 bg-gold-brand/15 text-gold-brand shadow-sm">
            <Bell size={15} />
            <span className="absolute -left-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-teal-brand px-1 text-[10px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          </span>
        </Link>
      )}
    </div>
  );
}

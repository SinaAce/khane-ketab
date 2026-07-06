"use client";

import Link from "next/link";
import { Bell, CheckCheck } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export type NotificationItem = {
  id: string;
  type: "CONTENT_APPROVED" | "CONTENT_REJECTED" | "REVIEW_APPROVED" | "REVIEW_REJECTED";
  message: string;
  read: boolean;
  relatedId: string | null;
  createdAt: string;
  contentLink: { href: string; title: string } | null;
};

const typeStyles: Record<NotificationItem["type"], string> = {
  CONTENT_APPROVED: "border-r-gold-brand bg-gold-brand/5",
  CONTENT_REJECTED: "border-r-red-500 bg-red-500/5",
  REVIEW_APPROVED: "border-r-teal-brand bg-teal-brand/5",
  REVIEW_REJECTED: "border-r-red-500 bg-red-500/5",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fa-IR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function NotificationMessage({ item }: { item: NotificationItem }) {
  if (!item.contentLink) {
    return <span>{item.message}</span>;
  }

  const needle = `«${item.contentLink.title}»`;
  const index = item.message.indexOf(needle);

  if (index === -1) {
    return <span>{item.message}</span>;
  }

  const before = item.message.slice(0, index);
  const after = item.message.slice(index + needle.length);

  return (
    <>
      {before}
      <Link href={item.contentLink.href} className="font-semibold text-teal-brand hover:underline">
        «{item.contentLink.title}»
      </Link>
      {after}
    </>
  );
}

type NotificationListProps = {
  items: NotificationItem[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  unreadCount: number;
};

export function NotificationList({ items, onMarkRead, onMarkAllRead, unreadCount }: NotificationListProps) {
  if (items.length === 0) {
    return (
      <Card className="text-center">
        <Bell size={32} className="mx-auto mb-3 text-muted" />
        <p className="text-muted">هنوز نوتیفی دریافت نکرده‌اید.</p>
        <p className="mt-2 text-sm text-muted">
          پس از تأیید یا رد آپلود و نظرات توسط مدیر، پیام اینجا نمایش داده می‌شود.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {unreadCount > 0 && (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={onMarkAllRead}>
            <CheckCheck size={16} className="ml-1" />
            علامت‌گذاری همه به‌عنوان خوانده‌شده
          </Button>
        </div>
      )}

      <div className="space-y-3">
        {items.map((item) => (
          <Card
            key={item.id}
            className={cn(
              "border-r-4 transition",
              typeStyles[item.type],
              !item.read && "ring-1 ring-teal-brand/20",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className={cn("text-sm", item.read ? "text-muted" : "font-medium text-foreground")}>
                  <NotificationMessage item={item} />
                </p>
                <p className="mt-1 text-xs text-muted">{formatDate(item.createdAt)}</p>
              </div>
              {!item.read && (
                <button
                  type="button"
                  onClick={() => onMarkRead(item.id)}
                  className="shrink-0 text-xs text-teal-brand hover:underline"
                >
                  خواندم
                </button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function useNotifications(enabled: boolean) {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    try {
      const res = await fetch("/api/user/notifications");
      const data = await res.json();
      if (res.ok) {
        setItems(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!enabled) return;

    const timer = setInterval(() => {
      void load();
    }, 60_000);

    return () => clearInterval(timer);
  }, [enabled, load]);

  const markRead = useCallback(async (id: string) => {
    const res = await fetch(`/api/user/notifications/${id}/read`, { method: "PATCH" });
    if (!res.ok) return;

    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, read: true } : item)),
    );
    setUnreadCount((count) => Math.max(0, count - 1));
  }, []);

  const markAllRead = useCallback(async () => {
    const res = await fetch("/api/user/notifications", { method: "PATCH" });
    if (!res.ok) return;

    setItems((current) => current.map((item) => ({ ...item, read: true })));
    setUnreadCount(0);
  }, []);

  return { items, unreadCount, loading, load, markRead, markAllRead };
}

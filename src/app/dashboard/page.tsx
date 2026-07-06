"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Bell, Bookmark, LayoutDashboard, Settings, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { NotificationList, useNotifications } from "@/components/dashboard/NotificationList";
import { ProfileForm } from "@/components/dashboard/ProfileForm";
import { SavedList, UploadsList } from "@/components/dashboard/UserLists";
import { Card } from "@/components/ui/Card";
import { PersianLoader } from "@/components/ui/PersianLoader";
import { cn } from "@/lib/utils";

type Tab = "overview" | "saved" | "uploads" | "notifications" | "profile";

type DashboardData = {
  user: { name: string; email: string; createdAt: string };
  stats: {
    saved: number;
    uploads: number;
    reviews: number;
    pending: number;
    approved: number;
    rejected: number;
  };
};

const tabs: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "خلاصه", icon: LayoutDashboard },
  { id: "saved", label: "کتابخانه من", icon: Bookmark },
  { id: "uploads", label: "آپلودها", icon: Upload },
  { id: "notifications", label: "نوتیف‌ها", icon: Bell },
  { id: "profile", label: "پروفایل", icon: Settings },
];

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [tab, setTab] = useState<Tab>("overview");
  const [data, setData] = useState<DashboardData | null>(null);
  const [saved, setSaved] = useState<Parameters<typeof SavedList>[0]["items"]>([]);
  const [uploads, setUploads] = useState<Parameters<typeof UploadsList>[0]["items"]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const {
    items: notifications,
    unreadCount,
    loading: notificationsLoading,
    markRead,
    markAllRead,
  } = useNotifications(status === "authenticated");

  useEffect(() => {
    const requestedTab = searchParams.get("tab");
    if (
      requestedTab === "overview" ||
      requestedTab === "saved" ||
      requestedTab === "uploads" ||
      requestedTab === "notifications" ||
      requestedTab === "profile"
    ) {
      setTab(requestedTab);
    }
  }, [searchParams]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login?callbackUrl=/dashboard");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;

    async function load() {
      setLoading(true);
      const [profileRes, savedRes, uploadsRes] = await Promise.all([
        fetch("/api/user/profile"),
        fetch("/api/user/saved"),
        fetch("/api/user/uploads"),
      ]);

      const [profile, savedData, uploadsData] = await Promise.all([
        profileRes.json(),
        savedRes.json(),
        uploadsRes.json(),
      ]);

      if (!profileRes.ok || !profile.user || !profile.stats) {
        setData(null);
        setSaved([]);
        setUploads([]);
        setLoadError(profile.error || "خطا در بارگذاری پنل کاربری. دیتابیس در دسترس نیست.");
        setLoading(false);
        return;
      }

      setData(profile);
      setSaved(savedData.saved || []);
      setUploads(uploadsData.uploads || []);
      setLoadError(null);
      setLoading(false);
    }

    void load();
  }, [status]);

  if (status === "loading" || loading) {
    return <PersianLoader label="در حال بارگذاری پنل..." />;
  }

  if (!session) return null;

  if (loadError) {
    return (
      <div className="page-shell mx-auto max-w-6xl py-6 sm:py-10">
        <Card className="text-center">
          <p className="text-sm text-muted">{loadError}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 text-sm font-medium text-teal-brand hover:underline"
          >
            تلاش مجدد
          </button>
        </Card>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="page-shell mx-auto max-w-6xl py-6 sm:py-10">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl font-bold text-teal-brand sm:text-2xl">پنل کاربری</h1>
        <p className="mt-1 text-sm text-muted">سلام {data.user.name} — مدیریت کتاب‌ها و حساب شما</p>
      </div>

      <div className="scroll-tabs mb-6">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={cn(
              "relative inline-flex min-h-[2.75rem] shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition sm:min-h-0 sm:py-2",
              tab === item.id
                ? "bg-teal-brand text-white"
                : "surface-panel text-muted hover:text-foreground",
            )}
          >
            <item.icon size={16} />
            {item.label}
            {item.id === "notifications" && unreadCount > 0 && (
              <span className="absolute -left-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold-brand px-1 text-[10px] font-bold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="text-center">
              <p className="text-2xl font-bold text-teal-brand">{data.stats.saved}</p>
              <p className="text-sm text-muted">ذخیره‌شده</p>
            </Card>
            <Card className="text-center">
              <p className="text-2xl font-bold text-teal-brand">{data.stats.uploads}</p>
              <p className="text-sm text-muted">آپلود</p>
            </Card>
            <Card className="text-center">
              <p className="text-2xl font-bold text-gold-brand">{data.stats.approved}</p>
              <p className="text-sm text-muted">تأیید شده</p>
            </Card>
            <Card className="text-center">
              <p className="text-2xl font-bold text-muted">{data.stats.reviews}</p>
              <p className="text-sm text-muted">نظرات</p>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold text-foreground">آخرین ذخیره‌ها</h2>
                <button
                  type="button"
                  onClick={() => setTab("saved")}
                  className="text-sm text-teal-brand hover:underline"
                >
                  همه
                </button>
              </div>
              {saved.length === 0 ? (
                <p className="text-sm text-muted">کتابی ذخیره نکرده‌اید.</p>
              ) : (
                <ul className="space-y-2">
                  {saved.slice(0, 3).map((item) => (
                    <li key={item.id}>
                      <Link
                        href={
                          item.type === "EBOOK"
                            ? `/content/${item.id}/read`
                            : `/content/${item.id}/listen`
                        }
                        className="text-sm text-foreground hover:text-teal-brand"
                      >
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold text-foreground">وضعیت آپلودها</h2>
                <button
                  type="button"
                  onClick={() => setTab("uploads")}
                  className="text-sm text-teal-brand hover:underline"
                >
                  همه
                </button>
              </div>
              <ul className="space-y-2 text-sm text-muted">
                <li>در انتظار تأیید: {data.stats.pending}</li>
                <li>تأیید شده: {data.stats.approved}</li>
                <li>رد شده: {data.stats.rejected}</li>
              </ul>
              <Link href="/upload" className="mt-4 inline-block text-sm text-teal-brand hover:underline">
                آپلود محتوای جدید
              </Link>
            </Card>
          </div>
        </div>
      )}

      {tab === "saved" && <SavedList items={saved} />}
      {tab === "uploads" && <UploadsList items={uploads} />}
      {tab === "notifications" &&
        (notificationsLoading ? (
          <PersianLoader label="در حال بارگذاری نوتیف‌ها..." />
        ) : (
          <NotificationList
            items={notifications}
            unreadCount={unreadCount}
            onMarkRead={markRead}
            onMarkAllRead={markAllRead}
          />
        ))}
      {tab === "profile" && (
        <ProfileForm
          initialName={data.user.name}
          email={data.user.email}
          onUpdated={(name) => setData((current) => (current ? { ...current, user: { ...current.user, name } } : current))}
        />
      )}
    </div>
  );
}

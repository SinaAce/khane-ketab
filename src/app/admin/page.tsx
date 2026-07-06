"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { BarChart3, ClipboardList, Crown, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { AnimateOnView } from "@/components/admin/AnimateOnView";
import { AdminStats } from "@/components/admin/AdminStats";
import { AdminTabPanel } from "@/components/admin/AdminTabPanel";
import { AdminTopUsers } from "@/components/admin/AdminTopUsers";
import { AdminUserList } from "@/components/admin/AdminUserList";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PersianLoader } from "@/components/ui/PersianLoader";
import { StarRating } from "@/components/content/StarRating";
import { cn } from "@/lib/utils";

type Tab = "pending" | "stats" | "users" | "top";

type PendingContent = {
  id: string;
  title: string;
  type: "EBOOK" | "AUDIOBOOK";
  createdAt: string;
  author: { name: string };
  category: { name: string };
};

type PendingReview = {
  id: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  user: { name: string; email: string };
  content: { id: string; title: string; type: "EBOOK" | "AUDIOBOOK" };
};

const tabs: { id: Tab; label: string; icon: typeof ClipboardList }[] = [
  { id: "pending", label: "تأییدها", icon: ClipboardList },
  { id: "stats", label: "آمار سایت", icon: BarChart3 },
  { id: "users", label: "کاربران", icon: Users },
  { id: "top", label: "کاربران برتر", icon: Crown },
];

export default function AdminPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [tab, setTab] = useState<Tab>("pending");
  const [contents, setContents] = useState<PendingContent[]>([]);
  const [reviews, setReviews] = useState<PendingReview[]>([]);
  const [message, setMessage] = useState("");
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }

    if (status === "authenticated" && session.user.role !== "ADMIN") {
      router.push("/");
    }
  }, [status, session, router]);

  useEffect(() => {
    async function loadPending() {
      setLoadError(null);
      const response = await fetch("/api/admin/pending");

      if (!response.ok) {
        setLoadError(
          "دیتابیس در دسترس نیست. در ترمینال جدا npm run db:dev را اجرا کنید، سپس npm run db:check را بزنید.",
        );
        setContents([]);
        setReviews([]);
        return;
      }

      const data = await response.json();
      setContents(data.contents || []);
      setReviews(data.reviews || []);
    }

    if (session?.user?.role === "ADMIN") {
      void loadPending();
    }
  }, [session]);

  async function updateContentStatus(id: string, action: "approve" | "reject") {
    const response = await fetch(`/api/admin/contents/${id}/${action}`, { method: "PATCH" });
    const data = await response.json();

    if (response.ok) {
      setMessage(data.message);
      setContents((current) => current.filter((item) => item.id !== id));
    }
  }

  async function updateReviewStatus(id: string, action: "approve" | "reject") {
    const response = await fetch(`/api/admin/reviews/${id}/${action}`, { method: "PATCH" });
    const data = await response.json();

    if (response.ok) {
      setMessage(data.message);
      setReviews((current) => current.filter((item) => item.id !== id));
    }
  }

  if (status === "loading") {
    return <PersianLoader label="در حال بارگذاری پنل مدیر..." />;
  }

  if (!session || session.user.role !== "ADMIN") return null;

  return (
    <div className="page-shell mx-auto max-w-6xl py-6 sm:py-10">
      <AnimateOnView animation="header" className="mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl font-bold text-teal-brand sm:text-3xl">پنل مدیر</h1>
          <p className="mt-2 text-sm text-muted">مدیریت تأییدها، آمار، کاربران و دسترسی‌ها</p>
        </div>
      </AnimateOnView>

      <div className="scroll-tabs mb-5 sm:mb-6">
        {tabs.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={cn(
              "admin-rise touch-target inline-flex min-h-[2.75rem] shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300 sm:min-h-0 sm:px-4 sm:py-2",
              tab === item.id
                ? "admin-main-tab-active bg-teal-brand text-white shadow-md shadow-teal-brand/20"
                : "surface-panel text-muted hover:scale-[1.02] hover:text-foreground",
            )}
            style={{ animationDelay: `${index * 0.06}s` }}
          >
            <item.icon size={16} />
            <span className="whitespace-nowrap">{item.label}</span>
          </button>
        ))}
      </div>

      {message && (
        <AnimateOnView animation="message" className="admin-message-pop mb-4 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300">
          {message}
        </AnimateOnView>
      )}

      {tab === "pending" && (
        <AdminTabPanel panelKey="pending">
          {loadError && (
            <AnimateOnView animation="rise">
              <Card className="mb-6 border-amber-300/40 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
              <p className="text-sm">{loadError}</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-3 text-sm font-medium text-teal-brand hover:underline"
              >
                تلاش مجدد
              </button>
            </Card>
            </AnimateOnView>
          )}

          <section className="mb-10">
            <AnimateOnView animation="rise">
              <h2 className="mb-4 text-lg font-semibold text-foreground sm:text-xl">محتوای در انتظار</h2>
            </AnimateOnView>
            {contents.length === 0 ? (
              <AnimateOnView animation="rise">
                <Card className="flex flex-col items-center gap-2 py-8 text-center">
                  <ClipboardList size={36} className="admin-empty-icon text-muted" />
                  <p className="text-muted">محتوای در انتظار تأیید وجود ندارد.</p>
                </Card>
              </AnimateOnView>
            ) : (
              <div className="space-y-4">
                {contents.map((item, index) => (
                  <AnimateOnView key={item.id} animation="slide" delay={index * 0.07}>
                    <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-semibold text-foreground sm:text-lg">{item.title}</h3>
                        <Badge variant="warning">{item.type === "EBOOK" ? "کتاب" : "صوتی"}</Badge>
                      </div>
                      <p className="text-sm text-muted">
                        {item.author.name} · {item.category.name}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                      <Button
                        className="touch-target w-full sm:w-auto"
                        onClick={() => updateContentStatus(item.id, "approve")}
                      >
                        تأیید
                      </Button>
                      <Button
                        className="touch-target w-full sm:w-auto"
                        variant="danger"
                        onClick={() => updateContentStatus(item.id, "reject")}
                      >
                        رد
                      </Button>
                    </div>
                  </Card>
                  </AnimateOnView>
                ))}
              </div>
            )}
          </section>

          <section>
            <AnimateOnView animation="rise" delay={0.1}>
              <h2 className="mb-4 text-lg font-semibold text-foreground sm:text-xl">نظرات در انتظار</h2>
            </AnimateOnView>
            {reviews.length === 0 ? (
              <AnimateOnView animation="rise" delay={0.15}>
                <Card className="flex flex-col items-center gap-2 py-8 text-center">
                  <p className="text-muted">نظری در انتظار تأیید وجود ندارد.</p>
                </Card>
              </AnimateOnView>
            ) : (
              <div className="space-y-4">
                {reviews.map((review, index) => (
                  <AnimateOnView key={review.id} animation="slide" delay={0.1 + index * 0.07}>
                    <Card className="flex flex-col gap-4 sm:flex-row sm:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <StarRating value={review.rating} size={14} />
                        <Badge variant="warning">در انتظار</Badge>
                      </div>
                      <p className="font-medium text-foreground">{review.user.name}</p>
                      <p className="text-sm text-muted">
                        روی{" "}
                        <Link
                          href={
                            review.content.type === "EBOOK"
                              ? `/content/${review.content.id}/read`
                              : `/content/${review.content.id}/listen`
                          }
                          className="font-medium text-teal-brand hover:underline"
                          target="_blank"
                        >
                          {review.content.title}
                        </Link>{" "}
                        · {review.content.type === "EBOOK" ? "کتاب" : "صوتی"}
                      </p>
                      {review.comment && <p className="text-sm text-foreground">{review.comment}</p>}
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-3">
                      <Button
                        className="touch-target w-full sm:w-auto"
                        onClick={() => updateReviewStatus(review.id, "approve")}
                      >
                        تأیید
                      </Button>
                      <Button
                        className="touch-target w-full sm:w-auto"
                        variant="danger"
                        onClick={() => updateReviewStatus(review.id, "reject")}
                      >
                        رد
                      </Button>
                    </div>
                  </Card>
                  </AnimateOnView>
                ))}
              </div>
            )}
          </section>
        </AdminTabPanel>
      )}

      {tab === "stats" && (
        <AdminTabPanel panelKey="stats">
          <section>
            <AnimateOnView animation="rise">
              <h2 className="mb-3 text-lg font-semibold text-foreground sm:mb-4 sm:text-xl">آمار کلی سایت</h2>
            </AnimateOnView>
            <AdminStats />
          </section>
        </AdminTabPanel>
      )}

      {tab === "users" && (
        <AdminTabPanel panelKey="users">
          <section>
            <AnimateOnView animation="rise">
              <h2 className="mb-2 text-lg font-semibold text-foreground sm:mb-3 sm:text-xl">مدیریت کاربران</h2>
            </AnimateOnView>
            <AnimateOnView animation="rise" delay={0.08}>
              <p className="mb-4 text-xs text-muted sm:text-sm">
                نقش، مسدودیت و اطلاعات کاربران — هر صفحه ۱۰ کاربر.
              </p>
            </AnimateOnView>
            <AdminUserList currentUserId={session.user.id} onMessage={setMessage} />
          </section>
        </AdminTabPanel>
      )}

      {tab === "top" && (
        <AdminTabPanel panelKey="top">
          <section>
            <AnimateOnView animation="rise">
              <h2 className="mb-2 text-lg font-semibold text-foreground sm:mb-3 sm:text-xl">کاربران برتر</h2>
            </AnimateOnView>
            <AnimateOnView animation="rise" delay={0.08}>
              <p className="mb-4 text-xs text-muted sm:text-sm">
                رتبه‌بندی کاربران در آپلود، نظر، ذخیره و دانلود — هر صفحه ۱۰ نفر.
              </p>
            </AnimateOnView>
            <AdminTopUsers />
          </section>
        </AdminTabPanel>
      )}
    </div>
  );
}

"use client";

import { LifeBuoy, MessageSquarePlus, Send } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { PersianLoader } from "@/components/ui/PersianLoader";
import { cn } from "@/lib/utils";

type TicketSummary = {
  id: string;
  subject: string;
  status: "OPEN" | "ANSWERED" | "CLOSED";
  createdAt: string;
  updatedAt: string;
  messages: { body: string; isStaff: boolean; createdAt: string }[];
};

type TicketDetail = {
  id: string;
  subject: string;
  status: "OPEN" | "ANSWERED" | "CLOSED";
  createdAt: string;
  updatedAt: string;
  messages: {
    id: string;
    body: string;
    isStaff: boolean;
    createdAt: string;
    author: { name: string; role: "USER" | "ADMIN" };
  }[];
};

const statusLabels = {
  OPEN: "باز",
  ANSWERED: "پاسخ داده شده",
  CLOSED: "بسته",
} as const;

const statusVariants = {
  OPEN: "warning",
  ANSWERED: "success",
  CLOSED: "default",
} as const;

export function TicketPanel() {
  const [tickets, setTickets] = useState<TicketSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [reply, setReply] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadTickets = useCallback(async () => {
    setLoading(true);
    const response = await fetch("/api/user/tickets");
    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.error || "خطا در بارگذاری تیکت‌ها.");
      setTickets([]);
      return;
    }

    setError("");
    setTickets(data.tickets || []);
  }, []);

  const loadDetail = useCallback(async (id: string) => {
    setDetailLoading(true);
    const response = await fetch(`/api/user/tickets/${id}`);
    const data = await response.json();
    setDetailLoading(false);

    if (!response.ok) {
      setError(data.error || "خطا در بارگذاری تیکت.");
      return;
    }

    setDetail(data.ticket);
    setSelectedId(id);
    setError("");
  }, []);

  useEffect(() => {
    void loadTickets();
  }, [loadTickets]);

  async function createTicket(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    setError("");

    const response = await fetch("/api/user/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, body }),
    });
    const data = await response.json();
    setSubmitting(false);

    if (!response.ok) {
      setError(data.error || "ثبت تیکت ناموفق بود.");
      return;
    }

    setSubject("");
    setBody("");
    setMessage(data.message || "تیکت ثبت شد.");
    await loadTickets();
    if (data.ticket?.id) {
      await loadDetail(data.ticket.id);
    }
  }

  async function sendReply(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedId || !reply.trim()) return;

    setSubmitting(true);
    setError("");

    const response = await fetch(`/api/user/tickets/${selectedId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: reply }),
    });
    const data = await response.json();
    setSubmitting(false);

    if (!response.ok) {
      setError(data.error || "ارسال پیام ناموفق بود.");
      return;
    }

    setReply("");
    await loadDetail(selectedId);
    await loadTickets();
  }

  if (loading) {
    return <PersianLoader label="در حال بارگذاری تیکت‌ها..." />;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      <div className="space-y-4">
        <Card>
          <div className="mb-4 flex items-center gap-2">
            <MessageSquarePlus size={18} className="text-teal-brand" />
            <h2 className="font-semibold text-foreground">تیکت جدید</h2>
          </div>

          <form onSubmit={createTicket} className="space-y-3">
            <Input
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              placeholder="موضوع تیکت"
              required
              minLength={3}
            />
            <textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder="مشکل یا سوال خود را بنویسید..."
              required
              minLength={10}
              rows={5}
              className="w-full rounded-xl border border-border-persian bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-teal-brand"
            />
            {error && !selectedId && <p className="text-sm text-rose-600">{error}</p>}
            {message && <p className="text-sm text-emerald-700 dark:text-emerald-300">{message}</p>}
            <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
              {submitting ? "در حال ارسال..." : "ثبت تیکت"}
            </Button>
          </form>
        </Card>

        <Card>
          <div className="mb-4 flex items-center gap-2">
            <LifeBuoy size={18} className="text-teal-brand" />
            <h2 className="font-semibold text-foreground">تیکت‌های من</h2>
          </div>

          {tickets.length === 0 ? (
            <p className="text-sm text-muted">هنوز تیکتی ثبت نکرده‌اید.</p>
          ) : (
            <ul className="space-y-2">
              {tickets.map((ticket) => (
                <li key={ticket.id}>
                  <button
                    type="button"
                    onClick={() => void loadDetail(ticket.id)}
                    className={cn(
                      "w-full rounded-xl border px-3 py-3 text-right transition",
                      selectedId === ticket.id
                        ? "border-teal-brand bg-teal-brand/5"
                        : "border-border-persian hover:bg-surface-muted/50",
                    )}
                  >
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <span className="truncate font-medium text-foreground">{ticket.subject}</span>
                      <Badge variant={statusVariants[ticket.status]}>{statusLabels[ticket.status]}</Badge>
                    </div>
                    <p className="line-clamp-2 text-xs text-muted">
                      {ticket.messages[0]?.body || "بدون پیام"}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card className="min-h-[420px]">
        {!selectedId ? (
          <div className="flex h-full min-h-[320px] flex-col items-center justify-center text-center text-muted">
            <LifeBuoy size={40} className="mb-3 opacity-40" />
            <p className="text-sm">یک تیکت را انتخاب کنید یا تیکت جدید بسازید.</p>
          </div>
        ) : detailLoading || !detail ? (
          <PersianLoader label="در حال بارگذاری گفتگو..." />
        ) : (
          <div className="flex h-full flex-col">
            <div className="mb-4 border-b border-border-persian pb-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-semibold text-foreground">{detail.subject}</h2>
                <Badge variant={statusVariants[detail.status]}>{statusLabels[detail.status]}</Badge>
              </div>
              <p className="mt-1 text-xs text-muted">
                آخرین به‌روزرسانی: {new Date(detail.updatedAt).toLocaleString("fa-IR")}
              </p>
            </div>

            <div className="mb-4 max-h-[420px] flex-1 space-y-3 overflow-y-auto">
              {detail.messages.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "rounded-xl px-3 py-2 text-sm",
                    item.isStaff
                      ? "ml-8 bg-teal-brand/10 text-foreground"
                      : "mr-8 bg-surface-muted text-foreground",
                  )}
                >
                  <div className="mb-1 flex items-center justify-between gap-2 text-xs text-muted">
                    <span>{item.isStaff ? "پشتیبانی" : item.author.name}</span>
                    <span>{new Date(item.createdAt).toLocaleString("fa-IR")}</span>
                  </div>
                  <p className="whitespace-pre-wrap leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>

            {detail.status !== "CLOSED" ? (
              <form onSubmit={sendReply} className="space-y-3 border-t border-border-persian pt-4">
                <textarea
                  value={reply}
                  onChange={(event) => setReply(event.target.value)}
                  placeholder="پیام خود را بنویسید..."
                  rows={3}
                  className="w-full rounded-xl border border-border-persian bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-teal-brand"
                />
                {error && selectedId && <p className="text-sm text-rose-600">{error}</p>}
                <Button type="submit" disabled={submitting || !reply.trim()} className="w-full sm:w-auto">
                  <Send size={16} className="ml-1" />
                  {submitting ? "در حال ارسال..." : "ارسال پیام"}
                </Button>
              </form>
            ) : (
              <p className="border-t border-border-persian pt-4 text-sm text-muted">این تیکت بسته شده است.</p>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}

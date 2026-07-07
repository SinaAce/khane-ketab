"use client";

import { LifeBuoy, Send } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Pagination } from "@/components/ui/Pagination";
import { PersianLoader } from "@/components/ui/PersianLoader";
import { cn } from "@/lib/utils";

type AdminTicketSummary = {
  id: string;
  subject: string;
  status: "OPEN" | "ANSWERED" | "CLOSED";
  createdAt: string;
  updatedAt: string;
  user: { id: string; name: string; email: string };
  messages: { body: string; isStaff: boolean; createdAt: string }[];
  _count: { messages: number };
};

type AdminTicketDetail = {
  id: string;
  subject: string;
  status: "OPEN" | "ANSWERED" | "CLOSED";
  createdAt: string;
  updatedAt: string;
  user: { id: string; name: string; email: string };
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

type AdminTicketsProps = {
  onMessage: (message: string) => void;
};

export function AdminTickets({ onMessage }: AdminTicketsProps) {
  const [tickets, setTickets] = useState<AdminTicketSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<AdminTicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [reply, setReply] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"" | "OPEN" | "ANSWERED" | "CLOSED">("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadTickets = useCallback(async (targetPage: number, status: string) => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(targetPage) });
    if (status) params.set("status", status);

    const response = await fetch(`/api/admin/tickets?${params}`);
    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      onMessage(data.error || "خطا در بارگذاری تیکت‌ها.");
      setTickets([]);
      return;
    }

    setTickets(data.tickets || []);
    setTotalPages(data.totalPages || 1);
    setPage(data.page || targetPage);
  }, [onMessage]);

  const loadDetail = useCallback(async (id: string) => {
    setDetailLoading(true);
    const response = await fetch(`/api/admin/tickets/${id}`);
    const data = await response.json();
    setDetailLoading(false);

    if (!response.ok) {
      onMessage(data.error || "خطا در بارگذاری تیکت.");
      return;
    }

    setDetail(data.ticket);
    setSelectedId(id);
  }, [onMessage]);

  useEffect(() => {
    void loadTickets(page, statusFilter);
  }, [loadTickets, page, statusFilter]);

  async function sendReply(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedId || !reply.trim()) return;

    setSubmitting(true);
    const response = await fetch(`/api/admin/tickets/${selectedId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: reply }),
    });
    const data = await response.json();
    setSubmitting(false);

    if (!response.ok) {
      onMessage(data.error || "ارسال پاسخ ناموفق بود.");
      return;
    }

    setReply("");
    onMessage(data.ticketMessage || "پاسخ ارسال شد.");
    await loadDetail(selectedId);
    await loadTickets(page, statusFilter);
  }

  async function updateStatus(status: "OPEN" | "ANSWERED" | "CLOSED") {
    if (!selectedId) return;

    setSubmitting(true);
    const response = await fetch(`/api/admin/tickets/${selectedId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await response.json();
    setSubmitting(false);

    if (!response.ok) {
      onMessage(data.error || "تغییر وضعیت ناموفق بود.");
      return;
    }

    onMessage(data.message || "وضعیت به‌روز شد.");
    await loadDetail(selectedId);
    await loadTickets(page, statusFilter);
  }

  if (loading && tickets.length === 0) {
    return <PersianLoader label="در حال بارگذاری تیکت‌ها..." />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(["", "OPEN", "ANSWERED", "CLOSED"] as const).map((value) => (
          <button
            key={value || "all"}
            type="button"
            onClick={() => {
              setStatusFilter(value);
              setPage(1);
            }}
            className={cn(
              "rounded-xl px-3 py-2 text-sm transition",
              statusFilter === value
                ? "bg-teal-brand text-white"
                : "surface-panel text-muted hover:text-foreground",
            )}
          >
            {value ? statusLabels[value] : "همه"}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <Card className="p-0">
          {tickets.length === 0 ? (
            <div className="p-6 text-sm text-muted">تیکتی یافت نشد.</div>
          ) : (
            <ul className="divide-y divide-border-persian">
              {tickets.map((ticket) => (
                <li key={ticket.id}>
                  <button
                    type="button"
                    onClick={() => void loadDetail(ticket.id)}
                    className={cn(
                      "w-full px-4 py-3 text-right transition hover:bg-surface-muted/50",
                      selectedId === ticket.id && "bg-teal-brand/5",
                    )}
                  >
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <span className="truncate font-medium text-foreground">{ticket.subject}</span>
                      <Badge variant={statusVariants[ticket.status]}>{statusLabels[ticket.status]}</Badge>
                    </div>
                    <p className="text-xs text-muted">
                      {ticket.user.name} — {ticket.user.email}
                    </p>
                    <p className="mt-1 line-clamp-1 text-xs text-muted">
                      {ticket.messages[0]?.body || "بدون پیام"}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="border-t border-border-persian p-3">
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} showDots={false} />
          </div>
        </Card>

        <Card className="min-h-[480px]">
          {!selectedId ? (
            <div className="flex h-full min-h-[360px] flex-col items-center justify-center text-center text-muted">
              <LifeBuoy size={40} className="mb-3 opacity-40" />
              <p className="text-sm">یک تیکت را برای مشاهده و پاسخ انتخاب کنید.</p>
            </div>
          ) : detailLoading || !detail ? (
            <PersianLoader label="در حال بارگذاری..." />
          ) : (
            <div className="flex h-full flex-col">
              <div className="mb-4 border-b border-border-persian pb-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-foreground">{detail.subject}</h2>
                    <p className="mt-1 text-xs text-muted">
                      {detail.user.name} — {detail.user.email}
                    </p>
                  </div>
                  <Badge variant={statusVariants[detail.status]}>{statusLabels[detail.status]}</Badge>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {detail.status !== "CLOSED" && (
                    <Button size="sm" variant="secondary" disabled={submitting} onClick={() => void updateStatus("CLOSED")}>
                      بستن تیکت
                    </Button>
                  )}
                  {detail.status === "CLOSED" && (
                    <Button size="sm" variant="secondary" disabled={submitting} onClick={() => void updateStatus("OPEN")}>
                      بازگشایی
                    </Button>
                  )}
                </div>
              </div>

              <div className="mb-4 max-h-[360px] flex-1 space-y-3 overflow-y-auto">
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

              {detail.status !== "CLOSED" && (
                <form onSubmit={sendReply} className="space-y-3 border-t border-border-persian pt-4">
                  <textarea
                    value={reply}
                    onChange={(event) => setReply(event.target.value)}
                    placeholder="پاسخ پشتیبانی..."
                    rows={4}
                    className="w-full rounded-xl border border-border-persian bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-teal-brand"
                  />
                  <Button type="submit" disabled={submitting || !reply.trim()} className="w-full sm:w-auto">
                    <Send size={16} className="ml-1" />
                    {submitting ? "در حال ارسال..." : "ارسال پاسخ"}
                  </Button>
                </form>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

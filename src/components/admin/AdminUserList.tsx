"use client";

import { Ban, KeyRound, Search, Shield, ShieldOff, User as UserIcon, Users, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { AnimateOnView } from "@/components/admin/AnimateOnView";
import { AnimatedNumber } from "@/components/admin/AnimatedNumber";
import { useAnimateOnView } from "@/components/admin/useAnimateOnView";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Pagination } from "@/components/ui/Pagination";
import { cn } from "@/lib/utils";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  blocked: boolean;
  createdAt: string;
  stats: {
    uploads: number;
    reviews: number;
    saved: number;
    notifications: number;
  };
};

type AdminUserListProps = {
  currentUserId: string;
  onMessage: (message: string) => void;
};

const PAGE_SIZE = 10;

function UserListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="admin-user-skeleton" />
      ))}
    </div>
  );
}

export function AdminUserList({ currentUserId, onMessage }: AdminUserListProps) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [resetUser, setResetUser] = useState<AdminUser | null>(null);
  const [resetPassword, setResetPassword] = useState("");
  const [resetConfirm, setResetConfirm] = useState("");
  const [resetError, setResetError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const next = search.trim();
      setDebouncedSearch((prev) => {
        if (prev !== next) setPage(1);
        return next;
      });
    }, 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const loadUsers = useCallback(async (targetPage: number, query: string) => {
    setRefreshing(true);
    setError(null);

    const params = new URLSearchParams({ page: String(targetPage) });
    if (query) params.set("q", query);

    try {
      const response = await fetch(`/api/admin/users?${params}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "خطا در بارگذاری کاربران.");
        setUsers([]);
        return;
      }

      setUsers(data.users || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
      setPage(data.page || targetPage);
    } catch {
      setError("خطا در ارتباط با سرور.");
      setUsers([]);
    } finally {
      setRefreshing(false);
      setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUsers(page, debouncedSearch);
  }, [loadUsers, page, debouncedSearch]);

  async function patchUser(
    user: AdminUser,
    body: { role?: "USER" | "ADMIN"; blocked?: boolean },
  ) {
    setUpdatingId(user.id);
    const response = await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    setUpdatingId(null);

    if (!response.ok) {
      onMessage(data.error || "عملیات انجام نشد.");
      return;
    }

    onMessage(data.message || "به‌روز شد.");
    void loadUsers(page, debouncedSearch);
  }

  async function updateRole(user: AdminUser, role: "USER" | "ADMIN") {
    if (user.role === role) return;
    const label = role === "ADMIN" ? "مدیر" : "کاربر عادی";
    if (!confirm(`آیا مطمئن هستید نقش «${user.name}» به ${label} تغییر کند؟`)) return;
    await patchUser(user, { role });
  }

  function openResetModal(user: AdminUser) {
    setResetUser(user);
    setResetPassword("");
    setResetConfirm("");
    setResetError("");
  }

  async function submitResetPassword(event: React.FormEvent) {
    event.preventDefault();
    if (!resetUser) return;

    if (resetPassword.length < 6) {
      setResetError("رمز عبور باید حداقل ۶ کاراکتر باشد.");
      return;
    }

    if (resetPassword !== resetConfirm) {
      setResetError("رمز عبور و تکرار آن یکسان نیست.");
      return;
    }

    setUpdatingId(resetUser.id);
    setResetError("");

    const response = await fetch(`/api/admin/users/${resetUser.id}/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: resetPassword }),
    });
    const data = await response.json();
    setUpdatingId(null);

    if (!response.ok) {
      setResetError(data.error || "تغییر رمز ناموفق بود.");
      return;
    }

    onMessage(data.message || "رمز عبور تغییر کرد.");
    setResetUser(null);
    setResetPassword("");
    setResetConfirm("");
  }

  async function toggleBlock(user: AdminUser) {
    const next = !user.blocked;
    const label = next ? "مسدود" : "رفع مسدودیت";
    if (!confirm(`آیا مطمئن هستید ${label} برای «${user.name}» انجام شود؟`)) return;
    await patchUser(user, { blocked: next });
  }

  if (initialLoading) {
    return (
      <div className="space-y-4">
        <UserSearchBar
          search={search}
          onSearchChange={setSearch}
          onClear={() => setSearch("")}
          refreshing={false}
        />
        <div className="admin-shimmer h-16 rounded-xl" />
        <UserListSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      <UserSearchBar
        search={search}
        onSearchChange={setSearch}
        onClear={() => setSearch("")}
        refreshing={refreshing}
      />

      {error ? (
        <Card className="border-amber-300/40 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
          <p className="text-sm">{error}</p>
        </Card>
      ) : (
        <>
          <SummaryCard total={total} page={page} totalPages={totalPages} search={debouncedSearch} />

          {refreshing && users.length === 0 ? (
            <UserListSkeleton />
          ) : users.length === 0 ? (
            <AnimateOnView animation="rise">
              <Card className="flex flex-col items-center gap-2 py-8 text-center">
                <Users size={36} className="admin-empty-icon text-muted" />
                <p className="text-muted">
                  {debouncedSearch
                    ? `کاربری با «${debouncedSearch}» پیدا نشد.`
                    : "کاربری در این صفحه نیست."}
                </p>
              </Card>
            </AnimateOnView>
          ) : (
            <div className={cn(refreshing && "pointer-events-none opacity-60")}>
              <div className="hidden overflow-x-auto rounded-xl border border-border-persian lg:block">
                <table className="w-full min-w-[920px] text-sm">
                  <thead className="bg-surface-muted text-muted">
                    <tr>
                      <th className="px-4 py-3 text-right font-medium">کاربر</th>
                      <th className="px-4 py-3 text-right font-medium">وضعیت</th>
                      <th className="px-4 py-3 text-right font-medium">آمار</th>
                      <th className="px-4 py-3 text-right font-medium">عضویت</th>
                      <th className="px-4 py-3 text-right font-medium">عملیات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, index) => (
                      <UserRow
                        key={user.id}
                        user={user}
                        index={index}
                        currentUserId={currentUserId}
                        updatingId={updatingId}
                        onRoleChange={updateRole}
                        onToggleBlock={toggleBlock}
                        onResetPassword={openResetModal}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="space-y-3 lg:hidden">
                {users.map((user, index) => (
                  <UserCard
                    key={user.id}
                    user={user}
                    index={index}
                    currentUserId={currentUserId}
                    updatingId={updatingId}
                    onRoleChange={updateRole}
                    onToggleBlock={toggleBlock}
                    onResetPassword={openResetModal}
                  />
                ))}
              </div>
            </div>
          )}

          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} showDots={false} />
        </>
      )}

      {resetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md">
            <h3 className="mb-1 text-lg font-semibold text-foreground">تغییر رمز عبور</h3>
            <p className="mb-4 text-sm text-muted">
              رمز جدید برای «{resetUser.name}» ({resetUser.email})
            </p>
            <form onSubmit={submitResetPassword} className="space-y-3">
              <div>
                <label className="mb-1 block text-sm text-muted">رمز جدید</label>
                <PasswordInput
                  value={resetPassword}
                  onChange={(event) => setResetPassword(event.target.value)}
                  minLength={6}
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-muted">تکرار رمز جدید</label>
                <PasswordInput
                  value={resetConfirm}
                  onChange={(event) => setResetConfirm(event.target.value)}
                  minLength={6}
                  required
                />
              </div>
              {resetError && <p className="text-sm text-rose-600">{resetError}</p>}
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button type="submit" disabled={updatingId === resetUser.id} className="flex-1">
                  {updatingId === resetUser.id ? "در حال ذخیره..." : "ذخیره رمز جدید"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setResetUser(null)}
                >
                  انصراف
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}

function UserSearchBar({
  search,
  onSearchChange,
  onClear,
  refreshing,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  onClear: () => void;
  refreshing: boolean;
}) {
  return (
    <div className="sticky top-[4.25rem] z-20 -mx-1 rounded-xl bg-surface/95 p-1 backdrop-blur-sm sm:static sm:top-auto sm:z-auto sm:mx-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
      <div className="relative">
        <Search size={18} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="جستجو با نام یا ایمیل..."
          className="min-h-[2.75rem] pr-10 pl-10 text-base sm:min-h-0 sm:text-sm"
          aria-label="جستجوی کاربران"
          autoComplete="off"
          enterKeyHint="search"
        />
        {search ? (
          <button
            type="button"
            onClick={onClear}
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-muted transition hover:bg-surface-muted hover:text-foreground"
            aria-label="پاک کردن جستجو"
          >
            <X size={16} />
          </button>
        ) : refreshing ? (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-teal-brand">...</span>
        ) : null}
      </div>
    </div>
  );
}

function SummaryCard({
  total,
  page,
  totalPages,
  search,
}: {
  total: number;
  page: number;
  totalPages: number;
  search?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <AnimateOnView animation="rise" onVisibleChange={setVisible}>
      <Card className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-brand/10 text-teal-brand">
            <Users size={20} />
          </span>
          <div>
            <p className="text-xs text-muted sm:text-sm">
              {search ? "نتیجه جستجو" : "تعداد کل کاربران"}
            </p>
            <p className="text-xl font-bold text-teal-brand sm:text-2xl">
              <AnimatedNumber value={total} duration={1000} active={visible} />
            </p>
            {search && (
              <p className="mt-0.5 text-[11px] text-muted sm:text-xs">برای «{search}»</p>
            )}
          </div>
        </div>
        <p className="rounded-lg bg-surface-muted px-3 py-2 text-center text-xs text-muted sm:text-left">
          صفحه {page.toLocaleString("fa-IR")} از {totalPages.toLocaleString("fa-IR")} — هر صفحه{" "}
          {PAGE_SIZE.toLocaleString("fa-IR")} کاربر
        </p>
      </Card>
    </AnimateOnView>
  );
}

type UserItemProps = {
  user: AdminUser;
  index: number;
  currentUserId: string;
  updatingId: string | null;
  onRoleChange: (user: AdminUser, role: "USER" | "ADMIN") => void;
  onToggleBlock: (user: AdminUser) => void;
  onResetPassword: (user: AdminUser) => void;
};

function UserRow({
  user,
  index,
  currentUserId,
  updatingId,
  onRoleChange,
  onToggleBlock,
  onResetPassword,
}: UserItemProps) {
  const { setRef, visible, animationClass } = useAnimateOnView();
  const isSelf = user.id === currentUserId;
  const isAdmin = user.role === "ADMIN";

  return (
    <tr
      ref={setRef}
      className={animationClass(
        "slide",
        cn(
          "border-t border-border-persian transition-colors hover:bg-surface-muted/50",
          user.blocked && "bg-rose-500/5",
        ),
      )}
      style={{ animationDelay: visible ? `${index * 0.04}s` : undefined }}
    >
      <td className="px-4 py-3">
        <p className="font-medium text-foreground">{user.name}</p>
        <p className="max-w-[200px] truncate text-xs text-muted">{user.email}</p>
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-1.5">
          <Badge variant={isAdmin ? "success" : "default"}>{isAdmin ? "مدیر" : "کاربر"}</Badge>
          {user.blocked && <Badge variant="danger">مسدود</Badge>}
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-1">
          <StatPill label="آپلود" value={user.stats.uploads} />
          <StatPill label="نظر" value={user.stats.reviews} />
          <StatPill label="ذخیره" value={user.stats.saved} />
        </div>
      </td>
      <td className="px-4 py-3 text-xs text-muted">
        {new Date(user.createdAt).toLocaleDateString("fa-IR")}
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={isAdmin ? "primary" : "secondary"}
            disabled={isSelf || updatingId === user.id || isAdmin || user.blocked}
            onClick={() => onRoleChange(user, "ADMIN")}
          >
            <Shield size={14} className="ml-1" />
            مدیر
          </Button>
          <Button
            size="sm"
            variant={!isAdmin ? "primary" : "ghost"}
            disabled={isSelf || updatingId === user.id || !isAdmin}
            onClick={() => onRoleChange(user, "USER")}
          >
            <ShieldOff size={14} className="ml-1" />
            کاربر
          </Button>
          <Button
            size="sm"
            variant="secondary"
            disabled={updatingId === user.id}
            onClick={() => onResetPassword(user)}
          >
            <KeyRound size={14} className="ml-1" />
            تغییر رمز
          </Button>
          <Button
            size="sm"
            variant={user.blocked ? "secondary" : "danger"}
            disabled={isSelf || updatingId === user.id || isAdmin}
            onClick={() => onToggleBlock(user)}
          >
            <Ban size={14} className="ml-1" />
            {user.blocked ? "رفع مسدودیت" : "مسدود"}
          </Button>
        </div>
        {isSelf && <p className="mt-1 text-[11px] text-muted">حساب فعلی شما</p>}
      </td>
    </tr>
  );
}

function UserCard({
  user,
  index,
  currentUserId,
  updatingId,
  onRoleChange,
  onToggleBlock,
  onResetPassword,
}: UserItemProps) {
  const isSelf = user.id === currentUserId;
  const isAdmin = user.role === "ADMIN";

  return (
    <AnimateOnView animation="slide" delay={index * 0.05}>
      <Card
        className={cn(
          "p-4 sm:p-5",
          isSelf && "border-teal-brand/40",
          user.blocked && "border-rose-500/30",
        )}
      >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-foreground">{user.name}</p>
          <p className="truncate text-xs text-muted">{user.email}</p>
        </div>
        <div className="flex shrink-0 flex-wrap justify-end gap-1.5">
          <Badge variant={isAdmin ? "success" : "default"}>{isAdmin ? "مدیر" : "کاربر"}</Badge>
          {user.blocked && <Badge variant="danger">مسدود</Badge>}
        </div>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <StatPill label="آپلود" value={user.stats.uploads} block />
        <StatPill label="نظر" value={user.stats.reviews} block />
        <StatPill label="ذخیره" value={user.stats.saved} block />
        <StatPill label="نوتیف" value={user.stats.notifications} block />
      </div>

      <p className="mb-3 text-xs text-muted">
        عضویت: {new Date(user.createdAt).toLocaleDateString("fa-IR")}
      </p>

      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-2">
          <Button
            size="sm"
            className="touch-target w-full"
            variant={isAdmin ? "primary" : "secondary"}
            disabled={isSelf || updatingId === user.id || isAdmin || user.blocked}
            onClick={() => onRoleChange(user, "ADMIN")}
          >
            <Shield size={14} className="ml-1" />
            مدیر
          </Button>
          <Button
            size="sm"
            className="touch-target w-full"
            variant={!isAdmin ? "primary" : "ghost"}
            disabled={isSelf || updatingId === user.id || !isAdmin}
            onClick={() => onRoleChange(user, "USER")}
          >
            <UserIcon size={14} className="ml-1" />
            کاربر
          </Button>
        </div>
        <Button
          size="sm"
          className="touch-target w-full"
          variant="secondary"
          disabled={updatingId === user.id}
          onClick={() => onResetPassword(user)}
        >
          <KeyRound size={14} className="ml-1" />
          تغییر رمز
        </Button>
        <Button
          size="sm"
          className="touch-target w-full"
          variant={user.blocked ? "secondary" : "danger"}
          disabled={isSelf || updatingId === user.id || isAdmin}
          onClick={() => onToggleBlock(user)}
        >
          <Ban size={14} className="ml-1" />
          {user.blocked ? "رفع مسدودیت" : "مسدود کردن"}
        </Button>
      </div>

      {isSelf && <p className="mt-2 text-[11px] text-muted">حساب فعلی شما</p>}
      </Card>
    </AnimateOnView>
  );
}

function StatPill({
  label,
  value,
  block,
}: {
  label: string;
  value: number;
  block?: boolean;
}) {
  return (
    <span
      className={cn(
        "rounded-lg bg-surface-muted text-muted",
        block ? "flex flex-col px-2.5 py-1.5 text-center" : "inline-flex items-center gap-1 px-2 py-0.5 text-[11px]",
      )}
    >
      <span className={cn(block && "text-[10px]")}>{label}</span>
      <span className={cn("font-semibold text-foreground", block && "text-sm")}>
        {value.toLocaleString("fa-IR")}
      </span>
    </span>
  );
}

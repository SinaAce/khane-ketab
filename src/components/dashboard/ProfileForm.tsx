"use client";

import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type ProfileFormProps = {
  initialName: string;
  email: string;
  onUpdated: (name: string) => void;
};

export function ProfileForm({ initialName, email, onUpdated }: ProfileFormProps) {
  const { update } = useSession();
  const [name, setName] = useState(initialName);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => setName(initialName), [initialName]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const response = await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        ...(newPassword ? { currentPassword, newPassword } : {}),
      }),
    });

    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.error || "خطا در به‌روزرسانی");
      return;
    }

    setMessage(data.message);
    setCurrentPassword("");
    setNewPassword("");
    onUpdated(data.user.name);
    await update({ name: data.user.name });
  }

  return (
    <Card>
      <h2 className="mb-4 text-lg font-semibold text-foreground">ویرایش پروفایل</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm text-muted">نام</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label className="mb-1 block text-sm text-muted">ایمیل</label>
          <Input value={email} disabled />
        </div>
        <div className="border-t border-border-persian pt-4">
          <p className="mb-3 text-sm font-medium text-foreground">تغییر رمز عبور</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <PasswordInput
              placeholder="رمز فعلی"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <PasswordInput
              placeholder="رمز جدید"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
        </div>
        {error && <p className="text-sm text-rose-600">{error}</p>}
        {message && <p className="text-sm text-teal-brand">{message}</p>}
        <Button type="submit" disabled={loading}>
          {loading ? "در حال ذخیره..." : "ذخیره تغییرات"}
        </Button>
      </form>

      <div className="mt-6 border-t border-border-persian pt-4">
        <Button
          type="button"
          variant="ghost"
          className="w-full justify-start text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/40"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut size={16} className="ml-2" />
          خروج از حساب
        </Button>
      </div>
    </Card>
  );
}

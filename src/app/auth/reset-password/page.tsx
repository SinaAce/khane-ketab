"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { PersianLoader } from "@/components/ui/PersianLoader";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    if (!token) {
      setError("لینک بازیابی نامعتبر است.");
      return;
    }

    if (password !== confirmPassword) {
      setError("رمز عبور و تکرار آن یکسان نیست.");
      return;
    }

    setLoading(true);

    const response = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.error || "تغییر رمز ناموفق بود.");
      return;
    }

    router.push("/auth/login?reset=1");
  }

  if (!token) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-1 items-center px-4 py-12">
        <Card className="w-full text-center">
          <h1 className="mb-2 text-2xl font-bold text-foreground">لینک نامعتبر</h1>
          <p className="mb-6 text-sm text-muted">لینک بازیابی رمز معتبر نیست یا منقضی شده است.</p>
          <Link href="/auth/forgot-password">
            <Button className="w-full">درخواست لینک جدید</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 items-center px-4 py-12">
      <Card className="w-full">
        <h1 className="mb-2 text-2xl font-bold text-foreground">تغییر رمز عبور</h1>
        <p className="mb-6 text-sm text-muted">رمز عبور جدید خود را وارد کنید.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">رمز عبور جدید</label>
            <PasswordInput
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={6}
              required
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">تکرار رمز عبور</label>
            <PasswordInput
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              minLength={6}
              required
            />
          </div>

          {error && <p className="text-sm text-rose-600">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "در حال ذخیره..." : "ذخیره رمز جدید"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          <Link href="/auth/login" className="font-medium text-teal-brand hover:underline">
            بازگشت به ورود
          </Link>
        </p>
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<PersianLoader label="در حال بارگذاری..." />}>
      <ResetPasswordForm />
    </Suspense>
  );
}

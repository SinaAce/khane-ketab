"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [devResetUrl, setDevResetUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    setDevResetUrl("");

    const response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.error || "ارسال لینک ناموفق بود.");
      return;
    }

    setMessage(data.message);
    if (data.devResetUrl) {
      setDevResetUrl(data.devResetUrl);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 items-center px-4 py-12">
      <Card className="w-full">
        <h1 className="mb-2 text-2xl font-bold text-foreground">فراموشی رمز عبور</h1>
        <p className="mb-6 text-sm text-muted">
          ایمیل خود را وارد کنید تا لینک تغییر رمز برایتان ارسال شود.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">ایمیل</label>
            <Input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="email@example.com"
              required
            />
          </div>

          {error && <p className="text-sm text-rose-600">{error}</p>}
          {message && <p className="text-sm text-emerald-700 dark:text-emerald-300">{message}</p>}

          {devResetUrl && (
            <div className="rounded-xl border border-amber-300/40 bg-amber-50 p-3 text-xs text-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
              <p className="mb-2 font-medium">حالت توسعه — SMTP تنظیم نشده</p>
              <a href={devResetUrl} className="break-all text-teal-brand hover:underline">
                {devResetUrl}
              </a>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "در حال ارسال..." : "ارسال لینک بازیابی"}
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

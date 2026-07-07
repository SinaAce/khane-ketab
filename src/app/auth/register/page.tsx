"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.error || "ثبت‌نام با خطا مواجه شد.");
      return;
    }

    router.push("/auth/login");
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 items-center px-4 py-12">
      <Card className="w-full">
        <h1 className="mb-2 text-2xl font-bold text-slate-900">ثبت‌نام</h1>
        <p className="mb-6 text-sm text-slate-500">حساب جدید بسازید و محتوا منتشر کنید.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">نام</label>
            <Input value={name} onChange={(event) => setName(event.target.value)} required />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">ایمیل</label>
            <Input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">رمز عبور</label>
            <PasswordInput
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={6}
              required
            />
          </div>

          {error && <p className="text-sm text-rose-600">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "در حال ثبت..." : "ثبت‌نام"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          قبلاً ثبت‌نام کرده‌اید؟{" "}
          <Link href="/auth/login" className="font-medium text-indigo-600 hover:underline">
            ورود
          </Link>
        </p>
      </Card>
    </div>
  );
}

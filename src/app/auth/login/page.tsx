"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { PersianLoader } from "@/components/ui/PersianLoader";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const resetSuccess = searchParams.get("reset") === "1";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("ایمیل یا رمز عبور اشتباه است.");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 items-center px-4 py-12">
      <Card className="w-full">
        <h1 className="mb-2 text-2xl font-bold text-foreground">ورود</h1>
        <p className="mb-6 text-sm text-muted">به حساب کاربری خود وارد شوید.</p>

        {resetSuccess && (
          <p className="mb-4 rounded-xl bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300">
            رمز عبور با موفقیت تغییر کرد. اکنون وارد شوید.
          </p>
        )}

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
          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <label className="block text-sm font-medium text-foreground">رمز عبور</label>
              <Link
                href="/auth/forgot-password"
                className="text-xs font-medium text-teal-brand hover:underline"
              >
                فراموشی رمز؟
              </Link>
            </div>
            <PasswordInput
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          {error && <p className="text-sm text-rose-600">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "در حال ورود..." : "ورود"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          حساب ندارید؟{" "}
          <Link href="/auth/register" className="font-medium text-teal-brand hover:underline">
            ثبت‌نام
          </Link>
        </p>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<PersianLoader label="در حال بارگذاری..." />}>
      <LoginForm />
    </Suspense>
  );
}

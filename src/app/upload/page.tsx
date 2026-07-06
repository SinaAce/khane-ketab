"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

type Category = {
  id: string;
  name: string;
};

export default function UploadPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"EBOOK" | "AUDIOBOOK">("EBOOK");
  const [categoryId, setCategoryId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  useEffect(() => {
    async function loadCategories() {
      const response = await fetch("/api/categories");
      const data = await response.json();
      setCategories(data.categories || []);
      if (data.categories?.[0]) {
        setCategoryId(data.categories[0].id);
      }
    }

    void loadCategories();
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!file) {
      setError("لطفاً یک فایل انتخاب کنید.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("type", type);
    formData.append("categoryId", categoryId);
    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.error || "آپلود با خطا مواجه شد.");
      return;
    }

    setMessage(data.message);
    setTitle("");
    setDescription("");
    setFile(null);
  }

  if (status === "loading") {
    return <div className="p-8 text-center text-muted">در حال بارگذاری...</div>;
  }

  if (!session) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <Card>
        <h1 className="mb-2 text-3xl font-bold text-teal-brand">آپلود محتوا</h1>
        <p className="mb-8 text-muted">
          کتاب PDF یا فایل صوتی خود را آپلود کنید. پس از تأیید مدیر منتشر می‌شود.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">عنوان</label>
            <Input value={title} onChange={(event) => setTitle(event.target.value)} required />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">توضیحات</label>
            <Textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">نوع محتوا</label>
              <select
                value={type}
                onChange={(event) => setType(event.target.value as "EBOOK" | "AUDIOBOOK")}
                className="surface-input w-full rounded-xl px-4 py-2.5 text-sm"
              >
                <option value="EBOOK">کتاب الکترونیکی (PDF)</option>
                <option value="AUDIOBOOK">محتوای صوتی</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">دسته‌بندی</label>
              <select
                value={categoryId}
                onChange={(event) => setCategoryId(event.target.value)}
                className="surface-input w-full rounded-xl px-4 py-2.5 text-sm"
                required
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">فایل</label>
            <Input
              type="file"
              accept={type === "EBOOK" ? ".pdf,application/pdf" : "audio/*"}
              onChange={(event) => setFile(event.target.files?.[0] || null)}
              required
            />
          </div>

          {error && <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}
          {message && <p className="text-sm text-emerald-600 dark:text-emerald-400">{message}</p>}

          <Button type="submit" disabled={loading}>
            {loading ? "در حال آپلود..." : "ارسال برای بررسی"}
          </Button>
        </form>
      </Card>
    </div>
  );
}

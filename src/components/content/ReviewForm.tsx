"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { cn } from "@/lib/utils";

type ReviewFormProps = {
  contentId: string;
};

export function ReviewForm({ contentId }: ReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const response = await fetch(`/api/contents/${contentId}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating, comment }),
    });

    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.error || "ثبت نظر با خطا مواجه شد.");
      return;
    }

    setMessage(data.message || "نظر شما ثبت شد و پس از تأیید مدیر نمایش داده می‌شود.");
    setComment("");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <p className="mb-2 text-sm font-medium text-foreground">امتیاز شما</p>
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setRating(index + 1)}
              className="rounded-lg p-1 hover:bg-amber-50 dark:hover:bg-amber-950/30"
            >
              <Star
                size={22}
                className={cn(
                  index + 1 <= rating ? "fill-gold-brand text-gold-brand" : "text-muted/40",
                )}
              />
            </button>
          ))}
        </div>
      </div>

      <Textarea
        placeholder="نظر خود را بنویسید..."
        value={comment}
        onChange={(event) => setComment(event.target.value)}
      />

      {error && <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}
      {message && <p className="text-sm text-emerald-600 dark:text-emerald-400">{message}</p>}

      <Button type="submit" disabled={loading}>
        {loading ? "در حال ثبت..." : "ارسال برای بررسی"}
      </Button>
    </form>
  );
}

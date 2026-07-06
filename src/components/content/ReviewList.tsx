"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { StarRating } from "@/components/content/StarRating";
import { Button } from "@/components/ui/Button";
import { useState } from "react";

type ReviewListProps = {
  contentId: string;
  reviews: {
    id: string;
    rating: number;
    comment?: string | null;
    createdAt: Date;
    user: { id: string; name: string };
  }[];
  currentUserId?: string;
  isAdmin?: boolean;
};

export function ReviewList({ contentId, reviews, currentUserId, isAdmin }: ReviewListProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(reviewId: string) {
    if (!confirm("آیا از حذف این نظر مطمئن هستید؟")) return;

    setDeletingId(reviewId);
    const response = await fetch(`/api/contents/${contentId}/reviews/${reviewId}`, {
      method: "DELETE",
    });
    setDeletingId(null);

    if (!response.ok) {
      const data = await response.json();
      alert(data.error || "حذف نظر با خطا مواجه شد.");
      return;
    }

    router.refresh();
  }

  if (reviews.length === 0) {
    return <p className="text-sm text-muted">هنوز نظری ثبت نشده است.</p>;
  }

  return (
    <div className="space-y-3">
      {reviews.map((review) => {
        const canDelete = currentUserId === review.user.id || isAdmin;

        return (
          <div key={review.id} className="surface-panel rounded-xl p-4">
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="font-medium text-foreground">{review.user.name}</p>
              <div className="flex items-center gap-2">
                <StarRating value={review.rating} size={14} />
                {canDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={deletingId === review.id}
                    onClick={() => handleDelete(review.id)}
                    className="text-rose-600"
                    title={isAdmin && currentUserId !== review.user.id ? "حذف توسط مدیر" : "حذف نظر"}
                  >
                    <Trash2 size={14} />
                  </Button>
                )}
              </div>
            </div>
            {review.comment && <p className="text-sm text-muted">{review.comment}</p>}
          </div>
        );
      })}
    </div>
  );
}

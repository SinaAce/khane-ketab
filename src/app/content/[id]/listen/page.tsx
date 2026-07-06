export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { SaveButton } from "@/components/content/SaveButton";
import { ReviewForm } from "@/components/content/ReviewForm";
import { ReviewList } from "@/components/content/ReviewList";
import { StarRating } from "@/components/content/StarRating";
import { AudioPlayer } from "@/components/media/AudioPlayer";
import { Card } from "@/components/ui/Card";
import { auth } from "@/lib/auth";
import { getContentById } from "@/lib/content";
import { prisma, withPrismaRetry } from "@/lib/prisma";
import { getFileUrl } from "@/lib/storage";

type ListenPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ListenPage({ params }: ListenPageProps) {
  const { id } = await params;
  const session = await auth();
  const content = await getContentById(id, "APPROVED");

  if (!content || content.type !== "AUDIOBOOK") {
    notFound();
  }

  await withPrismaRetry(() =>
    prisma.content.update({
      where: { id },
      data: { downloadCount: { increment: 1 } },
    }),
  );

  const fileUrl = await getFileUrl(content.fileKey);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href="/browse"
        className="mb-6 inline-flex items-center text-sm text-teal-brand hover:underline"
      >
        <ArrowRight size={16} className="ml-1" />
        برگشت به کتاب‌ها
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">{content.title}</h1>
        {content.description && <p className="mt-2 text-muted">{content.description}</p>}
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted">
          <span>نویسنده: {content.author.name}</span>
          <span>دسته: {content.category.name}</span>
          <StarRating value={content.averageRating} />
          <SaveButton contentId={content.id} />
        </div>
      </div>

      <AudioPlayer src={fileUrl} title={content.title} fileKey={content.fileKey} />

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-xl font-semibold text-foreground">نظرات کاربران</h2>
          <ReviewList
            contentId={content.id}
            reviews={content.reviews}
            currentUserId={session?.user?.id}
            isAdmin={session?.user?.role === "ADMIN"}
          />
        </Card>

        {session ? (
          <Card>
            <h2 className="mb-4 text-xl font-semibold text-foreground">ثبت نظر</h2>
            <ReviewForm contentId={content.id} />
          </Card>
        ) : (
          <Card>
            <p className="text-sm text-muted">
              برای ثبت نظر ابتدا{" "}
              <Link href="/auth/login" className="text-teal-brand hover:underline">
                وارد شوید
              </Link>
              .
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}

import type { NotificationType } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

type CreateNotificationInput = {
  userId: string;
  type: NotificationType;
  message: string;
  relatedId?: string;
};

export type NotificationContentLink = {
  href: string;
  title: string;
};

export function getContentHref(type: "EBOOK" | "AUDIOBOOK", id: string) {
  return type === "EBOOK" ? `/content/${id}/read` : `/content/${id}/listen`;
}

export async function createNotification(input: CreateNotificationInput) {
  return prisma.notification.create({ data: input });
}

export async function notifyContentApproved(content: {
  id: string;
  title: string;
  authorId: string;
}) {
  return createNotification({
    userId: content.authorId,
    type: "CONTENT_APPROVED",
    message: `محتوای «${content.title}» توسط مدیر تأیید شد.`,
    relatedId: content.id,
  });
}

export async function notifyContentRejected(content: {
  id: string;
  title: string;
  authorId: string;
}) {
  return createNotification({
    userId: content.authorId,
    type: "CONTENT_REJECTED",
    message: `محتوای «${content.title}» توسط مدیر رد شد.`,
    relatedId: content.id,
  });
}

export async function notifyReviewApproved(review: {
  id: string;
  userId: string;
  content: { id: string; title: string; type: "EBOOK" | "AUDIOBOOK" };
}) {
  return createNotification({
    userId: review.userId,
    type: "REVIEW_APPROVED",
    message: `نظر شما روی «${review.content.title}» تأیید شد.`,
    relatedId: review.id,
  });
}

export async function notifyReviewRejected(review: {
  id: string;
  userId: string;
  content: { id: string; title: string; type: "EBOOK" | "AUDIOBOOK" };
}) {
  return createNotification({
    userId: review.userId,
    type: "REVIEW_REJECTED",
    message: `نظر شما روی «${review.content.title}» رد شد.`,
    relatedId: review.id,
  });
}

type NotificationRecord = {
  id: string;
  type: NotificationType;
  message: string;
  read: boolean;
  relatedId: string | null;
  createdAt: Date;
};

export async function enrichNotification(notification: NotificationRecord) {
  let contentLink: NotificationContentLink | null = null;

  if (notification.type.startsWith("CONTENT_") && notification.relatedId) {
    const content = await prisma.content.findUnique({
      where: { id: notification.relatedId },
      select: { id: true, title: true, type: true, status: true },
    });

    if (content) {
      contentLink = {
        title: content.title,
        href:
          content.status === "APPROVED"
            ? getContentHref(content.type, content.id)
            : "/dashboard?tab=uploads",
      };
    }
  }

  if (notification.type.startsWith("REVIEW_") && notification.relatedId) {
    const review = await prisma.review.findUnique({
      where: { id: notification.relatedId },
      select: {
        content: { select: { id: true, title: true, type: true, status: true } },
      },
    });

    if (review?.content) {
      contentLink = {
        title: review.content.title,
        href:
          review.content.status === "APPROVED"
            ? getContentHref(review.content.type, review.content.id)
            : "/browse",
      };
    }
  }

  return {
    ...notification,
    createdAt: notification.createdAt.toISOString(),
    contentLink,
  };
}

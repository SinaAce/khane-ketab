import { prisma, withPrismaRetry } from "@/lib/prisma";
import { averageRating } from "@/lib/utils";
import type { ContentStatus, ContentType, Prisma } from "@/generated/prisma/client";

export const approvedReviewWhere = { status: "APPROVED" as const };

export const contentInclude = {
  author: { select: { id: true, name: true } },
  category: { select: { id: true, name: true, slug: true } },
  reviews: {
    where: approvedReviewWhere,
    select: { rating: true },
  },
} satisfies Prisma.ContentInclude;

export type ContentWithRelations = Prisma.ContentGetPayload<{
  include: typeof contentInclude;
}>;

export function mapContent(content: ContentWithRelations) {
  const ratings = content.reviews.map((review) => review.rating);
  return {
    id: content.id,
    title: content.title,
    description: content.description,
    type: content.type,
    status: content.status,
    fileKey: content.fileKey,
    coverKey: content.coverKey,
    fileSize: content.fileSize,
    duration: content.duration,
    downloadCount: content.downloadCount,
    createdAt: content.createdAt,
    author: content.author,
    category: content.category,
    averageRating: averageRating(ratings),
    reviewCount: ratings.length,
  };
}

export type MappedContent = ReturnType<typeof mapContent>;

export type PaginatedContents = {
  items: MappedContent[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export async function getApprovedContents(params?: {
  q?: string;
  type?: ContentType;
  category?: string;
  sort?: "newest" | "popular" | "rating";
  page?: number;
  pageSize?: number;
  limit?: number;
}): Promise<PaginatedContents> {
  const page = Math.max(1, params?.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, params?.pageSize ?? params?.limit ?? 50));
  const skip = (page - 1) * pageSize;
  const where: Prisma.ContentWhereInput = {
    status: "APPROVED",
  };

  if (params?.q) {
    where.OR = [
      { title: { contains: params.q, mode: "insensitive" } },
      { description: { contains: params.q, mode: "insensitive" } },
    ];
  }

  if (params?.type) {
    where.type = params.type;
  }

  if (params?.category) {
    where.category = { slug: params.category };
  }

  if (params?.sort === "rating") {
    const allContents = await withPrismaRetry(() =>
      prisma.content.findMany({
        where,
        include: contentInclude,
        orderBy: { createdAt: "desc" },
      }),
    );

    const sorted = allContents.map(mapContent).sort((a, b) => b.averageRating - a.averageRating);
    const total = sorted.length;

    return {
      items: sorted.slice(skip, skip + pageSize),
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  }

  const orderBy: Prisma.ContentOrderByWithRelationInput =
    params?.sort === "popular" ? { downloadCount: "desc" } : { createdAt: "desc" };

  const [contents, total] = await withPrismaRetry(() =>
    Promise.all([
      prisma.content.findMany({
        where,
        include: contentInclude,
        orderBy,
        skip,
        take: pageSize,
      }),
      prisma.content.count({ where }),
    ]),
  );

  return {
    items: contents.map(mapContent),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getRecommendations(userId?: string, limit = 6) {
  if (userId) {
    const userReviews = await withPrismaRetry(() =>
      prisma.review.findMany({
        where: { userId, status: "APPROVED" },
        include: { content: { select: { categoryId: true, type: true } } },
      }),
    );

    if (userReviews.length > 0) {
      const categoryIds = [...new Set(userReviews.map((r) => r.content.categoryId))];
      const contents = await withPrismaRetry(() =>
        prisma.content.findMany({
          where: {
            status: "APPROVED",
            categoryId: { in: categoryIds },
          },
          include: contentInclude,
          orderBy: { downloadCount: "desc" },
          take: limit,
        }),
      );
      return contents.map(mapContent);
    }
  }

  const popular = await getApprovedContents({ sort: "popular", pageSize: limit });
  return popular.items;
}

export async function getContentById(id: string, status?: ContentStatus) {
  const content = await withPrismaRetry(() =>
    prisma.content.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true } },
        category: { select: { id: true, name: true, slug: true } },
      },
    }),
  );

  if (!content || (status && content.status !== status)) return null;

  const reviews = await withPrismaRetry(() =>
    prisma.review.findMany({
      where: { contentId: id, ...approvedReviewWhere },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    }),
  );

  return {
    ...mapContent({ ...content, reviews: reviews.map((review) => ({ rating: review.rating })) }),
    reviews: reviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      user: review.user,
    })),
  };
}

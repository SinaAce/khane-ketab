export const dynamic = "force-dynamic";

import { HomeHero } from "@/components/home/HomeHero";
import { HomeSections } from "@/components/home/HomeSections";
import { TopicSlider } from "@/components/home/TopicSlider";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { auth } from "@/lib/auth";
import { getApprovedContents, getRecommendations } from "@/lib/content";
import { prisma, withPrismaRetry } from "@/lib/prisma";
import { buildTopicSlides } from "@/lib/topic-slides";

async function getHeroStats() {
  return withPrismaRetry(async () => {
    const approved = { status: "APPROVED" as const };

    const [ebooks, audiobooks, iranHistory, worldHistory] = await Promise.all([
      prisma.content.count({ where: { ...approved, type: "EBOOK" } }),
      prisma.content.count({ where: { ...approved, type: "AUDIOBOOK" } }),
      prisma.content.count({
        where: {
          ...approved,
          OR: [
            { category: { slug: "history" } },
            { title: { contains: "ایران", mode: "insensitive" } },
            { description: { contains: "ایران", mode: "insensitive" } },
          ],
        },
      }),
      prisma.content.count({
        where: {
          ...approved,
          OR: [
            { title: { contains: "جهان", mode: "insensitive" } },
            { description: { contains: "جهان", mode: "insensitive" } },
            { title: { contains: "باستان", mode: "insensitive" } },
            { description: { contains: "تمدن", mode: "insensitive" } },
          ],
        },
      }),
    ]);

    return { ebooks, audiobooks, iranHistory, worldHistory };
  });
}

async function getTopicSliderData() {
  return withPrismaRetry(async () => {
    const approved = { status: "APPROVED" as const };

    const [categories, ebooks, audiobooks] = await Promise.all([
      prisma.category.findMany({
        orderBy: { name: "asc" },
        include: {
          _count: {
            select: { contents: { where: approved } },
          },
        },
      }),
      prisma.content.count({ where: { ...approved, type: "EBOOK" } }),
      prisma.content.count({ where: { ...approved, type: "AUDIOBOOK" } }),
    ]);

    return buildTopicSlides(
      categories.map((category) => ({
        name: category.name,
        slug: category.slug,
        description: category.description,
        count: category._count.contents,
      })),
      { ebooks, audiobooks },
    );
  });
}

export default async function HomePage() {
  const session = await auth();

  let recommended: Awaited<ReturnType<typeof getRecommendations>> = [];
  let latest: Awaited<ReturnType<typeof getApprovedContents>>["items"] = [];
  let stats = { ebooks: 0, audiobooks: 0, iranHistory: 0, worldHistory: 0 };
  let topicSlides: Awaited<ReturnType<typeof getTopicSliderData>> = [];
  let dbError = false;

  try {
    const [recommendedData, latestData, statsData, topicSlidesData] = await Promise.all([
      getRecommendations(session?.user?.id, 80),
      getApprovedContents({ sort: "newest", pageSize: 80 }),
      getHeroStats(),
      getTopicSliderData(),
    ]);
    recommended = recommendedData;
    latest = latestData.items;
    stats = statsData;
    topicSlides = topicSlidesData;
  } catch {
    dbError = true;
  }

  return (
    <div>
      <HomeHero stats={stats} />

      {dbError && (
        <ScrollReveal variant="fade">
          <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-xl border border-amber-300/40 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
              اتصال به دیتابیس برقرار نیست. اگر از Prisma Dev استفاده می‌کنید آن را اجرا کنید، سپس سرور Next.js را
              ری‌استارت کنید.
            </div>
          </section>
        </ScrollReveal>
      )}

      <TopicSlider slides={topicSlides} />
      <HomeSections recommended={recommended} latest={latest} />
    </div>
  );
}

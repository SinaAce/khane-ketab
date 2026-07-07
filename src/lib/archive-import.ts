import bcrypt from "bcryptjs";
import type { PrismaClient } from "@/generated/prisma/client";
import { ARCHIVE_CATALOG } from "../../prisma/data/archive-catalog";
import { VERIFIED_ARCHIVE } from "../../prisma/data/verified-archive";
import { buildArchiveFileKey } from "@/lib/storage";

export type ArchiveCatalogEntry = {
  identifier: string;
  title: string;
  creator: string;
  description?: string;
  type: "EBOOK" | "AUDIOBOOK";
  categorySlug: string;
};

const authorCache = new Map<string, string>();

function authorEmail(name: string) {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\u0600-\u06FF-]+/g, "")
    .slice(0, 40);
  return `author-${slug || "unknown"}@books.local`;
}

async function getAuthorId(prisma: PrismaClient, name: string) {
  const cached = authorCache.get(name);
  if (cached) return cached;

  const password = await bcrypt.hash("import123", 12);
  const user = await prisma.user.upsert({
    where: { email: authorEmail(name) },
    update: { name },
    create: {
      name,
      email: authorEmail(name),
      passwordHash: password,
      role: "USER",
    },
  });

  authorCache.set(name, user.id);
  return user.id;
}

export function buildMergedCatalog(): ArchiveCatalogEntry[] {
  const map = new Map<string, ArchiveCatalogEntry>();

  for (const item of VERIFIED_ARCHIVE) {
    map.set(item.identifier, {
      identifier: item.identifier,
      title: item.title,
      creator: item.creator,
      description: item.description,
      type: item.type,
      categorySlug: item.categorySlug,
    });
  }

  for (const item of ARCHIVE_CATALOG) {
    if (map.has(item.identifier)) continue;
    map.set(item.identifier, {
      identifier: item.identifier,
      title: item.title,
      creator: item.creator || "گردآوری",
      description: item.description,
      type: item.type,
      categorySlug: item.categorySlug,
    });
  }

  return [...map.values()];
}

async function importCatalog(
  prisma: PrismaClient,
  categoryMap: Record<string, string>,
  importedIds: Set<string>,
  items: ArchiveCatalogEntry[],
) {
  let imported = 0;
  let skipped = 0;

  for (const item of items) {
    if (!categoryMap[item.categorySlug] || importedIds.has(item.identifier)) {
      skipped += 1;
      continue;
    }

    const existing = await prisma.content.findFirst({
      where: { fileKey: buildArchiveFileKey(item.identifier) },
      select: { id: true },
    });
    if (existing) {
      importedIds.add(item.identifier);
      skipped += 1;
      continue;
    }

    importedIds.add(item.identifier);
    const authorId = await getAuthorId(prisma, item.creator);

    await prisma.content.create({
      data: {
        title: item.title.slice(0, 200),
        description: item.description,
        type: item.type,
        status: "APPROVED",
        fileKey: buildArchiveFileKey(item.identifier),
        downloadCount: Math.floor(Math.random() * 120) + 15,
        authorId,
        categoryId: categoryMap[item.categorySlug],
        duration: item.type === "AUDIOBOOK" ? 2400 + Math.floor(Math.random() * 3600) : null,
      },
    });

    imported += 1;
  }

  return { imported, skipped };
}

async function tryOnlineImport(
  prisma: PrismaClient,
  categoryMap: Record<string, string>,
  importedIds: Set<string>,
) {
  const queries = [
    { q: "collection:booksbylanguage_persian AND mediatype:texts", type: "EBOOK" as const, category: "literature" },
    { q: "language:fas AND mediatype:texts", type: "EBOOK" as const, category: "literature" },
    { q: "language:per AND mediatype:texts", type: "EBOOK" as const, category: "literature" },
    { q: "subject:persian AND mediatype:texts", type: "EBOOK" as const, category: "literature" },
    { q: "subject:iran AND mediatype:texts", type: "EBOOK" as const, category: "history" },
    { q: "language:fas AND mediatype:audio", type: "AUDIOBOOK" as const, category: "podcast" },
    { q: "subject:persian AND mediatype:audio", type: "AUDIOBOOK" as const, category: "podcast" },
  ];

  let imported = 0;

  for (const { q, type, category } of queries) {
    try {
      const url = new URL("https://archive.org/advancedsearch.php");
      url.searchParams.set("q", q);
      url.searchParams.append("fl[]", "identifier");
      url.searchParams.append("fl[]", "title");
      url.searchParams.append("fl[]", "creator");
      url.searchParams.set("rows", "80");
      url.searchParams.set("output", "json");

      const response = await fetch(url, { signal: AbortSignal.timeout(20000) });
      if (!response.ok) continue;

      const data = (await response.json()) as {
        response?: { docs?: { identifier: string; title?: string; creator?: string | string[] }[] };
      };

      for (const doc of data.response?.docs || []) {
        if (!doc.identifier || importedIds.has(doc.identifier)) continue;

        const existing = await prisma.content.findFirst({
          where: { fileKey: buildArchiveFileKey(doc.identifier) },
          select: { id: true },
        });
        if (existing) {
          importedIds.add(doc.identifier);
          continue;
        }

        importedIds.add(doc.identifier);
        const categorySlug = type === "AUDIOBOOK" ? "podcast" : category;
        if (!categoryMap[categorySlug]) continue;

        const creator = Array.isArray(doc.creator)
          ? doc.creator.join("، ")
          : doc.creator || "ناشناس";
        const authorId = await getAuthorId(prisma, creator.slice(0, 80));

        await prisma.content.create({
          data: {
            title: (doc.title || doc.identifier).slice(0, 200),
            type,
            status: "APPROVED",
            fileKey: buildArchiveFileKey(doc.identifier),
            downloadCount: Math.floor(Math.random() * 80) + 10,
            authorId,
            categoryId: categoryMap[categorySlug],
            duration: type === "AUDIOBOOK" ? 2400 : null,
          },
        });

        imported += 1;
      }
    } catch {
      // network unavailable — static catalog still works
    }
  }

  return imported;
}

export type ArchiveImportResult = {
  catalogImported: number;
  catalogSkipped: number;
  onlineImported: number;
  totalCatalog: number;
};

export async function runArchiveImport(prisma: PrismaClient): Promise<ArchiveImportResult> {
  authorCache.clear();

  const defaultCategories = [
    { name: "ادبیات", slug: "literature", description: "رمان، داستان و شعر" },
    { name: "علمی", slug: "science", description: "کتاب‌های علمی و آموزشی" },
    { name: "تاریخ", slug: "history", description: "تاریخ و باستان‌شناسی" },
    { name: "فلسفه", slug: "philosophy", description: "فلسفه و اندیشه" },
    { name: "پادکست", slug: "podcast", description: "پادکست و محتوای صوتی" },
    { name: "کودک و نوجوان", slug: "children", description: "محتوای مناسب کودکان" },
  ];

  for (const category of defaultCategories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }

  const categories = await prisma.category.findMany();
  const categoryMap = Object.fromEntries(categories.map((c) => [c.slug, c.id]));

  const catalog = buildMergedCatalog();
  const importedIds = new Set<string>();
  const { imported: catalogImported, skipped: catalogSkipped } = await importCatalog(
    prisma,
    categoryMap,
    importedIds,
    catalog,
  );
  const onlineImported = await tryOnlineImport(prisma, categoryMap, importedIds);

  return {
    catalogImported,
    catalogSkipped,
    onlineImported,
    totalCatalog: catalog.length,
  };
}

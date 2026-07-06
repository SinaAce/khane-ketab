import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { VERIFIED_ARCHIVE } from "./data/verified-archive";
import { buildArchiveFileKey } from "../src/lib/storage";

// Bypass broken system proxy (ECONNREFUSED 10.10.34.36)
process.env.NO_PROXY = "*";
delete process.env.HTTP_PROXY;
delete process.env.HTTPS_PROXY;
delete process.env.http_proxy;
delete process.env.https_proxy;

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

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

async function getAuthorId(name: string) {
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

async function tryOnlineImport(categoryMap: Record<string, string>, importedIds: Set<string>) {
  const queries = [
    "collection:booksbylanguage_persian AND mediatype:texts",
    "language:fas AND mediatype:audio",
  ];

  let imported = 0;

  for (const query of queries) {
    try {
      const url = new URL("https://archive.org/advancedsearch.php");
      url.searchParams.set("q", query);
      url.searchParams.append("fl[]", "identifier");
      url.searchParams.append("fl[]", "title");
      url.searchParams.append("fl[]", "creator");
      url.searchParams.set("rows", "30");
      url.searchParams.set("output", "json");

      const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
      if (!response.ok) continue;

      const data = (await response.json()) as {
        response?: { docs?: { identifier: string; title?: string; creator?: string | string[] }[] };
      };

      for (const doc of data.response?.docs || []) {
        if (!doc.identifier || importedIds.has(doc.identifier)) continue;
        importedIds.add(doc.identifier);

        const type = query.includes("audio") ? "AUDIOBOOK" : "EBOOK";
        const categorySlug = type === "AUDIOBOOK" ? "podcast" : "literature";
        const creator = Array.isArray(doc.creator) ? doc.creator.join("، ") : doc.creator || "ناشناس";
        const authorId = await getAuthorId(creator.slice(0, 80));

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
      // network unavailable — fall back to static catalog
    }
  }

  return imported;
}

async function importStaticCatalog(categoryMap: Record<string, string>, importedIds: Set<string>) {
  let imported = 0;

  for (const item of VERIFIED_ARCHIVE) {
    if (!categoryMap[item.categorySlug] || importedIds.has(item.identifier)) continue;
    importedIds.add(item.identifier);

    const authorId = await getAuthorId(item.creator);

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
        duration: item.type === "AUDIOBOOK" ? 2400 : null,
      },
    });

    imported += 1;
  }

  return imported;
}

async function main() {
  console.log("Importing verified Persian books & podcasts...");

  const categories = await prisma.category.findMany();
  const categoryMap = Object.fromEntries(categories.map((c) => [c.slug, c.id]));

  await prisma.review.deleteMany({
    where: {
      OR: [
        { content: { fileKey: { startsWith: "ext:" } } },
        { content: { fileKey: { startsWith: "archive:" } } },
      ],
    },
  });
  await prisma.content.deleteMany({
    where: {
      OR: [{ fileKey: { startsWith: "ext:" } }, { fileKey: { startsWith: "archive:" } }],
    },
  });

  const importedIds = new Set<string>();
  const staticCount = await importStaticCatalog(categoryMap, importedIds);
  const onlineCount = await tryOnlineImport(categoryMap, importedIds);

  console.log(`Done: ${staticCount} verified items + ${onlineCount} from API (if online).`);
  console.log("Books use archive.org embed — works in browser without server download.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

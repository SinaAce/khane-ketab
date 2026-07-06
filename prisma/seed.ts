import "dotenv/config";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { buildArchiveFileKey } from "../src/lib/storage";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const UPLOAD_DIR = path.join(process.cwd(), "uploads", "seed");

const MINIMAL_PDF = Buffer.from(
  `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >> endobj
4 0 obj << /Length 44 >> stream
BT /F1 24 Tf 100 700 Td (Sample Book) Tj ET
endstream endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000214 00000 n 
trailer << /Size 5 /Root 1 0 R >>
startxref
308
%%EOF`,
);

const categories = [
  { name: "ادبیات", slug: "literature", description: "رمان، داستان و شعر" },
  { name: "علمی", slug: "science", description: "کتاب‌های علمی و آموزشی" },
  { name: "تاریخ", slug: "history", description: "تاریخ و باستان‌شناسی" },
  { name: "فلسفه", slug: "philosophy", description: "فلسفه و اندیشه" },
  { name: "پادکست", slug: "podcast", description: "پادکست و محتوای صوتی" },
  { name: "کودک و نوجوان", slug: "children", description: "محتوای مناسب کودکان" },
];

const sampleBooks = [
  {
    slug: "shahnameh",
    title: "شاهنامه فردوسی",
    description: "حماسه ملی ایران؛ داستان پهلوانان، پادشاهان و جنگ‌های ایران باستان.",
    type: "EBOOK" as const,
    categorySlug: "literature",
    fileSize: 4_850_000,
    downloadCount: 128,
  },
  {
    slug: "golestan",
    title: "گلستان سعدی",
    description: "مجموعه‌ای از حکایات اخلاقی و آموزنده به نثر مسجع.",
    type: "EBOOK" as const,
    categorySlug: "literature",
    fileSize: 1_240_000,
    downloadCount: 96,
  },
  {
    slug: "bustan",
    title: "بوستان سعدی",
    description: "دیوان شعر و حکمت سعدی شیرازی در ده باب.",
    type: "EBOOK" as const,
    categorySlug: "literature",
    fileSize: 980_000,
    downloadCount: 74,
  },
  {
    slug: "hafez-divan",
    title: "دیوان حافظ",
    description: "غزلیات حافظ شیرازی؛ سروده‌های عرفانی و عاشقانه.",
    type: "EBOOK" as const,
    categorySlug: "literature",
    fileSize: 760_000,
    downloadCount: 210,
  },
  {
    slug: "masnavi",
    title: "مثنوی معنوی",
    description: "اثر بزرگ مولانا؛ داستان‌های تمثیلی و معرفتی.",
    type: "EBOOK" as const,
    categorySlug: "philosophy",
    fileSize: 3_200_000,
    downloadCount: 88,
  },
  {
    slug: "tarikh-beyhaqi",
    title: "تاریخ بیهقی",
    description: "تاریخ غزنویان؛ یکی از مهم‌ترین منابع تاریخ ایران.",
    type: "EBOOK" as const,
    categorySlug: "history",
    fileSize: 2_100_000,
    downloadCount: 52,
  },
  {
    slug: "qabusnameh",
    title: "قابوسنامه",
    description: "پندهای پادشاهی و اخلاقی کیکاووس بن وشمگیر.",
    type: "EBOOK" as const,
    categorySlug: "history",
    fileSize: 890_000,
    downloadCount: 41,
  },
  {
    slug: "physics-intro",
    title: "فیزیک پایه برای دانش‌آموز",
    description: "مفاهیم بنیادین فیزیک با مثال‌های ساده و کاربردی.",
    type: "EBOOK" as const,
    categorySlug: "science",
    fileSize: 5_600_000,
    downloadCount: 63,
  },
  {
    slug: "majid-stories",
    title: "قصه‌های مجید",
    description: "مجموعه داستان‌های کودکانه و شاد برای نوجوانان.",
    type: "EBOOK" as const,
    categorySlug: "children",
    fileSize: 1_500_000,
    downloadCount: 115,
  },
  {
    slug: "iran-history-podcast",
    title: "مثنوی‌خوانی",
    description: "اجرای صوتی اشعار مثنوی.",
    type: "AUDIOBOOK" as const,
    categorySlug: "podcast",
    duration: 3_600,
    downloadCount: 87,
    archiveId: "Various_Artist_-_Masnavi_Khani_II",
  },
];

const sampleReviews = [
  { rating: 5, comment: "یکی از بهترین منابع برای مطالعه. بسیار توصیه می‌کنم." },
  { rating: 4, comment: "محتوای عالی، فقط کیفیت فایل می‌توانست بهتر باشد." },
  { rating: 5, comment: "برای علاقه‌مندان ادبیات فارسی ضروری است." },
  { rating: 4, comment: "خواندنش لذت‌بخش بود. منتظر نسخه‌های بیشتر هستم." },
  { rating: 3, comment: "خوب بود ولی بعضی بخش‌ها نیاز به توضیح بیشتر دارد." },
];

async function ensureSeedFiles() {
  await mkdir(UPLOAD_DIR, { recursive: true });

  for (const book of sampleBooks) {
    if ("archiveId" in book && book.archiveId) continue;
    if (book.type === "EBOOK") {
      await writeFile(path.join(UPLOAD_DIR, `${book.slug}.pdf`), MINIMAL_PDF);
    }
  }
}

async function main() {
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }

  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@marketplace.local" },
    update: {},
    create: {
      name: "مدیر سیستم",
      email: "admin@marketplace.local",
      passwordHash: adminPassword,
      role: "ADMIN",
    },
  });

  const userPassword = await bcrypt.hash("user123", 12);
  const sampleUser = await prisma.user.upsert({
    where: { email: "user@marketplace.local" },
    update: {},
    create: {
      name: "کاربر نمونه",
      email: "user@marketplace.local",
      passwordHash: userPassword,
      role: "USER",
    },
  });

  const authorPassword = await bcrypt.hash("author123", 12);
  const author1 = await prisma.user.upsert({
    where: { email: "author1@marketplace.local" },
    update: {},
    create: {
      name: "مریم کریمی",
      email: "author1@marketplace.local",
      passwordHash: authorPassword,
      role: "USER",
    },
  });

  const author2 = await prisma.user.upsert({
    where: { email: "author2@marketplace.local" },
    update: {},
    create: {
      name: "احمد رضایی",
      email: "author2@marketplace.local",
      passwordHash: authorPassword,
      role: "USER",
    },
  });

  const authors = [admin, author1, author2, sampleUser];

  await prisma.review.deleteMany({
    where: { content: { fileKey: { startsWith: "seed/" } } },
  });
  await prisma.content.deleteMany({
    where: { fileKey: { startsWith: "seed/" } },
  });

  await ensureSeedFiles();

  const categoryMap = Object.fromEntries(
    (await prisma.category.findMany()).map((c) => [c.slug, c.id]),
  );

  for (const [index, book] of sampleBooks.entries()) {
    const author = authors[index % authors.length];
    const fileKey =
      "archiveId" in book && book.archiveId
        ? buildArchiveFileKey(book.archiveId)
        : book.type === "EBOOK"
          ? `seed/${book.slug}.pdf`
          : `seed/${book.slug}.mp3`;

    const content = await prisma.content.create({
      data: {
        title: book.title,
        description: book.description,
        type: book.type,
        status: "APPROVED",
        fileKey,
        fileSize: book.type === "EBOOK" ? book.fileSize : null,
        duration: book.type === "AUDIOBOOK" ? book.duration : null,
        downloadCount: book.downloadCount,
        authorId: author.id,
        categoryId: categoryMap[book.categorySlug],
      },
    });

    const reviewers = [sampleUser, author1, author2, admin].filter(
      (reviewer) => reviewer.id !== author.id,
    );
    const reviewCount = Math.min(2 + (index % 3), reviewers.length);
    for (let i = 0; i < reviewCount; i++) {
      const reviewer = reviewers[i];
      const review = sampleReviews[(index + i) % sampleReviews.length];

      await prisma.review.create({
        data: {
          contentId: content.id,
          userId: reviewer.id,
          rating: review.rating,
          comment: review.comment,
        },
      });
    }
  }

  console.log("Seed completed: 10 books, categories, users, and reviews.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

/**
 * Deep line-by-line docs — database & auth
 * Used by build-site-docs.mjs to replace/enrich entries
 */

function lines(items) {
  return items.map(({ n, c, e }) => `- **خط ${n}:** \`${c.replace(/`/g, "'")}\` — ${e}`).join("\n");
}

export const DEEP_OVERVIEWS = [
  {
    id: "deep-database-overview",
    category: "database",
    title: "📘 راهنمای کامل دیتابیس — از صفر",
    keywords: ["database", "دیتابیس", "prisma", "postgresql", "schema", "seed", "neon"],
    body: `## دیتابیس در این پروژه کجاست؟

**PostgreSQL** روی **Neon Cloud** — connection string در env: \`DATABASE_URL\`

## فایل‌های دیتابیس (همه را در راهنما جستجو کن)

| فایل | کار |
| prisma/schema.prisma | تعریف 9 جدول + 5 enum — **منبع حقیقت** |
| src/lib/prisma.ts | اتصال Prisma Client + retry |
| prisma/seed.ts | داده اولیه — npm run db:seed |
| prisma/import-archive.ts | واردات archive.org |
| prisma/data/*.ts | کاتalog کتاب‌ها |
| src/generated/prisma/ | client خودکار (generate) |

## جریان کار با DB
1. \`prisma migrate dev\` — schema → PostgreSQL
2. \`prisma generate\` — schema → TypeScript client
3. کد: \`import { prisma } from '@/lib/prisma'\`
4. Query: \`prisma.user.findMany()\`

## 9 Model
User, Content, Category, Review, SavedContent, Notification, Ticket, TicketMessage, PasswordResetToken

**جستجو پیشنهادی:** \`schema User\` · \`prisma.ts\` · \`seed\``,
  },
  {
    id: "deep-auth-overview",
    category: "concepts",
    title: "📗 راهنمای کامل Login و Register — از صفر",
    keywords: ["login", "register", "ورود", "ثبت نام", "nextauth", "jwt", "auth"],
    body: `## Login و Register چطور کار می‌کند؟

### ثبت‌نام (Register)
1. کاربر فرم در **register/page.tsx** پر می‌کند
2. POST **/api/register** — register/route.ts
3. Zod validate → bcrypt hash → prisma.user.create
4. redirect به **/auth/login**

### ورود (Login)
1. فرم **login/page.tsx**
2. signIn('credentials') → POST **/api/auth/[...nextauth]**
3. auth.ts → authorize() → bcrypt.compare → JWT cookie
4. redirect به callbackUrl (مثلاً dashboard)

### بازیابی رمز
1. forgot-password → POST /api/auth/forgot-password
2. token در PasswordResetToken + email
3. reset-password?token=... → POST /api/auth/reset-password

## فایل‌های کلیدی
| فایل | نقش |
| src/lib/auth.ts | NextAuth config + requireAuth |
| src/app/api/register/route.ts | ثبت‌نام API |
| src/app/api/auth/[...nextauth]/route.ts | login handler |
| src/lib/password-reset.ts | token بازیابی |
| src/lib/validators.ts | loginSchema, registerSchema |
| AuthProvider.tsx | SessionProvider wrap |

**حساب تست:** admin@marketplace.local/admin123 — user@marketplace.local/user123`,
  },
];

export const DEEP_FILES = {
  "prisma/schema.prisma": {
    title: "schema.prisma — خط‌به‌خط",
    keywords: ["schema", "model", "enum", "User", "Content"],
    body: `## prisma/schema.prisma — نقشه کامل PostgreSQL

**مسیر:** prisma/schema.prisma
**چرا؟** تعریف جداول — Prisma این را به SQL migration و TypeScript client تبدیل می‌کند
**بعد از تغییر:** npm run db:generate && npx prisma migrate dev

${lines([
  { n: 1, c: "generator client {", e: "شروع block تنظیم generator — تولید Prisma Client" },
  { n: 2, c: 'provider = "prisma-client"', e: "provider جدید Prisma 7 — client در src/generated" },
  { n: 3, c: 'output = "../src/generated/prisma"', e: "مسیر خروجی client — import از @/generated/prisma/client" },
  { n: 4, c: "}", e: "پایان generator" },
  { n: 6, c: "datasource db {", e: "تنظیم منبع داده — کدام DB" },
  { n: 7, c: 'provider = "postgresql"', e: "PostgreSQL — Neon در production" },
  { n: 8, c: "}", e: "URL از env DATABASE_URL خوانده می‌شود" },
  { n: 10, c: "enum Role {", e: "enum نقش کاربر — فقط دو مقدار مجاز" },
  { n: 11, c: "USER", e: "کاربر عادی — browse, upload, dashboard" },
  { n: 12, c: "ADMIN", e: "مدیر — دسترسی /admin و APIهای admin/*" },
  { n: 13, c: "}", e: "پایان enum Role" },
  { n: 15, c: "enum ContentType {", e: "نوع محتوا" },
  { n: 16, c: "EBOOK", e: "کتاب PDF" },
  { n: 17, c: "AUDIOBOOK", e: "پادکست/فایل صوتی" },
  { n: 20, c: "enum ContentStatus {", e: "وضعیت moderation" },
  { n: 21, c: "PENDING", e: "تازه آپلود — منتظر admin" },
  { n: 22, c: "APPROVED", e: "تأیید شده — در browse عمومی" },
  { n: 23, c: "REJECTED", e: "رد شده — فقط author می‌بیند" },
  { n: 26, c: "enum NotificationType {", e: "انواع اعلان push به user" },
  { n: 27, c: "CONTENT_APPROVED", e: "محتوای user تأیید شد" },
  { n: 28, c: "CONTENT_REJECTED", e: "محتوا رد شد" },
  { n: 29, c: "REVIEW_APPROVED / REVIEW_REJECTED", e: "نظر تأیید/رد" },
  { n: 31, c: "TICKET_REPLY", e: "پاسخ admin به تیکت" },
  { n: 34, c: "enum TicketStatus {", e: "وضعیت تیکت پشتیبانی" },
  { n: 35, c: "OPEN", e: "باز — منتظر پاسخ" },
  { n: 36, c: "ANSWERED", e: "admin پاسخ داد" },
  { n: 37, c: "CLOSED", e: "بسته — user نمی‌تواند reply" },
  { n: 40, c: "model User {", e: "جدول users — هر کاربر سایت" },
  { n: 41, c: "@id @default(cuid())", e: "Primary key — cuid رشته یکتا خودکار" },
  { n: 42, c: "name String", e: "نام نمایشی در UI" },
  { n: 43, c: "email @unique", e: "ایمیل login — تکراری ممنوع" },
  { n: 44, c: "passwordHash", e: "رمز bcrypt — هرگز plain text" },
  { n: 45, c: "role @default(USER)", e: "USER یا ADMIN" },
  { n: 46, c: "blocked @default(false)", e: "true = login ممنوع" },
  { n: 47, c: "image String?", e: "آواتار — optional" },
  { n: 48, c: "contents Content[]", e: "relation — کتاب‌های آپلود شده" },
  { n: 49, c: "reviews Review[]", e: "نظرات نوشته‌شده" },
  { n: 50, c: "saved SavedContent[]", e: "bookmarkها" },
  { n: 51, c: "notifications Notification[]", e: "اعلان‌ها" },
  { n: 52, c: "passwordResetTokens", e: "tokenهای بازیابی رمز" },
  { n: 53, c: "tickets Ticket[]", e: "تیکت‌های پشتیبانی" },
  { n: 54, c: "ticketMessages", e: "پیام‌های تیکت (author)" },
  { n: 55, c: "createdAt @default(now())", e: "زمان ثبت‌نام" },
  { n: 56, c: "updatedAt @updatedAt", e: "آخرین update خودکار" },
  { n: 59, c: "model Ticket {", e: "جدول tickets" },
  { n: 60, c: "subject", e: "موضوع تیکت" },
  { n: 62, c: "status TicketStatus", e: "OPEN/ANSWERED/CLOSED" },
  { n: 63, c: "userId", e: "FK → User — صاحب تیکت" },
  { n: 64, c: "@relation onDelete: Cascade", e: "حذف user → تیکت‌ها هم حذف" },
  { n: 65, c: "messages TicketMessage[]", e: "پیام‌های مکالمه" },
  { n: 69, c: "@@index([userId])", e: "index — سرعت query تیکت‌های یک user" },
  { n: 74, c: "model TicketMessage {", e: "هر پیام در تیکت" },
  { n: 80, c: "body String", e: "متن پیام" },
  { n: 81, c: "isStaff @default(false)", e: "true = پاسخ admin" },
  { n: 88, c: "model PasswordResetToken {", e: "token یک‌بار مصرف بازیابی رمز" },
  { n: 92, c: "tokenHash @unique", e: "hash SHA256 token — plain در DB نیست" },
  { n: 93, c: "expiresAt", e: "انقضا — معمولاً ۱ ساعت" },
  { n: 100, c: "model Category {", e: "دسته‌بندی کتاب" },
  { n: 102, c: "name @unique", e: "نام فارسی — مثلاً ادبیات" },
  { n: 103, c: "slug @unique", e: "URL-friendly — literature" },
  { n: 108, c: "model Content {", e: "جدول اصلی کتاب/پادکست" },
  { n: 110, c: "title", e: "عنوان کتاب" },
  { n: 112, c: "type ContentType", e: "EBOOK یا AUDIOBOOK" },
  { n: 113, c: "status @default(PENDING)", e: "پیش‌فرض منتظر تأیید" },
  { n: 114, c: "fileKey", e: "مسیر فایل در storage یا ext:archiveId" },
  { n: 115, c: "coverKey?", e: "تصویر جلد — optional" },
  { n: 116, c: "fileSize?", e: "حجم PDF بایت" },
  { n: 117, c: "duration?", e: "مدت صوت ثانیه" },
  { n: 118, c: "authorId → User", e: "چه کسی آپلود کرد" },
  { n: 120, c: "categoryId → Category", e: "دسته" },
  { n: 124, c: "downloadCount @default(0)", e: "تعداد بازدید read/listen" },
  { n: 128, c: "@@index([title])", e: "index جستجو عنوان" },
  { n: 130, c: "@@index([status])", e: "index فیلتر APPROVED در browse" },
  { n: 134, c: "model Review {", e: "نظرات کاربران" },
  { n: 136, c: "rating Int", e: "1 تا 5 ستاره" },
  { n: 138, c: "status ContentStatus", e: "moderation نظر — PENDING تا approve" },
  { n: 146, c: "@@unique([userId, contentId])", e: "یک نظر per user per book" },
  { n: 150, c: "model SavedContent {", e: "bookmark / کتابخانه شخصی" },
  { n: 158, c: "@@unique([userId, contentId])", e: "duplicate bookmark ممنوع" },
  { n: 162, c: "model Notification {", e: "اعلان in-app" },
  { n: 166, c: "type NotificationType", e: "نوع رویداد" },
  { n: 168, c: "read @default(false)", e: "خوانده شده؟ badge Navbar" },
  { n: 169, c: "relatedId?", e: "contentId یا reviewId مرتبط" },
  { n: 172, c: "@@index([userId, read])", e: "سرعت unreadCount" },
])}`,
  },

  "src/lib/prisma.ts": {
    title: "prisma.ts — اتصال DB خط‌به‌خط",
    keywords: ["prisma", "client", "connection", "retry"],
    body: `## src/lib/prisma.ts — Prisma Client singleton

**چرا؟** یک connection pool — در dev hot reload دوباره connect نشود
**استفاده:** همه API و lib — import { prisma } from '@/lib/prisma'

${lines([
  { n: 1, c: "import { PrismaPg } from '@prisma/adapter-pg'", e: "adapter PostgreSQL برای Prisma 7 driver" },
  { n: 2, c: "import { PrismaClient } from '@/generated/prisma/client'", e: "client تولیدشده از schema" },
  { n: 4, c: "globalForPrisma", e: "globalThis — نگه‌داشت client بین hot reload" },
  { n: 9, c: "function createPrismaClient()", e: "ساخت client جدید" },
  { n: 10, c: "process.env.DATABASE_URL", e: "connection string Neon — الزامی" },
  { n: 12, c: "if (!connectionString) throw", e: "بدون URL خطا — deploy misconfig" },
  { n: 16, c: "new PrismaPg({ connectionString, max: 2 })", e: "pool حداکثر 2 connection — serverless friendly" },
  { n: 19, c: "connectionTimeoutMillis: 5000", e: "timeout 5 ثانیه" },
  { n: 23, c: "return new PrismaClient({ adapter })", e: "client با adapter pg" },
  { n: 26, c: "REQUIRED_DELEGATES", e: "چک modelهای لازم exist — بعد از migrate" },
  { n: 28, c: "isStalePrismaClient()", e: "اگر schema عوض شده client قدیمی invalidate" },
  { n: 45, c: "export const prisma = new Proxy(...)", e: "Proxy — lazy init + همیشه client تازه" },
  { n: 46, c: "get(_target, prop)", e: "هر prisma.user → getPrismaClient().user" },
  { n: 50, c: "value.bind(client)", e: "methodها bind به instance" },
  { n: 58, c: "NODE_ENV !== production", e: "dev: cache در global" },
  { n: 62, c: "async function resetPrismaClient()", e: "disconnect و reset — بعد از connection error" },
  { n: 77, c: "isPrismaConnectionError(error)", e: "تشخیص خطاهای شبکه/DB: P1001, ECONNRESET, ..." },
  { n: 100, c: "withPrismaRetry(query, retries=4)", e: "تا 4 بار retry با backoff — Neon cold start" },
  { n: 105, c: "return await query()", e: "اجرای prisma query" },
  { n: 109, c: "if !isPrismaConnectionError throw", e: "خطای logic — retry نکن" },
  { n: 113, c: "await resetPrismaClient()", e: "آخرین attempt — reconnect" },
  { n: 117, c: "setTimeout 250*(attempt+1)", e: "backoff — 250ms, 500ms, ..." },
])}`,
  },

  "prisma/seed.ts": {
    title: "seed.ts — داده اولیه خط‌به‌خط",
    keywords: ["seed", "db:seed", "admin", "sample"],
    body: `## prisma/seed.ts — npm run db:seed

**کاربرد:** پر کردن DB برای dev/demo — admin، user، 10 کتاب، نظرات

${lines([
  { n: 1, c: 'import "dotenv/config"', e: "load .env — DATABASE_URL" },
  { n: 4, c: "import { PrismaPg }", e: "adapter مستقیم — seed خارج Next.js" },
  { n: 5, c: "import bcrypt", e: "hash رمز admin/user" },
  { n: 6, c: "buildArchiveFileKey", e: "fileKey برای کتاب archive" },
  { n: 9, c: "new PrismaPg({ connectionString })", e: "اتصال DB" },
  { n: 12, c: "UPLOAD_DIR = uploads/seed", e: "PDF نمونه local" },
  { n: 14, c: "MINIMAL_PDF = Buffer.from(...)", e: "PDF minimal valid برای seed" },
  { n: 35, c: "const categories = [...]", e: "6 دسته: ادبیات، علمی، تاریخ، ..." },
  { n: 44, c: "const sampleBooks = [...]", e: "10 کتاب: شاهنامه، حافظ، ..." },
  { n: 138, c: "sampleReviews", e: "نظرات نمونه rating 3-5" },
  { n: 146, c: "ensureSeedFiles()", e: "نوشتن PDF به disk برای seed/" },
  { n: 157, c: "async function main()", e: "entry point seed" },
  { n: 158, c: "prisma.category.upsert", e: "insert یا skip اگر slug وجود دارد" },
  { n: 166, c: 'bcrypt.hash("admin123", 12)', e: "hash رمز admin — rounds=12" },
  { n: 167, c: "prisma.user.upsert admin@", e: "کاربر ADMIN — admin@marketplace.local" },
  { n: 178, c: "user@marketplace.local", e: "کاربر USER نمونه — user123" },
  { n: 191, c: "author1, author2", e: "نویسندگان نمونه برای کتاب‌ها" },
  { n: 215, c: "review.deleteMany seed/", e: "پاک seed قبلی قبل از re-seed" },
  { n: 218, c: "content.deleteMany seed/", e: "idempotent seed" },
  { n: 228, c: "for sampleBooks", e: "loop 10 کتاب" },
  { n: 230, c: "buildArchiveFileKey / seed/slug.pdf", e: "fileKey — archive یا local" },
  { n: 237, c: "prisma.content.create", e: "status APPROVED — مستقیم در browse" },
  { n: 260, c: "prisma.review.create", e: "2-4 نظر per book" },
  { n: 271, c: 'console.log("Seed completed")', e: "پایان موفق" },
  { n: 274, c: "main().catch.finally disconnect", e: "خروج — بستن connection" },
])}`,
  },

  "src/lib/auth.ts": {
    title: "auth.ts — NextAuth خط‌به‌خط",
    keywords: ["auth", "nextauth", "jwt", "login"],
    body: `## src/lib/auth.ts — قلب احراز هویت

${lines([
  { n: 1, c: "import NextAuth from 'next-auth'", e: "کتابخانه auth v5" },
  { n: 2, c: "Credentials from providers", e: "login با email/password — نه Google" },
  { n: 3, c: "import bcrypt", e: "مقایسه رمز login" },
  { n: 4, c: "import { prisma }", e: "خواندن user از DB" },
  { n: 5, c: "normalizeEmail", e: "trim + lowercase email" },
  { n: 6, c: "loginSchema", e: "Zod — email valid + password min 1" },
  { n: 8, c: "export const { handlers, signIn, signOut, auth }", e: "export اصلی — handlers برای route، auth() برای server" },
  { n: 10, c: "Credentials({ ... })", e: "provider تنها — credentials form" },
  { n: 16, c: "authorize: async (credentials)", e: "تابع login — null = fail" },
  { n: 17, c: "loginSchema.safeParse(credentials)", e: "validate — fail → null → 401" },
  { n: 20, c: "normalizeEmail(parsed.data.email)", e: "یکسان‌سازی email" },
  { n: 22, c: "prisma.user.findFirst mode insensitive", e: "جستجو case-insensitive" },
  { n: 26, c: "if (!user) return null", e: "email وجود ندارد — login fail" },
  { n: 28, c: "if (user.blocked) return null", e: "حساب مسدود — silent fail" },
  { n: 30, c: "bcrypt.compare(password, passwordHash)", e: "مقایسه رمز — timing-safe" },
  { n: 31, c: "if (!valid) return null", e: "رمز اشتباه" },
  { n: 33, c: "return { id, name, email, role }", e: "موفق — این در JWT می‌رود" },
  { n: 42, c: 'session: { strategy: "jwt" }', e: "JWT نه database session" },
  { n: 43, c: "pages.signIn: /auth/login", e: "redirect اگر unauthorized" },
  { n: 47, c: "callbacks.jwt", e: "وقتی login — user → token" },
  { n: 48, c: "if (user) token.id/role/name", e: "ذخیره در JWT payload" },
  { n: 53, c: "trigger update + session.name", e: "update profile name در token" },
  { n: 58, c: "callbacks.session", e: "token → session.user برای client" },
  { n: 60, c: "session.user.id = token.id", e: "useSession().user.id در dashboard" },
  { n: 61, c: "session.user.role = token.role", e: "ADMIN check در UI" },
  { n: 69, c: "export async function requireAuth()", e: "guard API — throw UNAUTHORIZED" },
  { n: 70, c: "const session = await auth()", e: "خواندن JWT از cookie" },
  { n: 77, c: "export async function requireAdmin()", e: "guard admin API — FORBIDDEN" },
])}`,
  },

  "src/app/api/register/route.ts": {
    title: "register API — خط‌به‌خط",
    keywords: ["register", "ثبت نام", "api"],
    body: `## POST /api/register — ثبت‌نام

**مسیر فایل:** src/app/api/register/route.ts
**URL:** /api/register
**صفحه:** auth/register/page.tsx

${lines([
  { n: 1, c: "import bcrypt", e: "hash رمز قبل از DB" },
  { n: 7, c: "export async function POST", e: "فقط POST — create user" },
  { n: 9, c: "body = await request.json()", e: "خواندن { name, email, password }" },
  { n: 10, c: "registerSchema.safeParse(body)", e: "name min2, email, password min6" },
  { n: 12, c: "if (!parsed.success) return 400", e: "پیام فارسی از Zod" },
  { n: 19, c: "normalizeEmail", e: "email یکسان" },
  { n: 21, c: "prisma.user.findFirst email", e: "چک تکراری" },
  { n: 25, c: "if (existing) return 409", e: "این ایمیل قبلاً ثبت شده" },
  { n: 29, c: "bcrypt.hash(password, 12)", e: "12 rounds — امن" },
  { n: 31, c: "prisma.user.create", e: "INSERT به جدول User — role پیش‌فرض USER" },
  { n: 37, c: "select: { id, name, email }", e: "passwordHash برنمی‌گردد" },
  { n: 40, c: "return 201 { user }", e: "موفق — client redirect login" },
  { n: 41, c: "catch return 500", e: "خطای سرور" },
])}`,
  },

  "src/app/api/auth/[...nextauth]/route.ts": {
    title: "NextAuth route — خط‌به‌خط",
    keywords: ["nextauth", "handlers"],
    body: `## /api/auth/[...nextauth]

**فایل:** src/app/api/auth/[...nextauth]/route.ts — فقط 3 خط!

${lines([
  { n: 1, c: "import { handlers } from '@/lib/auth'", e: "handlers از config NextAuth" },
  { n: 3, c: "export const { GET, POST } = handlers", e: "Next.js route — GET csrf/session, POST signIn/signOut" },
])}

**مسیرهای NextAuth:**
- POST /api/auth/callback/credentials — login
- POST /api/auth/signout — logout
- GET /api/auth/session — وضعیت session`,
  },

  "src/app/auth/login/page.tsx": {
    title: "صفحه Login — خط‌به‌خط",
    keywords: ["login", "ورود", "signIn"],
    body: `## src/app/auth/login/page.tsx

${lines([
  { n: 1, c: '"use client"', e: "Client — useState, signIn, router" },
  { n: 4, c: "import signIn from next-auth/react", e: "تابع login" },
  { n: 5, c: "useRouter, useSearchParams", e: "redirect بعد login + callbackUrl" },
  { n: 16, c: "callbackUrl = searchParams.get || '/'", e: "بعد login کجا برود — مثلاً /upload" },
  { n: 17, c: "resetSuccess = reset=1", e: "banner بعد بازیابی رمز" },
  { n: 18, c: "useState email, password, error, loading", e: "state فرم" },
  { n: 23, c: "handleSubmit async", e: "submit فرم" },
  { n: 24, c: "event.preventDefault()", e: "بدون reload صفحه" },
  { n: 28, c: "signIn('credentials', { email, password, redirect: false })", e: "POST nextauth — بدون auto redirect" },
  { n: 36, c: "if (result?.error)", e: "login fail" },
  { n: 37, c: "setError('ایمیل یا رمز اشتباه')", e: "پیام کاربر — امن (جزئیات نمی‌دهد)" },
  { n: 41, c: "router.push(callbackUrl)", e: "redirect موفق" },
  { n: 42, c: "router.refresh()", e: "refresh server components — Navbar session" },
  { n: 57, c: "<form onSubmit={handleSubmit}>", e: "فرم UI" },
  { n: 71, c: "Link /auth/forgot-password", e: "فراموشی رمز" },
  { n: 94, c: "Link /auth/register", e: "لینک ثبت‌نام" },
  { n: 103, c: "Suspense + LoginForm", e: "useSearchParams نیاز Suspense" },
])}`,
  },

  "src/app/auth/register/page.tsx": {
    title: "صفحه Register — خط‌به‌خط",
    keywords: ["register", "ثبت نام"],
    body: `## src/app/auth/register/page.tsx

${lines([
  { n: 1, c: '"use client"', e: "Client component" },
  { n: 13, c: "useState name, email, password", e: "فیلدهای فرم" },
  { n: 19, c: "handleSubmit", e: "submit" },
  { n: 24, c: "fetch('/api/register', { method: 'POST', ... })", e: "فراخوانی API ثبت‌نام" },
  { n: 27, c: "JSON.stringify({ name, email, password })", e: "body" },
  { n: 33, c: "if (!response.ok) setError", e: "نمایش خطای API" },
  { n: 38, c: "router.push('/auth/login')", e: "موفق → صفحه login" },
  { n: 50, c: "Input name", e: "فیلد نام" },
  { n: 54, c: "Input email type=email", e: "فیلد email" },
  { n: 63, c: "PasswordInput minLength=6", e: "رمز min 6 در UI" },
])}`,
  },

  "src/lib/password-reset.ts": {
    title: "password-reset.ts — خط‌به‌خط",
    keywords: ["reset", "token", "forgot"],
    body: `## src/lib/password-reset.ts — بازیابی رمز

${lines([
  { n: 5, c: "RESET_TOKEN_TTL_MS = 60*60*1000", e: "1 ساعت اعتبار token" },
  { n: 7, c: "hashToken = sha256", e: "token plain در DB ذخیره نمی‌شود — فقط hash" },
  { n: 11, c: "createResetTokenValue = randomBytes(32)", e: "token امن 64 hex char" },
  { n: 15, c: "clearPasswordResetTokens(userId)", e: "پاک tokenهای قبلی user" },
  { n: 24, c: "createPasswordResetToken", e: "ساخت token جدید در PasswordResetToken" },
  { n: 37, c: "resetPasswordWithToken(token, newPassword)", e: "validate + update password" },
  { n: 39, c: "findUnique tokenHash", e: "پیدا کردن record" },
  { n: 44, c: "if expired return error", e: "منقضی — delete token" },
  { n: 51, c: "if blocked return error", e: "حساب مسدود" },
  { n: 55, c: "bcrypt.hash(newPassword, 12)", e: "hash رمز جدید" },
  { n: 57, c: "prisma.$transaction", e: "atomic — update user + delete tokens" },
  { n: 85, c: "buildResetPasswordUrl(token)", e: "/auth/reset-password?token=..." },
])}`,
  },

  "src/app/api/auth/forgot-password/route.ts": {
    title: "forgot-password API — خط‌به‌خط",
    keywords: ["forgot", "فراموشی"],
    body: `## POST /api/auth/forgot-password

${lines([
  { n: 8, c: "GENERIC_MESSAGE", e: "همیشه همین پیام — جلوگیری از email enumeration" },
  { n: 13, c: "body = request.json()", e: "{ email }" },
  { n: 14, c: "forgotPasswordSchema.safeParse", e: "email valid" },
  { n: 25, c: "withPrismaRetry find user", e: "retry connection" },
  { n: 34, c: "if user && !blocked", e: "فقط user معتبر token می‌گیرد" },
  { n: 35, c: "createPasswordResetToken(user.id)", e: "token در DB" },
  { n: 36, c: "buildResetPasswordUrl(token)", e: "لینک email" },
  { n: 39, c: "sendPasswordResetEmail", e: "nodemailer SMTP" },
  { n: 45, c: "devResetUrl in dev", e: "اگر SMTP نیست — URL در response dev" },
  { n: 60, c: "return { message: GENERIC_MESSAGE }", e: "همیشه 200 — حتی email نباشد" },
])}`,
  },

  "src/app/api/auth/reset-password/route.ts": {
    title: "reset-password API — خط‌به‌خط",
    keywords: ["reset", "بازیابی"],
    body: `## POST /api/auth/reset-password

${lines([
  { n: 7, c: "body = request.json()", e: "{ token, password }" },
  { n: 8, c: "resetPasswordSchema.safeParse", e: "token + password min6" },
  { n: 17, c: "resetPasswordWithToken(...)", e: "logic در lib" },
  { n: 19, c: "if !result.ok return 400", e: "token invalid/expired" },
  { n: 23, c: "return message success", e: "→ login?reset=1" },
])}`,
  },

  "src/lib/email-utils.ts": {
    title: "email-utils.ts",
    keywords: ["email", "normalize"],
    body: `## src/lib/email-utils.ts — یک تابع

${lines([
  { n: 1, c: "export function normalizeEmail(email)", e: "trim فاصله + toLowerCase — login/register یکسان" },
  { n: 2, c: "return email.trim().toLowerCase()", e: "User@Mail.com → user@mail.com" },
])}

**استفاده:** register, login authorize, forgot-password`,
  },

  "src/components/providers/AuthProvider.tsx": {
    title: "AuthProvider — خط‌به‌خط",
    keywords: ["AuthProvider", "SessionProvider"],
    body: `## AuthProvider — wrap کل app

${lines([
  { n: 1, c: '"use client"', e: "SessionProvider client-only" },
  { n: 3, c: "SessionProvider from next-auth/react", e: "React Context برای session" },
  { n: 5, c: "AuthProvider({ children })", e: "wrap در layout.tsx" },
  { n: 7, c: "refetchOnWindowFocus={false}", e: "بدون refetch هر focus — performance" },
  { n: 7, c: "refetchInterval={0}", e: "بدون poll — manual refresh" },
])}

**نتیجه:** useSession() در Navbar, SaveButton, dashboard کار می‌کند`,
  },
};

export const AUTH_VALIDATORS_BODY = `## validators.ts — schemaهای login/register

**مسیر:** src/lib/validators.ts

${lines([
  { n: 3, c: "registerSchema", e: "name min2, email, password min6 — POST /api/register" },
  { n: 9, c: "loginSchema", e: "email, password min1 — authorize() در auth.ts" },
  { n: 14, c: "forgotPasswordSchema", e: "فقط email — forgot-password API" },
  { n: 18, c: "resetPasswordSchema", e: "token + password min6 — reset-password API" },
])}`;

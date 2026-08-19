/**
 * Build comprehensive site docs — line-by-line code explanations
 * Run: node scripts/build-site-docs.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  explainSourceFile,
  categoryForPath,
} from "./doc-code-explainer.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "src/lib/docs/entries.ts");

const entries = [];

function add(category, title, body, opts = {}) {
  entries.push({
    id: opts.id || `${category}-${entries.length}`,
    category,
    title,
    filePath: opts.filePath || undefined,
    keywords: opts.keywords || [],
    body: body.trim(),
  });
}

function globFiles(dir, pattern) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, name.name);
    if (name.isDirectory()) {
      if (["node_modules", "generated", ".next"].includes(name.name)) continue;
      out.push(...globFiles(full, pattern));
    } else if (pattern.test(name.name)) {
      out.push(path.relative(ROOT, full).replace(/\\/g, "/"));
    }
  }
  return out;
}

// ═══════════════════════════════════════
// CONCEPTS — expanded backend & database
// ═══════════════════════════════════════
const concepts = [
  {
    title: "معماری کلی پروژه — Frontend + Backend + DB",
    keywords: ["architecture", "معماری", "fullstack", "ساختار"],
    body: `## از صفر: این پروژه چطور کار می‌کند؟

**Frontend (مرورگر):** React components در src/components/ + pages در src/app/
**Backend (سرور):** API routes در src/app/api/ + logic در src/lib/
**Database:** PostgreSQL روی Neon — schema در prisma/schema.prisma

## جریان یک درخواست (مثال: جستجوی کتاب)
1. کاربر در BrowseSearch.tsx تایپ می‌کند
2. fetch('/api/contents?q=حافظ') از مرورگر
3. src/app/api/contents/route.ts — GET handler
4. searchSchema (Zod) پارامترها را validate
5. getApprovedContents() در src/lib/content.ts
6. prisma.content.findMany() → PostgreSQL
7. JSON { contents, total } برمی‌گردد
8. ContentCard.tsx لیست را نشان می‌دهد

## پوشه‌های مهم
| پوشه | نقش |
| src/components/ | UI — 51 فایل |
| src/lib/ | مغز backend — 16 فایل |
| src/app/api/ | 36 REST endpoint |
| src/app/*/page.tsx | 13 صفحه |
| prisma/ | schema + seed |
| public/ | PWA, sw.js, لوگو |`,
  },
  {
    title: "JWT چیست؟ — توکن نشست",
    keywords: ["jwt", "token", "cookie", "session"],
    filePath: "src/lib/auth.ts",
    body: `JWT = JSON Web Token — «کارت شناسایی» بعد از login.

**کجا ساخته می‌شود؟** src/lib/auth.ts → callbacks.jwt
**کجا ذخیره می‌شود؟** Cookie مرورگر (HttpOnly)
**چه چیزی داخلش است؟** id, name, email, role (USER/ADMIN)
**چطور استفاده می‌شود؟** هر fetch/API → cookie خودکار → auth() session برمی‌گرداند

**چرا JWT؟** سرور session table لازم ندارد — stateless
**فایل‌های مرتبط:** auth.ts, AuthProvider.tsx, api/auth/[...nextauth]/route.ts`,
  },
  {
    title: "NextAuth — سیستم login/logout",
    keywords: ["nextauth", "login", "ورود"],
    filePath: "src/lib/auth.ts",
    body: `## فایل‌ها
- **src/lib/auth.ts** — config اصلی
- **src/app/api/auth/[...nextauth]/route.ts** — export handlers
- **src/components/providers/AuthProvider.tsx** — SessionProvider wrap

## authorize() — قلب login
1. loginSchema validate email/password
2. prisma.user.findFirst by email
3. blocked? → reject
4. bcrypt.compare password
5. return { id, name, email, role }

## Guards
- **requireAuth()** — API user → 401
- **requireAdmin()** — API admin → 403
- **useSession()** — client component
- **auth()** — server component / API`,
  },
  {
    title: "PostgreSQL + Neon — دیتابیس کجاست؟",
    keywords: ["postgresql", "neon", "database", "دیتابیس"],
    filePath: "prisma/schema.prisma",
    body: `## کجا host می‌شود؟
**Neon PostgreSQL** (cloud) — connection string در env:
\`DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/neondb\`

## فایل‌های DB در پروژه
| فایل | کار |
| prisma/schema.prisma | تعریف 9 model + 5 enum |
| src/lib/prisma.ts | Prisma Client + retry |
| prisma/seed.ts | داده اولیه — npm run db:seed |
| src/generated/prisma/ | client auto-generated |

## 9 Model
User, Content, Category, Review, SavedContent, Notification, Ticket, TicketMessage, PasswordResetToken

## CLI
- prisma generate — بعد از تغییر schema
- prisma migrate dev — migration
- prisma studio — UI مرور DB`,
  },
  {
    title: "Prisma ORM — چطور query می‌زنیم؟",
    keywords: ["prisma", "orm", "query"],
    filePath: "src/lib/prisma.ts",
    body: `## prisma.ts — singleton client
- DATABASE_URL از env
- PrismaPg adapter برای PostgreSQL
- Proxy pattern — یک connection pool
- withPrismaRetry() — 4 بار retry اگر connection قطع شد

## مثال‌های query (در lib/content.ts و APIها)
\`\`\`
prisma.user.findFirst({ where: { email } })
prisma.content.findMany({ where: { status: 'APPROVED' } })
prisma.content.create({ data: { title, authorId, ... } })
prisma.review.upsert({ where: { userId_contentId }, ... })
prisma.notification.create({ data: { userId, type, message } })
\`\`\`

## relation
Content.author → User
Content.category → Category
Review.user + Review.content`,
  },
  {
    title: "API Route در Next.js — چطور ساخته می‌شود؟",
    keywords: ["api", "route", "endpoint", "nextjs"],
    body: `## قانون App Router
مسیر فایل = URL API:
\`src/app/api/contents/route.ts\` → **GET/POST** \`/api/contents\`
\`src/app/api/user/profile/route.ts\` → \`/api/user/profile\`
\`src/app/api/contents/[id]/route.ts\` → \`/api/contents/abc-123\`

## ساختار یک route.ts
\`\`\`
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const session = await auth(); // optional
  // ... logic
  return NextResponse.json({ data });
}
\`\`\`

## 36 API در src/app/api/
دسته auth(3), register(1), contents(4), user(8), admin(14), files(3), misc(2)

## Validation
همه POST/PATCH → Zod schema از src/lib/validators.ts`,
  },
  {
    title: "bcrypt — امنیت رمز عبور",
    keywords: ["bcrypt", "password", "hash"],
    body: `**hash:** register, profile — bcrypt.hash(pw, 10) → passwordHash
**compare:** login — bcrypt.compare(pw, user.passwordHash)
**هرگز** password plain در DB نیست`,
  },
  {
    title: "Zod — validation ورودی API",
    keywords: ["zod", "validation"],
    filePath: "src/lib/validators.ts",
    body: `src/lib/validators.ts — registerSchema, loginSchema, searchSchema, reviewSchema, ...
safeParse → success یا error.message فارسی → 400`,
  },
  {
    title: "storage.ts — آپلود فایل کجا می‌رود؟",
    keywords: ["storage", "s3", "upload", "file"],
    filePath: "src/lib/storage.ts",
    body: `**Dev:** local disk — public/uploads/
**Production:** AWS S3 — env AWS_*
**uploadFile():** buffer → key
**getFileUrl():** /api/files/... یا S3 presigned
**archive:** prefix ext: → /api/proxy?url=archive.org`,
  },
  {
    title: "content.ts — منطق query محتوا",
    keywords: ["content", "query", "browse"],
    filePath: "src/lib/content.ts",
    body: `**getApprovedContents()** — browse + GET /api/contents
**getContentById()** — read/listen pages
**getRecommendations()** — home page
**mapContent()** — DB row → JSON shape + averageRating`,
  },
  {
    title: "notifications.ts — سیستم اعلان",
    keywords: ["notification", "اعلان"],
    filePath: "src/lib/notifications.ts",
    body: `createNotification() — وقتی admin approve/reject content/review یا reply ticket
NotificationList poll می‌کند GET /api/user/notifications`,
  },
  {
    title: "Environment Variables — env چی نیاز است؟",
    keywords: ["env", "environment", "DATABASE_URL"],
    body: `**DATABASE_URL** — PostgreSQL Neon (الزامی)
**AUTH_SECRET** — NextAuth JWT sign (الزامی)
**AWS_*** — S3 storage (production)
**SMTP_*** — email forgot-password
**NEXTAUTH_URL** — URL سایت`,
  },
  {
    title: "گردش وضعیت Content — PENDING → APPROVED",
    keywords: ["pending", "approved", "workflow"],
    body: `1. POST /api/upload → status=PENDING
2. GET /api/user/uploads — user می‌بیند
3. GET /api/admin/pending — admin صف
4. PATCH approve → APPROVED + notification
5. GET /api/contents — عمومی visible`,
  },
  {
    title: "React Client vs Server Component",
    keywords: ["react", "client", "server", "use client"],
    body: `"use client" → state, fetch, events — BrowseSearch, SaveButton
بدون use client → server — page.tsx, HomeSections — fetch مستقیم prisma/lib`,
  },
];

for (const c of concepts) {
  add("concepts", c.title, c.body, { keywords: c.keywords, filePath: c.filePath });
}

// ═══════════════════════════════════════
// DATABASE — each model detailed
// ═══════════════════════════════════════
const schema = fs.readFileSync(path.join(ROOT, "prisma/schema.prisma"), "utf8");

add(
  "database",
  "schema.prisma — نقشه کامل دیتابیس",
  `## این فایل چیست؟
**مسیر:** prisma/schema.prisma
**چرا؟** منبع حقیقت (single source of truth) برای ساختار PostgreSQL
**بعد از edit:** npm run db:generate && prisma migrate dev

## توضیح خط‌به‌خط فایل schema

${schema
  .split("\n")
  .map((line, i) => {
    const t = line.trim();
    if (!t || t.startsWith("//")) return null;
    let exp = "تعریف Prisma";
    if (t.startsWith("model ")) exp = `جدول DB: ${t.replace("model ", "").replace(" {", "")} — رکوردها اینجا ذخیره می‌شوند`;
    if (t.startsWith("enum ")) exp = `enum — مقادیر ثابت مجاز`;
    if (t.includes("@id")) exp = "Primary key — شناسه یکتا";
    if (t.includes("@unique")) exp = "Unique — تکراری ممنوع";
    if (t.includes("@relation")) exp = "Foreign key — ارتباط بین جداول";
    if (t.includes("@default")) exp = "مقدار پیش‌فرض";
    if (t.includes("@@index")) exp = "Index — سرعت query";
    return `- **خط ${i + 1}:** \`${t.slice(0, 80)}\` → ${exp}`;
  })
  .filter(Boolean)
  .join("\n")}`,
  { filePath: "prisma/schema.prisma", keywords: ["schema", "prisma", "model", "enum"] },
);

const modelDocs = [
  {
    title: "User — جدول کاربران",
    keywords: ["user", "کاربر", "email", "role"],
    body: `**فیلدها:** id, name, email(unique), passwordHash, role(USER|ADMIN), blocked
**روابط:** contents[], reviews[], saved[], notifications[], tickets[]
**API:** register, profile, admin/users
**seed:** admin@marketplace.local / admin123`,
  },
  {
    title: "Content — کتاب و پادکست",
    keywords: ["content", "ebook", "audiobook"],
    body: `**type:** EBOOK | AUDIOBOOK
**status:** PENDING | APPROVED | REJECTED
**fileKey** — مسیر PDF/audio در storage
**authorId, categoryId** — FK
**downloadCount** — increment در read/listen`,
  },
  {
    title: "Review — نظرات",
    keywords: ["review", "rating"],
    body: `rating 1-5, comment, status
@@unique([userId, contentId]) — یک نظر per user per book`,
  },
  {
    title: "SavedContent — bookmark",
    keywords: ["saved", "bookmark"],
    body: `userId + contentId — کتابخانه شخصی`,
  },
  {
    title: "Notification — اعلان",
    keywords: ["notification"],
    body: `type enum, message, read, relatedId`,
  },
  {
    title: "Ticket + TicketMessage",
    keywords: ["ticket", "پشتیبانی"],
    body: `Ticket: subject, status OPEN|ANSWERED|CLOSED
Message: body, isStaff (admin reply)`,
  },
];

for (const m of modelDocs) {
  add("database", m.title, m.body, { keywords: m.keywords, filePath: "prisma/schema.prisma" });
}

// ═══════════════════════════════════════
// SOURCE FILES — line-by-line
// ═══════════════════════════════════════
const sourceFiles = [
  ...globFiles(path.join(ROOT, "src/components"), /\.tsx$/),
  ...globFiles(path.join(ROOT, "src/lib"), /\.ts$/),
  ...globFiles(path.join(ROOT, "src/app/api"), /route\.ts$/),
  ...globFiles(path.join(ROOT, "src/app"), /page\.tsx$/),
  ...globFiles(path.join(ROOT, "src/hooks"), /\.ts$/),
  ...globFiles(path.join(ROOT, "prisma"), /\.(ts|prisma)$/),
].filter((f) => !f.includes("components/docs/Docs"));

for (const rel of sourceFiles.sort()) {
  const full = path.join(ROOT, rel);
  let content;
  try {
    content = fs.readFileSync(full, "utf8");
  } catch {
    continue;
  }
  if (content.length > 80000) continue; // skip huge generated

  const cat = categoryForPath(rel);
  const title = path.basename(rel, path.extname(rel));
  const body = explainSourceFile(ROOT, rel, content);
  const keywords = [
    title,
    rel,
    cat,
    ...rel.split("/").filter(Boolean),
  ];

  add(cat, title, body, {
    id: `src-${rel.replace(/[^a-z0-9]+/gi, "-")}`,
    filePath: rel,
    keywords,
  });
}

// ═══════════════════════════════════════
// FLOWS
// ═══════════════════════════════════════
const flows = [
  {
    title: "جریان کامل Login",
    body: `login/page → signIn('credentials') → POST /api/auth/[...nextauth] → authorize → JWT cookie → dashboard`,
  },
  {
    title: "جریان Browse → Read PDF",
    body: `browse/page SSR → BrowseSearch fetch /api/contents → ContentCard → /content/[id]/read → PdfViewer → /api/files`,
  },
  {
    title: "جریان Upload → Admin Approve",
    body: `upload FormData POST /api/upload → PENDING → admin/pending → PATCH approve → notification → browse visible`,
  },
];

for (const f of flows) {
  add("flows", f.title, f.body, { keywords: ["flow", "جریان"] });
}

// ═══════════════════════════════════════
// WRITE
// ═══════════════════════════════════════
const out = `/** Auto-generated — node scripts/build-site-docs.mjs */
import type { DocEntry } from "./types";

export const DOC_ENTRIES: DocEntry[] = ${JSON.stringify(entries, null, 2)} as DocEntry[];

export const DOC_COUNT = ${entries.length};
`;

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, out, "utf8");
console.log(`✅ ${entries.length} entries (${(fs.statSync(OUT).size / 1024).toFixed(0)} KB) → ${OUT}`);

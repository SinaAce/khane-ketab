/**
 * Build site documentation entries for /docs page
 * Run: node scripts/build-site-docs.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const MD = path.join(__dirname, "_components-doc.md");
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

// ─── Concepts (from zero) ───
const concepts = [
  {
    title: "JWT چیست و چه کار می‌کند؟",
    keywords: ["jwt", "token", "توکن", "نشست", "session", "cookie", "احراز هویت"],
    body: `JWT مخفف JSON Web Token است — یک «کارت شناسایی دیجital» که سرور بعد از login به مرورگر می‌دهد.

**چطور کار می‌کند؟**
1. کاربر email و password را در login وارد می‌کند
2. سرور با bcrypt رمز را چک می‌کند
3. اگر درست بود، یک JWT می‌سازد که داخلش id، name، role کاربر است
4. JWT داخل cookie مرورگر ذخیره می‌شود (HttpOnly)
5. هر درخواست بعدی (fetch به API) خودکار cookie را می‌فرستد
6. سرور JWT را decode می‌کند و می‌فهمد کی login کرده

**در این پروژه:** فایل src/lib/auth.ts — NextAuth با strategy: "jwt"
**مزیت:** سرور نیاز به ذخیره session در DB ندارد — همه چیز در token است
**فیلدهای token:** id, name, email, role (USER یا ADMIN)`,
  },
  {
    title: "NextAuth چیست؟",
    keywords: ["nextauth", "login", "ورود", "خروج", "signin", "signout", "auth"],
    filePath: "src/lib/auth.ts",
    body: `NextAuth کتابخانه احراز هویت برای Next.js است.

**فایل‌ها:**
- src/lib/auth.ts — تنظیمات NextAuth (providers, callbacks)
- src/app/api/auth/[...nextauth]/route.ts — API handler
- src/components/providers/AuthProvider.tsx — wrap کل app

**Credentials Provider:** login با email/password (نه Google/GitHub)
**authorize():** کاربر را از DB پیدا می‌کند، bcrypt.compare رمز، blocked چک
**callbacks.jwt:** اطلاعات user را در token ذخیره می‌کند
**callbacks.session:** token را به session.user تبدیل می‌کند
**requireAuth():** در API — اگر login نبود throw UNAUTHORIZED → 401
**requireAdmin():** اگر role !== ADMIN → 403

**استفاده در کامپوننت:** useSession() از next-auth/react
**استفاده در server:** auth() از @/lib/auth`,
  },
  {
    title: "bcrypt و هش رمز عبور",
    keywords: ["bcrypt", "password", "رمز", "hash", "هش", "امنیت"],
    body: `رمز عبور هرگز plain text در DB ذخیره نمی‌شود!

**bcrypt:** الگوریتم one-way hash — از رمز نمی‌توان رمز اصلی را فهمید
**ثبت‌نام:** bcrypt.hash(password, 10) → passwordHash در User
**ورود:** bcrypt.compare(password, user.passwordHash) → true/false
**فایل‌ها:** register/route.ts, auth.ts, profile/route.ts

**چرا مهم است؟** اگر DB لو برود، مهاجم رمز واقعی را نمی‌بیند.`,
  },
  {
    title: "Prisma ORM — ارتباط با دیتابیس",
    keywords: ["prisma", "orm", "database", "دیتابیس", "query", "مدل"],
    filePath: "src/lib/prisma.ts",
    body: `Prisma ORM لایه بین کد TypeScript و PostgreSQL است.

**فایل schema:** prisma/schema.prisma — تعریف جداول (models)
**generate:** prisma generate → client در src/generated/prisma
**استفاده:** import { prisma } from "@/lib/prisma"
**مثال:** prisma.user.findMany(), prisma.content.create({ data: {...} })

**prisma.ts:** singleton client + retry روی connection error
**seed:** prisma/seed.ts — npm run db:seed — داده اولیه admin و کتاب‌ها

**چرا ORM؟** به جای SQL خام، TypeScript type-safe queries`,
  },
  {
    title: "PostgreSQL — دیتابیس کجاست؟",
    keywords: ["postgresql", "postgres", "neon", "database", "sql", "جدول"],
    filePath: "prisma/schema.prisma",
    body: `PostgreSQL دیتابیس رابطه‌ای است — همه داده‌ها در جداول (tables).

**کجا host می‌شود؟** Neon PostgreSQL (cloud) — connection string در env: DATABASE_URL
**۹ مدل اصلی:** User, Content, Category, Review, SavedContent, Notification, Ticket, TicketMessage, PasswordResetToken
**۵ enum:** Role, ContentType, ContentStatus, NotificationType, TicketStatus

**فایل schema:** prisma/schema.prisma — منبع حقیقت ساختار DB
**migrate:** prisma migrate dev — اعمال تغییر schema
**فقط APPROVED contents** در browse عمومی دیده می‌شوند`,
  },
  {
    title: "API و REST — ارتباط Frontend و Backend",
    keywords: ["api", "rest", "fetch", "endpoint", "http", "get", "post"],
    body: `API راه ارتباط مرورگر با سرور است. هر API یک URL در src/app/api/

**متدها:**
- GET — خواندن (لیست کتاب‌ها)
- POST — ایجاد (ثبت‌نام، آپلود)
- PATCH — ویرایش جزئی (تأیید محتوا)
- DELETE — حذف (نظر)

**پاسخ:** JSON مثل { contents: [...], total: 50 }
**خطاها:** 401=login لازم، 403=admin لازم، 404=یافت نشد، 400=ورودی بد

**۳۶ route** در src/app/api/ — بخش API در راهنما همه را توضیح می‌دهد`,
  },
  {
    title: "React — Client vs Server Component",
    keywords: ["react", "component", "client", "server", "use client", "state"],
    body: `React = کتابخانه UI. هر .tsx یک کامپوننت است.

**Server Component (پیش‌فرض):** روی سرور render — fetch مستقیم DB — page.tsx
**Client Component ("use client"):** در مرورگر — state، onClick، useEffect — BrowseSearch

**۵۱ کامپوننت** در src/components/ — ui, layout, home, content, dashboard, admin, media

**Props:** داده از parent به child
**Hooks:** useState, useEffect, useSession — فقط client`,
  },
  {
    title: "Next.js App Router — صفحات و routing",
    keywords: ["nextjs", "next", "app router", "routing", "صفحه", "layout"],
    filePath: "src/app/layout.tsx",
    body: `Next.js 16 فریم‌ورک React با routing فایل‌محور.

**src/app/** = صفحات
- page.tsx = یک route (مثلاً /browse)
- layout.tsx = wrapper مشترک (Navbar, Footer)
- [id] = dynamic param

**۱۳ صفحه:** /, /browse, /dashboard, /admin, /upload, /auth/*, /content/[id]/read|listen

**API Routes:** src/app/api/**/route.ts — export GET, POST, ...

**SSR:** server component داده را قبل از HTML fetch می‌کند`,
  },
  {
    title: "Zod — اعتبارسنجی ورودی",
    keywords: ["zod", "validation", "schema", "اعتبارسنجی"],
    filePath: "src/lib/validators.ts",
    body: `Zod کتابخانه validation — قبل از ذخیره در DB ورودی چک می‌شود.

**فایل:** src/lib/validators.ts
**registerSchema:** name min 2, email, password min 6
**loginSchema, reviewSchema, searchSchema, profileUpdateSchema, ...**

**استفاده:** schema.safeParse(body) → success یا error با پیام فارسی
**چرا؟** جلوگیری از داده بد — SQL injection کمتر، UX بهتر`,
  },
  {
    title: "fetch — فراخوانی API از مرورگر",
    keywords: ["fetch", "ajax", "request", "درخواست", "json"],
    body: `fetch() API مرورگر برای HTTP request.

**GET:** fetch('/api/contents?q=حافظ').then(r => r.json())
**POST JSON:** method POST, headers Content-Type application/json, body JSON.stringify
**POST FormData:** برای آپلود فایل — body: formData بدون Content-Type

**Cookie session:** با credentials: 'include' (پیش‌فرض same-origin) خودکار فرستاده می‌شود
**کامپوننت‌های fetch:** BrowseSearch, SaveButton, ReviewForm, ProfileForm, TicketPanel, admin`,
  },
  {
    title: "Tailwind CSS — استایل",
    keywords: ["tailwind", "css", "style", "کلاس", "رنگ"],
    filePath: "src/app/globals.css",
    body: `Tailwind = utility classes در JSX — className="text-teal-brand px-4"

**globals.css:** theme colors — teal-brand, gold-brand, surface, muted
**Dark mode:** next-themes + class dark:
**RTL:** dir="rtl" در html
**cn():** src/lib/utils.ts — ترکیب کلاس‌ها`,
  },
  {
    title: "Storage — ذخیره فایل PDF و صوت",
    keywords: ["storage", "s3", "upload", "file", "فایل", "pdf"],
    filePath: "src/lib/storage.ts",
    body: `فایل‌های آپلود در S3 (production) یا disk محلی (dev) ذخیره می‌شوند.

**uploadFile():** buffer → key مثل uploads/userId/uuid.pdf
**getFileUrl():** URL برای نمایش — /api/files/... یا S3 presigned
**archive:** fileKey با prefix ext: → embed از archive.org via /api/proxy

**API:** POST /api/upload, GET /api/files/[...key], GET /api/proxy`,
  },
  {
    title: "TypeScript — تایپ‌های امن",
    keywords: ["typescript", "type", "interface", "تایپ"],
    body: `TypeScript = JavaScript + types — خطا قبل از runtime.

**.tsx** = React + TS, **.ts** = pure logic
**Prisma types:** از generated client
**Props types:** در هر کامپوننت`,
  },
];

for (const c of concepts) {
  add("concepts", c.title, c.body, { keywords: c.keywords, filePath: c.filePath });
}

// ─── Database models ───
const models = [
  {
    title: "مدل User — کاربران",
    filePath: "prisma/schema.prisma",
    keywords: ["user", "کاربر", "email", "role", "admin", "blocked"],
    body: `جدول User — همه کاربران سایت

**فیلدها:**
- id (cuid) — شناسه یکتا
- name — نام نمایشی
- email (unique) — ایمیل login
- passwordHash — رمز هش‌شده (هرگز plain)
- role — USER یا ADMIN
- blocked — true = login ممنوع
- createdAt, updatedAt

**روابط:** contents, reviews, saved, notifications, tickets
**seed admin:** admin@marketplace.local / admin123`,
  },
  {
    title: "مدل Content — کتاب و پادکست",
    keywords: ["content", "ebook", "audiobook", "محتوا", "کتاب", "pending", "approved"],
    body: `جدول Content — هر PDF یا فایل صوتی

**فیلدها:** title, description, type (EBOOK|AUDIOBOOK), status (PENDING|APPROVED|REJECTED)
**fileKey** — مسیر فایل در storage
**coverKey** — تصویر جلد (optional)
**authorId** → User, **categoryId** → Category
**downloadCount** — تعداد بازدید read/listen

**گردش کار:** upload → PENDING → admin approve → APPROVED → در browse`,
  },
  {
    title: "مدل Category — دسته‌بندی",
    keywords: ["category", "دسته", "slug"],
    body: `name, slug (unique), description — مثلاً «ادبیات» slug: adabiat
**API:** GET /api/categories`,
  },
  {
    title: "مدل Review — نظرات",
    keywords: ["review", "نظر", "rating", "ستاره"],
    body: `rating 1-5, comment, status (مثل ContentStatus)
**unique:** یک نظر per user per content
**POST** /api/contents/[id]/reviews → PENDING تا admin تأیید`,
  },
  {
    title: "مدل SavedContent — کتابخانه شخصی",
    keywords: ["saved", "bookmark", "ذخیره", "کتابخانه"],
    body: `userId + contentId — bookmark
**API:** /api/user/saved, SaveButton.tsx`,
  },
  {
    title: "مدل Notification — اعلان",
    keywords: ["notification", "اعلان", "notify"],
    body: `type: CONTENT_APPROVED, CONTENT_REJECTED, REVIEW_*, TICKET_REPLY
**read:** boolean — NotificationList, badge در Navbar`,
  },
  {
    title: "مدل Ticket و TicketMessage — پشتیبانی",
    keywords: ["ticket", "تیکت", "پشتیبانی", "support"],
    body: `Ticket: subject, status OPEN|ANSWERED|CLOSED
TicketMessage: body, isStaff (پاسخ admin)
**User API:** /api/user/tickets — **Admin:** /api/admin/tickets`,
  },
  {
    title: "مدل PasswordResetToken",
    keywords: ["reset", "token", "بازیابی رمز"],
    body: `tokenHash, expiresAt (۱ ساعت) — forgot-password flow`,
  },
];

for (const m of models) {
  add("database", m.title, m.body, { keywords: m.keywords, filePath: m.filePath });
}

// ─── API routes ───
const apis = [
  { path: "/api/register", method: "POST", auth: "عمومی", title: "ثبت‌نام", body: "POST JSON: name, email, password → user ایجاد → 201. فایل: src/app/api/register/route.ts. صفحه: auth/register", keywords: ["register", "ثبت نام"] },
  { path: "/api/auth/[...nextauth]", method: "GET/POST", auth: "عمومی", title: "NextAuth — ورود و session", body: "signIn credentials → JWT cookie. src/lib/auth.ts. login/page.tsx", keywords: ["nextauth", "login", "ورود"] },
  { path: "/api/auth/forgot-password", method: "POST", auth: "عمومی", title: "فراموشی رمز", body: "POST { email } → token + email. forgot-password/page.tsx", keywords: ["forgot", "فراموشی"] },
  { path: "/api/auth/reset-password", method: "POST", auth: "عمومی", title: "بازیابی رمز", body: "POST { token, password }. reset-password/page.tsx", keywords: ["reset", "بازیابی"] },
  { path: "/api/contents", method: "GET", auth: "عمومی", title: "لیست و جستجوی محتوا", body: "Query: q, type, category, sort, page, pageSize. فقط APPROVED. BrowseSearch.tsx → fetch. پاسخ: contents[], total, totalPages", keywords: ["contents", "browse", "جستجو", "list"] },
  { path: "/api/contents/[id]", method: "GET", auth: "عمومی", title: "جزئیات یک محتوا", body: "Path id. content + reviews. read/listen pages (server-side lib/content)", keywords: ["content", "detail", "جزئیات"] },
  { path: "/api/contents/[id]/reviews", method: "POST", auth: "login", title: "ثبت نظر", body: "POST { rating 1-5, comment? }. ReviewForm.tsx. status PENDING", keywords: ["review", "نظر", "rating"] },
  { path: "/api/contents/[id]/reviews/[reviewId]", method: "DELETE", auth: "login", title: "حذف نظر", body: "صاحب یا admin. ReviewList.tsx", keywords: ["delete", "review"] },
  { path: "/api/categories", method: "GET", auth: "عمومی", title: "لیست دسته‌ها", body: "categories[]. upload/page, browse filter", keywords: ["category", "دسته"] },
  { path: "/api/recommendations", method: "GET", auth: "عمومی", title: "پیشنهاد هوشمند", body: "max 6. logged-in: based on reviews. home page.tsx", keywords: ["recommend", "پیشنهاد"] },
  { path: "/api/upload", method: "POST", auth: "login", title: "آپلود PDF/صوت", body: "FormData: title, type, categoryId, file. status PENDING. upload/page.tsx → storage.ts", keywords: ["upload", "آپلود", "pdf"] },
  { path: "/api/files/[...key]", method: "GET", auth: "عمومی", title: "سرو فایل", body: "Stream PDF/audio. PdfViewer, AudioPlayer", keywords: ["files", "download", "pdf"] },
  { path: "/api/proxy", method: "GET", auth: "عمومی", title: "پروکسی archive.org", body: "?url= archive.org only. CORS bypass", keywords: ["proxy", "archive"] },
  { path: "/api/user/profile", method: "GET/PATCH", auth: "login", title: "پروفایل کاربر", body: "GET: user+stats. PATCH: name یا password. ProfileForm, dashboard", keywords: ["profile", "پروفایل"] },
  { path: "/api/user/saved", method: "GET/POST", auth: "login", title: "کتابخانه — لیست و افزودن", body: "POST { contentId }. SaveButton, dashboard", keywords: ["saved", "bookmark"] },
  { path: "/api/user/saved/[contentId]", method: "GET/DELETE", auth: "login", title: "وضعیت bookmark", body: "GET saved:true/false. DELETE unbookmark. SaveButton", keywords: ["saved"] },
  { path: "/api/user/uploads", method: "GET", auth: "login", title: "آپلودهای من", body: "همه status. dashboard tab uploads", keywords: ["uploads", "آپلود"] },
  { path: "/api/user/notifications", method: "GET/PATCH", auth: "login", title: "اعلان‌ها", body: "GET 50 + unreadCount. PATCH mark all read. NotificationList", keywords: ["notification", "اعلان"] },
  { path: "/api/user/notifications/[id]/read", method: "PATCH", auth: "login", title: "خواندن یک اعلان", body: "PATCH. NotificationList", keywords: ["notification"] },
  { path: "/api/user/tickets", method: "GET/POST", auth: "login", title: "تیکت پشتیبانی", body: "POST subject+body. TicketPanel", keywords: ["ticket", "تیکت"] },
  { path: "/api/user/tickets/[id]", method: "GET/POST", auth: "login", title: "مکالمه تیکت", body: "GET messages. POST reply. TicketPanel", keywords: ["ticket"] },
  { path: "/api/admin/stats", method: "GET", auth: "admin", title: "آمار KPI", body: "users, contents, reviews stats. AdminStats.tsx", keywords: ["stats", "آمار", "admin"] },
  { path: "/api/admin/pending", method: "GET", auth: "admin", title: "صف تأیید", body: "contents + reviews PENDING. admin/page pending tab", keywords: ["pending", "تأیید", "moderation"] },
  { path: "/api/admin/contents/[id]/approve", method: "PATCH", auth: "admin", title: "تأیید محتوا", body: "APPROVED + notification. admin page", keywords: ["approve", "تأیید"] },
  { path: "/api/admin/contents/[id]/reject", method: "PATCH", auth: "admin", title: "رد محتوا", body: "REJECTED + notification", keywords: ["reject", "رد"] },
  { path: "/api/admin/reviews/[id]/approve", method: "PATCH", auth: "admin", title: "تأیید نظر", keywords: ["review", "approve"] },
  { path: "/api/admin/reviews/[id]/reject", method: "PATCH", auth: "admin", title: "رد نظر", keywords: ["review", "reject"] },
  { path: "/api/admin/users", method: "GET", auth: "admin", title: "لیست کاربران", body: "?page&q. AdminUserList", keywords: ["users", "کاربران"] },
  { path: "/api/admin/users/[id]", method: "PATCH", auth: "admin", title: "ویرایش کاربر", body: "role, blocked, password. AdminUserList", keywords: ["user", "block"] },
  { path: "/api/admin/users/[id]/reset-password", method: "POST", auth: "admin", title: "ریست رمز توسط admin", keywords: ["password", "reset"] },
  { path: "/api/admin/top-users", method: "GET", auth: "admin", title: "Leaderboard", body: "?category=uploads|reviews|saved|downloads. AdminTopUsers", keywords: ["top", "leaderboard"] },
  { path: "/api/admin/tickets", method: "GET", auth: "admin", title: "همه تیکت‌ها", body: "?status. AdminTickets", keywords: ["ticket", "admin"] },
  { path: "/api/admin/tickets/[id]", method: "GET/PATCH/POST", auth: "admin", title: "مدیریت تیکت", body: "reply staff, change status. AdminTickets", keywords: ["ticket"] },
  { path: "/api/admin/import-archive", method: "POST", auth: "admin", title: "واردات archive.org", body: "~100 کتاب. admin import button", keywords: ["import", "archive"] },
  { path: "/api/admin/contents", method: "GET", auth: "admin", title: "لیست PENDING contents", keywords: ["admin", "contents"] },
  { path: "/api/admin/reviews", method: "GET", auth: "admin", title: "لیست PENDING reviews", keywords: ["admin", "reviews"] },
];

for (const a of apis) {
  add("api", `${a.method} ${a.path}`, `${a.title}\n\n**دسترسی:** ${a.auth}\n\n${a.body}`, {
    filePath: `src/app/api${a.path.replace("[...nextauth]", "[...nextauth]").replace(/\[(\w+)\]/g, "[$1]")}/route.ts`.replace("/route.ts/route.ts", "/route.ts"),
    keywords: [...(a.keywords || []), a.path, a.method, "api"],
    id: `api-${a.path.replace(/\//g, "-").replace(/[\[\]]/g, "")}`,
  });
}

// ─── Flows ───
const flows = [
  { title: "جریان ثبت‌نام و ورود", keywords: ["flow", "login", "register"], body: "1. POST /api/register 2. redirect login 3. signIn → JWT 4. session در cookie" },
  { title: "جریان مرور و مطالعه کتاب", keywords: ["browse", "read", "pdf"], body: "GET /api/contents → ContentCard → /content/[id]/read → PdfViewer → /api/files یا /api/proxy" },
  { title: "جریان آپلود و تأیید", keywords: ["upload", "approve"], body: "GET categories → POST upload PENDING → admin pending → PATCH approve → notification" },
  { title: "جریان نظرات", keywords: ["review"], body: "POST review PENDING → admin approve → نمایش در ReviewList" },
  { title: "جریان تیکت پشتیبانی", keywords: ["ticket"], body: "User POST ticket → Admin GET tickets → POST reply → TICKET_REPLY notify" },
  { title: "نقشه پوشه‌های پروژه", keywords: ["structure", "ساختار", "پوشه"], body: `src/components/ — 51 UI\nsrc/lib/ — 16 logic\nsrc/app/ — pages + api\nprisma/ — DB schema\npublic/ — PWA` },
];

for (const f of flows) {
  add("flows", f.title, f.body, { keywords: f.keywords });
}

// ─── Parse components markdown ───
function parseComponentsMd(text) {
  const catMap = {
    "ui/": "frontend",
    "layout/": "frontend",
    "home/": "frontend",
    "content/": "frontend",
    "dashboard/": "frontend",
    "admin/": "frontend",
    "media/": "frontend",
    "providers/": "frontend",
    "lib/": "backend",
    "hooks/": "backend",
    "app pages/": "pages",
    "prisma/": "database",
    "config/": "config",
  };

  let currentCat = "frontend";
  const blocks = text.split(/^---$/m);

  for (const block of blocks) {
    const sectionMatch = block.match(/^## (.+)$/m);
    if (sectionMatch) {
      const sec = sectionMatch[1].trim();
      currentCat = catMap[sec] || currentCat;
      continue;
    }

    const fileMatch = block.match(/^### `([^`]+)`/m);
    if (!fileMatch) continue;

    const fullPath = fileMatch[1].replace(/\\/g, "/");
    const shortPath = fullPath.replace(/^.*?(src\/|prisma\/)/, "$1");
    const fileName = shortPath.split("/").pop()?.replace(/\.tsx?$/, "") || shortPath;

    let body = block
      .replace(/^### `[^`]+`\s*/m, "")
      .replace(/\*\*هدف:\*\*/g, "**هدف:**")
      .trim();

    const kw = [fileName, shortPath, fullPath.split("/").slice(-2).join(" ")];

    add(currentCat, fileName, body, {
      filePath: shortPath,
      keywords: kw.filter(Boolean),
      id: `file-${shortPath.replace(/[^a-z0-9]+/gi, "-")}`,
    });
  }
}

if (fs.existsSync(MD)) {
  parseComponentsMd(fs.readFileSync(MD, "utf8"));
}

// ─── lib files extra detail ───
const libExtras = [
  { file: "src/lib/content.ts", title: "content.ts — منطق محتوا", body: "getApprovedContents, getContentById, getRecommendations, mapContent. queries Prisma + averageRating", keywords: ["content", "query"] },
  { file: "src/lib/notifications.ts", title: "notifications.ts — ایجاد اعلان", body: "createNotification on approve/reject. types CONTENT_*, REVIEW_*, TICKET_REPLY", keywords: ["notification"] },
  { file: "src/lib/email.ts", title: "email.ts — SMTP", body: "sendPasswordResetEmail — nodemailer. env SMTP_*", keywords: ["email", "smtp"] },
];

for (const l of libExtras) {
  add("backend", l.title, l.body, { filePath: l.file, keywords: l.keywords });
}

// ─── Write output ───
const out = `/** Auto-generated by scripts/build-site-docs.mjs — do not edit manually */
import type { DocEntry } from "./types";

export const DOC_ENTRIES: DocEntry[] = ${JSON.stringify(entries, null, 2)} as DocEntry[];

export const DOC_COUNT = ${entries.length};
`;

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, out, "utf8");
console.log(`✅ Generated ${entries.length} doc entries → ${OUT}`);

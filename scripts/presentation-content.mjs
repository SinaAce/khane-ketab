/**
 * Full project presentation script — defense / demo
 */
export const PRESENTATION = {
  title: "خانه کتاب",
  subtitle: "پلتفرم فارسی کتاب الکترونیکی و پادکست",
  university: "دانشگاه ملی مهارت",
  student: "سینا محمدی شرمه",
  advisor: "یوکابد امیری",
  url: "https://khane-ketab.vercel.app",
  sections: [
    {
      id: "intro",
      title: "۱. مقدمه و معرفی",
      content: `
سلام — وقت بخیر. من سینا محمدی شرمه هستم و امروز پروژه پایان‌نامه‌ام با عنوان **«خانه کتاب»** را ارائه می‌دهم.

**خانه کتاب** یک پلتform وب فارسی‌زبان است برای **مرور، مطالعه، گوش دادن و اشتراک‌گذاری** کتاب الکترونیکی (PDF) و پادکست. هدف ما ساخت یک **کتابخانه دیجیتال** با تجربه کاربری راست‌به‌چپ (RTL)، مدیریت محتوای کاربر-محور و پنل مدیریت حرفه‌ای بود.

**آدرس زنده پروژه:** khane-ketab.vercel.app

این سامانه برای مخاطب فارسی‌زبان طراحی شده — از آثار کلاسیک مثل شاهنامه و دیوان حافظ تا پادکست‌های آموزشی و محتوای آپلودشده توسط کاربران.`,
    },
    {
      id: "problem",
      title: "۲. مسئله و انگیزه",
      content: `
**مسئله:** دسترسی پراکنده به منابع PDF و فایل صوتی فارسی، نبود یک پلتفرم واحد با جستجو، کتابخانه شخصی و مدیریت محتوا.

**نیازمندی‌های اصلی:**
- مرور و جستجوی کتاب و پادکست به فارسی
- مطالعه PDF و پخش صوت در مرورگر
- ثبت‌نام، login و پروfiل کاربری
- آپلود محتوا توسط کاربر + **تأیید مدیر**
- نظرات و امتیازدهی
- کتابخانه شخصی (bookmark)
- پنل admin برای moderation و آمار
- PWA — نصب روی موبایل
- پشتیبانی تیکت

**چرا این پروژه؟** ترکیب فناوری‌های مدرن Full-Stack JavaScript با تمرکز بر فرهنگ و زبان فارسی.`,
    },
    {
      id: "tech",
      title: "۳. فناوری‌ها (Tech Stack)",
      content: `
| لایه | فناوری | نقش |
| Frontend | Next.js 16, React 19, TypeScript | UI و routing |
| Styling | Tailwind CSS 4 | طراحی RTL responsive |
| Backend | Next.js API Routes | 36 REST endpoint |
| Database | PostgreSQL (Neon) + Prisma 7 | ذخیره داده |
| Auth | NextAuth v5 + JWT + bcrypt | login امن |
| Storage | AWS S3 / local | فایل PDF و صوت |
| Deploy | Vercel | hosting + CI/CD |
| Mobile | Capacitor + PWA | اپ اندروید |

**چرا Next.js؟** Full-Stack در یک codebase — SSR برای SEO، API Routes برای backend، App Router مدرn.`,
    },
    {
      id: "architecture",
      title: "۴. معماری سیستم",
      content: `
معماری **سه‌لایه:**

**۱. Presentation (Frontend)**
- 13 صفحه در src/app/
- 51 کامپوننت React در src/components/
- Client Components برای تعامل (BrowseSearch, SaveButton)
- Server Components برای fetch مستقیم (page.tsx)

**۲. Business Logic (Backend)**
- 36 API Route در src/app/api/
- 16 ماژول lib در src/lib/ (auth, content, storage, validators, ...)

**۳. Data (Database)**
- PostgreSQL — 9 model در prisma/schema.prisma
- Prisma ORM — type-safe queries

**جریان داده:**
کاربر → صفحه → کامپوننت → fetch API → lib → Prisma → PostgreSQL → JSON → UI`,
    },
    {
      id: "database",
      title: "۵. پایگاه داده",
      content: `
**فایل schema:** prisma/schema.prisma
**Host:** Neon PostgreSQL (cloud)

**۹ Model اصلی:**
1. **User** — کاربران (role: USER/ADMIN, blocked)
2. **Content** — کتاب/پادکست (status: PENDING/APPROVED/REJECTED)
3. **Category** — دسته‌بندی (ادبیات، تاریخ، ...)
4. **Review** — نظرات (rating 1-5)
5. **SavedContent** — bookmark
6. **Notification** — اعلان تأیید/رد
7. **Ticket + TicketMessage** — پشتیبانی
8. **PasswordResetToken** — بازیابی رمز

**گردش وضعیت Content:**
آپلود → PENDING → admin تأیید → APPROVED → نمایش عمومی

**Seed:** admin@marketplace.local / admin123 — user@marketplace.local / user123`,
    },
    {
      id: "auth",
      title: "۶. احراز هویت و امنیت",
      content: `
**NextAuth v5** با Credentials Provider (email/password)

**فرآیند login:**
1. کاربر email/password وارد می‌کند
2. authorize() — Zod validate + prisma.user.find + bcrypt.compare
3. JWT در cookie — شامل id, name, role
4. session در useSession() / auth()

**امنیت:**
- bcrypt hash — رمز plain در DB نیست
- Zod validation — همه ورودی API
- requireAuth / requireAdmin — guards
- blocked user — login ممنوع
- proxy فقط archive.org whitelist

**بازیابی رمز:** forgot-password → email token → reset-password`,
    },
    {
      id: "api",
      title: "۷. API — 36 Endpoint",
      content: `
**ساختار:** src/app/api/**/route.ts — export GET/POST/PATCH/DELETE

**دسته‌بندی:**
- **Auth (4):** register, nextauth, forgot/reset password
- **Contents (4):** list, detail, reviews CRUD
- **User (8):** profile, saved, uploads, notifications, tickets
- **Admin (14):** stats, pending, approve/reject, users, tickets, import
- **Files (3):** upload, files stream, archive proxy
- **Misc (2):** categories, recommendations

**مثال:** GET /api/contents?q=حافظ
→ searchSchema → getApprovedContents() → prisma → JSON

**Validation:** src/lib/validators.ts — registerSchema, reviewSchema, ...`,
    },
    {
      id: "frontend",
      title: "۸. Frontend — صفحات و کامپوننت‌ها",
      content: `
**صفحات (13):**
/ خانه — HomeHero, TopicSlider, پیشنهاد هوشمند
/browse — جستجو و فیلتر BrowseSearch
/content/[id]/read — PdfViewer + نظرات
/content/[id]/listen — AudioPlayer
/dashboard — 6 tab (پروفایل، ذخیره، آپلود، اعلان، تیکت)
/admin — 5 tab (صف تأیید، آمار، کاربران، تیکت)
/upload — آپلود PDF/صوت
/auth/* — login, register, forgot, reset

**کامپوننت‌ها (51) — پوشه‌ها:**
ui/ — Button, Input, Card, Pagination
layout/ — Navbar, Footer, MobileBottomNav
content/ — ContentCard, BrowseSearch, SaveButton
dashboard/ — ProfileForm, NotificationList
admin/ — AdminStats, charts, user list
media/ — PdfViewer, AudioPlayer`,
    },
    {
      id: "features",
      title: "۹. قابلیت‌های کلیدی (Demo)",
      content: `
**برای دفاع — Demo flow:**

1. **صفحه اصلی** — آمار، اسلایدر موضوعات، پیشنهاد شخصی
2. **مرور** — جستجو، فیلتر EBOOK/AUDIOBOOK، sort
3. **مطالعه PDF** — inline viewer + archive.org books
4. **پادکست** — HTML5 audio player
5. **ثبت‌نام و login**
6. **ذخیره در کتابخانه** — SaveButton
7. **نظر و امتیاز** — ReviewForm (تأیید admin)
8. **آپلود** — FormData → PENDING
9. **Admin** — approve content/review، آمار KPI، مدیریت کاربر
10. **تیکت پشتیبانی** — user ↔ admin
11. **PWA** — نصب روی موبایل
12. **تم روشن/تاریک**

**Import archive:** ~100 کتاب از Internet Archive`,
    },
    {
      id: "deploy",
      title: "۱۰. استقرار (Deploy)",
      content: `
**Platform:** Vercel — region Frankfurt (fra1)
**Database:** Neon PostgreSQL
**Storage:** S3 (production)
**CI/CD:** git push → auto deploy

**Env variables:**
DATABASE_URL, AUTH_SECRET, AWS_*, SMTP_*

**PWA:** manifest.webmanifest + sw.js
**Android:** Capacitor — APK در /downloads/

**مستندات زنده:** khane-ketab.vercel.app/docs — 149 بخش + جستجو`,
    },
    {
      id: "stats",
      title: "۱۱. آمار پروژه",
      content: `
| مورد | تعداد |
| صفحات UI | 13 |
| API Routes | 36 |
| کامپوننت React | 51 |
| فایل lib | 16 |
| Model DB | 9 |
| Enum | 5 |
| دسته‌بندی | 6+ |

**خطوط کد:** Full-Stack TypeScript
**زبان UI:** فارسی RTL
**فونت:** Vazirmatn`,
    },
    {
      id: "conclusion",
      title: "۱۲. نتیجه‌گیری",
      content: `
**دستاوردها:**
✅ پلتفرم کامل فارسی ebook + podcast
✅ معماری Full-Stack مدرn با Next.js 16
✅ گردش کار moderation محتوا
✅ PWA و موبایل
✅ مستندات کامل آنلاین

**محدودیت‌ها:**
- بدون درگاه پرداخت (کتابخانه رایگان)
- moderation دستی admin

**آینده:**
- پرداخت آنلاین
- OCR فارسی
- اپ iOS
- recommendation ML

**سپاسگزارم** از استاد راهنما یوکابد امیری و هیئت محترم داوران.

**سوالات؟** 🎓`,
    },
  ],
};

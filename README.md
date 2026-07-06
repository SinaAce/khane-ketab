<div align="center">

# 📚 خانه کتاب

### مارکت‌پلیس فارسی کتاب الکترونیکی و پادکست

**خواندن، شنیدن و به‌اشتراک‌گذاری ادبیات و تاریخ ایران و جهان**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev/)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?style=flat-square&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

🌐 **نسخه زنده:** [khane-ketab.vercel.app](https://khane-ketab.vercel.app)

</div>

---

## درباره پروژه

**خانه کتاب** یک پلتفرم کامل برای مرور، مطالعه و اشتراک‌گذاری محتوای فارسی است — از شاهنامه و تاریخ بیهقی تا پادکست‌های صوتی و کتاب‌های الکترونیکی.

پروژه با تمرکز بر **تجربه کاربری RTL فارسی**، **پنل مدیریت پیشرفته** و **معماری مدرن Full-Stack** ساخته شده است.

> **پروژه دانشگاهی** — دانشگاه ملی مهارت  
> **دانشجو:** سینا محمدی شرمه · **استاد راهنما:** یوکابد امیری

---

## ✨ امکانات

| بخش | قابلیت‌ها |
|-----|-----------|
| **کاربران** | ثبت‌نام، ورود، پروفایل، کتابخانه شخصی، نوتیفیکیشن |
| **محتوا** | آپلود PDF و فایل صوتی، دسته‌بندی، جستجو و فیلتر |
| **خواندن** | نمایشگر PDF در مرورگر، پخش‌کننده صوتی |
| **تعامل** | امتیازدهی، نظرات، ذخیره محتوا، پیشنهاد هوشمند |
| **مدیریت** | تأیید محتوا و نظرات، آمار زنده، مدیریت کاربران، کاربران برتر |

### پنل مدیر
- 📊 داشبورد آمار با نمودار و انیمیشن
- 👥 مدیریت کاربران (نقش، مسدودیت، پیجینیشن)
- 🏆 رتبه‌بندی کاربران برتر
- ✅ صف تأیید محتوا و نظرات

---

## 🛠 تکنولوژی‌ها

- **Frontend:** Next.js 16 · React 19 · Tailwind CSS 4
- **Backend:** Next.js API Routes · NextAuth.js v5
- **Database:** PostgreSQL · Prisma ORM 7
- **Storage:** ذخیره محلی + AWS S3 (اختیاری)
- **Deploy:** Vercel · Neon PostgreSQL

---

## 🚀 اجرای محلی

### پیش‌نیاز
- Node.js 20+
- npm

### نصب

```bash
git clone https://github.com/YOUR_USERNAME/khane-ketab.git
cd khane-ketab
npm install
```

### متغیرهای محیطی

```bash
copy .env.example .env
```

| متغیر | توضیح |
|-------|-------|
| `DATABASE_URL` | اتصال PostgreSQL |
| `AUTH_SECRET` | کلید رمزنگاری NextAuth |
| `AUTH_URL` | آدرس سایت (مثلاً `http://localhost:3000`) |

### دیتابیس و اجرا

```bash
# در یک ترمینال جدا:
npm run db:dev

# سپس:
npm run db:check
npm run db:seed
npm run dev
```

سایت روی [http://localhost:3000](http://localhost:3000) باز می‌شود.

### حساب‌های پیش‌فرض

| نقش | ایمیل | رمز |
|-----|-------|-----|
| مدیر | `admin@marketplace.local` | `admin123` |
| کاربر | `user@marketplace.local` | `user123` |

---

## 📦 استقرار (Vercel + Neon)

1. ریپو را به GitHub وصل کنید
2. در [Neon](https://neon.tech) یک دیتابیس PostgreSQL بسازید
3. پروژه را در [Vercel](https://vercel.com) import کنید
4. Environment Variables را تنظیم کنید:

```
DATABASE_URL=postgresql://...
AUTH_SECRET=<یک رشته تصادفی ۳۲+ کاراکتری>
AUTH_URL=https://your-domain.vercel.app
```

5. Deploy کنید — سپس یک‌بار seed بزنید:

```bash
npx prisma db push
npm run db:seed
```

---

## 📁 ساختار پروژه

```
src/
├── app/              # صفحات و API Routes
├── components/       # UI، پنل مدیر، صفحه اصلی
├── lib/              # auth، prisma، storage
└── generated/prisma/ # Prisma Client
prisma/
├── schema.prisma     # مدل دیتابیس
├── seed.ts           # داده اولیه
└── import-archive.ts # واردات از Internet Archive
public/
├── logos/            # لوگو و favicon
└── slides/           # اسلایدر موضوعات
```

---

## 📜 اسکریپت‌های مفید

| دستور | کاربرد |
|-------|--------|
| `npm run dev` | اجرای توسعه |
| `npm run build` | بیلد production |
| `npm run db:dev` | PostgreSQL محلی (Prisma Dev) |
| `npm run db:seed` | داده اولیه |
| `npm run db:import` | واردات ۱۰۰ کتاب از Archive.org |
| `npm run icons:generate` | ساخت favicon |

---

## 📄 مجوز

پروژه آموزشی — دانشگاه ملی مهارت

---

<div align="center">

ساخته شده با ❤️ برای کتاب‌خوان‌های فارسی‌زبان

</div>

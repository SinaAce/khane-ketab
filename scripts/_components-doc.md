# مستندسازی ساختار پروژه ebook-marketplace (خانه کتاب)

---

## ui/

### `c:\Users\ASUS\Projects\ebook-marketplace\src\components\ui\Badge.tsx`
**هدف:** برچسب رنگی کوچک برای نمایش وضعیت یا نوع محتوا.

- چهار variant: پیش‌فرض، موفق، هشدار، خطر
- استایل گرد با رنگ‌های برند (teal/gold)
- از `cn` برای ترکیب کلاس‌ها استفاده می‌کند

**خروجی‌ها:** `Badge`

**استفاده‌شده در:** `ContentCard`, `UserLists`, `AdminUserList`, `AdminTickets`, `TicketPanel`, `admin/page.tsx`

---

### `c:\Users\ASUS\Projects\ebook-marketplace\src\components\ui\Button.tsx`
**هدف:** دکمه استاندارد با variant و اندازه‌های مختلف.

- variantها: primary, secondary, ghost, danger, accent, hero
- اندازه‌ها: sm, md, lg با حداقل ارتفاع لمسی
- `forwardRef` برای دسترسی به DOM

**خروجی‌ها:** `Button`

**استفاده‌شده در:** تقریباً همه فرم‌ها و پنل‌ها (auth, dashboard, admin, upload, layout, content, media)

---

### `c:\Users\ASUS\Projects\ebook-marketplace\src\components\ui\Card.tsx`
**هدف:** کانتینر پنل با پس‌زمینه و گوشه گرد.

- کلاس `surface-panel` با padding پیش‌فرض
- `forwardRef` برای ref به div

**خروجی‌ها:** `Card`

**استفاده‌شده در:** dashboard, admin, auth, upload, content pages, NotificationList, TicketPanel

---

### `c:\Users\ASUS\Projects\ebook-marketplace\src\components\ui\Input.tsx`
**هدف:** فیلد ورودی متنی استایل‌دار.

- border و focus ring teal-brand
- `forwardRef` برای فرم‌ها

**خروجی‌ها:** `Input`

**استفاده‌شده در:** auth pages, ProfileForm, AdminUserList, TicketPanel, upload, PasswordInput

---

### `c:\Users\ASUS\Projects\ebook-marketplace\src\components\ui\PasswordInput.tsx`
**هدف:** ورودی رمز با دکمه نمایش/مخفی‌سازی.

- state داخلی visible
- آیکون Eye/EyeOff از lucide
- wrapper روی `Input`

**خروجی‌ها:** `PasswordInput`

**استفاده‌شده در:** login, register, reset-password, ProfileForm, AdminUserList

---

### `c:\Users\ASUS\Projects\ebook-marketplace\src\components\ui\Pagination.tsx`
**هدف:** صفحه‌بندی RTL با دکمه قبل/بعد و نقطه‌ها.

- نمایش شماره صفحه به فارسی
- `PageSizeSelect` برای تعداد در صفحه
- مخفی شدن اگر فقط یک صفحه باشد

**خروجی‌ها:** `Pagination`, `PageSizeSelect`

**استفاده‌شده در:** `BrowseSearch`, `PaginatedContentGrid`, `AdminUserList`, `AdminTickets`, `AdminTopUsers`

---

### `c:\Users\ASUS\Projects\ebook-marketplace\src\components\ui\PersianLoader.tsx`
**هدف:** لودر تم‌دار فارسی با انیمیشن orbit.

- نمایش label قابل تنظیم
- نام سایت از `SITE_NAME`
- SVG الماس/طلایی

**خروجی‌ها:** `PersianLoader`

**استفاده‌شده در:** `loading.tsx` (root, browse, dashboard), login, reset-password, browse, dashboard, admin, TicketPanel, AdminTickets, BrowseSearch

---

### `c:\Users\ASUS\Projects\ebook-marketplace\src\components\ui\ScrollReveal.tsx`
**هدف:** انیمیشن ظاهر شدن هنگام scroll با IntersectionObserver.

- variantها: up, left, right, scale, fade, blur, rise
- delay و once قابل تنظیم
- client component

**خروجی‌ها:** `ScrollReveal`

**استفاده‌شده در:** `page.tsx`, `browse/page.tsx`, `HomeSections`, `TopicSlider`, `BrowseSearch`

---

### `c:\Users\ASUS\Projects\ebook-marketplace\src\components\ui\Textarea.tsx`
**هدف:** textarea چندخطی با استایل یکسان Input.

- حداقل ارتفاع 28
- focus ring teal

**خروجی‌ها:** `Textarea`

**استفاده‌شده در:** `ReviewForm`, `upload/page.tsx`

---

## layout/

### `c:\Users\ASUS\Projects\ebook-marketplace\src\components\layout\PageContainer.tsx`
**هدف:** wrapper عرض محدود برای محتوای صفحات.

- max-w-7xl با padding responsive
- prop `narrow` برای max-w-4xl

**خروجی‌ها:** `PageContainer`

**استفاده‌شده در:** *(فعلاً import نشده — صفحات از کلاس `page-shell` مستقیم استفاده می‌کنند)*

---

### `c:\Users\ASUS\Projects\ebook-marketplace\src\components\layout\SiteLogo.tsx`
**هدف:** نمایش لوگوی سایت با Next/Image.

- اندازه قابل تنظیم (پیش‌فرض 56)
- از `SITE_LOGO` و `SITE_NAME`

**خروجی‌ها:** `SiteLogo`

**استفاده‌شده در:** `Navbar`, `Footer`, `DownloadClient`

---

### `c:\Users\ASUS\Projects\ebook-marketplace\src\components\layout\ThemeToggle.tsx`
**هدف:** دکمه تعویض تم روشن/تاریک.

- از `next-themes` استفاده می‌کند
- placeholder تا mount برای جلوگیری از hydration mismatch

**خروجی‌ها:** `ThemeToggle`

**استفاده‌شده در:** `Navbar`

---

### `c:\Users\ASUS\Projects\ebook-marketplace\src\components\layout\AppShellScript.tsx`
**هدف:** اسکript inline برای تشخیص PWA/Capacitor.

- ست کردن `data-app-shell="true"` روی html
- تشخیص standalone و Capacitor native

**خروجی‌ها:** `AppShellScript`

**استفاده‌شده در:** `src/app/layout.tsx` (در `<head>`)

---

### `c:\Users\ASUS\Projects\ebook-marketplace\src\components\layout\MobileBottomNav.tsx`
**هدف:** ناوبری پایین موبایل با ۵ آیتم.

- آیتم‌ها: حساب، پشتیبانی/مدیریت، خانه (مرکز), کتاب, آپلود
- مخفی در auth/read/listen
- نقش ADMIN را از session می‌خواند

**خروجی‌ها:** `MobileBottomNav`

**استفاده‌شده در:** `MobileBottomNavShell`

---

### `c:\Users\ASUS\Projects\ebook-marketplace\src\components\layout\MobileBottomNavShell.tsx`
**هدف:** wrapper با Suspense برای MobileBottomNav.

- fallback null
- لازم برای useSearchParams

**خروجی‌ها:** `MobileBottomNavShell`

**استفاده‌شده در:** `src/app/layout.tsx`

---

### `c:\Users\ASUS\Projects\ebook-marketplace\src\components\layout\PageEntrance.tsx`
**هدف:** انیمیشن ورود صفحه با کلاس CSS.

- wrapper ساده با `page-enter page-enter-active`

**خروجی‌ها:** `PageEntrance`

**استفاده‌شده در:** `src/app/layout.tsx` (دور children در main)

---

### `c:\Users\ASUS\Projects\ebook-marketplace\src\components\layout\PwaRegister.tsx`
**هدف:** ثبت service worker برای PWA.

- register `/sw.js` در useEffect
- خطا را silent می‌گیرد

**خروجی‌ها:** `PwaRegister`

**استفاده‌شده در:** `src/app/layout.tsx`

---

### `c:\Users\ASUS\Projects\ebook-marketplace\src\components\layout\Navbar.tsx`
**هدف:** هدر اصلی سایت با لینک‌ها و auth.

- لینک‌های خانه، browse، upload، دانلود اپ (در وب)
- ThemeToggle، ورود/ثبت‌نام یا UserAccountButton
- لینک admin برای نقش ADMIN
- از `useAppShellMode` برای مخفی کردن لینک دانلود در اپ

**خروجی‌ها:** `Navbar`

**استفاده‌شده در:** `src/app/layout.tsx`

---

### `c:\Users\ASUS\Projects\ebook-marketplace\src\components\layout\BackToTop.tsx`
**هدف:** دکمه شناور برگشت به بالای صفحه.

- نمایش بعد از 120px scroll
- موقعیت بالای bottom nav در موبایل
- smooth scroll

**خروجی‌ها:** `BackToTop`

**استفاده‌شده در:** `src/app/layout.tsx`

---

### `c:\Users\ASUS\Projects\ebook-marketplace\src\components\layout\UserAccountButton.tsx`
**هدف:** دکمه حساب کاربری و badge نوتیف در navbar.

- لینک به dashboard
- badge تعداد unread از `useNotifications`
- فقط برای session

**خروجی‌ها:** `UserAccountButton`

**استفاده‌شده در:** `Navbar`

---

### `c:\Users\ASUS\Projects\ebook-marketplace\src\components\layout\Footer.tsx`
**هدف:** فوتر دسکتاپ با لوگو و شعار.

- فقط md:block (مخفی در موبایل)
- نام و شعار سایت

**خروجی‌ها:** `Footer`

**استفاده‌شده در:** `src/app/layout.tsx`

---

## home/

### `c:\Users\ASUS\Projects\ebook-marketplace\src\components\home\HomeHero.tsx`
**هدف:** بخش hero صفحه اصلی با آمار و CTA.

- ۴ کارت آمار: کتاب، صوتی، تاریخ ایران، تاریخ جهان
- انیمیشن با `useAnimateOnView` و `AnimatedNumber`
- دکمه‌های browse و upload

**خروجی‌ها:** `HomeHero`

**استفاده‌شده در:** `src/app/page.tsx`

---

### `c:\Users\ASUS\Projects\ebook-marketplace\src\components\home\HomeSections.tsx`
**هدف:** سه بخش محتوا در صفحه اصلی.

- تاریخ ایران و جهان (فیلتر category/title)
- پیشنهاد برای شما
- جدیدترین‌ها با لینک «مشاهده همه»
- هر بخش حداکثر ۴ کارت

**خروجی‌ها:** `HomeSections`

**استفاده‌شده در:** `src/app/page.tsx`

---

### `c:\Users\ASUS\Projects\ebook-marketplace\src\components\home\TopicSlider.tsx`
**هدف:** اسلایدر افقی موضوعات با autoplay و loop بی‌نهایت.

- کپی ۳ برابری slides برای loop
- pause روی hover/touch
- لینک به browse با query params
- آیکون بر اساس نوع موضوع

**خروجی‌ها:** `TopicSlider`

**استفاده‌شده در:** `src/app/page.tsx`

---

## content/

### `c:\Users\ASUS\Projects\ebook-marketplace\src\components\content\ContentCard.tsx`
**هدف:** کارت لینک‌دار برای نمایش یک کتاب/پادکست.

- گرادیان بر اساس category slug
- Badge نوع، امتیاز، نویسنده، دسته
- لینک به `/read` یا `/listen`

**خروجی‌ها:** `ContentCard`

**استفاده‌شده در:** `ContentGrid`, `PaginatedContentGrid`, `HomeSections`, `BrowseSearch`

---

### `c:\Users\ASUS\Projects\ebook-marketplace\src\components\content\ContentGrid.tsx`
**هدف:** grid ساده از ContentCard بدون صفحه‌بندی.

- grid responsive 2 تا 5 ستون
- پیام خالی قابل تنظیم

**خروجی‌ها:** `ContentGrid`

**استفاده‌شده در:** `UserLists` (SavedList)

---

### `c:\Users\ASUS\Projects\ebook-marketplace\src\components\content\PaginatedContentGrid.tsx`
**هدف:** grid محتوا با صفحه‌بندی client-side.

- slice آرایه items
- reset page هنگام تغییر items
- columns: home یا browse

**خروجی‌ها:** `PaginatedContentGrid`

**استفاده‌شده در:** *(فعلاً import نشده)*

---

### `c:\Users\ASUS\Projects\ebook-marketplace\src\components\content\BrowseSearch.tsx`
**هدف:** UI جستجو و فیلتر browse با fetch از API.

- debounce 300ms و sync URL
- فیلتر: q, type, category, sort, pageSize
- fetch `/api/contents`
- ScrollReveal روی هر کارت

**خروجی‌ها:** `BrowseSearch`

**استفاده‌شده در:** `src/app/browse/page.tsx`

---

### `c:\Users\ASUS\Projects\ebook-marketplace\src\components\content\SaveButton.tsx`
**هدف:** دکمه ذخیره/حذف از کتابخانه.

- فقط برای authenticated
- GET/POST/DELETE `/api/user/saved`
- state saved و loading

**خروجی‌ها:** `SaveButton`

**استفاده‌شده در:** `read/page.tsx`, `listen/page.tsx`

---

### `c:\Users\ASUS\Projects\ebook-marketplace\src\components\content\StarRating.tsx`
**هدف:** نمایش ۵ ستاره با امتیاز عددی.

- round value برای پر شدن ستاره‌ها
- showValue اختیاری

**خروجی‌ها:** `StarRating`

**استفاده‌شده در:** `ContentCard`, `ReviewList`, read/listen pages, `admin/page.tsx`

---

### `c:\Users\ASUS\Projects\ebook-marketplace\src\components\content\ReviewList.tsx`
**هدف:** لیست نظرات با امکان حذف.

- حذف توسط صاحب نظر یا admin
- confirm و router.refresh
- StarRating برای هر نظر

**خروجی‌ها:** `ReviewList`

**استفاده‌شده در:** `read/page.tsx`, `listen/page.tsx`

---

### `c:\Users\ASUS\Projects\ebook-marketplace\src\components\content\ReviewForm.tsx`
**هدف:** فرم ثبت نظر با امتیاز ۱–۵.

- POST `/api/contents/[id]/reviews`
- پیام تأیید مدیر
- Textarea برای comment

**خروجی‌ها:** `ReviewForm`

**استفاده‌شده در:** `read/page.tsx`, `listen/page.tsx`

---

## dashboard/

### `c:\Users\ASUS\Projects\ebook-marketplace\src\components\dashboard\UserLists.tsx`
**هدف:** لیست‌های ذخیره‌شده و آپلودهای کاربر.

- `SavedList`: grid یا پیام خالی
- `UploadsList`: کارت با Badge وضعیت PENDING/APPROVED/REJECTED
- لینک به محتوای تأییدشده

**خروجی‌ها:** `SavedList`, `UploadsList`

**استفاده‌شده در:** `src/app/dashboard/page.tsx`

---

### `c:\Users\ASUS\Projects\ebook-marketplace\src\components\dashboard\ProfileForm.tsx`
**هدف:** ویرایش نام، رمز و خروج از حساب.

- PATCH `/api/user/profile`
- update session با next-auth
- بخش جداگانه signOut

**خروجی‌ها:** `ProfileForm`

**استفاده‌شده در:** `src/app/dashboard/page.tsx`

---

### `c:\Users\ASUS\Projects\ebook-marketplace\src\components\dashboard\NotificationList.tsx`
**هدف:** لیست نوتیف‌ها و hook مدیریت آن‌ها.

- انواع CONTENT/REVIEW approved/rejected
- mark read / mark all read
- poll هر ۶۰ ثانیه
- لینک embed شده در message

**خروجی‌ها:** `NotificationList`, `NotificationItem` (type), `useNotifications`

**استفاده‌شده در:** `dashboard/page.tsx`, `UserAccountButton`

---

### `c:\Users\ASUS\Projects\ebook-marketplace\src\components\dashboard\TicketPanel.tsx`
**هدف:** پنل تیکت پشتیبانی کاربر.

- ایجاد تیکت جدید
- لیست و جزئیات گفتگو
- reply تا وضعیت CLOSED
- API `/api/user/tickets`

**خروجی‌ها:** `TicketPanel`

**استفاده‌شده در:** `src/app/dashboard/page.tsx`

---

## admin/

### `c:\Users\ASUS\Projects\ebook-marketplace\src\components\admin\useAnimateOnView.ts`
**هدف:** hook IntersectionObserver برای انیمیشن‌های admin.

- animationClass با prefix `admin-animate-*`
- threshold و rootMargin قابل تنظیم

**خروجی‌ها:** `useAnimateOnView`, `AdminAnimation` (type)

**استفاده‌شده در:** AdminBarChart, AdminDonutChart, AdminStatsHero, AdminTopUsers, AdminUserList, HomeHero, AnimateOnView

---

### `c:\Users\ASUS\Projects\ebook-marketplace\src\components\admin\AnimateOnView.tsx`
**هدف:** wrapper declarative برای انیمیشن scroll.

- prop `as` برای tag دلخواه
- callback `onVisibleChange`

**خروجی‌ها:** `AnimateOnView`

**استفاده‌شده در:** AdminStats, AdminUserList, AdminTopUsers, `admin/page.tsx`

---

### `c:\Users\ASUS\Projects\ebook-marketplace\src\components\admin\AnimatedNumber.tsx`
**هدف:** شمارنده انیمیشن‌دار با easing.

- فرمت fa-IR
- reset به ۰ هنگام active

**خروجی‌ها:** `AnimatedNumber`

**استفاده‌شده در:** HomeHero, AdminStats, AdminBarChart, AdminDonutChart, AdminStatsHero, AdminTopUsers, AdminUserList

---

### `c:\Users\ASUS\Projects\ebook-marketplace\src\components\admin\AdminBarChart.tsx`
**هدف:** نمودار میله‌ای افقی با انیمیشن.

- BarRow با AnimatedNumber
- درصد نسبت به max

**خروجی‌ها:** `AdminBarChart`, `BarItem` (type)

**استفاده‌شده در:** `AdminStats`

---

### `c:\Users\ASUS\Projects\ebook-marketplace\src\components\admin\AdminDonutChart.tsx`
**هدف:** نمودار دونات SVG با legend.

- stroke-dasharray انیمیشن
- centerLabel/centerValue
- LegendItem با درصد

**خروجی‌ها:** `AdminDonutChart`, `DonutSegment` (type)

**استفاده‌شده در:** `AdminStats`

---

### `c:\Users\ASUS\Projects\ebook-marketplace\src\components\admin\AdminStatsHero.tsx`
**هدف:** hero بنر آمار در بالای داشبورد admin.

- pillهای کاربر فعال، محتوای تأییدشده، دسته‌ها
- پس‌زمینه گرادیان و orb

**خروجی‌ها:** `AdminStatsHero`

**استفاده‌شده در:** `AdminStats`

---

### `c:\Users\ASUS\Projects\ebook-marketplace\src\components\admin\AdminStats.tsx`
**هدف:** داشبورد آمار کامل سایت.

- fetch `/api/admin/stats`
- KPI cards، donut charts، bar charts، mini stats
- skeleton loading

**خروجی‌ها:** `AdminStats`

**استفاده‌شده در:** `src/app/admin/page.tsx`

---

### `c:\Users\ASUS\Projects\ebook-marketplace\src\components\admin\AdminUserList.tsx`
**هدف:** مدیریت کاربران با جستجو و pagination.

- تغییر role، block/unblock، reset password
- جدول desktop + کارت mobile
- modal تغییر رمز

**خروجی‌ها:** `AdminUserList`

**استفاده‌شده در:** `src/app/admin/page.tsx`

---

### `c:\Users\ASUS\Projects\ebook-marketplace\src\components\admin\AdminTopUsers.tsx`
**هدف:** رتبه‌بندی کاربران برتر.

- دسته‌ها: uploads, reviews, saved, downloads
- podium top 3
- progress bar نسبی

**خروجی‌ها:** `AdminTopUsers`

**استفاده‌شده در:** `src/app/admin/page.tsx`

---

### `c:\Users\ASUS\Projects\ebook-marketplace\src\components\admin\AdminTickets.tsx`
**هدف:** مدیریت تیکت‌های پشتیبانی توسط admin.

- فیلتر وضعیت OPEN/ANSWERED/CLOSED
- پاسخ staff و بستن/بازگشایی
- pagination

**خروجی‌ها:** `AdminTickets`

**استفاده‌شده در:** `src/app/admin/page.tsx`

---

### `c:\Users\ASUS\Projects\ebook-marketplace\src\components\admin\AdminTabPanel.tsx`
**هدف:** wrapper ساده برای tab panels admin.

- key برای re-mount
- کلاس `admin-tab-panel`

**خروجی‌ها:** `AdminTabPanel`

**استفاده‌شده در:** `src/app/admin/page.tsx`

---

## media/

### `c:\Users\ASUS\Projects\ebook-marketplace\src\components\media\PdfViewer.tsx`
**هدف:** نمایش PDF در iframe.

- پشتیبانی archive.org embed
- لینک باز در تب جدید و archive details

**خروجی‌ها:** `PdfViewer`

**استفاده‌شده در:** `src/app/content/[id]/read/page.tsx`

---

### `c:\Users\ASUS\Projects\ebook-marketplace\src\components\media\AudioPlayer.tsx`
**هدف:** پخش‌کننده صوتی HTML5 یا embed archive.

- play/pause، seek bar، duration
- fallback iframe برای archive
- خطای «غیرقابل پخش»

**خروجی‌ها:** `AudioPlayer`

**استفاده‌شده در:** `src/app/content/[id]/listen/page.tsx`

---

## providers/

### `c:\Users\ASUS\Projects\ebook-marketplace\src\components\providers\AuthProvider.tsx`
**هدف:** wrapper SessionProvider از next-auth.

- refetchOnWindowFocus و refetchInterval غیرفعال

**خروجی‌ها:** `AuthProvider`

**استفاده‌شده در:** `src/app/layout.tsx`

---

### `c:\Users\ASUS\Projects\ebook-marketplace\src\components\providers\ThemeProvider.tsx`
**هدف:** wrapper next-themes.

- attribute class، defaultTheme light
- enableSystem، disableTransitionOnChange

**خروجی‌ها:** `ThemeProvider`

**استفاده‌شده در:** `src/app/layout.tsx`

---

## lib/

### `c:\Users\ASUS\Projects\ebook-marketplace\src\lib\utils.ts`
**هدف:** توابع کمکی عمومی.

- `cn`: clsx + tailwind-merge
- `formatFileSize`, `formatDuration`, `averageRating`
- `isExternalFileKey`, `isArchiveFileKey`, `slugify`

**خروجی‌ها:** توابع بالا

**استفاده‌شده در:** تقریباً همه components؛ `content.ts` از averageRating

---

### `c:\Users\ASUS\Projects\ebook-marketplace\src\lib\button-styles.ts`
**هدف:** کلاس‌های CSS مشترک دکمه.

- `buttonInteraction`: hover scale/shadow
- `buttonNavClass`: استایل nav pagination

**خروجی‌ها:** `buttonInteraction`, `buttonNavClass`

**استفاده‌شده در:** `Button`, `Pagination`, `BackToTop`

---

### `c:\Users\ASUS\Projects\ebook-marketplace\src\lib\site.ts`
**هدف:** ثابت‌های برند و URL سایت.

- SITE_NAME, SITE_SLOGAN, SITE_LOGO, SITE_URL
- ANDROID_APK_URL, IOS_INSTALL_URL, PWA_INSTALL_URL

**خروجی‌ها:** ثابت‌های بالا

**استفاده‌شده در:** layout, Navbar, Footer, PersianLoader, SiteLogo, email, download

---

### `c:\Users\ASUS\Projects\ebook-marketplace\src\lib\app-shell.ts`
**هدف:** تشخیص حالت اپ (PWA/Capacitor).

- `isStandaloneDisplay`, `isNativeCapacitorApp`, `isAppShellMode`

**خروجی‌ها:** توابع بالا

**استفاده‌شده در:** `useAppShellMode`, `AppShellScript` (منطق مشابه inline)

---

### `c:\Users\ASUS\Projects\ebook-marketplace\src\lib\prisma.ts`
**هدف:** singleton PrismaClient با adapter PostgreSQL.

- Proxy برای lazy init و stale client detection
- `withPrismaRetry` با reconnect
- `isPrismaConnectionError`

**خروجی‌ها:** `prisma`, `withPrismaRetry`, `isPrismaConnectionError`

**استفاده‌شده در:** همه API routes، content.ts, auth.ts, notifications, users, password-reset, archive-import, pages

---

### `c:\Users\ASUS\Projects\ebook-marketplace\src\lib\auth.ts`
**هدف:** پیکربندی NextAuth v5 با Credentials.

- JWT session با role در token
- `requireAuth`, `requireAdmin`
- export handlers, signIn, signOut, auth

**خروجی‌ها:** `handlers`, `signIn`, `signOut`, `auth`, `requireAuth`, `requireAdmin`

**استفاده‌شده در:** API routes، pages (home, read, listen)، `[...nextauth]/route.ts`

---

### `c:\Users\ASUS\Projects\ebook-marketplace\src\lib\validators.ts`
**هدف:** schemaهای Zod برای validation API.

- register, login, forgot/reset password
- contentUpload, review, search, profile
- ticket schemas

**خروجی‌ها:** schemaهای Zod

**استفاده‌شده در:** API routes (register, auth, upload, reviews, contents, profile, tickets)

---

### `c:\Users\ASUS\Projects\ebook-marketplace\src\lib\email-utils.ts`
**هدف:** نرمال‌سازی ایمیل.

- trim + lowercase

**خروجی‌ها:** `normalizeEmail`

**استفاده‌شده در:** auth.ts, users.ts, register, forgot-password

---

### `c:\Users\ASUS\Projects\ebook-marketplace\src\lib\users.ts`
**هدف:** جستجوی کاربر بر اساس ایمیل.

- case-insensitive با Prisma

**خروجی‌ها:** `findUserByEmail`, `findUserIdByEmail`

**استفاده‌شده در:** *(احتمالاً API routes — grep مستقیم محدود)*

---

### `c:\Users\ASUS\Projects\ebook-marketplace\src\lib\email.ts`
**هدف:** ارسال ایمیل بازیابی رمز با nodemailer.

- `smtpConfigured`, `sendPasswordResetEmail`
- HTML RTL فارسی
- fallback log در dev بدون SMTP

**خروجی‌ها:** `smtpConfigured`, `sendPasswordResetEmail`

**استفاده‌شده در:** `api/auth/forgot-password/route.ts`

---

### `c:\Users\ASUS\Projects\ebook-marketplace\src\lib\password-reset.ts`
**هدف:** مدیریت token بازیابی رمز.

- hash SHA256، TTL ۱ ساعت
- create/clear/resetWithToken
- `buildResetPasswordUrl`, `getAppBaseUrl`

**خروجی‌ها:** توابع token و URL

**استفاده‌شده در:** forgot-password API, reset-password API, profile API, admin user routes

---

### `c:\Users\ASUS\Projects\ebook-marketplace\src\lib\content.ts`
**هدف:** لایه داده محتوا (query + map).

- `getApprovedContents` با sort/filter/pagination
- `getRecommendations` بر اساس تاریخچه review
- `getContentById` با reviews
- `mapContent`, `contentInclude`

**خروجی‌ها:** توابع و typeهای MappedContent, PaginatedContents

**استفاده‌شده در:** pages (home, browse, read, listen)، API contents/saved/uploads/recommendations

---

### `c:\Users\ASUS\Projects\ebook-marketplace\src\lib\storage.ts`
**هدف:** آپلود و URL فایل (S3 یا local).

- `uploadFile`, `getFileUrl`, `buildFileKey`
- پشتیبانی archive: و ext: keys
- signed URL S3 یا `/api/files/`

**خروجی‌ها:** توابع storage

**استفاده‌شده در:** upload API, read/listen pages, files API, seed, archive-import

---

### `c:\Users\ASUS\Projects\ebook-marketplace\src\lib\notifications.ts`
**هدف:** ایجاد و enrich نوتیف‌ها.

- notify content/review approved/rejected
- `enrichNotification` با contentLink
- `getContentHref`

**خروجی‌ها:** توابع notification

**استفاده‌شده در:** admin approve/reject routes، user notifications API

---

### `c:\Users\ASUS\Projects\ebook-marketplace\src\lib\topic-slides.ts`
**هدف:** ساخت داده اسلایder موضوعات صفحه اصلی.

- `TopicSlide` type
- `buildTopicSlides` از categories + type counts
- تصاویر از `/public/slides`

**خروجی‌ها:** `TopicSlide` (type), `buildTopicSlides`

**استفاده‌شده در:** `page.tsx`, `TopicSlider`

---

### `c:\Users\ASUS\Projects\ebook-marketplace\src\lib\archive-import.ts`
**هدف:** واردات انبوه از Internet Archive.

- merge VERIFIED_ARCHIVE + ARCHIVE_CATALOG
- upsert categories، create authors
- tryOnlineImport از API archive.org

**خروجی‌ها:** `runArchiveImport`, `buildMergedCatalog`, `ArchiveCatalogEntry`, `ArchiveImportResult`

**استفاده‌شده در:** `prisma/import-archive.ts`, `api/admin/import-archive/route.ts`

---

## hooks/

### `c:\Users\ASUS\Projects\ebook-marketplace\src\hooks\useAppShellMode.ts`
**هدف:** hook React برای state حالت app shell.

- sync با matchMedia و Capacitor
- listen به change events

**خروجی‌ها:** `useAppShellMode`

**استفاده‌شده در:** `Navbar`

---

## app pages/

### `c:\Users\ASUS\Projects\ebook-marketplace\src\app\page.tsx`
**هدف:** صفحه اصلی — hero، اسلایدر موضوعات، بخش‌های محتوا.

- revalidate 60s
- fetch stats، recommendations، latest، topicSlides
- handle dbError banner

**خروجی‌ها:** `HomePage` (default export)

**استفاده از:** HomeHero, HomeSections, TopicSlider, ScrollReveal, lib/content, prisma, topic-slides

---

### `c:\Users\ASUS\Projects\ebook-marketplace\src\app\browse\page.tsx`
**هدف:** صفحه مرور و جستجوی محتوا.

- SSR initial data + BrowseSearch client
- Suspense + PersianLoader

**خروجی‌ها:** `BrowsePage`

**استفاده از:** BrowseSearch, getApprovedContents, prisma.category

---

### `c:\Users\ASUS\Projects\ebook-marketplace\src\app\dashboard\page.tsx`
**هدف:** پنل کاربری با ۶ tab.

- overview, saved, uploads, notifications, tickets, profile
- guard unauthenticated → login
- fetch profile/saved/uploads APIs

**خروجی‌ها:** `DashboardPage`

**استفاده از:** NotificationList, ProfileForm, TicketPanel, UserLists, useNotifications

---

### `c:\Users\ASUS\Projects\ebook-marketplace\src\app\admin\page.tsx`
**هدف:** پنل مدیر با ۵ tab.

- pending (content/review approve), stats, users, tickets, top users
- import archive button
- guard ADMIN role

**خروجی‌ها:** `AdminPage`

**استفاده از:** AdminStats, AdminUserList, AdminTopUsers, AdminTickets, AdminTabPanel

---

### `c:\Users\ASUS\Projects\ebook-marketplace\src\app\upload\page.tsx`
**هدف:** فرم آپلود PDF/صوتی.

- require login
- FormData POST `/api/upload`
- fetch categories

**خروجی‌ها:** `UploadPage`

---

### `c:\Users\ASUS\Projects\ebook-marketplace\src\app\download\page.tsx`
**هدف:** صفحه دانلود اپ (SSR metadata).

- pass props به DownloadClient
- metadata SEO

**خروجی‌ها:** `DownloadPage`

**استفاده از:** `lib/site`, `DownloadClient.tsx`

---

### `c:\Users\ASUS\Projects\ebook-marketplace\src\app\logo-preview\page.tsx`
**هدف:** پیش‌نمایش ۴ گزینه لوگو (A–D).

- grid با پس‌زمینه روشن/تیره
- صفحه داخلی/طراحی

**خروجی‌ها:** `LogoPreviewPage`

---

### `c:\Users\ASUS\Projects\ebook-marketplace\src\app\auth\login\page.tsx`
**هدف:** ورود با credentials.

- signIn next-auth redirect false
- callbackUrl از query
- reset success banner

**خروجی‌ها:** `LoginPage`, `LoginForm`

---

### `c:\Users\ASUS\Projects\ebook-marketplace\src\app\auth\register\page.tsx`
**هدف:** ثبت‌نام کاربر جدید.

- POST `/api/register`
- redirect به login

**خروجی‌ها:** `RegisterPage`

---

### `c:\Users\ASUS\Projects\ebook-marketplace\src\app\auth\forgot-password\page.tsx`
**هدف:** درخواست لینک بازیابی رمز.

- POST `/api/auth/forgot-password`
- نمایش devResetUrl در dev

**خروجی‌ها:** `ForgotPasswordPage`

---

### `c:\Users\ASUS\Projects\ebook-marketplace\src\app\auth\reset-password\page.tsx`
**هدف:** تنظیم رمز جدید با token.

- token از query param
- POST `/api/auth/reset-password`
- invalid token UI

**خروجی‌ها:** `ResetPasswordPage`, `ResetPasswordForm`

---

### `c:\Users\ASUS\Projects\ebook-marketplace\src\app\content\[id]\read\page.tsx`
**هدف:** صفحه مطالعه PDF.

- force-dynamic
- increment downloadCount
- PdfViewer + reviews + SaveButton

**خروجی‌ها:** `ReadPage`

---

### `c:\Users\ASUS\Projects\ebook-marketplace\src\app\content\[id]\listen\page.tsx`
**هدف:** صفحه پخش پادکست/صوتی.

- مشابه read با AudioPlayer
- فقط AUDIOBOOK

**خروجی‌ها:** `ListenPage`

---

## prisma/

### `c:\Users\ASUS\Projects\ebook-marketplace\prisma\schema.prisma`
**هدف:** schema دیتابیس PostgreSQL.

- مدل‌ها: User, Ticket, TicketMessage, PasswordResetToken, Category, Content, Review, SavedContent, Notification
- enumها: Role, ContentType, ContentStatus, NotificationType, TicketStatus
- output client به `src/generated/prisma`

**خروجی‌ها:** Prisma models (via generate)

**استفاده‌شده در:** همه lib/prisma consumers

---

### `c:\Users\ASUS\Projects\ebook-marketplace\prisma\seed.ts`
**هدف:** seed اولیه دیتابیس برای توسعه.

- ۶ category، admin/user/authors
- ۱۰ کتاب نمونه (PDF local + archive)
- reviews نمونه
- credentials: admin@marketplace.local / admin123

**خروجی‌ها:** script `main()` (CLI)

**استفاده‌شده در:** `npm run db:seed` (package.json)

---

### `c:\Users\ASUS\Projects\ebook-marketplace\prisma\import-archive.ts`
**هدف:** CLI واردات کتاب از Internet Archive.

- فراخوانی `runArchiveImport`
- bypass proxy سیستم

**خروجی‌ها:** script CLI

**استفاده‌شده در:** npm script import

---

### `c:\Users\ASUS\Projects\ebook-marketplace\prisma\data\verified-archive.ts`
**هدف:** کاتالوگ شناسه‌های تأییدشده archive.org.

- آرایه `VERIFIED_ARCHIVE` با identifier, title, creator, type, categorySlug
- کار آفلاین بدون API

**خروجی‌ها:** `VERIFIED_ARCHIVE`, `VerifiedArchiveItem`

**استفاده‌شده در:** `archive-import.ts`

---

### `c:\Users\ASUS\Projects\ebook-marketplace\prisma\data\archive-catalog.ts`
**هدف:** کاتalog گسترده‌تر archive (fallback).

- `ARCHIVE_CATALOG` با metadata اضافی pdf/audio
- merge در buildMergedCatalog

**خروجی‌ها:** `ARCHIVE_CATALOG`, `ArchiveCatalogItem`

**استفاده‌شده در:** `archive-import.ts`

---

## config/

### `c:\Users\ASUS\Projects\ebook-marketplace\next.config.ts`
**هدف:** پیکربندی Next.js.

- serverExternalPackages: prisma, bcryptjs
- optimizePackageImports lucide-react
- remotePatterns unsplash
- webpack alias canvas/encoding false

**خروجی‌ها:** default export NextConfig

---

### `c:\Users\ASUS\Projects\ebook-marketplace\capacitor.config.ts`
**هدف:** پیکربندی اپ موبایل Capacitor.

- appId: ir.khaneketab.app
- server URL به production (remote web app)
- SplashScreen و StatusBar plugins

**خروجی‌ها:** default CapacitorConfig

---

### `c:\Users\ASUS\Projects\ebook-marketplace\vercel.json`
**هدف:** تنظیمات deploy Vercel.

- buildCommand: prisma generate + next build --webpack
- framework nextjs
- region fra1 (فرانکfurt)

**خروجی‌ها:** JSON config

---

## خلاصه آماری

| بخش | تعداد فایل |
|-----|-----------|
| ui/ | 9 |
| layout/ | 12 |
| home/ | 3 |
| content/ | 8 |
| dashboard/ | 4 |
| admin/ | 11 |
| media/ | 2 |
| providers/ | 2 |
| lib/ | 16 |
| hooks/ | 1 |
| app pages/ | 13 |
| prisma/ | 5 |
| config/ | 3 |
| **جمع** | **89** (+ layout.tsx root که page نیست) |

**نکته:** `PageContainer` و `PaginatedContentGrid` در کدبیس فعلی import نشده‌اند — احتمالاً برای استفاده آینده یا refactor باقی مانده‌اند.

[REDACTED]
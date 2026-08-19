/**
 * Persian line-by-line code explainer for site docs
 */
import fs from "fs";
import path from "path";

const IMPORT_HINTS = {
  react: "وارد کردن React",
  "next/link": "لینک SPA بدون reload — Next.js Link",
  "next/navigation": "hookهای routing: useRouter, usePathname, useSearchParams",
  "next-auth/react": "احراز هویت client: useSession, signIn, signOut",
  "next/server": "NextResponse و ابزار server-side در API Route",
  "lucide-react": "آیکون‌های SVG",
  bcrypt: "هش و مقایسه رمز عبور",
  zod: "اعتبارسنجی schema",
  "@/lib/prisma": "کلاینت دیتابیس Prisma",
  "@/lib/auth": "auth(), requireAuth(), requireAdmin()",
  "@/lib/content": "توابع query محتوا",
  "@/lib/validators": "schemaهای Zod",
  "@/lib/utils": "cn(), formatDate, slugify",
  "@/lib/storage": "آپلود و URL فایل",
  "@/components/ui/Button": "دکمه استاندارد UI",
};

export function findUsages(root, relPath, exportNames = []) {
  const found = new Set();
  const importPath = relPath
    .replace(/^src\//, "@/")
    .replace(/\.tsx?$/, "");
  const baseName = path.basename(relPath, path.extname(relPath));

  function scanDir(dir) {
    if (!fs.existsSync(dir)) return;
    for (const name of fs.readdirSync(dir)) {
      const full = path.join(dir, name);
      const st = fs.statSync(full);
      if (st.isDirectory()) {
        if (name === "node_modules" || name === "generated" || name === "docs") continue;
        scanDir(full);
      } else if (/\.(tsx?|jsx?)$/.test(name)) {
        const text = fs.readFileSync(full, "utf8");
        const rel = path.relative(root, full).replace(/\\/g, "/");
        if (rel === relPath) continue;
        if (
          text.includes(importPath) ||
          text.includes(`/${baseName}"`) ||
          text.includes(`/${baseName}'`) ||
          exportNames.some((n) => text.includes(n))
        ) {
          found.add(rel);
        }
      }
    }
  }

  scanDir(path.join(root, "src"));
  return [...found].slice(0, 12);
}

function hintImport(line) {
  for (const [key, hint] of Object.entries(IMPORT_HINTS)) {
    if (line.includes(`"${key}"`) || line.includes(`'${key}'`)) return hint;
  }
  if (line.includes("@/components/")) return `import کامپوننت: ${line.match(/@\/components\/[^"']+/)?.[0] || ""}`;
  if (line.includes("@/lib/")) return `import منطق backend: ${line.match(/@\/lib\/[^"']+/)?.[0] || ""}`;
  return "وارد کردن وابستگی/module";
}

export function explainLine(line, num, ctx) {
  const t = line.trim();
  if (!t) return null;
  if (t.startsWith("//") || t.startsWith("*") || t.startsWith("/*")) return "کامنت توضیحی در کد";

  if (t === '"use client";' || t === "'use client';")
    return "Client Component — در مرورگر اجرا می‌شود؛ مجاز به useState، useEffect، onClick و fetch";

  if (t.startsWith("import type "))
    return "import فقط type (TypeScript) — در runtime حذف می‌شود";
  if (t.startsWith("import ")) return hintImport(t);

  if (t.startsWith("export type ") || t.startsWith("type "))
    return "تعریف type TypeScript — شکل داده props یا object";
  if (t.startsWith("interface "))
    return "تعریف interface — قرارداد ساختار object";

  if (t.includes("export async function GET"))
    return "Handler API — متد GET: خواندن داده، query params از request.url";
  if (t.includes("export async function POST"))
    return "Handler API — متد POST: ایجاد/ارسال — body از request.json() یا formData";
  if (t.includes("export async function PATCH"))
    return "Handler API — متد PATCH: به‌روزرسانی جزئی رکورد";
  if (t.includes("export async function DELETE"))
    return "Handler API — متد DELETE: حذف رکورد";
  if (t.includes("export const { handlers"))
    return "export handlerهای NextAuth — GET/POST برای login/logout/session";
  if (t.startsWith("export function") || t.startsWith("export const"))
    return "export — این symbol از فایل بیرون داده می‌شود تا جاهای دیگر import شود";
  if (t.startsWith("export default"))
    return "export default — export اصلی فایل (مثلاً page یا config)";

  if (t.includes("NextResponse.json"))
    return "پاسخ JSON به client — status code و body";
  if (t.includes("safeParse")) return "اعتبارسنجی Zod — اگر invalid → 400";
  if (t.includes("requireAuth") || t.includes("await auth()"))
    return "بررسی login — بدون session → 401";
  if (t.includes("requireAdmin") || t.includes('role !== "ADMIN"'))
    return "فقط مدیر — کاربر عادی → 403";
  if (t.includes("prisma."))
    return `Query Prisma به PostgreSQL: ${t.match(/prisma\.\w+/)?.[0] || "prisma"}`;
  if (t.includes("bcrypt.hash")) return "هش کردن رمز قبل از ذخیره در DB";
  if (t.includes("bcrypt.compare")) return "مقایسه رمز واردشده با hash DB";
  if (t.includes("FormData") || t.includes("formData"))
    return "FormData — آپلود فایل multipart";
  if (t.includes("request.json()")) return "خواندن body JSON از درخواست client";
  if (t.includes("searchParams")) return "خواندن query string از URL (?page=1&q=...)";

  if (t.includes("useState")) return "state محلی React — با setState UI عوض می‌شود";
  if (t.includes("useEffect")) return "side effect — بعد از render (fetch، subscribe)";
  if (t.includes("useSession")) return "وضعیت login از NextAuth — session/user/loading";
  if (t.includes("useRouter")) return "ناوبری programmatic — router.push()";
  if (t.includes("usePathname")) return "مسیر URL فعلی — برای highlight منو";
  if (t.includes("useSearchParams")) return "query params URL — ?tab=profile";
  if (t.includes("useCallback")) return "memoize function — جلوگیری از re-render بی‌دلیل";
  if (t.includes("useMemo")) return "memoize مقدار محاسباتی";
  if (t.includes("useRef")) return "ref — مقدار بدون trigger render";
  if (t.includes("forwardRef")) return "forward ref به DOM برای focus/accessibility";

  if (t.includes("fetch("))
    return "درخواست HTTP به API backend — await response.json()";
  if (t.startsWith("return (") || t === "return (")
    return "شروع return JSX — UI که render می‌شود";
  if (t.startsWith("<") && t.endsWith(">")) return "تگ JSX — element رابط کاربری";
  if (t.includes("className=")) return "کلاس Tailwind CSS برای استایل";
  if (t.includes("onClick=")) return "handler کلیک کاربر";
  if (t.includes("disabled=")) return "غیرفعال کردن دکمه/input";
  if (t.includes("try {") || t === "try {") return "شروع try — خطا گرفته می‌شود";
  if (t.includes("catch")) return "catch — برگرداندن خطای 500 یا پیام فارسی";
  if (t.includes("if (!") || t.includes("if (")) return "شرط — شاخه‌بندی منطق";
  if (t.includes("await ")) return "منتظر Promise (DB، fetch، async)";
  if (t.includes("return null")) return "چیزی render نمی‌شود — مخفی";
  if (t.startsWith("}") || t === "};") return "بستن block کد";

  if (ctx.isApi && t.includes("status:")) return "HTTP status code پاسخ";
  if (ctx.isLib && t.includes("export")) return "تابع/متغیر export شده برای کل پروژه";

  return "ادامه منطق برنامه — جزئیات در block بالا/پایین";
}

export function getFileMeta(relPath) {
  const p = relPath.replace(/\\/g, "/");
  if (p.includes("/api/") && p.endsWith("route.ts")) {
    const route = p.replace("src/app/api", "/api").replace("/route.ts", "");
    return {
      kind: "api",
      route,
      why: "Backend endpoint — bridge بین frontend و database/business logic",
      how: `Next.js App Router: فایل route.ts در src/app/api${route.replace("/api", "")}/ — export تابع GET/POST/...`,
    };
  }
  if (p.includes("/components/")) {
    const folder = p.split("/components/")[1]?.split("/")[0] || "ui";
    const purposes = {
      ui: "قطعه پایه UI قابل استفاده مجدد",
      layout: "اسکلت و ناوبری کل سایت",
      home: "بخش‌های صفحه اصلی",
      content: "نمایش و تعامل با کتاب/پادکست",
      dashboard: "پنل کاربر",
      admin: "پنل مدیر",
      media: "PDF و پخش صوت",
      providers: "Context/React Provider",
    };
    return {
      kind: "component",
      folder,
      why: purposes[folder] || "کامپوننت React",
      how: "فایل .tsx — export function Component — import در page یا component دیگر",
    };
  }
  if (p.includes("/lib/")) {
    return {
      kind: "lib",
      why: "منطق backend مشترک — auth، DB، storage، validation",
      how: "ماژول TypeScript — import در API routes و Server Components",
    };
  }
  if (p.includes("prisma/")) {
    return {
      kind: "database",
      why: "تعریف schema، seed، import داده",
      how: "Prisma CLI — migrate, generate, seed",
    };
  }
  if (p.includes("/app/") && p.endsWith("page.tsx")) {
    const route = p.replace("src/app", "").replace("/page.tsx", "") || "/";
    return {
      kind: "page",
      route,
      why: "صفحه UI — یک URL در سایت",
      how: "Server Component — fetch data → render components",
    };
  }
  return { kind: "other", why: "بخش پروژه", how: "" };
}

export function explainSourceFile(root, relPath, content) {
  const meta = getFileMeta(relPath);
  const lines = content.split("\n");
  const exports = [];
  const exportRe = /export (?:async )?(?:function|const) (\w+)/g;
  let m;
  while ((m = exportRe.exec(content))) exports.push(m[1]);
  if (content.includes("export default")) exports.push("default");

  const usages = findUsages(root, relPath, exports);
  const baseName = path.basename(relPath);

  let body = `## این فایل چیست؟
**مسیر:** \`${relPath}\`
**نوع:** ${meta.kind}
${meta.route ? `**URL/API:** \`${meta.route}\`\n` : ""}${meta.folder ? `**پوشه:** ${meta.folder}/\n` : ""}
**چرا وجود دارد؟** ${meta.why}
**چطور ساخته شده؟** ${meta.how}

## کاربرد در پروژه
${exports.length ? `**Exportها:** ${exports.map((e) => `\`${e}\``).join(", ")}` : "—"}
${usages.length ? `**استفاده شده در:**\n${usages.map((u) => `- \`${u}\``).join("\n")}` : "**استفاده:** import مستقیم در page/API یا کامپوننت parent"}

`;

  if (meta.kind === "api") {
    body += `## API چطور کار می‌کند؟ (Next.js App Router)
1. مرورگر \`fetch('${meta.route}')\` می‌زند
2. Next.js فایل \`${relPath}\` را پیدا می‌کند
3. تابع GET/POST/... اجرا می‌شود
4. auth/validation → prisma/lib → NextResponse.json
5. JSON به client برمی‌گردد

`;
  }

  if (meta.kind === "lib" && relPath.includes("prisma")) {
    body += `## ارتباط با PostgreSQL
- env \`DATABASE_URL\` — connection string Neon
- Prisma Client — type-safe queries
- \`withPrismaRetry\` — retry روی قطع connection

`;
  }

  body += `## توضیح خط‌به‌خط (${lines.length} خط)\n\n`;

  const ctx = {
    isApi: meta.kind === "api",
    isComponent: meta.kind === "component",
    isLib: meta.kind === "lib",
    relPath,
  };

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const exp = explainLine(raw, i + 1, ctx);
    if (!exp) continue;
    const code = raw.trim().slice(0, 120) + (raw.trim().length > 120 ? "…" : "");
    body += `- **خط ${i + 1}:** \`${code.replace(/`/g, "'")}\`\n  → ${exp}\n`;
  }

  return body;
}

export function categoryForPath(relPath) {
  const p = relPath.replace(/\\/g, "/");
  if (p.includes("/api/")) return "api";
  if (p.includes("/components/docs/")) return "frontend";
  if (p.includes("/components/")) return "frontend";
  if (p.includes("/lib/")) return "backend";
  if (p.includes("prisma/")) return "database";
  if (p.includes("/app/") && p.endsWith("page.tsx")) return "pages";
  if (p.endsWith(".config.ts") || p === "vercel.json") return "config";
  return "backend";
}

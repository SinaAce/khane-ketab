export type DocCategory =
  | "concepts"
  | "frontend"
  | "backend"
  | "api"
  | "database"
  | "pages"
  | "config"
  | "flows";

export const CATEGORY_LABELS: Record<DocCategory, string> = {
  concepts: "مفاهیم پایه (از صفر)",
  frontend: "فرانت‌اند — کامپوننت‌ها",
  backend: "بک‌اند — lib",
  api: "API — ۳۶ endpoint",
  database: "دیتابیس — Prisma",
  pages: "صفحات app",
  config: "تنظیمات پروژه",
  flows: "جریان کار (Flow)",
};

export type DocEntry = {
  id: string;
  category: DocCategory;
  title: string;
  filePath?: string;
  keywords: string[];
  body: string;
};

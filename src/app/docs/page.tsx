import type { Metadata } from "next";
import { DocsApp } from "@/components/docs/DocsApp";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: `راهنمای پروژه | ${SITE_NAME}`,
  description:
    "آموزش کامل فرانت‌اند، بک‌اند، API و دیتابیس پروژه خانه کتاب — با جستجوی سریع",
};

export default function DocsPage() {
  return <DocsApp />;
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Apple, Download, ExternalLink, Smartphone, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SiteLogo } from "@/components/layout/SiteLogo";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type DownloadClientProps = {
  siteName: string;
  siteSlogan: string;
  siteUrl: string;
  androidApkUrl: string;
  iosInstallUrl: string;
  pwaInstallUrl: string;
};

export function DownloadClient({
  siteName,
  siteSlogan,
  siteUrl,
  androidApkUrl,
}: DownloadClientProps) {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in window.navigator && (window.navigator as Navigator & { standalone?: boolean }).standalone);
    setInstalled(Boolean(standalone));
    setIsIos(/iphone|ipad|ipod/i.test(window.navigator.userAgent));

    function onBeforeInstall(event: Event) {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  async function installPwa() {
    if (!installEvent) return;
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    if (choice.outcome === "accepted") {
      setInstalled(true);
      setInstallEvent(null);
    }
  }

  return (
    <div className="page-shell mx-auto max-w-3xl py-8 sm:py-12">
      <div className="mb-8 text-center">
        <SiteLogo size={72} className="mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-teal-brand sm:text-3xl">دانلود اپ {siteName}</h1>
        <p className="mt-2 text-sm text-muted">{siteSlogan}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card id="android" className="persian-section relative overflow-hidden p-5">
          <div className="mb-3 inline-flex rounded-xl bg-teal-brand/10 p-2.5 text-teal-brand">
            <Smartphone size={22} />
          </div>
          <h2 className="text-lg font-bold text-foreground">اندروید</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            فایل APK را دانلود و نصب کنید. اگر پیام «منبع ناشناس» آمد، اجازه نصب از مرورگر را بدهید.
          </p>
          <div className="mt-4 flex flex-col gap-2">
            <a href={androidApkUrl} download>
              <Button className="w-full">
                <Download size={18} className="ml-1" />
                دانلود APK اندروید
              </Button>
            </a>
            <p className="text-xs text-muted">نسخه وب: {siteUrl}</p>
          </div>
        </Card>

        <Card id="ios" className="persian-section relative overflow-hidden p-5">
          <div className="mb-3 inline-flex rounded-xl bg-gold-brand/15 p-2.5 text-gold-brand">
            <Apple size={22} />
          </div>
          <h2 className="text-lg font-bold text-foreground">iPhone / iPad</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            در Safari دکمه Share را بزنید و «Add to Home Screen» / «افزودن به صفحه Home» را انتخاب کنید.
          </p>
          <ol className="mt-4 space-y-2 text-sm text-muted">
            <li>۱. Safari را باز کنید و به {siteUrl} بروید</li>
            <li>۲. Share → Add to Home Screen</li>
            <li>۳. Add را بزنید</li>
          </ol>
          {isIos && (
            <p className="mt-3 rounded-xl bg-teal-brand/10 px-3 py-2 text-xs text-teal-brand">
              شما iOS دارید — مراحل بالا را در Safari انجام دهید.
            </p>
          )}
        </Card>
      </div>

      <Card id="pwa" className="mt-4 p-5">
        <div className="flex items-start gap-3">
          <div className="inline-flex rounded-xl bg-teal-brand/10 p-2.5 text-teal-brand">
            <Sparkles size={22} />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-foreground">نصب سریع (PWA)</h2>
            <p className="mt-1 text-sm text-muted">
              بدون استور، مثل اپ روی گوشی نصب می‌شود — با نوار پایین و طراحی ایرانی.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {installed ? (
                <p className="text-sm text-emerald-700 dark:text-emerald-300">اپ روی دستگاه شما نصب است.</p>
              ) : installEvent ? (
                <Button onClick={() => void installPwa()}>
                  <Download size={18} className="ml-1" />
                  نصب اپ
                </Button>
              ) : (
                <p className="text-sm text-muted">
                  در Chrome/Edge اندروید یا دسکتاپ دکمه «نصب» مرورگر را بزنید، یا از APK استفاده کنید.
                </p>
              )}
              <Link href="/">
                <Button variant="secondary">
                  <ExternalLink size={16} className="ml-1" />
                  ورود به سایت
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Card>

      <p className="mt-6 text-center text-xs text-muted">
        برای انتشار در Google Play و App Store نیاز به حساب توسعه‌دهنده و بررسی استور است.
      </p>
    </div>
  );
}

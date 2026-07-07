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
};

export function DownloadClient({ siteName, siteSlogan, siteUrl, androidApkUrl }: DownloadClientProps) {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [apkAvailable, setApkAvailable] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in window.navigator &&
        (window.navigator as Navigator & { standalone?: boolean }).standalone);
    setInstalled(Boolean(standalone));
    setIsIos(/iphone|ipad|ipod/i.test(window.navigator.userAgent));
    setIsAndroid(/android/i.test(window.navigator.userAgent));

    fetch(androidApkUrl, { method: "HEAD" })
      .then((response) => setApkAvailable(response.ok))
      .catch(() => setApkAvailable(false));

    function onBeforeInstall(event: Event) {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    }

    function onInstalled() {
      setInstalled(true);
      setInstallEvent(null);
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, [androidApkUrl]);

  async function installPwa() {
    if (!installEvent) return;
    setInstalling(true);
    try {
      await installEvent.prompt();
      const choice = await installEvent.userChoice;
      if (choice.outcome === "accepted") {
        setInstalled(true);
        setInstallEvent(null);
      }
    } finally {
      setInstalling(false);
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
            در Chrome اندروید دکمه «نصب اپ» را بزنید. اگر APK آماده باشد، می‌توانید فایل را مستقیم دانلود کنید.
          </p>

          <div className="mt-4 flex flex-col gap-2">
            {installed ? (
              <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                اپ روی دستگاه شما نصب است.
              </p>
            ) : installEvent ? (
              <Button className="w-full" onClick={() => void installPwa()} disabled={installing}>
                <Download size={18} className="ml-1" />
                {installing ? "در حال نصب..." : "نصب اپ اندروید"}
              </Button>
            ) : isAndroid ? (
              <div className="rounded-xl bg-teal-brand/10 px-3 py-3 text-sm text-teal-brand">
                منوی Chrome (⋮) → «Install app» / «نصب برنامه» → Install
              </div>
            ) : (
              <p className="text-sm text-muted">برای نصب، این صفحه را در Chrome اندروید باز کنید.</p>
            )}

            {apkAvailable ? (
              <a href={androidApkUrl} download="khane-ketab.apk">
                <Button variant="secondary" className="w-full">
                  <Download size={18} className="ml-1" />
                  دانلود APK
                </Button>
              </a>
            ) : (
              <p className="text-xs text-muted">فایل APK هنوز روی سرور قرار نگرفته — فعلاً از «نصب اپ» استفاده کنید.</p>
            )}
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
            <p className="mt-1 text-sm text-muted">بدون استور، مثل اپ روی گوشی نصب می‌شود — با نوار پایین و طراحی ایرانی.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {!installed && installEvent && (
                <Button onClick={() => void installPwa()} disabled={installing}>
                  <Download size={18} className="ml-1" />
                  {installing ? "در حال نصب..." : "نصب اپ"}
                </Button>
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
    </div>
  );
}

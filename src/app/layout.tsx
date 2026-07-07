import type { Metadata, Viewport } from "next";
import { Vazirmatn } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import { AppShellScript } from "@/components/layout/AppShellScript";
import { BackToTop } from "@/components/layout/BackToTop";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNavShell } from "@/components/layout/MobileBottomNavShell";
import { Navbar } from "@/components/layout/Navbar";
import { PageEntrance } from "@/components/layout/PageEntrance";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import "./globals.css";
import { SITE_NAME, SITE_SLOGAN, SITE_URL } from "@/lib/site";

const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  variable: "--font-vazirmatn",
});

export const metadata: Metadata = {
  title: `${SITE_NAME} | ${SITE_SLOGAN}`,
  description: SITE_SLOGAN,
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: SITE_NAME,
  },
  applicationName: SITE_NAME,
  formatDetection: { telephone: false },
  openGraph: {
    title: SITE_NAME,
    description: SITE_SLOGAN,
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "fa_IR",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0d7377" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0908" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" className={`${vazirmatn.variable} h-full`} data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <AppShellScript />
        <link rel="icon" href="/favicon.png" type="image/png" sizes="48x48" />
        <link rel="shortcut icon" href="/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-icon.png" sizes="180x180" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="min-h-full flex flex-col bg-background font-sans text-foreground antialiased">
        <ThemeProvider>
          <NextTopLoader
            color="#c9a227"
            height={3}
            showSpinner={false}
            crawlSpeed={200}
            easing="ease"
            shadow="0 0 10px #c9a227,0 0 5px #0d7377"
          />
          <AuthProvider>
            <Navbar />
            <main className="flex-1">
              <PageEntrance>{children}</PageEntrance>
            </main>
            <Footer />
            <MobileBottomNavShell />
            <BackToTop />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

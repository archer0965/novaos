import type { Metadata, Viewport } from "next";
import dynamic from "next/dynamic";
import { Outfit } from "next/font/google";
import { PwaInstallProvider } from "@/components/pwa-install-provider";
import { PwaInstallPrompt } from "@/components/pwa-install-prompt";
import { PwaRegister } from "@/components/pwa-register";
import { VisitTracker } from "@/components/visit-tracker";
import { PRODUCTION_URL } from "@/lib/site";
import "./globals.css";

/**
 * Only load a light Latin display face from Google Fonts.
 * Traditional Chinese uses system fonts (PingFang / Microsoft JhengHei) —
 * avoids multi‑MB Noto Sans TC download on mobile.
 */
const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});

const Toaster = dynamic(
  () => import("@/components/ui/sonner").then((m) => m.Toaster),
  { ssr: false }
);

const siteTitle = "拓新雲端 NovaOS｜美業與微型賣家營運中台";
const siteDescription =
  "拓脈預約、NovaStore 賣場對帳、Nova AI Doc、拓管訂閱——四大模組一站整合。現場付／手動轉帳，同業推薦現折。";
const twitterDescription =
  "拓新雲端 NovaOS：預約 · 賣場 · AI 文件 · 訂閱對帳，企業級微型營運中台。";

export const metadata: Metadata = {
  metadataBase: new URL(PRODUCTION_URL),
  title: {
    default: siteTitle,
    template: "%s｜拓新雲端 NovaOS",
  },
  description: siteDescription,
  applicationName: "NovaOS",
  manifest: "/manifest.json",
  keywords: [
    "NovaOS",
    "拓新雲端",
    "拓脈預約",
    "NovaStore",
    "美業預約",
    "自動對帳",
    "代購",
    "團購",
  ],
  authors: [{ name: "拓新雲端 NovaOS" }],
  creator: "拓新雲端 NovaOS",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "zh_TW",
    url: PRODUCTION_URL,
    siteName: "拓新雲端 NovaOS",
    title: siteTitle,
    description: siteDescription,
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "拓新雲端 NovaOS",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: twitterDescription,
    images: ["/og-image.jpg"],
  },
  appleWebApp: {
    capable: true,
    title: "NovaOS",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/pwa-icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/pwa-icon-512.png", sizes: "512x512", type: "image/png" },
      { url: "/pwa-icon.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: [{ url: "/favicon-32.png", sizes: "32x32", type: "image/png" }],
    apple: [
      {
        url: "/pwa-apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-title": "NovaStore",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0B132B" },
    { media: "(prefers-color-scheme: dark)", color: "#0B132B" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant" className={outfit.variable}>
      <head>
        <link rel="dns-prefetch" href="https://api.line.me" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/pwa-apple-touch-icon.png" />
        <link
          rel="icon"
          type="image/png"
          sizes="192x192"
          href="/pwa-icon-192.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="512x512"
          href="/pwa-icon-512.png"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="NovaStore" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#0B132B" />
        {/* Critical paint: match manifest splash before CSS arrives */}
        <style
          dangerouslySetInnerHTML={{
            __html:
              "html,body{background-color:#0B132B}body{margin:0;min-height:100dvh}",
          }}
        />
        {process.env.NEXT_PUBLIC_SUPABASE_URL ? (
          <link
            rel="preconnect"
            href={process.env.NEXT_PUBLIC_SUPABASE_URL}
            crossOrigin="anonymous"
          />
        ) : null}
      </head>
      <body className="font-sans antialiased">
        <PwaInstallProvider>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
          >
            跳到主要內容
          </a>
          {children}
          <VisitTracker />
          <PwaRegister />
          <PwaInstallPrompt />
          <Toaster
            richColors
            position="top-center"
            closeButton
            duration={2800}
          />
        </PwaInstallProvider>
      </body>
    </html>
  );
}

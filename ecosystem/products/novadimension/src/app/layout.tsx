import type { Metadata, Viewport } from "next";
import { Noto_Sans_TC, Outfit } from "next/font/google";
import SkipLink from "@/components/SkipLink";
import JsonLd from "@/components/JsonLd";
import VisitTracker from "@/components/VisitTracker";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_URL,
} from "@/lib/site";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const notoSansTC = Noto_Sans_TC({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME}｜AI 軟裝空間改造`,
    template: `%s｜${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "拓維空間",
    "NovaDimension",
    "拓新雲端",
    "AI 軟裝",
    "空間改造",
    "動線分析",
    "採光分析",
    "3D 擬真圖",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [{ url: "/favicon.png", type: "image/png" }],
    apple: [{ url: "/logo-icon.png" }],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    locale: "zh_TW",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_TAGLINE,
    images: [
      {
        url: "/hero.jpg",
        width: 1920,
        height: 1080,
        alt: "拓維空間軟裝擬真",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_TAGLINE,
    images: ["/hero.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
  category: "design",
};

export const viewport: Viewport = {
  themeColor: "#fdfbf7",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="zh-Hant"
      className={`${outfit.variable} ${notoSansTC.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans text-ink">
        <SkipLink />
        <JsonLd />
        <VisitTracker />
        {children}
      </body>
    </html>
  );
}

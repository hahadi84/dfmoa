import type { Metadata } from "next";
import { IBM_Plex_Mono, Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import { GoogleAnalytics } from "@/components/google-analytics";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { absoluteSiteUrl, DEFAULT_OG_IMAGE } from "@/lib/seo-metadata";

const ADSENSE_PUBLISHER_ID = "ca-pub-9602089494397808";
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

const notoSansKr = Noto_Sans_KR({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://dfmoa.netlify.app"),
  title: {
    default: "면세모아 | 면세가 모이는 곳",
    template: "%s | 면세모아",
  },
  description:
    "롯데, 현대, 신라, 신세계면세점 공개가와 국내 판매가를 한 화면에서 비교하고 할인·적립금 이벤트 조건을 분리해 안내합니다.",
  keywords: ["면세모아", "면세점 가격 비교", "공항면세점", "면세가", "국내가 비교", "DFMOA"],
  openGraph: {
    title: "면세모아 | 면세가 모이는 곳",
    description: "공항면세점 공개가와 국내 판매가를 한 번에 비교합니다.",
    url: "https://dfmoa.netlify.app",
    siteName: "면세모아 DFMOA",
    images: [{ url: absoluteSiteUrl(DEFAULT_OG_IMAGE), width: 1200, height: 630, alt: "면세모아 DFMOA" }],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "면세모아 | 면세가 모이는 곳",
    description: "공항면세점 공개가와 국내 판매가를 한 번에 비교합니다.",
    images: [absoluteSiteUrl(DEFAULT_OG_IMAGE)],
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  verification: {
    other: {
      "naver-site-verification": "d68acd4c4ba107da4c92dd5e55d0d3c8dcedbddd",
    },
  },
  other: {
    "google-adsense-account": ADSENSE_PUBLISHER_ID,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${notoSansKr.variable} ${plexMono.variable}`}>
      <head>
        <script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_PUBLISHER_ID}`}
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <GoogleAnalytics measurementId={GA_MEASUREMENT_ID} />
        <div className="site-shell">
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}

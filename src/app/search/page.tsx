import { Suspense } from "react";
import type { Metadata } from "next";
import { SearchPageClient } from "@/components/search-page-client";

export const metadata: Metadata = {
  title: "면세가 비교",
  description: "공항면세점 공개가와 국내 판매가를 검색어 기준으로 비교합니다.",
  robots: {
    index: false,
    follow: true,
    googleBot: {
      index: false,
      follow: true,
    },
  },
};

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchPageClient />
    </Suspense>
  );
}

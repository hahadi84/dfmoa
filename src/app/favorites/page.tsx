import type { Metadata } from "next";
import Link from "@/components/app-link";
import { FavoritesPageClient } from "@/components/favorites-page-client";
import { products } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "관심상품",
  description: "로그인 없이 저장한 관심상품의 공개가 상태, 가격 기준 시각, 예상 실결제가 계산 진입점을 확인합니다.",
  alternates: {
    canonical: "/favorites",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function FavoritesPage() {
  return (
    <section className="page-section is-tight">
      <div className="container">
        <div className="breadcrumb">
          <Link href="/">홈</Link>
          <span>/</span>
          <span>관심상품</span>
        </div>
        <FavoritesPageClient popularProducts={products.slice(0, 12)} />
      </div>
    </section>
  );
}

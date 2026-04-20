import type { Metadata } from "next";
import Link from "@/components/app-link";
import { categories } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "인기 카테고리",
  description: "공항면세점 인기 카테고리 전체 목록입니다.",
  alternates: {
    canonical: "/category",
  },
};

export default function CategoryIndexPage() {
  return (
    <section className="page-section is-tight">
      <div className="container">
        <div className="breadcrumb">
          <Link href="/">홈</Link>
          <span>/</span>
          <span>카테고리</span>
        </div>

        <span className="eyebrow" style={{ marginTop: 24 }}>
          Categories
        </span>
        <h1 className="page-title">인기 카테고리</h1>
        <p className="page-description">비교하기 좋은 면세점 카테고리 10개를 한 번에 봅니다.</p>

        <div className="cards-grid category-index-grid" style={{ marginTop: 14 }}>
          {categories.map((category) => (
            <Link key={category.slug} href={`/category/${category.slug}`} className="store-card category-card">
              <span className="chip is-soft">{category.name}</span>
              <div className="store-meta">
                <div className="store-name-row">
                  <h2 className="card-title">{category.headline}</h2>
                  <span className="text-link">보기</span>
                </div>
                <p className="section-copy">{category.intro}</p>
              </div>
              <div className="chip-row">
                {category.keywords.slice(0, 3).map((keyword) => (
                  <span key={keyword} className="chip is-soft">
                    {keyword}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

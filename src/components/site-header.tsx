"use client";

import { usePathname } from "next/navigation";
import Link from "@/components/app-link";

export function SiteHeader() {
  const path = usePathname();
  if (path === "/en" || path.startsWith("/en/")) return <header className="topbar" lang="en"><div className="container topbar-inner"><Link className="brand" href="/en"><span className="brand-mark">DF</span><span className="brand-copy"><strong>DFMOA</strong><span>Korea duty-free comparison</span></span></Link><nav className="topnav" aria-label="Main navigation"><Link href="/en">Compare products</Link><Link href="/en/guide/incheon-duty-free-pickup">Airport pickup</Link><Link href="/en/compare">Duty free vs tax refund</Link><Link href="/" lang="ko">한국어</Link></nav></div></header>;

  return (
    <header className="topbar">
      <div className="container topbar-inner">
        <Link className="brand" href="/">
          <span className="brand-mark">DF</span>
          <span className="brand-copy">
            <strong>면세모아</strong>
            <span>DFMOA</span>
          </span>
        </Link>

        <nav className="topnav" aria-label="주요 메뉴">
          <Link href="/price-compare">가격 비교하기</Link>
          <Link href="/methodology">비교 기준</Link>
          <Link href="/category">카테고리</Link>
          <Link href="/favorites">관심상품</Link>
          <Link href="/brand">브랜드</Link>
          <Link href="/deals">월간 혜택</Link>
          <Link href="/japan">일본 여행·엔화</Link>
          <Link href="/airport">공항 가이드</Link>
          <Link href="/benefit-reports">리포트</Link>
          <Link href="/en" lang="en">English</Link>
        </nav>
      </div>
    </header>
  );
}

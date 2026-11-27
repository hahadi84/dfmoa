"use client";
import { AirportNavigation } from "@/components/airport-navigation";

import { BrandMark } from "@/components/brand-mark";

import { usePathname } from "next/navigation";
import { TravelerHeader, LanguageLinks } from "@/components/traveler-chrome";
import Link from "@/components/app-link";

export function SiteHeader() {
  const path = usePathname();
  if (path === "/ja" || path.startsWith("/ja/")) return <TravelerHeader locale="ja" path={path}/>;
  if (path === "/zh" || path.startsWith("/zh/")) return <TravelerHeader locale="zh" path={path}/>;
  if (path === "/en" || path.startsWith("/en/")) return <header className="topbar" lang="en"><div className="container topbar-inner"><Link className="brand" href="/en"><BrandMark/><span className="brand-copy"><strong>DFMOA</strong><span>Korea duty-free comparison</span></span></Link><AirportNavigation label="Main navigation" menuLabel="Menu"><Link href="/en/guide/korea-duty-free-shopping-list">What to buy in Korea</Link><Link href="/en">Shopping home</Link><Link href="/en/guide/incheon-duty-free-pickup">Airport pickup</Link><Link href="/en/compare">Duty free vs tax refund</Link><LanguageLinks path={path}/></AirportNavigation></div></header>;

  return (
    <header className="topbar korean-header">
      <div className="container topbar-inner">
        <Link className="brand" href="/">
          <BrandMark/>
          <span className="brand-copy">
            <strong>면세모아</strong>
            <span>DFMOA</span>
          </span>
        </Link>

        <Link className="header-compare" href="/price-compare">가격 비교</Link>
        <AirportNavigation label="주요 메뉴" menuLabel="메뉴">
          <Link href="/category">카테고리</Link>
          <Link href="/brand">브랜드</Link>
          <Link href="/benefits">할인·적립금</Link>
          <Link href="/japan">일본 여행·엔화</Link>
          <Link href="/airport">공항 가이드</Link>
          <Link href="/favorites">관심상품</Link>
          <details className="header-group" name="ko-header-group">
            <summary>더보기</summary>
            <div><Link href="/methodology">비교 기준</Link><Link href="/benefit-reports">리포트</Link></div>
          </details>
        </AirportNavigation>
        <nav className="header-languages" aria-label="언어 선택">
          <Link href="/en" lang="en">English</Link>
          <Link href="/ja" lang="ja">日本語</Link>
          <Link href="/zh" lang="zh-Hans">简体中文</Link>
        </nav>
      </div>
    </header>
  );
}

import Link from "@/components/app-link";

export function SiteHeader() {
  return (
    <header className="topbar">
      <div className="container topbar-inner">
        <Link className="brand" href="/" aria-label="면세모아 홈">
          <span className="brand-mark">DF</span>
          <span className="brand-copy">
            <strong>면세모아</strong>
            <span>DFMOA</span>
          </span>
        </Link>

        <nav className="topnav" aria-label="주요 메뉴">
          <Link href="/search">가격 비교하기</Link>
          <Link href="/category">카테고리</Link>
          <Link href="/favorites">관심상품</Link>
          <Link href="/brand">브랜드</Link>
          <Link href="/deals">월간 혜택</Link>
          <Link href="/airport">공항 가이드</Link>
          <Link href="/benefit-reports">리포트</Link>
        </nav>
      </div>
    </header>
  );
}

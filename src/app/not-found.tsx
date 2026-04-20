import Link from "@/components/app-link";

export default function NotFound() {
  return (
    <section className="page-section">
      <div className="container">
        <div className="surface-card">
          <span className="eyebrow">404</span>
          <h1 className="page-title" style={{ marginTop: 18 }}>
            요청한 페이지를 찾을 수 없습니다
          </h1>
          <p className="page-description">
            주소가 바뀌었거나 아직 생성되지 않은 페이지일 수 있습니다. 홈으로 돌아가 검색을 다시
            시작해 보세요.
          </p>
          <div className="hero-actions" style={{ marginTop: 24 }}>
            <Link href="/" className="button">
              홈으로 이동
            </Link>
            <Link href="/search" className="ghost-button">
              검색 페이지
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

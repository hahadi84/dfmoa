import Link from "@/components/app-link";
import { NewsletterSignupForm } from "@/components/newsletter-signup-form";
import { AFFILIATE_DISCLOSURE_TEXT } from "@/lib/affiliate";
import { SITE_OPERATOR } from "@/lib/site-operator";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <p className="footer-brand">면세모아 DFMOA</p>
          <p className="footer-copy">
            최근 확인 가능한 공개가, 공식 링크, 혜택 조건을 함께 정리해 내 조건 기준 예상 실결제가 비교를 돕습니다.
          </p>
          <p className="footer-copy">
            DFMOA는 각 면세점의 공식 운영 사이트가 아니며, 별도 표시가 없는 한 각 면세점과 제휴 관계가 없습니다.
            최종 가격과 구매 조건은 각 면세점 원본 페이지에서 확인해 주세요.
          </p>
          <p className="footer-copy">{AFFILIATE_DISCLOSURE_TEXT}</p>
          <div className="footer-operator-block" aria-label="운영자 정보">
            <p>운영자: {SITE_OPERATOR.name}</p>
            <p>
              문의: <a href={`mailto:${SITE_OPERATOR.email}`}>{SITE_OPERATOR.email}</a>
            </p>
            <p>DFMOA는 개인이 비영리 목적으로 운영하는 정보 제공 서비스이며, 면세점과 제휴 관계가 없습니다.</p>
          </div>
          <div style={{ marginTop: 12 }}>
            <NewsletterSignupForm source="footer" compact />
          </div>
        </div>

        <div className="footer-links">
          <Link href="/about">서비스 소개</Link>
          <Link href="/favorites">관심상품</Link>
          <Link href="/brand">브랜드</Link>
          <Link href="/airport">공항 가이드</Link>
          <Link href="/deals">월간 혜택</Link>
          <Link href="/best-seller-examples">면세점별 베스트 추천 예시 →</Link>
          <Link href="/benefit-reports">주간 리포트</Link>
          <Link href="/feed.xml">RSS</Link>
        </div>

        <div className="footer-links">
          <Link href="/privacy">개인정보처리방침</Link>
          <Link href="/terms">이용약관</Link>
          <Link href="/editorial-policy">콘텐츠 운영정책</Link>
          <Link href="/data-source-policy">데이터 출처 정책</Link>
          <Link href="/advertising-policy">광고 운영 원칙</Link>
          <Link href="/unsubscribe">수신거부</Link>
        </div>
      </div>
    </footer>
  );
}

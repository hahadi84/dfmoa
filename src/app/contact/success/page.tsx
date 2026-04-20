import type { Metadata } from "next";
import Link from "@/components/app-link";

export const metadata: Metadata = {
  title: "문의 접수 완료",
  description: "DFMOA 문의가 접수되었습니다.",
};

export default function ContactSuccessPage() {
  return (
    <section className="page-section is-tight">
      <div className="container">
        <div className="surface-card">
          <span className="eyebrow">Received</span>
          <h1 className="page-title">문의가 접수되었습니다</h1>
          <p className="page-description">보내주신 내용은 운영 기준에 따라 확인하겠습니다.</p>
          <div className="chip-row" style={{ marginTop: 20 }}>
            <Link className="button" href="/">
              홈으로
            </Link>
            <Link className="ghost-button" href="/faq">
              FAQ 보기
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

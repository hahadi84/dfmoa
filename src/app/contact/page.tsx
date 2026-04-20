import type { Metadata } from "next";
import Link from "@/components/app-link";

export const metadata: Metadata = {
  title: "문의",
  description: "DFMOA 문의와 오류 제보",
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactPage() {
  return (
    <section className="page-section is-tight">
      <div className="container">
        <div className="breadcrumb">
          <Link href="/">홈</Link>
          <span>/</span>
          <span>문의</span>
        </div>

        <span className="eyebrow" style={{ marginTop: 20 }}>
          Contact
        </span>
        <h1 className="page-title">문의와 오류 제보</h1>
        <p className="page-description">가격 오류, 이미지 삭제 요청, 서비스 개선 의견을 남겨주세요.</p>

        <div className="split-grid" style={{ marginTop: 28 }}>
          <article className="surface-card">
            <h2 className="card-title">문의 양식</h2>
            <p className="section-copy">면세점 원본 링크와 상품명을 함께 보내주시면 더 빠르게 확인합니다.</p>

            <form
              name="contact"
              method="POST"
              action="/contact/success"
              data-netlify="true"
              netlify-honeypot="bot-field"
              className="contact-form"
            >
              <input type="hidden" name="form-name" value="contact" />
              <input type="hidden" name="subject" value="DFMOA 문의" />
              <p className="contact-honeypot">
                <label>
                  비워두세요
                  <input name="bot-field" />
                </label>
              </p>

              <label className="contact-field">
                <span>이름</span>
                <input name="name" type="text" placeholder="이름 또는 닉네임" required />
              </label>

              <label className="contact-field">
                <span>이메일</span>
                <input name="email" type="email" placeholder="답변 받을 이메일" required />
              </label>

              <label className="contact-field">
                <span>문의 유형</span>
                <select name="topic" required defaultValue="price">
                  <option value="price">가격/상품 정보 오류</option>
                  <option value="image">이미지/저작권 요청</option>
                  <option value="service">서비스 개선 의견</option>
                  <option value="ad">광고/정책 문의</option>
                </select>
              </label>

              <label className="contact-field">
                <span>내용</span>
                <textarea name="message" rows={6} placeholder="확인할 상품명, 면세점, 원본 링크를 적어주세요." required />
              </label>

              <button className="button" type="submit">
                문의 보내기
              </button>
            </form>
          </article>

          <aside className="feature-panel">
            <p className="panel-title">처리 기준</p>
            <div className="list-block" style={{ marginTop: 16 }}>
              <div className="list-item">
                <span className="list-number">A</span>
                <p className="list-copy">
                  <strong>가격 오류</strong>
                  검색 시점과 원본 링크 기준으로 재확인
                </p>
              </div>
              <div className="list-item">
                <span className="list-number">B</span>
                <p className="list-copy">
                  <strong>이미지 요청</strong>
                  권리자 요청 시 노출 중단 검토
                </p>
              </div>
              <div className="list-item">
                <span className="list-number">C</span>
                <p className="list-copy">
                  <strong>광고 정책</strong>
                  개인정보처리방침과 운영정책 기준 적용
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

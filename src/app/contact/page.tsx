import type { Metadata } from "next";
import Link from "@/components/app-link";
import { SITE_OPERATOR } from "@/lib/site-operator";

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
        <p className="page-description">데이터 수정 요청, 제휴 제안, 개인정보 관련 요청, 기타 문의를 접수합니다.</p>

        <article className="surface-card" style={{ marginTop: 20 }}>
          <span className="eyebrow">Email</span>
          <h2 className="card-title" style={{ fontSize: "1.35rem", marginTop: 8 }}>
            <a href={`mailto:${SITE_OPERATOR.email}`}>{SITE_OPERATOR.email}</a>
          </h2>
          <p className="section-copy" style={{ marginTop: 10 }}>
            회신은 영업일 기준 1~3일 이내를 원칙으로 합니다. 현재 전화·주소 문의 창구는 운영하지 않습니다.
          </p>
          <div className="chip-row" style={{ marginTop: 12 }}>
            <span className="chip is-soft">데이터 수정 요청</span>
            <span className="chip is-soft">제휴 제안</span>
            <span className="chip is-soft">개인정보 관련</span>
            <span className="chip is-soft">기타</span>
          </div>
        </article>

        <div className="split-grid" style={{ marginTop: 28 }}>
          <article className="surface-card">
            <h2 className="card-title">문의 양식</h2>
            <p className="section-copy">
              면세점 원본 링크와 상품명을 함께 보내주시면 더 빠르게 확인합니다. 이메일로 바로 보내도 됩니다.
            </p>

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
                  <option value="privacy">개인정보 관련</option>
                  <option value="affiliate">제휴 제안</option>
                  <option value="other">기타 문의</option>
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
                  <strong>데이터 수정 요청</strong>
                  검색 시점과 원본 링크 기준으로 재확인
                </p>
              </div>
              <div className="list-item">
                <span className="list-number">B</span>
                <p className="list-copy">
                  <strong>제휴 제안</strong>
                  현재 운영 형태와 서비스 적합성 기준으로 검토
                </p>
              </div>
              <div className="list-item">
                <span className="list-number">C</span>
                <p className="list-copy">
                  <strong>개인정보 관련</strong>
                  개인정보처리방침 기준으로 접수·처리
                </p>
              </div>
              <div className="list-item">
                <span className="list-number">D</span>
                <p className="list-copy">
                  <strong>회신 정책</strong>
                  영업일 기준 1~3일 이내 확인
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

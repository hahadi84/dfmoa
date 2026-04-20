"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { trackEvent } from "@/lib/analytics";
import type { AlertApiResponse, NewsletterSubscriber } from "@/lib/notification-types";

type NewsletterSignupFormProps = {
  source: NewsletterSubscriber["source"];
  compact?: boolean;
};

export function NewsletterSignupForm({ source, compact = false }: NewsletterSignupFormProps) {
  const [email, setEmail] = useState("");
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submitNewsletter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);

    if (!email.includes("@")) {
      setError("구독 이메일을 확인해 주세요.");
      return;
    }

    if (!privacyConsent) {
      setError("주간 리포트 구독을 위해 개인정보 수집·이용 동의가 필요합니다.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          email,
          privacyConsent,
          marketingConsent,
          source,
        }),
      });
      const data = (await response.json()) as AlertApiResponse;

      if (!response.ok || !data.ok) {
        throw new Error(data.message || "구독 요청을 접수하지 못했습니다.");
      }

      setEmail("");
      setPrivacyConsent(false);
      setMarketingConsent(false);
      setMessage(data.message);
      trackEvent("newsletter_subscribe_submit", {
        page_type: source,
        marketing_consent: marketingConsent,
      });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "구독 요청을 접수하지 못했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className={compact ? "newsletter-form is-compact" : "newsletter-form"} onSubmit={submitNewsletter}>
      <div>
        <span className="eyebrow">Weekly Report</span>
        <h3 className="card-title">주간 면세 리포트 구독</h3>
        <p className="section-copy">
          면세점별 쿠폰, 적립금, 카드 혜택과 예상 실결제가 계산 포인트를 주 1회 이메일로 정리합니다.
        </p>
      </div>

      <label>
        이메일
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="name@example.com"
          required
        />
      </label>

      <div className="consent-stack">
        <label className="check-row">
          <input
            type="checkbox"
            checked={privacyConsent}
            onChange={(event) => setPrivacyConsent(event.target.checked)}
            required
          />
          <span>주간 리포트 발송을 위한 이메일 수집·이용에 동의합니다.</span>
        </label>
        <label className="check-row">
          <input
            type="checkbox"
            checked={marketingConsent}
            onChange={(event) => setMarketingConsent(event.target.checked)}
          />
          <span>광고성 정보 수신에 동의합니다. 리포트에는 광고/제휴 링크가 포함될 수 있습니다.</span>
        </label>
      </div>

      <p className="form-fine-print">
        가격 알림 동의와 주간 리포트 구독 동의는 분리해 관리합니다. 모든 메일에는 수신거부 링크가 포함됩니다.
      </p>

      {error ? <p className="form-message is-error">{error}</p> : null}
      {message ? <p className="form-message is-success">{message}</p> : null}

      <button type="submit" className="ghost-button" disabled={isSubmitting}>
        {isSubmitting ? "구독 접수 중" : "무료 구독"}
      </button>
    </form>
  );
}

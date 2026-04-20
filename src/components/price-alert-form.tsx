"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { trackEvent } from "@/lib/analytics";
import {
  EFFECTIVE_PRICE_PREFERENCES_KEY,
  getRawStorageSnapshot,
} from "@/lib/retention-storage";
import { stores, type Product, type StoreId } from "@/lib/site-data";
import type { AlertApiResponse, PriceAlertTargetType } from "@/lib/notification-types";

type PriceAlertFormProps = {
  product: Product;
  source?: "product_detail" | "favorite_page" | "benefit_report" | "footer" | "other";
  compact?: boolean;
};

type FormState = {
  email: string;
  targetPrice: string;
  currency: "KRW" | "USD";
  targetType: PriceAlertTargetType;
  sourceId: "all" | StoreId;
  privacyConsent: boolean;
  marketingConsent: boolean;
  newsletterConsent: boolean;
};

const initialFormState: FormState = {
  email: "",
  targetPrice: "",
  currency: "KRW",
  targetType: "public_price",
  sourceId: "all",
  privacyConsent: false,
  marketingConsent: false,
  newsletterConsent: false,
};

function getUserConditionSnapshot() {
  const raw = getRawStorageSnapshot(EFFECTIVE_PRICE_PREFERENCES_KEY);

  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;

    return {
      membershipTier:
        typeof parsed.vipDiscountPercent === "number" && parsed.vipDiscountPercent > 0
          ? `vip-${parsed.vipDiscountPercent}`
          : undefined,
      cardDiscountAmount: typeof parsed.cardDiscountAmount === "number" ? parsed.cardDiscountAmount : undefined,
      pointsAmount: typeof parsed.pointsAmount === "number" ? parsed.pointsAmount : undefined,
      exchangeRate: typeof parsed.exchangeRate === "number" ? parsed.exchangeRate : undefined,
    };
  } catch {
    return undefined;
  }
}

export function PriceAlertForm({ product, source = "product_detail", compact = false }: PriceAlertFormProps) {
  const [form, setForm] = useState<FormState>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submitPriceAlert(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);

    const targetPrice = Number(form.targetPrice.replace(/,/g, ""));

    if (!form.email.includes("@")) {
      setError("알림을 받을 이메일을 확인해 주세요.");
      return;
    }

    if (!Number.isFinite(targetPrice) || targetPrice <= 0) {
      setError("알림 기준 금액을 숫자로 입력해 주세요.");
      return;
    }

    if (!form.privacyConsent) {
      setError("가격 알림을 등록하려면 개인정보 수집·이용 동의가 필요합니다.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/price-alerts", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          productId: product.id,
          productSlug: product.slug,
          email: form.email,
          targetType: form.targetType,
          targetPrice,
          currency: form.currency,
          sourceIds: form.sourceId === "all" ? stores.map((store) => store.id) : [form.sourceId],
          userConditionSnapshot: form.targetType === "effective_price" ? getUserConditionSnapshot() : undefined,
          privacyConsent: form.privacyConsent,
          marketingConsent: form.marketingConsent,
          newsletterConsent: form.newsletterConsent,
          source,
        }),
      });
      const data = (await response.json()) as AlertApiResponse;

      if (!response.ok || !data.ok) {
        throw new Error(data.message || "가격 알림 등록에 실패했습니다.");
      }

      setForm(initialFormState);
      setMessage(data.message);
      trackEvent("price_alert_submit", {
        product_id: product.id,
        product_slug: product.slug,
        threshold_krw: targetPrice,
        trigger_mode: form.targetType === "effective_price" ? "estimated_price" : "public_price",
        currency: form.currency,
        source_id: form.sourceId,
        page_type: source,
      });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "가격 알림 등록에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className={compact ? "retention-form is-compact" : "retention-form"} onSubmit={submitPriceAlert}>
      <div className="retention-form-head">
        <span className="eyebrow">Price Alert</span>
        <h3 className="card-title">가격 알림 받기</h3>
        <p className="section-copy">
          공개가 또는 내 조건 기준 예상 실결제가가 원하는 금액 이하로 내려가면 이메일 알림을 받을 수 있습니다.
        </p>
      </div>

      <div className="retention-form-grid">
        <label>
          이메일
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            placeholder="name@example.com"
            required
          />
        </label>
        <label>
          기준 금액
          <input
            type="number"
            min="1"
            inputMode="numeric"
            value={form.targetPrice}
            onChange={(event) => setForm((current) => ({ ...current, targetPrice: event.target.value }))}
            placeholder="예: 120000"
            required
          />
        </label>
        <label>
          통화
          <select
            value={form.currency}
            onChange={(event) => setForm((current) => ({ ...current, currency: event.target.value as "KRW" | "USD" }))}
          >
            <option value="KRW">KRW</option>
            <option value="USD">USD</option>
          </select>
        </label>
        <label>
          알림 기준
          <select
            value={form.targetType}
            onChange={(event) =>
              setForm((current) => ({ ...current, targetType: event.target.value as PriceAlertTargetType }))
            }
          >
            <option value="public_price">공개가 기준</option>
            <option value="effective_price">예상 실결제가 기준</option>
          </select>
        </label>
        <label>
          감시 면세점
          <select
            value={form.sourceId}
            onChange={(event) => setForm((current) => ({ ...current, sourceId: event.target.value as FormState["sourceId"] }))}
          >
            <option value="all">전체 면세점 중 최저가</option>
            {stores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="consent-stack">
        <label className="check-row">
          <input
            type="checkbox"
            checked={form.privacyConsent}
            onChange={(event) => setForm((current) => ({ ...current, privacyConsent: event.target.checked }))}
            required
          />
          <span>가격 알림 제공을 위한 이메일 수집·이용에 동의합니다.</span>
        </label>
        <label className="check-row">
          <input
            type="checkbox"
            checked={form.marketingConsent}
            onChange={(event) => setForm((current) => ({ ...current, marketingConsent: event.target.checked }))}
          />
          <span>광고성 정보 수신에 동의합니다. 제휴 링크가 포함될 수 있습니다.</span>
        </label>
        <label className="check-row">
          <input
            type="checkbox"
            checked={form.newsletterConsent}
            onChange={(event) => setForm((current) => ({ ...current, newsletterConsent: event.target.checked }))}
          />
          <span>주간 면세 리포트 구독에도 별도로 동의합니다.</span>
        </label>
      </div>

      <p className="form-fine-print">
        최종 결제가는 원본 면세점 결제 단계에서 확인해 주세요. 모든 이메일에는 로그인 없이 사용할 수 있는
        수신거부 링크를 포함합니다.
      </p>

      {error ? <p className="form-message is-error">{error}</p> : null}
      {message ? <p className="form-message is-success">{message}</p> : null}

      <button type="submit" className="button" disabled={isSubmitting}>
        {isSubmitting ? "등록 중" : "알림 등록"}
      </button>
    </form>
  );
}

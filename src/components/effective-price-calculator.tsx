"use client";

import { useEffect, useState } from "react";
import {
  calculateEffectivePriceEstimate,
  defaultEffectivePricePreferences,
  exchangeRateSnapshot,
  getBenefitRulesForSource,
  type EffectivePricePreferences,
} from "@/lib/effective-price";
import { trackEvent } from "@/lib/analytics";
import { formatKrw, getStoreById, type Product, type StoreId } from "@/lib/site-data";
import type { SourcePrice } from "@/lib/search-types";

const PREFERENCES_KEY = "dfmoa:effective-price-preferences";

function readPreferences(productSlug: string): EffectivePricePreferences {
  if (typeof window === "undefined") {
    return defaultEffectivePricePreferences;
  }

  try {
    const parsed = JSON.parse(window.localStorage.getItem(PREFERENCES_KEY) ?? "{}") as Record<
      string,
      Partial<EffectivePricePreferences>
    >;

    return {
      ...defaultEffectivePricePreferences,
      ...(parsed[productSlug] ?? {}),
    };
  } catch {
    return defaultEffectivePricePreferences;
  }
}

function writePreferences(productSlug: string, preferences: EffectivePricePreferences) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const parsed = JSON.parse(window.localStorage.getItem(PREFERENCES_KEY) ?? "{}") as Record<
      string,
      EffectivePricePreferences
    >;
    window.localStorage.setItem(
      PREFERENCES_KEY,
      JSON.stringify({
        ...parsed,
        [productSlug]: preferences,
      })
    );
  } catch {
    window.localStorage.setItem(PREFERENCES_KEY, JSON.stringify({ [productSlug]: preferences }));
  }
}

function toNumber(value: string) {
  const parsed = Number(value.replace(/,/g, ""));
  return Number.isFinite(parsed) ? Math.max(parsed, 0) : 0;
}

export function EffectivePriceCalculator({
  product,
  sourcePrices,
}: {
  product: Product;
  sourcePrices: SourcePrice[];
}) {
  const [preferences, setPreferences] = useState<EffectivePricePreferences>(() => readPreferences(product.slug));
  const pricedSources = sourcePrices.filter(
    (sourcePrice) => typeof sourcePrice.price === "number" && sourcePrice.status !== "low_confidence"
  );
  const selectedSource =
    pricedSources.find((sourcePrice) => sourcePrice.sourceId === preferences.sourceId) ?? pricedSources[0];
  const selectedStore = selectedSource ? getStoreById(selectedSource.sourceId as StoreId) : undefined;
  const sourceRules = selectedSource ? getBenefitRulesForSource(selectedSource.sourceId) : [];
  const estimate =
    selectedSource && typeof selectedSource.price === "number"
      ? calculateEffectivePriceEstimate({
          productId: product.slug,
          sourceId: selectedSource.sourceId,
          basePrice: selectedSource.price,
          preferences,
          ruleConfidence: sourceRules.some((rule) => rule.confidence === "low") ? "low" : "medium",
        })
      : null;
  const estimateEventKey = estimate
    ? `${selectedSource?.sourceId}:${estimate.estimatedFinalPrice}:${estimate.discounts.length}:${estimate.confidence}`
    : "";
  const estimateConfidence = estimate?.confidence;
  const estimateDiscountCount = estimate?.discounts.length ?? 0;
  const selectedSourceId = selectedSource?.sourceId;

  useEffect(() => {
    writePreferences(product.slug, preferences);
  }, [preferences, product.slug]);

  useEffect(() => {
    if (!estimateEventKey || !selectedSourceId) {
      return;
    }

    trackEvent("effective_price_calculate", {
      product_id: product.id,
      product_slug: product.slug,
      source_id: selectedSourceId,
      confidence: estimateConfidence,
      has_discount: estimateDiscountCount > 0,
    });
  }, [estimateConfidence, estimateDiscountCount, estimateEventKey, product.id, product.slug, selectedSourceId]);

  function updatePreference(next: Partial<EffectivePricePreferences>) {
    setPreferences((current) => ({
      ...current,
      ...next,
    }));
  }

  if (!pricedSources.length) {
    return (
      <article className="surface-card effective-price-panel">
        <div>
          <span className="eyebrow">Estimate</span>
          <h2 className="card-title">예상 실결제가 계산기</h2>
          <p className="section-copy">
            아직 확인된 공개가가 없어 계산을 시작할 수 없습니다. 공식 면세점 원본에서 판매 여부를 확인해 주세요.
          </p>
        </div>
      </article>
    );
  }

  return (
    <article className="surface-card effective-price-panel">
      <div className="section-head">
        <div>
          <span className="eyebrow">Estimate</span>
          <h2 className="card-title">예상 실결제가 계산기</h2>
          <p className="section-copy">
            공개가와 직접 입력한 혜택을 조합해 내 조건 기준 예상가를 계산합니다.
          </p>
        </div>
        <span className="status-chip is-limited">참고 계산</span>
      </div>

      <div className="effective-price-layout">
        <div className="effective-input-grid">
          <label className="estimate-field">
            <span>면세점</span>
            <select
              value={selectedSource?.sourceId ?? ""}
              onChange={(event) => updatePreference({ sourceId: event.target.value as StoreId })}
            >
              {pricedSources.map((sourcePrice) => (
                <option key={sourcePrice.sourceId} value={sourcePrice.sourceId}>
                  {sourcePrice.sourceName}
                </option>
              ))}
            </select>
          </label>

          <label className="estimate-field">
            <span>회원 등급 예상 할인</span>
            <select
              value={preferences.vipDiscountPercent}
              onChange={(event) => updatePreference({ vipDiscountPercent: toNumber(event.target.value) })}
            >
              <option value={0}>없음</option>
              <option value={3}>3% 예상</option>
              <option value={5}>5% 예상</option>
              <option value={7}>7% 예상</option>
              <option value={10}>10% 예상</option>
            </select>
          </label>

          <label className="estimate-field">
            <span>공개 쿠폰 직접 입력</span>
            <input
              inputMode="numeric"
              value={preferences.couponAmount}
              onChange={(event) => updatePreference({ couponAmount: toNumber(event.target.value) })}
            />
          </label>

          <label className="estimate-field">
            <span>대표 카드 혜택</span>
            <select
              value={preferences.cardDiscountAmount}
              onChange={(event) => updatePreference({ cardDiscountAmount: toNumber(event.target.value) })}
            >
              <option value={0}>없음</option>
              <option value={5000}>5,000원 예상</option>
              <option value={10000}>10,000원 예상</option>
              <option value={20000}>20,000원 예상</option>
            </select>
          </label>

          <label className="estimate-field">
            <span>적립금 사용 예상액</span>
            <input
              inputMode="numeric"
              value={preferences.pointsAmount}
              onChange={(event) => updatePreference({ pointsAmount: toNumber(event.target.value) })}
            />
          </label>

          <label className="estimate-field">
            <span>참고 환율</span>
            <input
              inputMode="decimal"
              value={preferences.exchangeRate}
              onChange={(event) => updatePreference({ exchangeRate: toNumber(event.target.value) || exchangeRateSnapshot.rate })}
            />
          </label>
        </div>

        <div className="effective-result-card">
          <span className="chip is-soft">{selectedStore?.name ?? selectedSource?.sourceName}</span>
          <p className="metric-title">내 조건 기준 예상가</p>
          <strong>{estimate ? formatKrw(estimate.estimatedFinalPrice) : "계산 대기"}</strong>
          <span>
            공개가 {estimate ? formatKrw(estimate.estimatedKrwPrice) : "계산 대기"} · 계산 신뢰도{" "}
            {estimate?.confidence === "low" ? "낮음" : "보통"}
          </span>
        </div>
      </div>

      {estimate ? (
        <details className="estimate-details">
          <summary>계산 근거 보기</summary>
          <div className="estimate-detail-grid">
            <div>
              <strong>적용된 조건</strong>
              {estimate.discounts.length ? (
                estimate.discounts.map((discount) => (
                  <span key={`${discount.source}-${discount.label}`}>
                    {discount.label}: -{formatKrw(discount.amount)}
                  </span>
                ))
              ) : (
                <span>직접 입력된 할인 없음</span>
              )}
            </div>
            <div>
              <strong>제외/확인 필요</strong>
              {sourceRules.length ? (
                sourceRules.map((rule) => (
                  <a key={rule.id} href={rule.sourceUrl} target="_blank" rel="noreferrer">
                    {rule.title}
                  </a>
                ))
              ) : (
                <span>공식 혜택 페이지에서 추가 확인</span>
              )}
            </div>
            <div>
              <strong>환율 기준</strong>
              <span>
                {exchangeRateSnapshot.sourceName} · {preferences.exchangeRate.toLocaleString("ko-KR")}원/USD
              </span>
              <span>기준일 {exchangeRateSnapshot.validForDate}</span>
            </div>
          </div>
          <p className="effective-warning">
            최종 결제가는 면세점 원본 결제 단계에서 확인해 주세요. 카드 실적, 월 한도, 쿠폰 중복 여부,
            출국정보에 따라 실제 금액은 달라질 수 있습니다.
          </p>
        </details>
      ) : null}
    </article>
  );
}

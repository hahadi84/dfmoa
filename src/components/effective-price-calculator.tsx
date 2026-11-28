"use client";

import { useEffect, useRef, useState } from "react";
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
  const excludesCouponAndPoints = product.slug === "bleu-de-chanel-edp-100ml" && selectedSource?.sourceId === "lotte";
  const usesExchangeRate = selectedSource?.currency === "USD";
  const estimate =
    selectedSource && typeof selectedSource.price === "number"
      ? calculateEffectivePriceEstimate({
          productId: product.slug,
          sourceId: selectedSource.sourceId,
          basePrice: selectedSource.price,
          currency: selectedSource.currency,
          preferences: excludesCouponAndPoints ? { ...preferences, couponAmount: 0, pointsAmount: 0 } : preferences,
          ruleConfidence: sourceRules.some((rule) => rule.confidence === "low") ? "low" : "medium",
        })
      : null;
  const pendingSelection = useRef(false);
  const inputStart = useRef("");

  useEffect(() => {
    writePreferences(product.slug, preferences);
  }, [preferences, product.slug]);

  function recordCalculation() {
    if (!selectedSource || !estimate) return;
    trackEvent("effective_price_calculate", {
      product_id: product.id,
      product_slug: product.slug,
      source_id: selectedSource.sourceId,
      confidence: estimate.confidence,
      has_discount: estimate.discounts.length > 0,
    });
  }

  useEffect(() => {
    if (pendingSelection.current) {
      pendingSelection.current = false;
      recordCalculation();
    }
  });

  function selectPreference(next: Partial<EffectivePricePreferences>) {
    pendingSelection.current = true;
    updatePreference(next);
  }

  function updatePreference(next: Partial<EffectivePricePreferences>) {
    setPreferences((current) => ({
      ...current,
      ...next,
    }));
  }

  if (!pricedSources.length) {
    return (
      <article id="effective-price" className="surface-card effective-price-panel">
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
    <article id="effective-price" className="surface-card effective-price-panel">
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
              onChange={(event) => selectPreference({ sourceId: event.target.value as StoreId })}
            >
              {pricedSources.map((sourcePrice) => (
                <option key={sourcePrice.sourceId} value={sourcePrice.sourceId}>
                  {sourcePrice.sourceName}
                </option>
              ))}
            </select>
          </label>

          {excludesCouponAndPoints && <p className="section-copy">롯데 샤넬 상품은 쿠폰·적립금 사용이 제외됩니다. 카드·회원 혜택은 결제 단계에서 적용이 확인된 경우에만 입력하세요.</p>}
          <label className="estimate-field">
            <span>회원 등급 예상 할인</span>
            <select
              value={preferences.vipDiscountPercent}
              onChange={(event) => selectPreference({ vipDiscountPercent: toNumber(event.target.value) })}
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
              onFocus={(event) => { inputStart.current = event.currentTarget.value; }}
              onBlur={(event) => {
                if (event.currentTarget.value !== inputStart.current) recordCalculation();
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") event.currentTarget.blur();
              }}
              inputMode="numeric"
              disabled={excludesCouponAndPoints}
              value={excludesCouponAndPoints ? 0 : preferences.couponAmount}
              onChange={(event) => updatePreference({ couponAmount: toNumber(event.target.value) })}
            />
          </label>

          <label className="estimate-field">
            <span>대표 카드 혜택</span>
            <select
              value={preferences.cardDiscountAmount}
              onChange={(event) => selectPreference({ cardDiscountAmount: toNumber(event.target.value) })}
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
              onFocus={(event) => { inputStart.current = event.currentTarget.value; }}
              onBlur={(event) => {
                if (event.currentTarget.value !== inputStart.current) recordCalculation();
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") event.currentTarget.blur();
              }}
              inputMode="numeric"
              disabled={excludesCouponAndPoints}
              value={excludesCouponAndPoints ? 0 : preferences.pointsAmount}
              onChange={(event) => updatePreference({ pointsAmount: toNumber(event.target.value) })}
            />
          </label>

          {usesExchangeRate && <label className="estimate-field">
            <span>참고 환율</span>
            <input
              onFocus={(event) => { inputStart.current = event.currentTarget.value; }}
              onBlur={(event) => {
                if (event.currentTarget.value !== inputStart.current) recordCalculation();
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") event.currentTarget.blur();
              }}
              inputMode="decimal"
              value={preferences.exchangeRate}
              onChange={(event) => updatePreference({ exchangeRate: toNumber(event.target.value) || exchangeRateSnapshot.rate })}
            />
          </label>}
        </div>

        <div className="effective-result-card">
          <span className="chip is-soft">{selectedStore?.name ?? selectedSource?.sourceName}</span>
          {selectedSource?.status === "manual_only" && <span>{selectedSource.message}</span>}
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
              {excludesCouponAndPoints ? <span>롯데 샤넬은 쿠폰·적립금 및 구매금액별 사은행사 제외</span> : sourceRules.length ? (
                sourceRules.map((rule) => (
                  <a key={rule.id} href={rule.sourceUrl} target="_blank" rel="noreferrer">
                    {rule.title}
                  </a>
                ))
              ) : (
                <span>공식 혜택 페이지에서 추가 확인</span>
              )}
            </div>
            {usesExchangeRate && <div>
              <strong>환율 기준</strong>
              <span>
                {exchangeRateSnapshot.sourceName} · {preferences.exchangeRate.toLocaleString("ko-KR")}원/USD
              </span>
              <span>기준일 {exchangeRateSnapshot.validForDate}</span>
            </div>}
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

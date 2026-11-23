'use client';

import { useRef, useState } from 'react';
import { historicalYenExample } from '@/lib/japan-price-examples';
import { trackEvent } from '@/lib/analytics';

export function YenComparisonCalculator({ initialRate }: { initialRate: number }) {
  const [historical, setHistorical] = useState(false);
  const [yen, setYen] = useState('');
  const [rate, setRate] = useState(initialRate.toFixed(2));
  const [fee, setFee] = useState('0');
  const [refund, setRefund] = useState('0');
  const [domestic, setDomestic] = useState('');
  const [result, setResult] = useState<{ charged: number; net: number; difference: number } | null>(null);
  const lastMeasured = useRef('');
  const valid = [yen, rate, fee, refund, domestic].every(value => value.trim() !== '' && Number.isFinite(Number(value)) && Number(value) >= 0)
    && Number(rate) > 0 && Number(yen) > 0 && Number(domestic) > 0 && Number(refund) <= Number(yen) && Number(fee) <= 100;
  const charged = Number(yen) * Number(rate) / 100 * (1 + Number(fee) / 100);
  const net = charged - Number(refund) * Number(rate) / 100;
  const difference = Number(domestic) - net;
  const won = (value: number) => `${Math.round(value).toLocaleString('ko-KR')}원`;
  const fields = [
    { label: '일본 세금 포함 가격 (엔)', value: yen, set: setYen, min: '1' },
    { label: '100엔당 적용 환율 (원)', value: rate, set: setRate, min: '0.01' },
    { label: '해외 결제 수수료 (%)', value: fee, set: setFee, min: '0', max: '100' },
    { label: '수수료 차감 후 예상 환급 (엔)', value: refund, set: setRefund, min: '0', max: yen },
    { label: '국내 면세점 최종 가격 (원)', value: domestic, set: setDomestic, min: '0' },
  ];
  return <section className="yen-calculator" aria-labelledby="yen-calculator-title">
    <h2 id="yen-calculator-title" className="section-title">일본 쇼핑 비용 계산기</h2>
    <p className="section-copy">같은 상품·용량·구성의 두 가격을 입력하세요. 환급액이 확인되지 않으면 0엔으로 두고, 카드 수수료는 본인의 결제 조건을 확인하세요.</p>
    <details><summary>과거 관찰가로 계산 방법 보기</summary>
      <p>소바쥬 EDP 100ml 단품: {historicalYenExample.observedAt} DEPACO 22,110엔(세금 포함), 롯데 공개 정상가 180,225원. 현재 가격이나 최종 결제액이 아닙니다. {historicalYenExample.rateDate} 참고 환율 100엔={historicalYenExample.rate}원을 사용하며 수수료·환급은 0으로 둡니다.</p>
      <button type="button" onClick={() => { setYen(String(historicalYenExample.yen)); setDomestic(String(historicalYenExample.domestic)); setRate(String(historicalYenExample.rate)); setFee('0'); setRefund('0'); setHistorical(true); setResult(null); }}>11월 18일 관찰가를 예시로 입력</button>
      <button type="button" onClick={() => { setYen(''); setDomestic(''); setRate(initialRate.toFixed(2)); setFee('0'); setRefund('0'); setHistorical(false); setResult(null); }}>예시 지우고 내 가격 입력</button>
    </details>
    {historical && <p role="status">과거 관찰가에서 시작한 입력입니다. 값을 수정해도 최신 판매가 검증을 뜻하지 않습니다. 실제 비교는 예시를 지운 뒤 판매처에서 확인한 두 가격으로 시작하세요.</p>}
    <form onSubmit={event => {
      event.preventDefault();
      if (!valid || ![charged, net, difference].every(Number.isFinite)) return;
      setResult({ charged, net, difference });
      const signature = JSON.stringify([[yen, rate, fee, refund, domestic].map(Number), historical]);
      if (lastMeasured.current === signature) return;
      lastMeasured.current = signature;
      trackEvent('effective_price_calculate', {
        language: 'ko', source_page: 'japan', calculator_type: 'yen_comparison',
        interaction: 'calculate_submit', price_basis: historical ? 'historical_example' : 'user_input', product_slug: historical ? historicalYenExample.product : undefined, has_refund: Number(refund) > 0, has_fee: Number(fee) > 0,
      });
    }}>
      <div className="yen-fields">{fields.map((field, index) => <label key={field.label} htmlFor={`yen-field-${index}`}>{field.label}<input id={`yen-field-${index}`} type="number" inputMode="decimal" required min={field.min} max={field.max || undefined} step="any" value={field.value} onChange={event => { field.set(event.target.value); setResult(null); }} /></label>)}</div>
      <button className="button" type="submit" disabled={!valid || ![charged, net, difference].every(Number.isFinite)}>입력한 가격 비교하기</button>
      {!valid ? <p className="section-copy">두 가격과 환율은 0보다 커야 합니다. 환급액은 일본 가격 이하, 수수료는 0~100%로 입력하세요.</p> : null}
    </form>
    <div className="yen-result" aria-live="polite">
      {result ? <>{historical && <p><strong>2026-11-18 과거 관찰가에서 시작한 계산 예시 · 현재 우열 판단 아님</strong></p>}<p>일본 예상 결제액 <strong>{won(result.charged)}</strong></p><p>환급 후 예상 비용 <strong>{won(result.net)}</strong></p><p>{Math.abs(result.difference) < 0.5 ? '입력한 조건에서 두 구매처의 예상 비용이 같습니다.' : `입력한 조건에서 ${result.difference > 0 ? '일본 구매' : '국내 면세 구매'}가 ${won(Math.abs(result.difference))} 낮습니다.`}</p></> : <p>가격 입력 후 비교 버튼을 누르면 결과를 확인할 수 있습니다. 확인하지 않은 가격을 0원으로 비교하지 않습니다.</p>}
    </div>
    <p className="section-copy">일본 결제액 = 엔화 가격 × (100엔당 환율 ÷ 100) × (1 + 수수료율). 환급은 같은 환율로 환산한 예상치이며 실제 환급일의 환율·추가 비용은 다를 수 있습니다. 한국 입국 세금·배송비는 포함하지 않습니다.</p>
  </section>;
}

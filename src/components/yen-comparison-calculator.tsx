'use client';

import { useRef, useState } from 'react';
import { trackEvent } from '@/lib/analytics';

export function YenComparisonCalculator({ initialRate }: { initialRate: number }) {
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
    <form onSubmit={event => {
      event.preventDefault();
      if (!valid || ![charged, net, difference].every(Number.isFinite)) return;
      setResult({ charged, net, difference });
      const signature = JSON.stringify([yen, rate, fee, refund, domestic].map(Number));
      if (lastMeasured.current === signature) return;
      lastMeasured.current = signature;
      trackEvent('effective_price_calculate', {
        language: 'ko', source_page: 'japan', calculator_type: 'yen_comparison',
        interaction: 'calculate_submit', has_refund: Number(refund) > 0, has_fee: Number(fee) > 0,
      });
    }}>
      <div className="yen-fields">{fields.map((field, index) => <label key={field.label} htmlFor={`yen-field-${index}`}>{field.label}<input id={`yen-field-${index}`} type="number" inputMode="decimal" required min={field.min} max={field.max || undefined} step="any" value={field.value} onChange={event => { field.set(event.target.value); setResult(null); }} /></label>)}</div>
      <button className="button" type="submit" disabled={!valid || ![charged, net, difference].every(Number.isFinite)}>입력한 가격 비교하기</button>
      {!valid ? <p className="section-copy">두 가격과 환율은 0보다 커야 합니다. 환급액은 일본 가격 이하, 수수료는 0~100%로 입력하세요.</p> : null}
    </form>
    <div className="yen-result" aria-live="polite">
      {result ? <><p>일본 예상 결제액 <strong>{won(result.charged)}</strong></p><p>환급 후 예상 비용 <strong>{won(result.net)}</strong></p><p>{Math.abs(result.difference) < 0.5 ? '입력한 조건에서 두 구매처의 예상 비용이 같습니다.' : `입력한 조건에서 ${result.difference > 0 ? '일본 구매' : '국내 면세 구매'}가 ${won(Math.abs(result.difference))} 낮습니다.`}</p></> : <p>가격 입력 후 비교 버튼을 누르면 결과를 확인할 수 있습니다. 확인하지 않은 가격을 0원으로 비교하지 않습니다.</p>}
    </div>
    <p className="section-copy">일본 결제액 = 엔화 가격 × (100엔당 환율 ÷ 100) × (1 + 수수료율). 환급은 같은 환율로 환산한 예상치이며 실제 환급일의 환율·추가 비용은 다를 수 있습니다. 한국 입국 세금·배송비는 포함하지 않습니다.</p>
  </section>;
}

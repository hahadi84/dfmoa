'use client';

import { useState } from 'react';

export function YenComparisonCalculator({ initialRate }: { initialRate: number }) {
  const [yen, setYen] = useState('10000');
  const [rate, setRate] = useState(initialRate.toFixed(2));
  const [fee, setFee] = useState('0');
  const [refund, setRefund] = useState('0');
  const [domestic, setDomestic] = useState('100000');
  const valid = [yen, rate, fee, refund, domestic].every(value => value.trim() !== '' && Number.isFinite(Number(value)) && Number(value) >= 0)
    && Number(rate) > 0 && Number(yen) > 0 && Number(refund) <= Number(yen) && Number(fee) <= 100;
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
    <p className="section-copy">입력된 가격은 계산 예시입니다. 실제 상품 가격·카드 수수료·예상 환급액으로 바꿔보세요.</p>
    <div className="yen-fields">{fields.map((field, index) => <label key={field.label} htmlFor={`yen-field-${index}`}>{field.label}<input id={`yen-field-${index}`} type="number" inputMode="decimal" min={field.min} max={field.max} step="any" value={field.value} onChange={event => field.set(event.target.value)} /></label>)}</div>
    <div className="yen-result" aria-live="polite">
      {valid ? <><p>일본 예상 결제액 <strong>{won(charged)}</strong></p><p>환급 후 예상 비용 <strong>{won(net)}</strong></p><p>{Math.abs(difference) < 0.5 ? '두 구매처의 예상 비용이 같습니다.' : `${difference > 0 ? '일본 구매' : '국내 면세 구매'}가 ${won(Math.abs(difference))} 낮습니다.`}</p></> : <p>가격·환율을 확인해 주세요. 환급액은 일본 가격 이하여야 하며, 수수료는 0~100% 범위로 입력하세요.</p>}
    </div>
    <p className="section-copy">일본 결제액 = 엔화 가격 × (100엔당 환율 ÷ 100) × (1 + 수수료율). 환급은 같은 환율로 환산한 예상치이며 실제 환급일의 환율·추가 비용은 다를 수 있습니다. 한국 입국 세금·배송비는 포함하지 않습니다.</p>
  </section>;
}

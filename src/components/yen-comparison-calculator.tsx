'use client';

import { useRef, useState } from 'react';
import Link from '@/components/app-link';
import { historicalYenExample } from '@/lib/japan-price-examples';
import { trackEvent } from '@/lib/analytics';

function readAmount(input: string, unit: 'JPY' | 'KRW' | '%'): string {
  let amount = input.normalize('NFKC').trim();
  if (unit === 'JPY') {
    amount = amount.replace(/^税込(?:価格)?\s*:?\s*/, '').replace(/\s*\(税込\)$/, '')
      .replace(/^(?:¥|JPY)\s*/i, '').replace(/\s*(?:円|엔|JPY)$/i, '');
  } else if (unit === 'KRW') {
    amount = amount.replace(/^(?:₩|KRW)\s*/i, '').replace(/\s*(?:원|KRW)$/i, '');
  } else {
    amount = amount.replace(/\s*%$/, '');
  }
  // Validate the whole price before removing separators so two amounts cannot merge.
  if (!/^(?:(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(amount)) return '';
  const numeric = amount.replaceAll(',', '');
  return Number.isFinite(Number(numeric)) ? numeric : '';
}

export function YenComparisonCalculator({ initialRate, rateDate }: { initialRate: number; rateDate: string }) {
  const quickInput = useRef<HTMLInputElement>(null);
  const comparisonHeading = useRef<HTMLHeadingElement>(null);
  const [historical, setHistorical] = useState(false);
  const [yenInput, setYen] = useState('');
  const [rateInput, setRate] = useState(initialRate.toFixed(2));
  const [feeInput, setFee] = useState('0');
  const [refundInput, setRefund] = useState('0');
  const [domesticInput, setDomestic] = useState('');
  const [result, setResult] = useState<{ charged: number; net: number; difference: number } | null>(null);
  const yen = readAmount(yenInput, 'JPY');
  const rate = readAmount(rateInput, 'KRW');
  const fee = readAmount(feeInput, '%');
  const refund = readAmount(refundInput, 'JPY');
  const domestic = readAmount(domesticInput, 'KRW');
  const yenInputInvalid = yenInput.trim() !== '' && yen === '';
  const yenFormatHelp = '1,100円처럼 결제할 엔화 가격 하나만 입력하세요.';
  const yenInWon = Number(yen) * Number(rate) / 100;
  const validQuickConversion = Number(yen) >= 1 && Number(rate) >= 0.01 && Number.isFinite(yenInWon);
  const quickInputEdited = useRef(false);
  function finishQuickConversion() {
    if (!quickInputEdited.current) return;
    quickInputEdited.current = false;
    if (!validQuickConversion) return;
    trackEvent('yen_conversion_complete', {
      language: 'ko', source_page: 'japan', interaction: 'input_complete',
    });
  }
  const lastMeasured = useRef('');
  const valid = [yen, rate, fee, refund, domestic].every(value => value !== '')
    && Number(rate) >= 0.01 && Number(yen) >= 1 && Number(domestic) > 0 && Number(refund) <= Number(yen) && Number(fee) <= 100;
  const hasInvalidComparisonValue =
    (yen !== '' && Number(yen) < 1) || (domestic !== '' && Number(domestic) <= 0) || (rate !== '' && Number(rate) < 0.01) ||
    Number(fee) > 100 || (yen !== '' && Number(refund) > Number(yen));
  const charged = yenInWon * (1 + Number(fee) / 100);
  const net = charged - Number(refund) * Number(rate) / 100;
  const difference = Math.round(Number(domestic)) - Math.round(net);
  const won = (value: number) => `${Math.round(value).toLocaleString('ko-KR')}원`;
  const exampleYenLimit = Math.floor(historicalYenExample.domestic * 100 / historicalYenExample.rate);
  let quickResult = '원화 환산액이 여기에 표시됩니다.';
  if (yen) {
    quickResult = validQuickConversion
      ? `원화 환산액 ${won(yenInWon)} · 100엔당 ${rate}원`
      : '1엔 이상 입력하고, 100엔당 적용 환율이 0.01원 이상인지 확인하세요.';
  }
  const refundExceedsPrice = yen !== '' && Number(refund) > Number(yen);
  const fields = [
    { label: '일본 세금 포함 가격 (엔)', input: yenInput, value: yen, set: setYen, help: yenFormatHelp },
    { label: '100엔당 적용 환율 (원)', input: rateInput, value: rate, set: setRate, help: '100엔에 해당하는 원화 금액 하나만 입력하세요.' },
    { label: '해외 결제 수수료 (%)', input: feeInput, value: fee, set: setFee, rangeInvalid: Number(fee) > 100, help: '본인 카드의 해외 결제 수수료율을 0~100% 사이로 입력하세요.' },
    { label: '수수료 차감 후 예상 환급 (엔)', input: refundInput, value: refund, set: setRefund, rangeInvalid: refundExceedsPrice, help: refundExceedsPrice ? '환급액은 입력한 일본 구매 가격 이하여야 합니다.' : '예상 환급액 하나를 엔화로 입력하세요. 확인 전에는 0엔으로 두세요.' },
    { label: '국내 면세점 최종 가격 (원)', input: domesticInput, value: domestic, set: setDomestic, help: '100,000원처럼 결제할 원화 가격 하나만 입력하세요.' },
  ];
  return <section className="yen-calculator" aria-labelledby="yen-calculator-title">
    <h2 id="yen-calculator-title" className="yen-quick-heading"><label htmlFor="quick-yen">원화로 환산할 금액 (엔)</label></h2>
    <input ref={quickInput} id="quick-yen" aria-describedby="quick-yen-result" aria-invalid={yenInputInvalid || undefined} type="text" inputMode="decimal" enterKeyHint="done" placeholder="11,000" value={yenInput}
      onChange={event => {
        quickInputEdited.current = true;
        setYen(event.target.value);
        setResult(null);
      }}
      onBlur={finishQuickConversion}
      onKeyDown={event => {
        if (event.key === 'Enter' && !event.nativeEvent.isComposing) event.currentTarget.blur();
      }}
    />
    <p id="quick-yen-result" aria-live="polite">{yenInputInvalid ? yenFormatHelp : quickResult}</p>
    <details className="yen-reference">
      <summary>{historical && Number(rate) === historicalYenExample.rate
        ? <>예시에 적용한 환율 100엔 = {historicalYenExample.rate}원 · <time dateTime={historicalYenExample.rateDate}>{historicalYenExample.rateDate}</time></>
        : Number(rate) === Number(initialRate.toFixed(2))
          ? <>기본 환율 100엔 = {initialRate.toLocaleString('ko-KR', { maximumFractionDigits: 2 })}원 · <time dateTime={rateDate}>{rateDate}</time></>
          : Number(rate) > 0 ? <>직접 입력한 환율 100엔 = {rate}원</> : '100엔당 적용 환율을 확인하세요.'}</summary>
      <p>기본값은 Frankfurter가 제공하는 유럽중앙은행(ECB) 참고 환율입니다. 휴일이나 자료가 늦어질 때는 마지막 기준일을 표시합니다. 카드사가 적용할 환율을 알고 있다면 아래 ‘100엔당 적용 환율’에서 바꿀 수 있습니다. <a href="https://frankfurter.dev/" target="_blank" rel="noreferrer">환율 출처</a></p>
    </details>
    <Link href={`#${historicalYenExample.anchor}`}>소바쥬 100ml로 계산 방법 보기</Link>
    <h3 ref={comparisonHeading} className="yen-comparison-heading" tabIndex={-1}>한국 면세점 가격과 비교하기</h3>
    {historical && <>
      <p role="status">11월 18일 관찰가와 당시 참고 환율을 입력했습니다. 오늘의 가격으로 비교하려면 예시를 지우고 두 판매처의 결제 금액을 입력하세요.</p>
      <button type="button" className="ghost-button" onClick={() => {
        setYen('');
        setDomestic('');
        setRate(initialRate.toFixed(2));
        setFee('0');
        setRefund('0');
        setHistorical(false);
        setResult(null);
        quickInput.current?.focus();
      }}>예시 지우고 내 가격 입력</button>
    </>}
    <p className="section-copy">같은 용량·구성의 상품을 찾아 할인 후 결제액을 입력하세요. <Link href="/price-compare">한국 면세가 찾기</Link></p>
    <p className="section-copy">수수료는 본인 카드의 결제 조건에 맞추세요. 환급액은 매장에서 안내한 수수료 차감 후 금액을 쓰고, 확인 전에는 0엔으로 두세요. <Link href="/guide/japan-tax-refund-2026#refund-airports">출국 전 세관 위치 확인</Link></p>
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
      <div className="yen-fields">
        {fields.map((field, index) => {
          const id = `yen-field-${index}`;
          const invalid = field.rangeInvalid || (field.input.trim() !== '' && field.value === '');
          return <div key={id}>
            <label htmlFor={id}>{field.label}
              <input id={id} type="text" inputMode="decimal" required value={field.input}
                aria-invalid={invalid || undefined} aria-describedby={invalid ? `${id}-help` : undefined}
                onChange={event => { field.set(event.target.value); setResult(null); }} />
            </label>
            {invalid && <small id={`${id}-help`}>{field.help}</small>}
          </div>;
        })}
      </div>
      <button className="button" type="submit" disabled={!valid || ![charged, net, difference].every(Number.isFinite)}>입력한 가격 비교하기</button>
      {hasInvalidComparisonValue ? <p className="section-copy">일본 가격은 1엔 이상, 국내 가격은 0원 초과, 100엔당 환율은 0.01원 이상이어야 합니다. 환급액은 일본 가격 이하, 수수료율은 0~100%로 입력하세요.</p> : null}
    </form>
    <div className="yen-result" aria-live="polite">
      {result ? <>{historical && <p><strong>2026-11-18 과거 관찰가에서 시작한 계산 예시 · 현재 우열 판단 아님</strong></p>}<p>일본 예상 결제액 <strong>{won(result.charged)}</strong></p><p>환급 후 예상 비용 <strong>{won(result.net)}</strong></p><p>국내 면세점 비교액 <strong>{won(Number(domestic))}</strong></p><p>{result.difference === 0 ? '원 단위로 반올림한 두 구매처의 예상 비용이 같습니다.' : `입력한 조건에서 ${result.difference > 0 ? '일본 구매' : '국내 면세 구매'}가 ${won(Math.abs(result.difference))} 낮습니다.`}</p></> : <p>가격 입력 후 비교 버튼을 누르면 결과를 확인할 수 있습니다. 확인하지 않은 가격을 0원으로 비교하지 않습니다.</p>}
    </div>
    <p className="section-copy">일본 결제액 = 엔화 가격 × (100엔당 환율 ÷ 100) × (1 + 입력한 수수료율 ÷ 100). 예를 들어 수수료가 2%라면 2를 입력하고, 계산기는 환산액에 1.02를 곱합니다. 환급은 같은 환율로 환산한 예상치이며 실제 환급일의 환율·추가 비용은 다를 수 있습니다. 한국 입국 세금·배송비는 포함하지 않습니다.</p>
    <section className="yen-example" aria-labelledby={historicalYenExample.anchor}>
      <h3 id={historicalYenExample.anchor} tabIndex={-1}>디올 소바쥬 오 드 퍼퓸 100ml 가격 비교 예시</h3>
      <p><time dateTime={historicalYenExample.observedAt}>2026년 11월 18일</time>에 확인한 100ml 한 병의 가격입니다. 일본 DEPACO 온라인몰의 세금 포함 가격은 <strong>{historicalYenExample.yen.toLocaleString('ko-KR')}엔</strong>, 롯데인터넷면세점의 공개 정상가는 <strong>{won(historicalYenExample.domestic)}</strong>이었습니다.</p>
      <p><time dateTime={historicalYenExample.rateDate}>11월 17일</time> 참고 환율(100엔당 {historicalYenExample.rate}원)을 적용하면, 일본 가격이 <strong>{exampleYenLimit.toLocaleString('ko-KR')}엔 이하</strong>일 때 당시 롯데 정상가보다 저렴합니다. 카드 수수료·소비세 환급·회원 할인은 0으로 계산했습니다.</p>
      <button type="button" className="button is-secondary" onClick={() => {
        setYen(String(historicalYenExample.yen));
        setDomestic(String(historicalYenExample.domestic));
        setRate(String(historicalYenExample.rate));
        setFee('0');
        setRefund('0');
        setHistorical(true);
        setResult(null);
        comparisonHeading.current?.focus();
      }}>이 두 가격을 계산기에 입력</button>
      <p><Link href="/guide/japan-shopping-price-checklist#example-p13">두 판매처의 상품 규격과 가격 조건 확인</Link></p>
    </section>
  </section>;
}

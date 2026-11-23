import { japanPriceExamples } from '@/lib/japan-price-examples';
import { JapanShoppingLink } from '@/components/japan-shopping-link';
import styles from './japan-price-examples.module.css';

export function JapanPriceExamples({ source }: { source: string }) {
  return <section className={styles.section} aria-labelledby="japan-price-examples-title">
    <h2 id="japan-price-examples-title">향수·화장품·위스키 3개, 무엇을 맞춰 비교할까요?</h2>
    <p>먼저 정확한 규격을 정하고 일본 가격의 종류를 확인하세요. 아래는 편집자가 고른 비교 사례이며 인기 순위가 아닙니다. 아래 가격은 2026년 11월 18일 과거 관찰 기록이며 현재가로 재확인하지 않았습니다. 소바쥬는 당시 롯데면세점의 동일 용량 공개 정상가와 대조한 사례입니다. SK-II는 규격 차이, 히비키는 에디션과 가격 종류 차이로 비교를 보류합니다.</p>
    <nav className={styles.actions} aria-label="대표 상품 바로가기">{japanPriceExamples.map(item => <a key={item.slug} href={`#example-${item.productId}`}>{item.name}</a>)}</nav>
    <p><small>작은 화면에서는 표를 좌우로 밀어 비교 항목을 확인할 수 있습니다.</small></p>
    <div className={styles.tableWrap} tabIndex={0} role="region" aria-label="대표 상품 가격 비교표 — 가로로 스크롤 가능">
      <table><caption>2026년 11월 18일 확인 자료 · 온라인 판매가와 제조사 권장가격 구분</caption><thead><tr><th scope="col">비교할 상품</th><th scope="col">일본 참고 가격</th><th scope="col">한국 면세 가격 / 판단</th></tr></thead><tbody>
        {japanPriceExamples.map(item => <tr key={item.slug}><th scope="row"><a href={`#example-${item.productId}`}>{item.name}</a></th><td>{item.price}<br /><small>{item.priceType}</small></td><td>{item.koreaPrice}<br /><small>{item.productId === 'p13' ? '11/18 과거 가격·참고 환율 단순 환산: 롯데 정상가가 약 5,238원 낮음 · 아래 조건 확인' : '가격 우열 보류'}</small></td></tr>)}
      </tbody></table>
    </div>
    {japanPriceExamples.map(item => <section id={`example-${item.productId}`} className={styles.product} key={item.slug}>
      <h3>{item.name}</h3>
      <p><strong>확인된 규격</strong> · {item.specification}</p>
      <p><strong>편집자의 추천 이유</strong> · {item.recommendation}</p>
      <dl><dt>일본 가격</dt><dd>{item.price} · {item.priceType}</dd><dt>판매처·언어</dt><dd>{item.seller} · {item.sourceLanguage}</dd><dt>확인일·시각</dt><dd>{item.checked}</dd><dt>가격 조건</dt><dd>{item.conditions}</dd><dt>구매 경로</dt><dd>{item.route}</dd><dt>한국 면세 비교</dt><dd>{item.koreaPrice}</dd><dt>판매처·확인 시점</dt><dd>{item.koreaSeller} · {item.koreaChecked}</dd><dt>규격·조건 대조</dt><dd>{item.koreaDetails}</dd><dt>비교 판단</dt><dd>{item.comparison}</dd></dl>
      <p><JapanShoppingLink href={item.url} kind="official" product={item.slug} source={source}>공식 출처: {item.seller} (외부 사이트)</JapanShoppingLink></p>
      <p><JapanShoppingLink href={item.koreaUrl} kind="official" product={item.slug} source={source}>한국 면세 공식 출처: {item.koreaSeller} (외부 사이트)</JapanShoppingLink></p>
      <nav className={styles.actions} aria-label={`${item.name} 다음 행동`}>
        <JapanShoppingLink href={`/product/${item.slug}`} kind="product" product={item.slug} source={source}>이 규격의 한국 면세 관찰가 확인</JapanShoppingLink>
        <JapanShoppingLink href="/japan#yen-calculator-title" kind="compare" product={item.slug} source={source}>{item.productId === "p13" ? "계산기에서 과거 관찰가 예시 불러오기" : "동일 규격의 두 가격을 확보한 뒤 계산"}</JapanShoppingLink>
      </nav>
    </section>)}
    <p>한국 출국 면세 주문은 본인의 출국편·수령 공항·주문 마감·구매 자격을 판매처에서 확인해야 합니다. 일본 온라인 구매, 일본 시내 구매, 한국 출국 면세 수령은 서로 다른 경로입니다. 일본 환급과 한국 귀국 시 반입 규정도 별도로 확인하세요.</p>
    <p>예상 환급액은 자동 차감하지 않습니다. 세 상품의 실제 지점 가격·재고·환급 조건과 한국 면세 최종 결제액은 추가 확인이 필요합니다.</p>
  </section>;
}

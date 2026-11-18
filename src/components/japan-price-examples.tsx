import { japanPriceExamples } from '@/lib/japan-price-examples';
import { JapanShoppingLink } from '@/components/japan-shopping-link';
import styles from './japan-price-examples.module.css';

export function JapanPriceExamples({ source }: { source: string }) {
  return <section className={styles.section} aria-labelledby="japan-price-examples-title">
    <h2 id="japan-price-examples-title">향수·화장품·위스키 3개, 무엇을 맞춰 비교할까요?</h2>
    <p>먼저 정확한 규격을 정하고 일본 가격의 종류를 확인하세요. 아래는 편집자가 고른 비교 사례이며 인기 순위가 아닙니다. 한국 면세 관찰가는 현재 확보되지 않아 절약액과 최저가 결론을 보류합니다.</p>
    <nav className={styles.actions} aria-label="대표 상품 바로가기">{japanPriceExamples.map(item => <a key={item.slug} href={`#example-${item.productId}`}>{item.name}</a>)}</nav>
    <p><small>작은 화면에서는 표를 좌우로 밀어 비교 항목을 확인할 수 있습니다.</small></p>
    <div className={styles.tableWrap} tabIndex={0} role="region" aria-label="대표 상품 가격 비교표 — 가로로 스크롤 가능">
      <table><caption>2026년 11월 18일 확인 자료 · 온라인 판매가와 제조사 권장가격 구분</caption><thead><tr><th scope="col">비교할 상품</th><th scope="col">일본 참고 가격</th><th scope="col">한국 면세 가격 / 판단</th></tr></thead><tbody>
        {japanPriceExamples.map(item => <tr key={item.slug}><th scope="row"><a href={`#example-${item.productId}`}>{item.name}</a></th><td>{item.price}<br /><small>{item.priceType}</small></td><td>비교 가능한 관찰가 미확인<br />가격 우열 보류</td></tr>)}
      </tbody></table>
    </div>
    {japanPriceExamples.map(item => <section id={`example-${item.productId}`} className={styles.product} key={item.slug}>
      <h3>{item.name}</h3>
      <p><strong>확인된 규격</strong> · {item.specification}</p>
      <p><strong>편집자의 추천 이유</strong> · {item.recommendation}</p>
      <dl><dt>일본 가격</dt><dd>{item.price} · {item.priceType}</dd><dt>판매처·언어</dt><dd>{item.seller} · {item.sourceLanguage}</dd><dt>확인일·시각</dt><dd>{item.checked}</dd><dt>가격 조건</dt><dd>{item.conditions}</dd><dt>구매 경로</dt><dd>{item.route}</dd><dt>한국 면세 비교</dt><dd>한국어 판매처의 동일 규격 관찰가 미확인. 가격·통화·관찰 시각·할인 조건을 확보한 뒤 비교해야 합니다. 미확인은 품절이나 판매하지 않는다는 뜻이 아닙니다.</dd></dl>
      <p><JapanShoppingLink href={item.url} kind="official" product={item.slug} source={source}>공식 출처: {item.seller} (외부 사이트)</JapanShoppingLink></p>
      <nav className={styles.actions} aria-label={`${item.name} 다음 행동`}>
        <JapanShoppingLink href={`/product/${item.slug}`} kind="product" product={item.slug} source={source}>이 규격의 한국 면세 관찰가 확인</JapanShoppingLink>
        <JapanShoppingLink href="/japan#yen-calculator-title" kind="compare" product={item.slug} source={source}>확인한 결제액으로 엔화 비교</JapanShoppingLink>
      </nav>
    </section>)}
    <p>한국 출국 면세 주문은 본인의 출국편·수령 공항·주문 마감·구매 자격을 판매처에서 확인해야 합니다. 일본 온라인 구매, 일본 시내 구매, 한국 출국 면세 수령은 서로 다른 경로입니다. 일본 환급과 한국 귀국 시 반입 규정도 별도로 확인하세요.</p>
    <p>예상 환급액은 자동 차감하지 않습니다. 세 상품의 실제 지점 가격·재고·환급 조건과 한국 면세 최종 결제액은 추가 확인이 필요합니다.</p>
  </section>;
}

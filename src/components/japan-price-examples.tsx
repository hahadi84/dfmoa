import { historicalYenExample, japanPriceExamples } from '@/lib/japan-price-examples';
import { JapanShoppingLink } from '@/components/japan-shopping-link';
import Link from '@/components/app-link';
import styles from './japan-price-examples.module.css';

export function JapanPriceExamples({ source }: { source: string }) {
  return <section className={styles.section} aria-labelledby="japan-price-examples-title">
    <h2 id="japan-price-examples-title">향수·화장품·위스키 3개, 무엇을 맞춰 비교할까요?</h2>
    <p>히비키 700ml 한 병은 11월 26일 일본 리커데포 배송몰과 한국 출국용 부산면세점 특가 목록에서 확인했습니다. 디올 소바쥬와 SK-II는 11월 18일 관찰 기록입니다. 소바쥬는 양쪽의 100ml 가격을 확인했고, SK-II는 일반 230ml 한 병의 한국 면세 가격이 더 필요합니다.</p>
    <nav className={styles.actions} aria-label="대표 상품 바로가기">{japanPriceExamples.map(item => <Link key={item.slug} href={`#example-${item.productId}`}>{item.name}</Link>)}</nav>
    <p><small>작은 화면에서는 표를 좌우로 밀어 비교 항목을 확인할 수 있습니다.</small></p>
    <div className={styles.tableWrap} tabIndex={0} role="region" aria-label="대표 상품 가격 비교표 — 가로로 스크롤 가능">
      <table><caption>2026년 11월에 확인한 일본 온라인 가격과 한국 출국 면세 가격</caption><thead><tr><th scope="col">비교할 상품</th><th scope="col">일본 참고 가격</th><th scope="col">한국 면세 가격 / 판단</th></tr></thead><tbody>
        {japanPriceExamples.map(item => <tr key={item.slug}><th scope="row"><Link href={`#example-${item.productId}`}>{item.name}</Link></th><td>{item.price}<br /><small>{item.priceType} · {item.checked.slice(0, 10)}</small></td><td>{item.koreaPrice}<br /><small>{item.productId === 'p13' ? '11/18 과거 가격·참고 환율 단순 환산: 롯데 정상가가 약 5,238원 낮음 · 아래 조건 확인' : '가격 우열 보류'}</small></td></tr>)}
      </tbody></table>
    </div>
    <section className={styles.packing} aria-labelledby="japan-liquid-baggage">
      <h3 id="japan-liquid-baggage" tabIndex={-1}>시내에서 산 향수·에센스·위스키, 어느 짐에 넣을까요?</h3>
      <p>일본발 국제선 보안검색에서는 병에 표시된 용량을 봅니다. 기내에 가져갈 액체류는 용기마다 100ml 이하여야 하고, 모두 1L 이하의 투명한 재밀봉 지퍼백 하나에 들어가야 합니다. 지퍼백은 1인 1개입니다.</p>
      <dl>
        {japanPriceExamples.map(item => (
          <div key={item.slug}>
            <dt><Link href={`#example-${item.productId}`} aria-label={`${item.name} 가격과 규격`}>{item.name}</Link></dt>
            <dd>{item.cityBaggage}</dd>
          </div>
        ))}
      </dl>
      <p><strong>시내 매장에서 소비세 환급을 신청했다면</strong> 여권과 면세 구매품을 모두 꺼내 보여줄 수 있게 두세요. 세관 반출 확인과 필요한 물품 검사를 마친 뒤 항공사에 짐을 맡기세요. <Link href="/guide/japan-tax-refund-2026#refund-airports">내 출국 터미널의 세관 지도 찾기</Link></p>
      <p><strong>출국 수속 후 공항 면세점에서 산 제품</strong>은 항공사의 운송 한도 안에서 100ml를 넘어도 기내로 가져갈 수 있습니다. 환승편이 있다면 결제 전에 환승 공항의 재검색 조건을 확인하세요. 보안 봉투(STEB)가 필요한 경우 매장에서 영수증을 넣어 밀봉해 주면 그대로 보관하세요.</p>
      <p><strong>한국에 도착하면</strong> 성인 여행자 1명의 주류 별도 면세 한도는 가져오는 술을 모두 합쳐 2L 이하이면서 미화 400달러 이하입니다. 향수의 별도 한도는 합계 100ml입니다. 시내와 공항 면세점에서 산 물건을 합산하고 한도를 넘으면 신고하세요.</p>
      <footer className={styles.packingSources}>
        <p>수하물·통관 기준 확인 <time dateTime="2026-11-26">2026년 11월 26일</time></p>
        <ul>
          <li><a href="https://www.narita-airport.jp/ko/airportguide/security/liquid/" target="_blank" rel="noreferrer">나리타공항 액체류 안내</a></li>
          <li><a href="https://www.mlit.go.jp/common/001425422.pdf#page=2" target="_blank" rel="noreferrer">일본 국토교통성 주류 운송 기준(PDF)</a></li>
          <li><a href="https://www.ana.co.jp/ko/kr/travel-information/baggage-information/carrying-on-liquids/" target="_blank" rel="noreferrer">ANA 환승 시 보안 봉투 안내</a></li>
          <li><a href="https://www.customs.go.kr/kcs/cm/cntnts/cntntsView.do?cntntsId=829&mi=2837" target="_blank" rel="noreferrer">한국 관세청 여행자 면세 범위</a></li>
        </ul>
      </footer>
    </section>
    {japanPriceExamples.map(item => <section id={`example-${item.productId}`} className={styles.product} key={item.slug}>
      <h3>{item.name}</h3>
      <p><strong>확인된 규격</strong> · {item.specification}</p>
      <p><strong>편집자의 추천 이유</strong> · {item.recommendation}</p>
      <dl>
        <dt>일본 가격</dt><dd>{item.price} · {item.priceType}</dd>
        <dt>한국 면세 가격</dt><dd>{item.koreaPrice}</dd>
        <dt>일본 판매처·확인 시각</dt><dd>{item.seller} · {item.sourceLanguage} · {item.checked}</dd>
        <dt>한국 판매처·확인 시각</dt><dd>{item.koreaSeller} · {item.koreaChecked}</dd>
        <dt>일본 가격 조건</dt><dd>{item.conditions}</dd>
        {'storeVisit' in item ? <>
          <dt>신주쿠에서 직접 살 때</dt>
          <dd>{item.route}
            <div className={styles.storeAddress}>지도 검색용 주소 <span lang="ja">{item.storeVisit.address}</span></div>
            <div className={styles.storeLink}><JapanShoppingLink href={item.storeVisit.floorMapUrl} kind="map" product={item.slug} store={item.storeVisit.store} source={source}>오다큐 지하 1층 매장 지도 열기</JapanShoppingLink></div>
          </dd>
          <dt>신주쿠에서 주문품을 찾을 때</dt>
          <dd>{item.storeVisit.pickup}
            <p className={styles.pickupTiming}>{item.storeVisit.timing}</p>
            <div className={styles.storeLink}><JapanShoppingLink href={item.storeVisit.pickupUrl} kind="official_branch" product={item.slug} store={item.storeVisit.store} source={source}>오다큐 공식 수령 창구 안내</JapanShoppingLink></div>
            <small>공식 안내에서 ‘便利なサービス’를 펼치세요. 매장·수령 안내 확인일 <time dateTime={item.storeVisit.checked}>{item.storeVisit.checked}</time></small>
          </dd>
        </> : <><dt>일본 구매 경로</dt><dd>{item.route}</dd></>}
        <dt>한국 면세 조건</dt><dd>{item.koreaDetails}</dd>
        <dt>비교 판단</dt><dd>{item.comparison}</dd>
      </dl>
      <p><JapanShoppingLink href={item.url} kind="official" product={item.slug} source={source}>공식 출처: {item.seller} (외부 사이트)</JapanShoppingLink></p>
      <p><JapanShoppingLink href={item.koreaUrl} kind="official" product={item.slug} source={source}>한국 면세 공식 출처: {item.koreaSeller} (외부 사이트)</JapanShoppingLink></p>
      {'references' in item && <ul aria-label="규격·환율·구매 조건의 출처">
        {item.references.map(ref => <li key={ref.url}><a href={ref.url} target="_blank" rel="noreferrer">{ref.label}</a></li>)}
      </ul>}
      <nav className={styles.actions} aria-label={`${item.name} 다음 행동`}>
        <JapanShoppingLink href={`/product/${item.slug}`} kind="product" product={item.slug} source={source}>이 규격의 한국 면세점별 가격 조회</JapanShoppingLink>
        {item.slug === historicalYenExample.product ? (
          <JapanShoppingLink href={`/japan#${historicalYenExample.anchor}`} kind="compare" product={item.slug} source={source}>계산기에서 소바쥬 11월 18일 가격 예시 보기</JapanShoppingLink>
        ) : (
          <JapanShoppingLink href="/japan#yen-calculator-title" kind="compare" product={item.slug} source={source}>내 엔화 가격과 면세 결제액으로 비교</JapanShoppingLink>
        )}
      </nav>
    </section>)}
    <p>한국 출국 면세 주문은 본인의 출국편·수령 공항·주문 마감·구매 자격을 판매처에서 확인해야 합니다. 일본 온라인 구매, 일본 시내 구매, 한국 출국 면세 수령은 서로 다른 경로입니다. 일본 환급과 한국 귀국 시 반입 규정도 별도로 확인하세요.</p>
    <p>예상 환급액은 자동 차감하지 않습니다. 세 상품의 실제 지점 가격·재고·환급 조건과 한국 면세 최종 결제액은 추가 확인이 필요합니다.</p>
  </section>;
}

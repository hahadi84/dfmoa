import styles from './japan-refund-visual.module.css';

const officialGuide = 'https://www.mlit.go.jp/kankocho/tax-free/page01_000001_00021.html';

export function JapanRefundVisual() {
  return <section className={styles.root} aria-labelledby="refund-visual-title">
    <header className={styles.header}>
      <p>2026년 11월 1일부터 일본 시내 면세점에서 산 물품 기준</p>
      <h2 id="refund-visual-title">일본 면세 환급, 한눈에 보는 순서</h2>
      <p><strong>면세품이 든 짐은 세관 확인을 마치고 부치세요.</strong></p>
    </header>
    <figure className={styles.figure}>
      <ol className={styles.steps}>
        <li><span className={styles.number} aria-hidden="true">1</span><div>
          <p className={styles.place}>시내 매장</p><h3>세금 포함 결제</h3>
          <p>면세 대상 구매인지 확인하고, 매장 안내에 따라 환급 수단을 등록합니다.</p>
        </div></li>
        <li><span className={styles.number} aria-hidden="true">2</span><div>
          <p className={styles.place}>출국 공항 · 짐 맡기기 전</p><h3>여권으로 반출 확인</h3>
          <p>구매일로부터 90일 이내. 여권과 면세 구매품 전부를 준비하고 키오스크 안내를 따릅니다.</p>
          <div className={styles.branches}>
            <div className={styles.green}><strong>초록색 판정 · 검사 불필요</strong><p>세관 확인 절차 종료</p></div>
            <div className={styles.red}><strong>빨간색 판정 · 검사 필요</strong><p>세관 검사 장소에서 물품 제시 후 확인 완료</p></div>
          </div>
        </div></li>
        <li><span className={styles.number} aria-hidden="true">3</span><div>
          <p className={styles.place}>세관 확인 완료 후</p><h3>출국과 환급을 각각 진행</h3>
          <div className={styles.branches}>
            <div><strong>수하물 위탁·출국</strong><p>확인받은 물품을 일본 밖으로 가져갑니다. 세관 확인 전에 짐을 맡기지 마세요.</p></div>
            <div><strong>매장·환급업체의 환급</strong><p>안내된 수단으로 환급받습니다. 현금 가능 여부와 지급 시점은 매장별로 다르며, 반드시 출국 후에만 지급되는 것은 아닙니다.</p></div>
          </div>
        </div></li>
      </ol>
      <figcaption>DFMOA 제작 절차도. 실제 공항 지도나 단말기 화면이 아닙니다. 환급 시점은 매장 안내에 따르며, 키오스크 확인이 곧 현금 수령을 뜻하지 않습니다. <a href={officialGuide} target="_blank" rel="noreferrer">공식 근거: 일본 관광청</a></figcaption>
    </figure>

    <div className={styles.tableWrap} tabIndex={0} role="region" aria-label="일본 면세 변경 전후 비교표, 좁은 화면에서는 가로로 이동">
      <table>
        <caption>달라진 점만 비교하기</caption>
        <thead><tr><th scope="col">확인할 것</th><th scope="col">2026년 10월까지 구매</th><th scope="col">2026년 11월부터 구매</th></tr></thead>
        <tbody>
          <tr><th scope="row">구매 시 세금</th><td>매장·지정 카운터에서 면세 처리</td><td>세금 포함 금액을 우선 결제</td></tr>
          <tr><th scope="row">환급의 전제</th><td>기존 면세 절차 적용</td><td>구매 후 90일 이내 출국 시 반출 확인</td></tr>
          <tr><th scope="row">소모품 포장</th><td>특수 포장 제도 적용</td><td>특수 포장 폐지. 일본 내 소비가 허용된다는 뜻은 아님</td></tr>
        </tbody>
      </table>
    </div>

    <fieldset className={styles.checklist}>
      <legend>짐을 맡기기 전 준비 체크</legend>
      <p>확인은 이 화면에서만 사용하며 저장되지 않습니다.</p>
      {['여권과 면세 구매품 전부를 꺼내 보여줄 수 있다', '영수증과 매장·환급업체 안내를 찾아둘 수 있다', '출국 공항과 터미널의 세관 확인 장소를 확인했다', '빨간색 판정이면 물품 검사까지 마쳤다', '환급 수단·예상 금액·문의처를 확인했다'].map(item =>
        <label key={item}><input type="checkbox" /><span>{item}</span></label>
      )}
    </fieldset>
  </section>;
}

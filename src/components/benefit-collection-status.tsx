import type { BenefitCoverage } from '@/lib/content-models';
import sources from '@/lib/benefit-sources.json';
const labels: Record<string,string> = {ok:'자동 목록 확인',manual_verified:'브라우저 확인 · 자동 수집 제한',no_verified_events:'기간 확인 행사 없음',error:'확인 실패'};
export function BenefitCollectionStatus({coverage}:{coverage?: BenefitCoverage[]}) {
  if(!coverage?.length)return null;
  return <section className="report-section benefit-coverage" aria-label="면세점별 확인 범위">
    <h2 className="section-title">면세점별 확인 범위</h2>
    <p className="section-copy">공식 목록에서 행사명과 시작·종료일을 확인한 항목입니다. 회사별 모든 행사나 개인별 할인 적용을 보장하지 않습니다.</p>
    <div style={{overflowX:'auto'}}><table style={{width:'100%',textAlign:'left',borderCollapse:'collapse',minWidth:540}}>
      <thead><tr>{['면세점','확인 방식','기간 확인 행사','실제 확인일','공식 목록'].map(label=><th key={label} scope="col" style={{padding:'12px 8px',borderBottom:'1px solid var(--line, #ddd)'}}>{label}</th>)}</tr></thead>
      <tbody>{coverage.map(item=><tr key={item.storeId}>
        <th scope="row" style={{padding:'12px 8px'}}>{sources.find(s=>s.storeId===item.storeId)?.name ?? item.storeId}</th>
        <td style={{padding:'12px 8px'}}>{labels[item.status] ?? '확인 필요'}</td>
        <td style={{padding:'12px 8px'}}>{item.count}개{item.scannedCount!==undefined?<small style={{display:'block'}}>목록 {item.scannedCount}항목 확인</small>:null}</td>
        <td style={{padding:'12px 8px'}}>{item.lastVerifiedAt ?? '미확인'}</td>
        <td style={{padding:'12px 8px'}}><a className="text-link" href={item.sourceUrl} target="_blank" rel="noreferrer">원본 확인</a></td>
      </tr>)}</tbody>
    </table></div>
    <p className="section-copy">기간 누락·종료·예정 행사, 2099·9999년 종료일의 상시 안내, 상세 연결이 불명확한 항목과 별도 검토가 필요한 카드 발급 캐시백은 집계에서 제외합니다. 자동 수집 제한 시 브라우저 확인 자료는 최대 7일만 사용하며, 종료된 행사는 먼저 제외합니다.</p>
  </section>;
}

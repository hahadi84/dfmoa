import type { Metadata } from 'next';
import { BenefitTopicPage } from '../benefit-topic-page';

const title = '면세점 적립금 받는 법과 사용 조건';
const description = '면세점 적립금·포인트 행사를 확인하고, 발급 방법과 사용기한, 주문당 한도, 제외 브랜드를 구매 전에 확인하세요.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/benefits/points' },
};

export default function PointsPage() {
  return <BenefitTopicPage topic="points" title={title} description={description} checks={[
    ['받는 방법', '행사 참여나 다운로드가 필요한지, 신규 가입·출국일 등록·회원 등급 조건이 있는지 공식 상세 페이지에서 확인하세요.'],
    ['지급일과 사용기한', '받는 기간과 쓰는 기간을 따로 확인하세요. 지금 결제에 쓸 수 있는 적립금과 구매 후 지급되는 적립금은 따로 기록하세요.'],
    ['주문당 사용 한도', '보유 잔액과 이번 주문에 적용할 수 있는 금액을 확인하세요. 제외 브랜드, 최소 결제액, 쿠폰과의 중복 여부에 따라 달라질 수 있습니다.'],
  ]} />;
}

import type { Metadata } from 'next';
import { BenefitTopicPage } from '../benefit-topic-page';

const title = '면세점 할인 비교｜쿠폰·카드 할인 조건';
const description = '면세점 쿠폰과 카드·결제 할인 행사를 모았습니다. 최소 결제금액, 할인 한도, 중복 적용과 공식 행사 기간을 확인하세요.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/benefits/discounts' },
};

export default function DiscountsPage() {
  return <BenefitTopicPage topic="discounts" title={title} description={description} checks={[
    ['쿠폰 적용 상품', '장바구니에 담은 브랜드·용량이 대상인지, 온라인과 오프라인 중 어디에서 쓸 수 있는지 확인하세요.'],
    ['카드와 결제 조건', '대상 카드, 간편결제 경로, 최소 결제액과 최대 할인액을 확인하세요. 즉시 할인과 나중에 반영되는 청구할인도 구분하세요.'],
    ['중복 적용과 실결제액', '쿠폰 적용 후 금액이 카드 혜택 기준을 충족하는지와 적립금을 함께 쓸 수 있는지 확인한 뒤 결제 화면의 금액을 비교하세요.'],
  ]} />;
}

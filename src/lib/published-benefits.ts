import archive from '../../data/content/benefit-publications.json';
import type { MonthlyDealReport } from './content-models';

export type PublishedBenefit = (typeof archive.monthly)[number]['benefits'][number];
export const publishedWeeklyBenefits = archive.weekly;
export const publishedMonthlyBenefits: MonthlyDealReport[] = archive.monthly.map(report => ({
  slug: report.slug,
  year: Number(report.slug.slice(0, 4)),
  month: Number(report.slug.slice(5, 7)),
  title: `${report.slug.slice(0, 4)}년 ${Number(report.slug.slice(5, 7))}월 면세점 혜택: 기간과 결제 조건 확인`,
  summary: '현대면세점 공식 목록에서 기간이 확인되는 행사를 모았습니다. 월중 변경 사항을 반영하며, 개인별 적용 여부와 상세 조건은 원본에서 확인하세요.',
  benefitRuleIds: [],
  benefits: report.benefits,
  sourceLinks: [{ sourceName: '현대면세점 공식 행사 목록', url: 'https://www.hddfs.com/event/op/evnt/evntShop.do', lastVerifiedAt: report.updatedAt }],
  publishedAt: report.publishedAt,
  updatedAt: report.updatedAt,
}));

import archive from '../../data/content/benefit-publications.json';
import latest from '../../data/content/benefit-latest.json';
import sources from './benefit-sources.json';
import type { MonthlyDealReport, BenefitCoverage } from './content-models';

export type PublishedBenefit = (typeof archive.monthly)[number]['benefits'][number];
// Preserve the original issue archive. A separately dated supplement updates only
// this week's view instead of issuing duplicates or rewriting previous weeks.
function weekStart(day: string) {
  const date=new Date(`${day}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate()-(date.getUTCDay()+6)%7);
  return date.toISOString().slice(0,10);
}
export const publishedWeeklyBenefits = archive.weekly.map(report => ({
  ...report,
  ...(report.period===weekStart(latest.checkedAt) ? {benefits:latest.benefits,updatedAt:latest.checkedAt,coverage:latest.coverage} : {coverage:'coverage' in report?report.coverage as BenefitCoverage[]:undefined}),
}));
export const publishedMonthlyBenefits: MonthlyDealReport[] = archive.monthly.map(report => ({
  slug: report.slug,
  year: Number(report.slug.slice(0, 4)),
  month: Number(report.slug.slice(5, 7)),
  title: `${report.slug.slice(0, 4)}년 ${Number(report.slug.slice(5, 7))}월 면세점 혜택: 기간과 결제 조건 확인`,
  summary: '면세점별 공식 목록에서 기간이 확인된 행사를 모았습니다. 회사별 확인 범위와 실제 확인일을 표시하며, 개인별 적용 여부와 상세 조건은 원본에서 확인하세요.',
  benefitRuleIds: [],
  benefits: report.slug===latest.checkedAt.slice(0,7)?latest.benefits:report.benefits,
  coverage: report.slug===latest.checkedAt.slice(0,7)?latest.coverage:undefined,
  sourceLinks: sources.filter(source=>report.benefits.some(benefit=>benefit.storeId===source.storeId)).map(source=>({
    sourceName: `${source.name} 공식 행사 목록`,url:source.url,
    lastVerifiedAt: report.benefits.filter(benefit=>benefit.storeId===source.storeId).map(benefit=>benefit.checkedAt).sort().at(-1) ?? report.updatedAt,
  })),
  publishedAt: report.publishedAt,
  updatedAt: report.updatedAt,
}));

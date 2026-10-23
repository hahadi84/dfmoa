import { dutyFreeBenefitStores, dutyFreeBenefitUpdatedAt } from "./duty-free-benefits";
import { publishedWeeklyBenefits } from './published-benefits';
import { getStoreById, type StoreId } from "./site-data";

export type BenefitReportBenefit = {
  title: string;
  type: string;
  description: string;
  url: string;
};

export type BenefitReportStoreSection = {
  storeId: StoreId;
  storeName: string;
  logoUrl: string;
  summary: string;
  benefitTypes: string[];
  benefits: BenefitReportBenefit[];
  checkPoints: string[];
  editorialNote: string;
};

export type BenefitReport = {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  updatedAt: string;
  periodLabel: string;
  storeCount: number;
  sourceCount: number;
  benefitTypes: string[];
  highlights: string[];
  sections: BenefitReportStoreSection[];
  methodology: string[];
  automationNote: string;
  disclaimer: string;
};

const REPORT_TIME_ZONE = "Asia/Seoul";

function dedupeText(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function toDateInput(value: string | Date) {
  if (value instanceof Date) {
    return value;
  }

  return new Date(`${value}T00:00:00+09:00`);
}

export function getKoreaDateString(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: REPORT_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function formatKoreanDate(value: string | Date) {
  const date = toDateInput(value);
  const dateLabel = new Intl.DateTimeFormat("ko-KR", {
    timeZone: REPORT_TIME_ZONE,
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
  const weekday = new Intl.DateTimeFormat("ko-KR", {
    timeZone: REPORT_TIME_ZONE,
    weekday: "short",
  }).format(date);

  return `${dateLabel}(${weekday})`;
}

function buildSlug(publishedAt: string) {
  return `${publishedAt}-duty-free-benefit-weekly`;
}

function getEditorialNote(types: string[]) {
  if (types.includes("카드할인")) {
    return "카드 할인은 결제수단, 구매금액대, 간편결제 조합에 따라 체감가 차이가 커서 원본 조건 확인이 필요합니다.";
  }

  if (types.includes("적립금")) {
    return "적립금은 로그인, 회원 등급, 출국일 등록 여부에 따라 노출과 사용 가능 금액이 달라질 수 있습니다.";
  }

  if (types.includes("쿠폰")) {
    return "쿠폰형 혜택은 발급 수량, 사용 기간, 브랜드 제외 조건을 먼저 확인하는 편이 안전합니다.";
  }

  return "기획전과 브랜드 행사는 재고 소진, 행사 기간, 지점 조건이 함께 바뀔 수 있어 원본 확인이 중요합니다.";
}

export function buildBenefitReport(publishedAt = dutyFreeBenefitUpdatedAt): BenefitReport {
  const reportDate = /^\d{4}-\d{2}-\d{2}$/.test(publishedAt) ? publishedAt : getKoreaDateString();
  const sections = dutyFreeBenefitStores.flatMap((benefitStore) => {
    const store = getStoreById(benefitStore.storeId);

    if (!store) {
      return [];
    }

    const benefitTypes = dedupeText(benefitStore.eventLinks.map((eventLink) => eventLink.type));

    return [
      {
        storeId: benefitStore.storeId,
        storeName: store.name,
        logoUrl: store.logoUrl,
        summary: benefitStore.summary,
        benefitTypes,
        benefits: benefitStore.eventLinks.map((eventLink) => ({
          title: eventLink.title,
          type: eventLink.type,
          description: eventLink.description,
          url: eventLink.url,
        })),
        checkPoints: benefitStore.checkPoints,
        editorialNote: getEditorialNote(benefitTypes),
      },
    ];
  });
  const allBenefits = sections.flatMap((section) => section.benefits);
  const benefitTypes = dedupeText(allBenefits.map((benefit) => benefit.type));
  const dateLabel = formatKoreanDate(reportDate);

  return {
    slug: buildSlug(reportDate),
    title: `${dateLabel} 면세점 혜택 주간 리포트`,
    description:
      "롯데·현대·신라·신세계면세점의 쿠폰, 적립금, 카드 할인, 브랜드 이벤트를 구매 전 확인 관점으로 정리했습니다.",
    publishedAt: reportDate,
    updatedAt: dutyFreeBenefitUpdatedAt,
    periodLabel: `${dateLabel} 기준`,
    storeCount: sections.length,
    sourceCount: allBenefits.length,
    benefitTypes,
    highlights: [
      "공개 가격에 이미 반영된 할인과 결제 전 추가 확인이 필요한 쿠폰·적립금을 분리해서 봐야 합니다.",
      "출국일, 회원 등급, 결제수단, 브랜드 제외 조건에 따라 같은 상품도 최종 결제 금액이 달라질 수 있습니다.",
      "타임세일과 선착순 쿠폰은 재고와 발급 수량이 빠르게 변하므로 원본 페이지에서 마감 여부를 확인해야 합니다.",
    ],
    sections,
    methodology: [
      "각 면세점 공식 혜택 페이지와 대표 이벤트 링크를 기준으로 정리했습니다.",
      "상품별 실제 적용 금액은 검색 결과의 공개가, 이벤트 배지, 원본 혜택 페이지를 함께 확인해야 합니다.",
      "로그인 후 개인별로 달라지는 쿠폰·적립금·카드 청구할인은 확정 결제 전 단계에서만 최종 확인할 수 있습니다.",
    ],
    automationNote:
      "이 리포트 형식은 매주 자동 초안으로 생성할 수 있게 구성했습니다. 자동 초안은 원본 링크와 조건을 모으고, 최종 공개 전 문구와 기간을 검수하는 흐름을 권장합니다.",
    disclaimer:
      "DFMOA는 면세점 공식 페이지의 공개 정보를 정리합니다. 혜택의 최종 적용 여부와 결제 금액은 각 면세점 원본 페이지에서 확인해야 합니다.",
  };
}

export const benefitReports: BenefitReport[] = [
  ...publishedWeeklyBenefits.map((report): BenefitReport => ({
    slug: report.slug,
    title: `${report.publishedAt} 면세점 혜택 주간 리포트`,
    description: '이번 주 확인한 현대면세점 행사 기간과 구매 전 확인할 결제 조건을 정리합니다.',
    publishedAt: report.publishedAt, updatedAt: report.updatedAt,
    periodLabel: `${report.publishedAt} 확인 · 주간 기록`,
    storeCount: 1, sourceCount: report.benefits.length, benefitTypes: ['공식 행사'],
    highlights: [
      `공식 행사 목록에서 기간을 확인한 ${report.benefits.length}개 행사입니다.`,
      '기간이 짧은 행사를 먼저 배치했습니다. 할인 한도·회원 조건·제외 브랜드는 상세 페이지에서 확인하세요.',
      '일본 여행 예정이라면 엔화 환산 비용과 국내 면세점 최종 결제액을 함께 비교하세요.',
    ],
    sections: [{ storeId: 'hyundai', storeName: '현대면세점', logoUrl: '/store-logos/hyundai-logo.png',
      summary: '공개 목록에서 확인 가능한 행사만 수록합니다. 다른 면세점 전체 혜택을 대표하지 않습니다.',
      benefitTypes: ['공식 행사'], benefits: report.benefits.map(item => ({
        title: item.title, type: '기간 확인', url: item.url,
        description: `${item.startDate} ~ ${item.endDate} · ${item.description}`,
      })),
      checkPoints: ['지난 호의 행사에는 종료된 혜택이 포함될 수 있습니다.', '수집 시점의 목록 노출은 개인별 할인 적용을 보장하지 않습니다.'],
      editorialNote: '최대 할인액을 모든 구매에 일괄 적용하지 말고, 결제창에서 실제 할인액을 확인하세요.',
    }],
    methodology: ['공식 목록의 행사명·시작일·종료일을 확인해 저장합니다.', '기간이 없거나 종료된 행사, 별도 자격 검토가 필요한 카드 발급 캐시백은 자동 수록하지 않습니다.', '매주 첫 수집 성공 시 새 호를 발행하고 이전 호의 내용과 날짜는 보존합니다.'],
    automationNote: '공식 목록의 기간 확인 후 주간 발행합니다.',
    disclaimer: '이 글은 발행일 기준 기록입니다. 현재 적용 조건과 종료 여부는 공식 행사 페이지에서 확인하세요.',
  })),
  buildBenefitReport(),
];

export const latestBenefitReport = benefitReports[0];

export function getBenefitReportBySlug(slug: string) {
  return benefitReports.find((report) => report.slug === slug);
}

import type { StoreId } from "@/lib/site-data";

export type BenefitLinkType = "쿠폰" | "적립금" | "카드할인" | "브랜드행사" | "매장혜택" | "기획전";

export type DutyFreeBenefitLink = {
  title: string;
  type: BenefitLinkType;
  description: string;
  url: string;
};

export type DutyFreeBenefitStore = {
  storeId: StoreId;
  benefitHomeUrl: string;
  summary: string;
  highlights: string[];
  eventLinks: DutyFreeBenefitLink[];
  checkPoints: string[];
};

export const dutyFreeBenefitUpdatedAt = "2026-04-19";

export const dutyFreeBenefitStores: DutyFreeBenefitStore[] = [
  {
    storeId: "lotte",
    benefitHomeUrl: "https://kor.lottedfs.com/kr/eventmain/benefit",
    summary: "쿠폰, 멤버십, 포인트 혜택과 시즌 기획전을 한 화면에서 확인하기 좋습니다.",
    highlights: ["혜택 홈", "선착순 쿠폰", "멤버십 포인트", "브랜드 특가"],
    eventLinks: [
      {
        title: "롯데면세점 혜택 모음",
        type: "쿠폰",
        description: "공식 혜택 탭에서 쿠폰, 포인트, 멤버십 혜택을 확인합니다.",
        url: "https://kor.lottedfs.com/kr/eventmain/benefit",
      },
      {
        title: "인천공항점 오픈 기념 온라인 단독 이벤트",
        type: "기획전",
        description: "~55% 특가, 선착순 쿠폰, 경품 등 공홈 이벤트로 노출된 프로모션입니다.",
        url: "https://kor.lottedfs.com/kr/event/eventDetail?evtDispNo=1054099",
      },
      {
        title: "오늘의 혜택 받기",
        type: "쿠폰",
        description: "환율 변동과 연계된 쿠폰·쇼핑 혜택을 확인하는 이벤트입니다.",
        url: "https://kor.lottedfs.com/kr/event/eventDetail?evtDispNo=1037462",
      },
      {
        title: "LDF 멤버십 등급 혜택",
        type: "적립금",
        description: "멤버십 등급별 혜택과 포인트 조건을 확인합니다.",
        url: "https://kor.lottedfs.com/kr/event/eventDetail?evtDispNo=1050701",
      },
    ],
    checkPoints: ["쿠폰은 선착순 또는 출국일 조건이 있을 수 있음", "포인트는 일부 브랜드에서 사용 제한 가능", "최종 결제 전 멤버십 등급 반영 여부 확인"],
  },
  {
    storeId: "hyundai",
    benefitHomeUrl: "https://www.hddfs.com/event/op/evnt/evntShop.do",
    summary: "H.oney, 카드 결제 혜택, 브랜드별 사은품과 적립금 이벤트가 자주 노출됩니다.",
    highlights: ["H.oney", "카드 할인", "브랜드 사은품", "특가 행사"],
    eventLinks: [
      {
        title: "현대면세점 혜택",
        type: "쿠폰",
        description: "공식 혜택 페이지에서 진행 중인 쿠폰과 이벤트를 확인합니다.",
        url: "https://www.hddfs.com/event/op/evnt/evntShop.do",
      },
      {
        title: "선착순 반값 H.oney",
        type: "적립금",
        description: "정해진 시간대에 열리는 H.oney 할인 찬스 이벤트입니다.",
        url: "https://www.hddfs.com/event/op/evnt/evntDetail.do?evntId=0007450",
      },
      {
        title: "삼성카드 결제 혜택",
        type: "카드할인",
        description: "구매금액대별 결제일 할인 혜택을 확인합니다.",
        url: "https://www.hddfs.com/event/op/evnt/evntDetail.do?evntId=0007344",
      },
      {
        title: "브랜드 행사",
        type: "브랜드행사",
        description: "브랜드별 사은품, 적립금, 단독 혜택을 모아봅니다.",
        url: "https://www.hddfs.com/event/op/spex/spexShop.do",
      },
    ],
    checkPoints: ["H.oney는 발급 시간과 사용 기간 확인", "카드 혜택은 결제수단과 구매금액 조건 확인", "브랜드 사은품은 재고 소진 여부 확인"],
  },
  {
    storeId: "shilla",
    benefitHomeUrl: "https://www.shilladfs.com/estore/kr/ko/event?uiel=Desktop",
    summary: "오늘의 혜택, 출국예정일 쿠폰, 선불·카드 혜택과 지점 혜택을 함께 확인할 수 있습니다.",
    highlights: ["오늘의 혜택", "더하기 쿠폰", "신라 선불", "지점 혜택"],
    eventLinks: [
      {
        title: "신라면세점 이벤트",
        type: "기획전",
        description: "공식 이벤트 목록에서 쇼핑·상품·지점 혜택을 확인합니다.",
        url: "https://www.shilladfs.com/estore/kr/ko/event?uiel=Desktop",
      },
      {
        title: "오늘의 혜택",
        type: "쿠폰",
        description: "일별 쿠폰과 추가 혜택을 확인하는 대표 이벤트입니다.",
        url: "https://www.shilladfs.com/estore/kr/ko/event/eventView?eventId=E81966",
      },
      {
        title: "출국예정일 등록 더하기 쿠폰",
        type: "쿠폰",
        description: "출국예정일 등록 후 받을 수 있는 쿠폰 혜택입니다.",
        url: "https://www.shilladfs.com/estore/kr/ko/event/departDueDate?eventId=E81968",
      },
      {
        title: "신라 선불 최대 혜택",
        type: "적립금",
        description: "구매금액대별 선불 혜택과 더블 혜택 조건을 확인합니다.",
        url: "https://www.shilladfs.com/estore/kr/ko/event/eventView?eventId=B66774",
      },
      {
        title: "카카오페이X삼성카드 혜택",
        type: "카드할인",
        description: "간편결제와 카드 결제 조합 혜택을 확인합니다.",
        url: "https://www.shilladfs.com/estore/kr/ko/event/eventView?affl_id=903165",
      },
    ],
    checkPoints: ["출국예정일 등록 여부에 따라 쿠폰 노출이 달라질 수 있음", "선불 혜택은 구매금액대와 지점 조건 확인", "카드 혜택은 결제수단 중복 가능 여부 확인"],
  },
  {
    storeId: "shinsegae",
    benefitHomeUrl: "https://www.ssgdfs.com/kr/event/initEventMain",
    summary: "타임세일, 신규회원 혜택, 카드·주류 할인, 브랜드 단독 사은 이벤트를 한 번에 확인합니다.",
    highlights: ["타임세일", "신규회원", "카드 할인", "브랜드 단독"],
    eventLinks: [
      {
        title: "신세계면세점 혜택",
        type: "기획전",
        description: "공식 이벤트 메인에서 할인, 적립, 카드, 브랜드 혜택을 확인합니다.",
        url: "https://www.ssgdfs.com/kr/event/initEventMain",
      },
      {
        title: "52시간 Weekend Sale",
        type: "기획전",
        description: "주말 타임세일과 특가 상품을 확인하는 공식 노출 프로모션입니다.",
        url: "https://www.ssgdfs.com/kr/event/initEventMain",
      },
      {
        title: "신규회원 특별 혜택",
        type: "쿠폰",
        description: "신규 가입자 대상 쿠폰·적립 혜택을 확인합니다.",
        url: "https://www.ssgdfs.com/kr/event/initEventMain",
      },
      {
        title: "이달의 혜택",
        type: "적립금",
        description: "월별 혜택, 카드 혜택, 브랜드 행사 조건을 함께 확인합니다.",
        url: "https://www.ssgdfs.com/kr/event/initEventMain",
      },
    ],
    checkPoints: ["상세 이벤트는 공홈 로그인·브라우저 상태에 따라 노출 차이 가능", "타임세일은 기간과 재고 소진 여부 확인", "신규회원 혜택은 기존 가입 이력과 출국 조건 확인"],
  },
];

import type { CategorySlug } from './site-data';

// Editorial discovery list for Korean duty-free shoppers, not a sales ranking.
const groups: Record<CategorySlug, ReadonlyArray<readonly [string, string]>> = {
  perfume: [
    ['크리드', 'CREED'], ['조말론', 'Jo Malone'], ['딥티크', 'Diptyque'], ['바이레도', 'Byredo'],
    ['르라보', 'Le Labo'], ['샤넬', 'Chanel'], ['디올', 'Dior'], ['톰 포드', 'Tom Ford'],
    ['메종 마르지엘라', 'Maison Margiela'], ['펜할리곤스', "Penhaligon's"],
    ['메종 프란시스 커정', 'Maison Francis Kurkdjian'],
    ['아쿠아 디 파르마', 'Acqua di Parma'], ['킬리안', 'Kilian'],
    ['논픽션', 'Nonfiction'], ['탬버린즈', 'Tamburins'], ['산타 마리아 노벨라', 'Santa Maria Novella'],
  ],
  beauty: [
    ['설화수', 'Sulwhasoo'], ['SK-II', 'SK-II'], ['에스티 로더', 'Estee Lauder'],
    ['랑콤', 'Lancome'], ['헤라', 'Hera'], ['키엘', "Kiehl's"], ['라메르', 'La Mer'],
    ['시세이도', 'Shiseido'], ['비오템', 'Biotherm'], ['이솝', 'Aesop'],
    ['라네즈', 'Laneige'], ['입생로랑 뷰티', 'Yves Saint Laurent Beauty'],
    ['나스', 'NARS'], ['바비 브라운', 'Bobbi Brown'], ['맥', 'MAC'], ['바이오더마', 'Bioderma'],
  ],
  liquor: [
    ['글렌피딕', 'Glenfiddich'], ['히비키', 'Hibiki'], ['발렌타인', "Ballantine's"],
    ['조니워커', 'Johnnie Walker'], ['맥캘란', 'The Macallan'], ['야마자키', 'Yamazaki'],
    ['로얄살루트', 'Royal Salute'], ['글렌모렌지', 'Glenmorangie'], ['헤네시', 'Hennessy'],
    ['돈 훌리오', 'Don Julio'], ['하쿠슈', 'Hakushu'], ['레미마틴', 'Rémy Martin'],
    ['하이랜드 파크', 'Highland Park'], ['기원 위스키', 'Ki One'],
  ],
  eyewear: [
    ['젠틀몬스터', 'Gentle Monster'], ['레이밴', 'Ray-Ban'], ['오클리', 'Oakley'],
    ['마우이 짐', 'Maui Jim'], ['페르솔', 'Persol'], ['셀린느', 'Celine'],
  ],
  fashion: [
    ['롱샴', 'Longchamp'], ['투미', 'TUMI'], ['몽블랑', 'Montblanc'], ['코치', 'Coach'],
    ['폴로 랄프 로렌', 'Polo Ralph Lauren'], ['엠씨엠', 'MCM'], ['쌤소나이트', 'Samsonite'],
    ['비비안 웨스트우드', 'Vivienne Westwood'], ['프라다', 'Prada'], ['구찌', 'Gucci'],
  ],
  watch: [
    ['세이코', 'Seiko'], ['시티즌', 'Citizen'], ['티쏘', 'Tissot'], ['카시오', 'Casio'],
    ['해밀턴', 'Hamilton'], ['론진', 'Longines'], ['스와치', 'Swatch'],
  ],
  jewelry: [
    ['스와로브스키', 'Swarovski'], ['판도라', 'Pandora'], ['제이에스티나', 'J.ESTINA'],
    ['스톤헨지', 'Stonehenge'], ['티파니앤코', 'Tiffany & Co.'], ['골든듀', 'Golden Dew'],
  ],
  health: [
    ['정관장', 'KGC'], ['오쏘몰', 'Orthomol'], ['센트룸', 'Centrum'], ['솔가', 'Solgar'],
    ['지엔씨', 'GNC'], ['락토핏', 'Lacto-Fit'], ['블랙모어스', 'Blackmores'], ['고려은단', 'Korea Eundan'],
  ],
  food: [
    ['고디바', 'Godiva'], ['로이스', 'Royce'], ['레더라', 'Laderach'], ['하리보', 'Haribo'],
    ['린트', 'Lindt'], ['토블론', 'Toblerone'], ['페레로 로쉐', 'Ferrero Rocher'], ['바샤커피', 'Bacha Coffee'],
  ],
  electronics: [
    ['애플', 'Apple'], ['소니', 'Sony'], ['보스', 'Bose'], ['다이슨', 'Dyson'],
    ['브라운', 'Braun'], ['제이비엘', 'JBL'], ['닌텐도', 'Nintendo'], ['삼성', 'Samsung'], ['가민', 'Garmin'],
  ],
};

export const directoryBrands = Object.entries(groups).flatMap(([category, names]) =>
  names.map(([nameKo, nameEn]) => ({ category: category as CategorySlug, nameKo, nameEn })),
);

export function brandNameKey(name: string) {
  return name.normalize('NFKD').toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
}

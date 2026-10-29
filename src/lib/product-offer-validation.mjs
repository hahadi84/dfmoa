import verifiedIdentities from './verified-offer-identities.json' with { type: 'json' };
export const OFFER_VALIDATION_VERSION = 'exact-product-v2';
const brands = {
 p1:['CREED','크리드'],p2:['Jo Malone','Jo Malone London','조말론','조말론런던'],p3:['Sulwhasoo','설화수'],p4:['SK-II','에스케이투'],p5:['Glenfiddich','글렌피딕'],
 p9:['Diptyque','딥티크'],p10:['Byredo','바이레도'],p11:['Le Labo','르 라보'],p12:['Chanel','샤넬'],p13:['Dior','디올'],p14:['Tom Ford','Tom Ford Beauty','톰 포드 뷰티'],
 p15:['Maison Margiela','Maison Margiela Fragrances','메종 마르지엘라 향수'],p16:['Penhaligons','펜할리곤스'],p17:['Estee Lauder','에스티 로더'],p18:['Lancome','랑콤'],p19:['Hera','헤라'],
 p20:['Kiehls','키엘'],p21:['La Mer','라 메르'],p22:['Shiseido','시세이도'],p23:['Biotherm','비오템'],p24:['Aesop','이솝'],p25:['Ballantines','발렌타인'],
 p26:['Johnnie Walker','조니워커'],p27:['Macallan','The Macallan','맥캘란'],p28:['Yamazaki','야마자키'],p29:['Royal Salute','로얄살루트'],p30:['Glenmorangie','글렌모렌지'],p31:['Hennessy','헤네시'],p32:['Don Julio','돈훌리오'],
 p71:['KGC','정관장'],p74:['Solgar','솔가'],p92:['Sony','소니'],p101:['Sony','소니'],p102:['Sony','소니'],p103:['GNC'],
};
const normalizeBrand = value => String(value ?? '').normalize('NFKC').toLowerCase().replace(/[^a-z0-9가-힣]/g, '');
// One fail-closed matching policy for exported pages, live results and daily snapshots.
const rules = {
 p1: { name: /aventus|어벤투스/i, reject: /cologne|코롱|for\s*her|포\s*허/i },
 p2: { name: /english\s*pear.*freesia|잉글리쉬\s*페어.*프리지아/i },
 p3: { name: /first\s*care|윤조/i },
 p4: { name: /facial\s*treatment\s*essence|페이셜\s*트리트먼트\s*에센스|피테라/i, reject: /\bmen\b|맨\s*페이셜/i },
 p5: { name: /glenfiddich|글렌피딕/i, require: /solera|솔레라/i, reject: /perpetual|퍼페추얼|sherry|셰리|쉐리/i },
 p9: { name: /do\s*son|도\s*손/i, require: /\bEDT\b|뚜왈렛|투알렛/i },
 p10: { name: /blanche|블랑쉬/i, require: /\bEDP\b|빠르펭|퍼퓸/i },
 p11: { name: /santal\s*33|상탈\s*33/i, require: /\bEDP\b|빠르펭|퍼퓸/i },
 p12: { name: /bleu|블루\s*드\s*샤넬/i, require: /\bEDP\b|빠르펭|퍼퓸/i },
 p13: { name: /sauvage|소바쥬|소바주/i, require: /\bEDP\b|빠르펭|퍼퓸/i },
 p14: { name: /oud\s*wood|오드\s*우드/i, require: /\bEDP\b|빠르펭|퍼퓸/i },
 p15: { name: /lazy\s*sunday\s*morning|레이지\s*선데이\s*모닝/i },
 p16: { name: /halfeti|할페티/i },
 p17: { name: /advanced\s*night\s*repair|나이트\s*리페어|\bANR\b/i },
 p18: { name: /genifique|제니피끄/i },
 p19: { name: /black\s*cushion|블랙\s*쿠션/i },
 p20: { name: /ultra\s*facial.*cream|울트라\s*훼이셜.*크림/i, reject: /oil.?free|오일.?프리/i },
 p21: { name: /moisturizing\s*cream|모이스춰라이징\s*크림/i },
 p22: { name: /ultimune|얼티뮨/i },
 p23: { name: /life\s*plankton|라이프\s*플랑크톤/i },
 p24: { name: /resurrection|레저렉션/i, require: /hand\s*balm|핸드\s*밤/i },
 p25: { name: /ballantine|발렌타인/i, require: /21\s*(?:year|yo|년)/i, reject: /edition|에디션|말본|아티스트/i },
 p26: { name: /johnnie\s*walker|조니\s*워커/i, require: /blue\s*label|블루\s*라벨/i },
 p27: { name: /macallan|맥캘란/i, require: /double\s*cask|더블\s*캐스크/i },
 p28: { name: /yamazaki|야마자키/i, require: /12\s*(?:year|yo|년)/i },
 p29: { name: /royal\s*salute|로얄\s*살루트/i, require: /21\s*(?:year|yo|년)/i, reject: /vintage|빈티지|edition|에디션|루나|뉴이어/i },
 p30: { name: /glenmorangie|글렌모렌지/i, require: /10\s*(?:year|yo|년)/i },
 p31: { name: /hennessy|헤네시/i, require: /\bXO\b|엑스오/i, reject: /paradis|파라디/i },
 p32: { name: /don\s*julio|돈\s*훌리오/i, require: /1942/ },
 p92: { name: /^WH[\s-]*1000XM5\/[BSP](?:\s+노이즈캔슬링\s+헤드폰\s+5세대)?$/i, modelOnly: true },
 p71: { name: /^에브리타임\s*로얄\s*\(\s*30포\s*\)$/, modelOnly: true },
 p74: { name: /^(?:솔가|solgar)\s*(?:비타민|vitamin)\s*D3\s*1000(?:\s*IU)?\s*90(?:정|\s*tablets?)$/i, modelOnly: true },
 p101: { name: /^WF[\s-]*1000XM5\/[BSP](?:\s+노이즈캔슬링\s+무선이어폰\s+5세대)?$/i, modelOnly: true },
 p102: { name: /^WH[\s-]*CH720N\/[BWN]$/i, modelOnly: true },
 p103: { name: /^메가맨\s*스포츠\s*남성\s*멀티비타민\s*180정(?:\s*\(비타민,종합,BCAA\))?$/, modelOnly: true },
};
/** @param {{id:string,volume:string}} product @param {{title?:string,priceKrw?:number|null,priceUsd?:number|null}} item */
export function getOfferMatchReason(product, item) {
 const title = (item.title ?? '').normalize('NFKC');
 // Guard product kind before matching the model: model names also occur on accessories.
 if (/이어\s*패드|교체용|보호\s*케이스|케이스\s*단품|충전\s*케이스\s*단품|\b(?:earpads?|replacement|accessor(?:y|ies)|shower\s*gel|body\s*(?:wash|lotion|cream|mist))\b|샤워\s*젤|샤워\s*겔|바디\s*(?:워시|로션|크림|미스트)/i.test(title)) return 'different_product_kind';
 if (/\b(?:duo|trio|set|refill|discovery|pack\s*of\s*[2-9]|[2-9]\s*pack)\b|리필|듀오|세트|디스커버리|묶음|[+]|[x×*]\s*\d|(?:^|[^\d])(?:[2-9]|\d{2,})\s*(?:개입|개\s*묶음|개\s*세트|팩|박스|병|개)(?![가-힣\d])/i.test(title)) return 'bundle_or_refill';
 if (/(?:^|[^\d])(?:[2-9]|\d{2,})\s*(?:개(?:입|묶음|세트)?|병|박스|팩|pcs?\b|pieces?\b|bottles?\b)/i.test(title)) return 'bundle_or_refill';
 const identity = verifiedIdentities[product.id];
 if (identity) {
   const normalize = value => String(value ?? '').normalize('NFKC').replace(/\s+/g, ' ').trim().toLowerCase();
   return identity.offers.some(offer => item.id === offer.id && normalize(item.brand) === normalize(offer.brand) && normalize(title) === normalize(offer.title)) ? null : 'different_or_unverified_model';
 }
 const rule = rules[product.id];
 if (!rule) return 'model_not_verified';
 if (product.brand && !(brands[product.id] ?? [product.brand]).some(brand => normalizeBrand(brand) === normalizeBrand(item.brand))) return 'brand_not_verified';
 if (!title || !rule.name.test(title) || (rule.require && !rule.require.test(title)) || (rule.reject && rule.reject.test(title))) return 'different_or_unverified_model';
 const capacities = title.match(/\d+(?:\.\d+)?\s*(?:ml|g)\b/gi) ?? [];
 if (capacities.length > 1) return 'multiple_sizes';
 if (!rule.modelOnly) {
  const volume = product.volume.match(/^(\d+(?:\.\d+)?)\s*(ml|g)$/i);
  if (!volume) return 'size_not_verified';
  const expected = new RegExp(`(?:^|[^\\d])${volume[1].replace('.', '\\.')}\\s*${volume[2]}(?![a-z])`, 'i');
  if (!expected.test(title)) return 'size_not_verified';
 }
 return null;
}
/** @param {{id:string,volume:string}} product @param {{title?:string,priceKrw?:number|null,priceUsd?:number|null}} item */
export function isVerifiedProductOffer(product, item) { return getOfferMatchReason(product,item) === null; }
/** @template T @param {{id:string,volume:string}} product @param {T} snapshot @returns {T} */
export function filterVerifiedSnapshot(product, snapshot) {
 if (!snapshot || typeof snapshot !== 'object' || !('sources' in snapshot)) return snapshot;
 const value = /** @type {{sources:Record<string,any>}} */ (snapshot);
 const sources = Object.fromEntries(Object.entries(value.sources).map(([id,source]) => {
  const items = (source.items ?? []).filter(item => isVerifiedProductOffer(product,item));
  return [id,{...source,items,...(source.items?.length && !items.length ? {status:'error',error:'product_match_failed'} : {})}];
 }));
 return /** @type {T} */ ({...snapshot,sources});
}

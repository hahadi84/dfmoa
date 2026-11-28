export type Locale = "ko" | "en" | "zh";
export const locales: Locale[] = ["ko","en","zh"];
export type Words = [string,string,string];
export const words = (ko:string,en:string,zh:string): Words => [ko,en,zh];
export const translate = (locale:Locale, value:Words) => value[locales.indexOf(locale)];
export function carePath(locale:Locale, slug = "") {
  return ["/japan/clinics", locale === "ko" ? "" : locale, slug].filter(Boolean).join("/");
}
export const directorySource = "https://www.mhlw.go.jp/stf/newpage_05774.html";
export const visitorSource = "https://www.jnto.go.jp/emergency/eng/mi_guide.html";
export const clinicTitle = words("일본 여행 병원 가이드","Medical care in Japan","日本旅行就医指南");
export const intro = words("여행지에서 진료받을 곳을 찾고, 방문 전에 언어 지원과 예상 비용을 확인하세요.","Find care near your destination and check language support and fees before you go.","按旅行目的地查找医疗机构，提前确认接诊语言和费用。");
export type Topic = { slug:string; title:Words; note:Words; dept?:string; source?:string };
export const topics:Topic[] = [
  {slug:"mounjaro",title:words("마운자로 처방 상담","Mounjaro consultation","替尔泊肽处方咨询"),note:words("여행 전에 기존 처방과 귀국 시 필요한 서류를 확인하세요. 일본에서 마운자로의 허가 적응증은 제2형 당뇨병이며 처방 여부는 의사가 판단합니다.","Check your existing prescription and return-country documentation. Mounjaro is approved in Japan for type 2 diabetes. A doctor decides whether to prescribe it.","出行前核对现有处方和入境所需文件。日本批准该药用于2型糖尿病，由医生评估能否开具处方。"),source:"https://japannetclinic.com/"},
  {slug:"emergency-contraception",title:words("응급피임 상담","Emergency contraception","紧急避孕咨询"),note:words("상담 가능한 시간과 당일 수령 여부를 바로 문의하세요. 후생노동성은 판매 가능한 약국 목록도 제공합니다.","Call promptly to check consultation times and same-day access. The ministry also lists participating pharmacies.","请及时联系机构确认咨询时间和当天能否取药。厚生劳动省另有药店名单。"),source:"https://www.mhlw.go.jp/stf/kinnkyuuhininnyaku_00005.html"},
  {slug:"dental",title:words("치과·치통","Dental care","牙科与牙痛"),note:words("여행 중 치통이 생겼다면 당일 초진과 응급 처치가 가능한지 먼저 물어보세요.","Ask whether the dental office accepts first-time patients today and can address urgent pain.","牙痛时可先询问牙科今天是否接收初诊患者，以及能否处理急性疼痛。"),dept:"歯科"},
  {slug:"placenta",title:words("태반주사 상담","Placenta injection consultation","胎盘制剂注射咨询"),note:words("제제명과 투여 방식, 진찰료를 확인하세요. 주사와 점적은 견적이 다를 수 있습니다.","Confirm the product, route and consultation fee. An injection and an infusion may be quoted separately.","先确认制剂名称、给药方式和诊察费，注射与输液的报价可能不同。"),source:"https://www.bi-ha-da.jp/treatments/infusiontherapy"},
  {slug:"regenerative",title:words("재생의료 상담","Regenerative medicine","再生医疗咨询"),note:words("기관이 안내한 시술명과 제공 계획을 후생노동성 공개 자료에서 대조하고 위험과 사후 관리 방법을 문의하세요.","Match the procedure and provider to the ministry’s published plan. Ask about risks and follow-up care.","核对厚生劳动省公布的提供计划、机构和项目名称，并询问风险及后续护理。"),source:"https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/0000186471.html"},
  {slug:"aesthetic",title:words("보톡스·필러·레이저","Botulinum toxin, fillers and lasers","肉毒毒素、填充与激光"),note:words("상담을 맡을 의사, 견적에 포함된 부위와 재진 비용을 확인하세요.","Ask who will assess you, what areas the quote covers and how follow-up is billed.","预约前询问面诊医生、报价涵盖的部位以及复诊费用。"),source:"https://clinic-ginza.com/ja/price-list/?view=first-visit"},
  {slug:"skin-care",title:words("피부관리·메디스파","Skin care and medical spas","皮肤护理与医疗美容"),note:words("예약하려는 서비스가 생활 미용인지 의료 시술인지, 상담과 시술을 누가 담당하는지 확인하세요.","Check whether you are booking a salon service or a medical procedure and who will provide it.","先确认预约的是生活美容还是医疗项目，以及由谁提供服务。"),source:"https://clinic-ginza.com/ko/"},
  {slug:"stomach",title:words("복통·배탈","Stomach pain and upset","腹痛与肠胃不适"),note:words("내과 접수처에 증상이 시작된 시간과 현재 위치를 알리고 방문 가능 여부를 확인하세요.","Call internal medicine with your location and when symptoms began to confirm that you can be seen.","联系内科时说明所在位置和症状开始的时间，确认是否能接诊。"),dept:"内科"},
  {slug:"allergy",title:words("알레르기·두드러기","Allergies and hives","过敏与荨麻疹"),note:words("피부 증상을 상담할 수 있는지 문의하세요. 숨쉬기 어렵거나 응급 상황이면 일본에서 119로 전화하세요.","Ask whether the clinic can assess skin symptoms. In an emergency, including difficulty breathing, call 119 in Japan.","可先询问能否接诊皮肤症状。若呼吸困难或发生紧急情况，请在日本拨打119。"),dept:"皮膚科"},
  {slug:"fever",title:words("발열·감기 증상","Fever and cold symptoms","发热与感冒症状"),note:words("내과에 먼저 전화해 발열 환자 접수 시간과 출입구를 확인하세요.","Call internal medicine before arrival to check reception hours and which entrance to use for fever.","到院前先致电内科，确认发热患者的接诊时间及入口。"),dept:"内科"},
  {slug:"injury",title:words("부상·골절 의심","Injuries and suspected fractures","外伤与疑似骨折"),note:words("정형외과에 다친 부위와 이동 가능 여부를 알리세요. 구급차가 필요하면 119로 전화하세요.","Tell orthopedics where you are injured and whether you can travel. Call 119 if you need an ambulance.","联系骨科时说明受伤部位及能否行动。需要救护车时请拨119。"),dept:"整形外科"},
];
export const regionKo = "홋카이도 아오모리 이와테 미야기 아키타 야마가타 후쿠시마 이바라키 도치기 군마 사이타마 지바 도쿄 가나가와 니가타 도야마 이시카와 후쿠이 야마나시 나가노 기후 시즈오카 아이치 미에 시가 교토 오사카 효고 나라 와카야마 돗토리 시마네 오카야마 히로시마 야마구치 도쿠시마 가가와 에히메 고치 후쿠오카 사가 나가사키 구마모토 오이타 미야자키 가고시마 오키나와".split(" ");
export const regionEn = "Hokkaido Aomori Iwate Miyagi Akita Yamagata Fukushima Ibaraki Tochigi Gunma Saitama Chiba Tokyo Kanagawa Niigata Toyama Ishikawa Fukui Yamanashi Nagano Gifu Shizuoka Aichi Mie Shiga Kyoto Osaka Hyogo Nara Wakayama Tottori Shimane Okayama Hiroshima Yamaguchi Tokushima Kagawa Ehime Kochi Fukuoka Saga Nagasaki Kumamoto Oita Miyazaki Kagoshima Okinawa".split(" ");
export const regionZh = "北海道 青森 岩手 宫城 秋田 山形 福岛 茨城 栃木 群马 埼玉 千叶 东京 神奈川 新潟 富山 石川 福井 山梨 长野 岐阜 静冈 爱知 三重 滋贺 京都 大阪 兵库 奈良 和歌山 鸟取 岛根 冈山 广岛 山口 德岛 香川 爱媛 高知 福冈 佐贺 长崎 熊本 大分 宫崎 鹿儿岛 冲绳".split(" ");
export const regionNames = {ko:regionKo,en:regionEn,zh:regionZh};
export type Practice = {name:Words; region:number; tags:string[]; url:string; note?:Words; address?:string};
export const practices:Practice[] = [
 {name:words("준텐도대학병원 정형외과","Juntendo University Hospital Orthopedics","顺天堂医院骨科"),region:13,tags:["regenerative"],url:"https://hosp.juntendo.ac.jp/clinic/department/seikei/about/",note:words("기관의 PRP 제공 계획 번호는 PB3150023입니다.","Published PRP plan number: PB3150023.","该院公开的PRP提供计划编号为PB3150023。")},
 {name:words("재팬넷클리닉","Japan Net Clinic","Japan Net Clinic 银座"),region:13,tags:["mounjaro","emergency-contraception"],url:"https://japannetclinic.com/",address:"東京都中央区銀座8-9-7 HULIC & New GINZA 8 11F",note:words("한국어 진료 안내. 마운자로 12펜 비용과 초진·서류비는 아래 비용표에서 확인하세요.","Korean consultations. The fee table shows 12-pen packages, first visits and documents.","可用韩语就诊。下方价目表列出12支套装、初诊及文件费用。")},
 {name:words("에이스클리닉 나고야","Ace Clinic Nagoya","名古屋 Ace Clinic"),region:23,tags:["mounjaro"],url:"https://nagoya.ace-clinic.com/shinryo/mounjaro/",note:words("초진 예약. 2.5mg 4펜 세금 포함 18,040엔, 초·재진료 무료. 증명서는 별도 확인.","Book the first visit. Four 2.5 mg pens cost ¥18,040 including tax. Consultations are free. Check document fees.","初诊需预约。2.5 mg四支含税18,040日元，初复诊免诊察费，证明文件费用需另询。")},
 {name:words("클라라 뷰티 클리닉 삿포로","Clara Beauty Clinic Sapporo","札幌 Clara Beauty Clinic"),region:1,tags:["mounjaro"],url:"https://clarabeautyclinic.jp/sapporo/menu/medicine/manjaro/",note:words("2.5mg 4펜 약값은 세금 포함 12,078엔입니다. 진찰료와 여행자 접수는 별도로 확인하세요.","Four 2.5 mg pens are listed at ¥12,078 with tax. Confirm consultation fees and visitor eligibility.","2.5 mg四支含税12,078日元，请另询诊察费及游客接诊条件。")},
 {name:words("야마모토 내과","Yamamoto Internal Medicine","山本内科"),region:34,tags:["mounjaro"],url:"https://yamamoto-naika-clinic.com/menu/diet.html"},
 {name:words("기무라 내과","Kimura Internal Medicine","木村内科"),region:34,tags:["mounjaro"],url:"https://www.kmclinic.jp/treatment/"},
 {name:words("다쿠마 패밀리 클리닉","Takuma Family Clinic","Takuma 家庭诊所"),region:34,tags:["mounjaro"],url:"https://gutliverclinic.com/private-practice/"},
 {name:words("부쿠스 클리닉 후쿠오카","BOOCS Clinic Fukuoka","福冈 BOOCS Clinic"),region:40,tags:["mounjaro"],url:"https://www.boocsclinic.com/view/fnews/page_1.html",address:"福岡市博多区店屋町6-18 ランダムスクエアビル6F",note:words("2.5mg 4펜 12,000엔에 회당 진찰·검사비 2,200엔 별도. 후쿠오카시 외 거주자는 금액과 기간을 문의해야 합니다.","Four 2.5 mg pens are listed at ¥12,000 plus ¥2,200 per visit for consultation and tests. Non-residents of Fukuoka City must confirm pricing and duration.","2.5 mg四支12,000日元，每次另收诊察检查费2,200日元。福冈市外居民须确认费用与期限。")},
 {name:words("나나이로 클리닉","Nanairo Clinic","七色诊所"),region:40,tags:["mounjaro"],url:"https://nana.clinic/info/medical-diet/"},
 {name:words("긴자 오하다 피부과","Ginza Ohada Clinic","银座皮肤诊所"),region:13,tags:["placenta"],url:"https://www.bi-ha-da.jp/treatments/infusiontherapy"},
 {name:words("뷰티온 클리닉 긴자","BeautyOn Clinic Ginza","BeautyOn 银座诊所"),region:13,tags:["skin-care","aesthetic","placenta"],url:"https://clinic-ginza.com/ja/price-list/?view=first-visit"},
 {name:words("메드시티21","MedCity21","MedCity21 健康检查"),region:27,tags:["checkup"],url:"https://www.hosp.omu.ac.jp/medcity21/reservation/web-reservation/",note:words("건강검진 예약 시 필요한 통역 언어를 신청하세요.","Request your interpreting language when booking a screening.","预约体检时说明所需口译语言。")},
 {name:words("오사카 공립대학병원 종합진료과","Osaka Metropolitan University Hospital","大阪公立大学医学部附属医院"),region:27,tags:["general"],url:"https://www.hosp.omu.ac.jp/departments/01-sougou/01-sougou.html",note:words("종합진료과 초진 소개장을 확인하세요.","Check referral requirements for general medicine.","联系综合诊疗科确认转诊信要求。")},
];


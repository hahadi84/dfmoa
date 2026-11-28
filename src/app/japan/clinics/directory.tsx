"use client";
import { useEffect, useState } from "react";
import { directorySource, practices, regionNames, translate, words, type Locale, type Topic } from "@/lib/japan-care";

type Facility = { region:number; name:string; english:string; address:string; area:string; hours:string; phone:string; departments:string; url:string };
const departments = [
  ["内科","내과","Internal medicine","内科"],["歯科","치과","Dentistry","牙科"],["皮膚科","피부과","Dermatology","皮肤科"],
  ["整形外科","정형외과","Orthopedics","骨科"],["小児科","소아과","Pediatrics","儿科"],["婦人科","부인과","Gynecology","妇科"],
  ["眼科","안과","Ophthalmology","眼科"],["救急","응급의학","Emergency medicine","急诊"],
];
const dataUrl = "/data/japan-medical-20261128.json";
const cityAliases: Record<string,string> = {삿포로:"札幌",하코다테:"函館",센다이:"仙台",나고야:"名古屋",나하:"那覇",요코하마:"横浜",고베:"神戸",기타큐슈:"北九州",시부야:"渋谷",신주쿠:"新宿",긴자:"銀座"};
export default function Directory({locale,topic}:{locale:Locale;topic?:Topic}) {
  const t = (ko:string,en:string,zh:string)=>translate(locale,words(ko,en,zh));
  const [directory,setDirectory] = useState(!topic || Boolean(topic.dept));
  const [rows,setRows] = useState<Facility[] | null>(null);
  const [failed,setFailed] = useState(false);
  const [retry,setRetry] = useState(0);
  const [region,setRegion] = useState("");
  const [query,setQuery] = useState("");
  const [dept,setDept] = useState(topic?.dept ?? "");
  const [lang,setLang] = useState("");
  const [limit,setLimit] = useState(10);
  useEffect(()=>{
    if (!directory || rows) return;
    const abort = new AbortController();
    fetch(dataUrl,{signal:abort.signal}).then(r=>{if(!r.ok) throw Error(); return r.json();})
      .then(data=>{if(!abort.signal.aborted)setRows(data);})
      .catch(()=>{if(!abort.signal.aborted)setFailed(true);});
    return ()=>abort.abort();
  },[directory,retry,rows]);
  const normalize = (s:string)=>s.normalize("NFKC").toLowerCase().replace(/\s+/g,"");
  function matches(id:number, text:string) {
    const haystack = normalize([text,...Object.values(regionNames).map(names=>names[id-1])].join(" "));
    const key = normalize(query.trim());
    return (!region || id === Number(region)) && (haystack.includes(key) || Boolean(cityAliases[key] && haystack.includes(cityAliases[key])));
  }
  const hospitals = (rows ?? []).filter(r=>{
    if(!matches(r.region,[r.name,r.english,r.address,r.area].join(" "))) return false;
    // Only match the language on the same department entry when both filters apply.
    return r.departments.split(/[\n;；]/).some(line=>(!dept || line.includes(dept)) && (!lang || new RegExp("\\b"+lang+"\\b","i").test(line)));
  });
  const specialists = practices.filter(p=>(!topic || p.tags.includes(topic.slug)) && matches(p.region,[...p.name,p.address ?? ""].join(" ")));
  const count = directory ? hospitals.length : specialists.length;
  const reset = ()=>{setRegion("");setQuery("");setDept(topic?.dept ?? "");setLang("");setLimit(10);};
  return <section id="directory" className="care-section">
    <h2>{t("지역·병원 찾기","Find a medical facility","按地区查找医疗机构")}</h2>
    {!topic && <div className="care-tabs">{[true,false].map(v=><button key={String(v)} type="button" aria-pressed={directory===v} onClick={()=>{setDirectory(v);reset();}}>{v?t("전국 의료기관","National directory","全国医疗机构"):t("진료별 확인 기관","Care-specific providers","已核对项目的机构")}</button>)}</div>}
    <p>{directory?t("후생노동성 외국인 환자 수용 명부입니다. 접수 시간과 통역은 방문 전에 확인하세요.","Based on the ministry’s directory for foreign patients. Confirm reception hours and interpreting before visiting.","资料取自厚生劳动省外国患者接诊名录。请提前确认接诊时间和口译安排。"):t("기관이 공개한 상담 분야입니다. 여행자 접수와 예약 조건은 기관에서 확인하세요.","These providers publish information on the listed services. Check visitor eligibility and appointments directly.","以下机构公开了相关服务。请直接确认游客接诊条件和预约时间。")}</p>
    <div className="care-controls">
      <label>{t("병원명·도시","Name or city","机构名或城市")}<input type="search" value={query} onChange={e=>{setQuery(e.target.value);setLimit(10);}} /></label>
      <label>{t("지역","Prefecture","都道府县")}<select value={region} onChange={e=>{setRegion(e.target.value);setLimit(10);}}><option value="">{t("전체 지역","All areas","全部地区")}</option>{regionNames[locale].map((r,i)=><option key={r} value={i+1}>{r}</option>)}</select></label>
      {directory && <><label>{t("진료과","Department","科室")}<select value={dept} onChange={e=>{setDept(e.target.value);setLimit(10);}}><option value="">{t("전체 진료과","All departments","全部科室")}</option>{departments.map(([id,ko,en,zh])=><option key={id} value={id}>{t(ko,en,zh)}</option>)}</select></label>
      <label>{t("진료과 표기 언어","Listed department language","科室标注语言")}<select value={lang} onChange={e=>{setLang(e.target.value);setLimit(10);}}><option value="">{t("전체 언어","All languages","全部语言")}</option><option value="KO">한국어</option><option value="EN">English</option><option value="ZH">中文</option></select></label></>}
    </div>
    {directory && !rows ? <p role="status">{failed?<button onClick={()=>{setFailed(false);setRetry(retry+1);}}>{t("명부 다시 불러오기","Retry directory download","重新加载名录")}</button>:t("명부 불러오는 중…","Loading directory…","正在加载名录…")}</p>:<>
    <p role="status"><b>{count.toLocaleString()}</b> {t("곳","facilities","家机构")} · <button type="button" onClick={reset}>{t("조건 초기화","Reset filters","重置筛选")}</button></p>
    {!count && <p>{t("이 조건으로 확인된 기관이 없습니다. 지역이나 검색 조건을 바꾸거나 아래 공식 자료를 확인하세요.","No verified matches. Change your filters or check the official source below.","暂无符合条件的机构。可调整筛选条件或查阅下方官方资料。")}</p>}
    {directory ? hospitals.slice(0,limit).map(r=><details key={r.name+r.address} className="care-record"><summary><b>{r.name}</b><small>{regionNames[locale][r.region-1]} · {r.english}</small></summary>
      <p lang="ja">{r.address}</p><p>{r.phone} · {r.hours}</p><p className="care-raw" lang="ja">{r.departments}</p><div className="care-links"><a href={"https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(r.name+" "+r.address)}>{t("지도에서 위치 확인","Open map","查看地图")}</a>{r.url && <a href={r.url}>{t("기관 홈페이지","Institution website","机构官网")}</a>}</div></details>)
      : specialists.slice(0,limit).map(p=><details key={p.url} className="care-record"><summary><b>{translate(locale,p.name)}</b><small>{regionNames[locale][p.region-1]}</small></summary>{p.note && <p>{translate(locale,p.note)}</p>}{p.address && <p><a href={"https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(p.address)}>{p.address}</a></p>}<a href={p.url}>{t("진료·예약 공식 안내","Official visit and booking details","官方就诊与预约说明")}</a></details>)}
    {count>limit && <button type="button" className="care-more" onClick={()=>setLimit(limit+10)}>{t("다음 10곳 보기","Show 10 more","再显示10家")}</button>}</>}
    <p className="care-source">{directory?<>{t("출처·가공","Directory adapted from","名录整理自")} · <a href={directorySource}>{t("일본 후생노동성 의료기관 명부","Japan Ministry of Health directory","日本厚生劳动省医疗机构名录")}</a></>:t("각 기관의 공식 진료 안내 확인","Provider websites checked","各机构官方诊疗资料核对日期")} · 2026-11-28</p>
  </section>;
}


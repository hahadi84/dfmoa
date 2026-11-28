"use client";
import { useState } from "react";
import Link from "@/components/app-link";
import { carePath,topics,translate,visitorSource,words,type Locale,type Words } from "@/lib/japan-care";
export function Topics({locale}:{locale:Locale}) {
  const [q,setQ] = useState("");
  const t=(ko:string,en:string,zh:string)=>translate(locale,words(ko,en,zh));
  const matches=topics.filter(topic=>topic.title.join(" ").toLowerCase().includes(q.trim().toLowerCase()));
  return <section className="care-section" id="care-topics"><h2>{t("어떤 진료가 필요한가요?","What care do you need?","您想咨询哪类问题？")}</h2>
    <label>{t("진료 분야 검색","Search care topics","搜索就诊项目")}<input type="search" value={q} onChange={e=>setQ(e.target.value)} placeholder={t("예: 치과, 발열, 마운자로","Try dental, fever or Mounjaro","例如：牙科、发热、替尔泊肽")}/></label>
    <div className="care-topic-list">{matches.map(topic=><Link key={topic.slug} href={carePath(locale,topic.slug)}>{translate(locale,topic.title)}</Link>)}</div>
    {!matches.length && <p role="status">{t("일치하는 분야가 없습니다.","No matching care topic.","没有匹配的项目。")}</p>}</section>;
}
const checklist:Words[]=[
  words("기관에 전화해 초진 접수와 통역 일정을 확인했어요.","I checked first-visit availability and interpreting.","已确认初诊接待与口译安排。"),
  words("진찰·검사·서류비와 보험 청구에 필요한 영수증을 확인했어요.","I checked consultation, test and document fees and insurance receipts.","已确认诊察、检查、文件费用及保险理赔凭证。"),
  words("신분증, 복용약 목록과 기관이 요청한 서류를 준비했어요.","I packed identification, a medication list and the requested documents.","已备好身份证件、用药清单和机构要求的材料。"),
];
export function Visit({locale}:{locale:Locale}) {
  const t=(ko:string,en:string,zh:string)=>translate(locale,words(ko,en,zh));
  const [done,setDone]=useState<number[]>([]);
  return <section className="care-section" id="visit"><h2>{t("방문 전 체크리스트","Before your visit","就诊前核对清单")}</h2>
    <p aria-live="polite">{done.length} / {checklist.length} {t("준비 완료","ready","项已完成")}</p>
    {checklist.map((v,i)=><label className="care-check" key={i}><input type="checkbox" checked={done.includes(i)} onChange={e=>setDone(e.target.checked?[...done,i]:done.filter(n=>n!==i))}/>{translate(locale,v)}</label>)}
    <p><a href="tel:119">{t("일본 구급차 119","Ambulance in Japan · 119","日本急救电话 119")}</a> · <a href={visitorSource}>{t("일본정부관광국 진료 안내","JNTO visitor care guide","日本国家旅游局就医指南")}</a></p></section>;
}


import type { Metadata } from "next";
import Link from "@/components/app-link";
import { carePath,clinicTitle,intro,locales,translate,words,visitorSource,type Locale,type Topic,type Words } from "@/lib/japan-care";
import publishedNotes from "../../../../data/content/japan-clinic-visitor-notes.json";
import { SITE_OPERATOR } from "@/lib/site-operator";
import Directory from "./directory";
import Fees from "./fees";
import { Topics,Visit } from "./visit-tools";
import "./guide.css";

export function careMetadata(locale:Locale,topic?:Topic):Metadata {
  const path = carePath(locale,topic?.slug);
  const title = topic?.slug === "mounjaro"
    ? translate(locale,words("일본 마운자로 처방 병원·가격 | 초진료와 서류비 비교","Mounjaro in Japan | Clinics, consultation fees and prescription costs","日本替尔泊肽就诊指南｜诊所、药费与初诊费"))
    : topic ? translate(locale,topic.title)+" | "+translate(locale,clinicTitle)
    : translate(locale,words("일본 병원 찾기 | 한국어 진료·마운자로 상담 안내","Find clinics in Japan | Language support and visitor fees","日本旅行看病｜按地区、科室和接诊语言找医院"));
  const description = topic?.slug === "mounjaro"
    ? translate(locale,words("일본에서 마운자로 상담을 안내하는 병원을 지역별로 찾고, 공개 약값에 초진료와 영문 처방전 비용을 더한 엔화·원화 견적을 확인하세요. 한국 반입 준비 안내도 제공합니다.","Find clinics that list Mounjaro consultations, compare published pen prices and estimate first-visit and documentation fees in yen and won.","查找日本提供替尔泊肽咨询的诊所，核对药费、初诊费和英文处方费，按日元与韩元估算费用。"))
    : translate(locale,topic?.note ?? intro);
  return {title,description,openGraph:{title,description,url:path,siteName:"DFMOA",type:"website",locale:{ko:"ko_KR",en:"en_US",zh:"zh_CN"}[locale]},
    twitter:{card:"summary",title,description},alternates:{canonical:path,
    languages:Object.fromEntries(locales.map(l=>[l==="zh"?"zh-Hans":l,carePath(l,topic?.slug)]))}};
}

function Feedback({locale}:{locale:Locale}) {
  const t=(ko:string,en:string,zh:string)=>translate(locale,words(ko,en,zh));
  // Only consented and editorially reviewed notes belong in the published collection.
  const notes: {facility:string;published:string;body:Words;rating?:number}[] = publishedNotes;
  return <section className="care-section" id="feedback"><h2>{t("방문 후기·운영 문의","Visitor notes and enquiries","就诊体验与运营联系")}</h2>
    {notes.length ? notes.map(note=><article key={note.facility+note.published+note.body[0]}><h3>{note.facility}</h3><p>{translate(locale,note.body)}</p><small>{note.published}{note.rating && " · "+note.rating+" / 5"}</small></article>) : <p>{t("아직 게시된 방문 후기가 없습니다. 접수·통역·길 찾기 경험을 보내 주시면 공개 동의와 내용을 확인합니다.","No visitor notes have been published yet. Share practical details about reception, interpreting or directions for editorial review.","尚无已发布的体验。欢迎分享挂号、口译或交通方面的经历，编辑将核实内容与公开授权。")}</p>}
    <details><summary>{t("후기 제보·기관 등록·제휴 문의","Submit a visitor note, listing or partnership enquiry","提交体验、机构收录或合作咨询")}</summary>
    <form className="contact-form" name="japan-care" method="POST" action="/contact/success" data-netlify="true" netlify-honeypot="bot-field">
      <input type="hidden" name="form-name" value="japan-care"/><input type="hidden" name="language" value={locale}/>
      <label hidden>Leave empty<input name="bot-field" tabIndex={-1} autoComplete="off"/></label>
      <label>{t("문의 종류","Type of enquiry","咨询类别")}<select name="topic"><option value="visit">{t("방문 후기 제보","Visitor note","就诊体验")}</option><option value="listing">{t("기관 등록·오류 정정","Listing or correction","收录或纠错")}</option><option value="partner">{t("광고·제휴 문의","Advertising or partnership","广告或合作")}</option></select></label>
      <label>{t("기관명","Facility name","机构名称")}<input name="facility" required maxLength={150}/></label>
      <label>{t("회신 이메일","Reply email","联系邮箱")}<input name="email" type="email" required/></label>
      <label>{t("방문 경험 평점 (선택)","Visit rating (optional)","就诊体验评分（选填）")}<select name="rating" defaultValue=""><option value="">—</option>{[1,2,3,4,5].map(n=><option key={n} value={n}>{n} / 5</option>)}</select></label>
      <label>{t("내용 (진료 기록·신분증 등 개인정보 제외)","Message (omit medical history and identity documents)","留言（请勿填写病史或证件信息）")}<textarea name="message" rows={4} maxLength={2000} required/></label>
      <label className="care-check"><input name="permission" type="checkbox" value="anonymous-publication"/>{t("후기 내용의 익명 게시에 동의합니다 (선택).","My visitor note may be published anonymously (optional).","同意匿名公开我的体验（选填）。")}</label>
      <button className="button" type="submit">{t("DFMOA에 보내기","Send to DFMOA","发送给 DFMOA")}</button>
    </form></details>
    <p className="care-source">DFMOA · <Link href="/about">{t("운영자 소개","About the publisher","关于运营方")}</Link> · <Link href="/editorial-policy">{t("편집 기준","Editorial policy","编辑方针")}</Link> · <Link href="/privacy">{t("개인정보 안내","Privacy","隐私说明")}</Link> · <a href={"mailto:"+SITE_OPERATOR.email}>{SITE_OPERATOR.email}</a></p></section>;
}

export default function Guide({locale="ko",topic}:{locale?:Locale;topic?:Topic}) {
  const t=(ko:string,en:string,zh:string)=>translate(locale,words(ko,en,zh));
  return <div className="care-shell" lang={locale==="zh"?"zh-Hans":locale}>
    <div className="care-top"><Link href={topic?carePath(locale):"/japan"}>{topic?translate(locale,clinicTitle):t("일본 여행","Japan travel","日本旅行")}</Link>
    <nav aria-label={t("언어","Language","语言")}>{locales.map(l=><Link key={l} href={carePath(l,topic?.slug)} aria-current={locale===l?"page":undefined} hrefLang={l}>{l==="ko"?"한국어":l==="en"?"English":"简体中文"}</Link>)}</nav></div>
    <header className="care-intro"><h1>{translate(locale,topic?.title ?? clinicTitle)}</h1><p>{translate(locale,topic?.note ?? intro)}</p>
    {topic && <a href={topic.source ?? visitorSource}>{t("공식 자료 확인","Check official guidance","查阅官方资料")}</a>}
    <nav><a href="#directory">{t("병원 찾기","Find a facility","查找医院")}</a>{!topic && <a href="#care-topics">{t("진료 분야","Care topics","就诊项目")}</a>}
    {(!topic || ["placenta","mounjaro"].includes(topic.slug)) && <a href="#fees">{t("비용 비교","Compare fees","比较费用")}</a>}<a href="#visit">{t("방문 준비","Prepare a visit","就诊准备")}</a>{!topic && <a href="#feedback">{t("후기·문의","Notes & enquiries","体验与联系")}</a>}</nav></header>
    {!topic && <Topics locale={locale}/>}
    {!topic && locale==="ko" && <section className="care-section"><h2>스시자로와 DFMOA의 병원 정보는 어떻게 다른가요?</h2>
      <p>스시자로(SUSHIJARO)는 일본 여행자의 진료 분야별 클리닉 가이드입니다. DFMOA에서는 일본 후생노동성 명부를 지역·진료과·언어로 검색할 수 있습니다. 특정 약의 상담을 원하면 <Link href={carePath(locale,"mounjaro")}>일본 마운자로 처방 병원과 비용</Link>에서 해당 상담을 공개한 기관과 약값·초진료를 확인하세요.</p>
      <p className="care-source"><a href="https://sushijaro.com/">스시자로 공식 사이트</a> · <a href="https://www.mhlw.go.jp/stf/newpage_05774.html">DFMOA 병원 검색의 원자료</a></p>
    </section>}
    <Directory locale={locale} topic={topic}/>
    {(!topic || ["placenta","mounjaro"].includes(topic.slug)) && <Fees locale={locale} only={topic?.slug}/>}
    {topic?.slug==="mounjaro" && <Link className="care-more" href="/guide/japan-mounjaro-travel-checklist">{t("처방·한국 반입 확인 절차","Check the rules for returning to Korea (Korean)","查看带回韩国的手续（韩语）")}</Link>}
    <Visit locale={locale}/>{topic?<Link href={carePath(locale)}>{t("전체 진료 분야 보기","Browse all care topics","浏览所有就诊项目")}</Link>:<Feedback locale={locale}/>}
  </div>;
}


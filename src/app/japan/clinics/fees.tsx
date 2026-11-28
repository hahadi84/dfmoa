"use client";
import { useState } from "react";
import yen from "../../../../data/content/yen-rate.json";
import { translate,words,type Locale } from "@/lib/japan-care";
const cases = [
  {item:"2.5 mg", yen:34584, won:891390}, {item:"5 mg", yen:66891, won:1174470},
  {item:"7.5 mg", yen:99924, won:1636320}, {item:"10 mg", yen:133232, won:1634490},
  {item:"12.5 mg", yen:166540, won:2110950}, {item:"15 mg", yen:200673, won:null},
];
const fmt = (n:number)=>n.toLocaleString("en-US");
export default function Fees({locale,only}:{locale:Locale;only?:string}) {
  const t=(ko:string,en:string,zh:string)=>translate(locale,words(ko,en,zh));
  const [item,setItem] = useState(0);
  const [shipping,setShipping] = useState(false);
  const [doc,setDoc] = useState(true);
  const total = cases[item].yen + 3630 + (shipping?3300:0) + (doc?7370:0);
  return <section className="care-section" id="fees"><h2>{t("한국·일본 진료비 비교","Compare published fees","韩日公开费用对照")}</h2>
    {only!=="placenta" && <><h3>{t("마운자로 12펜 약값","Mounjaro · 12 pens","替尔泊肽 · 12支药费")}</h3>
    <p>{t("일본은 재팬넷클리닉의 세금 포함 일괄 약값입니다. 한국은 이 기관이 인용한 11월 7일 약국 표본의 4주 약값을 3배 한 참고액이며 진료비가 별도입니다.","Japan shows Japan Net Clinic’s tax-inclusive package. Korean figures are three times the four-week pharmacy sample price cited by the clinic on Nov 7 and exclude consultations.","日本一栏为 Japan Net Clinic 含税套装价。韩国参考额为该院引用的11月7日药房样本四周药费乘三，不含诊察费。")}</p>
    <table><thead><tr><th>{t("규격","Strength","规格")}</th><th>{t("일본","Japan","日本")}</th><th>{t("한국 참고액","Korea estimate","韩国参考额")}</th></tr></thead><tbody>{cases.map(r=><tr key={r.item}><th>{r.item}</th><td>¥{fmt(r.yen)}</td><td>{r.won?"₩"+fmt(r.won):t("미확인","Unverified","未核实")}</td></tr>)}</tbody></table>
    <fieldset className="care-estimate"><legend>{t("내 견적 계산","Estimate clinic charges","估算诊所费用")}</legend><label>{t("처방받은 규격","Prescribed strength","已开处方规格")} <select value={item} onChange={e=>setItem(Number(e.target.value))}>{cases.map((r,i)=><option key={r.item} value={i}>{r.item}</option>)}</select></label>
    <span>{t("초진료 포함","First visit included","含初诊费")} ¥3,630</span>
    <label><input type="checkbox" checked={doc} onChange={e=>setDoc(e.target.checked)}/>{t("영문 처방전","English document","英文处方")} +¥7,370</label>
    <label><input type="checkbox" checked={shipping} onChange={e=>setShipping(e.target.checked)}/>{t("현지 배송","Domestic delivery","日本境内配送")} +¥3,300</label>
    <output aria-live="polite">¥{fmt(total)} <small>≈ ₩{fmt(Math.round(total*yen.rate))}</small></output></fieldset>
    <p>{t("기관 예시 견적입니다. 처방 기간과 서류 필요 여부는 진료 시 확인하세요. 검사·여행·결제 수수료는 제외됩니다.","Example charges only. Confirm the prescribed duration and document requirements. Tests, travel and payment fees are excluded.","仅供估算。处方时长和所需文件请在就诊时确认，不含检查、旅行和支付手续费。")}</p>
    <p className="care-source"><a href="https://japannetclinic.com/">{t("재팬넷클리닉 공개 요금","Japan Net Clinic fee schedule","Japan Net Clinic 公开价目")}</a> · 2026-11-28 · <a href={yen.sourceUrl}>¥1 = ₩{yen.rate} ({yen.date})</a></p></>}
    {only!=="mounjaro" && <><h3>{t("태반주사 비용에 포함된 항목","What a placenta injection quote includes","胎盘制剂报价包含哪些费用")}</h3><table><thead><tr><th>{t("기관","Provider","机构")}</th><th>{t("공개 항목","Listed charge","公开项目")}</th></tr></thead><tbody>
    <tr><th><a href="https://www.yonseibarun.com/s10/s10_5.php">{t("한국 연세바른병원","Yonsei Barun, Korea","韩国延世Barun医院")}</a></th><td>{t("라이넥 2mL 약제비","Laennec 2 mL drug fee","Laennec 2 mL 药费")} ₩40,000</td></tr>
    <tr><th><a href="https://www.bi-ha-da.jp/treatments/infusiontherapy">{t("일본 긴자 오하다","Ginza Ohada, Japan","日本银座皮肤诊所")}</a></th><td>{t("라이넥 1앰플","Laennec, one ampoule","Laennec 一安瓿")} ¥2,200 + {t("초진","first visit","初诊")} ¥3,300</td></tr>
    </tbody></table><p>{t("2026-11-28 확인. 한국 공개 항목은 약제비이므로 양국의 환자 총부담액은 비교할 수 없습니다.","Checked Nov 28, 2026. The Korean entry covers the drug charge only. Total patient costs cannot be compared.","核对日期为2026-11-28。韩国公开项目仅为药费，无法据此比较两国就诊总价。")}</p></>}
  </section>;
}


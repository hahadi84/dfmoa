'use client';
import { useId, useState } from 'react';
type Benefit = {title:string;type:string;description:string;url:string};
export function BenefitEventList({benefits}:{benefits:Benefit[]}) {
  const [kind,setKind]=useState('전체');const id=useId();
  const kinds=[...new Set(benefits.map(b=>b.type))];
  const visible=kind==='전체'?benefits:benefits.filter(b=>b.type===kind);
  return <>
    {benefits.length>5&&<div style={{margin:'16px 0'}}>
      <label htmlFor={id}>혜택 유형 </label>
      <select id={id} value={kind} onChange={event=>setKind(event.target.value)} style={{padding:8,maxWidth:'100%'}}>
        <option value="전체">전체 ({benefits.length}개)</option>
        {kinds.map(value=><option key={value} value={value}>{value} ({benefits.filter(b=>b.type===value).length}개)</option>)}
      </select>
    </div>}
    <p className="section-copy" aria-live="polite">{visible.length}개 행사</p>
    <div className="benefit-link-list benefit-events">{visible.map(benefit=><a key={`${benefit.url}-${benefit.title}`} className="benefit-link-item" href={benefit.url} target="_blank" rel="noreferrer">
      <span className="benefit-link-copy"><strong>{benefit.title}</strong><small>{benefit.type} · {benefit.description}</small></span>
      <span className="text-link">상세 조건</span>
    </a>)}</div>
  </>;
}

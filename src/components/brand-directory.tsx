"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "@/components/app-link";
import { brandNameKey } from "@/lib/brand-directory";
import { observationState } from "@/lib/observation-policy.mjs";

const priceStates = {
  recent: "최근 관측가 있음",
  historical: "과거 관측가만 있음",
  unknown: "공식몰에서 확인",
};
const priceOrder = { recent: 0, historical: 1, unknown: 2 };
const getClock = () => Math.floor(Date.now() / 60_000) * 60_000;
function subscribeClock(callback: () => void) {
  const timer = window.setInterval(callback, 60_000);
  return () => window.clearInterval(timer);
}

export type BrandDirectoryEntry = {
  nameKo: string;
  nameEn: string;
  category: string;
  categoryName: string;
  count: number;
  detailPath?: string;
  productPath?: string;
  officialLinks: { name: string; url: string }[];
  observations: { name: string; store: string; price: string; time: string; observedAt: string; path: string }[];
};

export function BrandDirectory({ entries, initialTime }: { entries: BrandDirectoryEntry[]; initialTime: number }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [priceFilter, setPriceFilter] = useState("");
  const now = useSyncExternalStore(subscribeClock, getClock, () => initialTime);
  const categoryOptions = Array.from(new Map(entries.map(entry => [entry.category, entry.categoryName])));
  const keyword = brandNameKey(query);
  const visible = entries.map(entry => {
    const latestFirst = [...entry.observations].sort((a, b) => Date.parse(b.observedAt) - Date.parse(a.observedAt));
    const observation = latestFirst.find(item => observationState(item.observedAt, now) !== "unknown");
    const state = observationState(observation?.observedAt, now) as keyof typeof priceStates;
    return { ...entry, observation, state };
  }).filter(entry =>
    (!category || entry.category === category) &&
    (!priceFilter || entry.state === priceFilter) &&
    [entry.nameKo, entry.nameEn].some(name => brandNameKey(name).includes(keyword))
  ).sort((a, b) => priceOrder[a.state] - priceOrder[b.state]);

  return (
    <>
      <div className="brand-directory-filters" role="group" aria-label="브랜드 찾기">
        <label>브랜드명
          <input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="예: 설화수, Creed" />
        </label>
        <label>카테고리
          <select value={category} onChange={event => setCategory(event.target.value)}>
            <option value="">전체 카테고리</option>
            {categoryOptions.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
          </select>
        </label>
        <label>가격 상태
          <select value={priceFilter} onChange={event => setPriceFilter(event.target.value)}>
            <option value="">모든 가격 상태</option>
            {Object.entries(priceStates).map(([state, label]) => <option key={state} value={state}>{label}</option>)}
          </select>
        </label>
      </div>
      <p className="section-copy" role="status">{visible.length}개 브랜드 · 전체 {entries.length}개</p>
      {!visible.length && <p>검색 결과가 없습니다. 브랜드명이나 필터를 바꿔보세요.</p>}
      <div className="brand-index-grid brand-directory-grid">
        {visible.map(entry => (
          <article key={entry.nameEn} className="brand-index-card">
            <header>
              <p className="section-copy">{entry.categoryName} · {entry.count ? `등록 상품 ${entry.count}개` : "공식몰 검색"}</p>
              <h2 className="card-title">{entry.nameKo}</h2>
              {entry.nameEn !== entry.nameKo && <p className="section-copy" lang="en">{entry.nameEn}</p>}
            </header>
            <p className="brand-directory-status" data-price-state={entry.state}>{priceStates[entry.state]}</p>
            {entry.observation ? (
              <div className="brand-directory-price">
                <Link className="text-link" href={entry.observation.path}>{entry.observation.name}</Link>
                <strong>{entry.observation.store} · {entry.observation.price}</strong>
                <small>{entry.observation.time}</small>
              </div>
            ) : <p className="section-copy">{entry.count ? "등록 상품 가격 미확인" : "등록 상품 없음"}</p>}
            <div className="chip-row">
              {entry.detailPath ? <Link className="text-link" href={entry.detailPath}>브랜드 보기</Link>
                : entry.productPath && !entry.observation && <Link className="text-link" href={entry.productPath}>등록 상품 보기</Link>}
            </div>
            <details className="brand-directory-official">
              <summary>면세점별 확인</summary>
              <ul>
                {entry.officialLinks.map(store => <li key={store.name}>
                  <a className="text-link" href={store.url} target="_blank" rel="noreferrer">{store.name} 검색</a>
                </li>)}
              </ul>
            </details>
          </article>
        ))}
      </div>
    </>
  );
}

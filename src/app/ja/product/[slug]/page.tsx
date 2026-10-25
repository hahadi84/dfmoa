import { notFound } from "next/navigation";
import { TravelerProduct } from "@/components/traveler-pages";
import { getEnglishCatalog } from "@/lib/international-catalog";
import { localizedMetadata } from "@/lib/international";
import { travelerCopy } from "@/lib/traveler-locales";
type Props={params:Promise<{slug:string}>};
export const dynamicParams=false;
export function generateStaticParams(){return getEnglishCatalog().map(item=>({slug:item.slug}));}
export async function generateMetadata({params}:Props){const {slug}=await params;const item=getEnglishCatalog().find(item=>item.slug===slug);const t=travelerCopy.ja;return item?localizedMetadata("ja",`${item.name} ${t.detailSuffix}`,`${item.name} — ${t.notice}`, `/ja/product/${slug}`,`/product/${slug}`):{};}
export default async function Page({params}:Props){const {slug}=await params;if(!getEnglishCatalog().some(item=>item.slug===slug))notFound();return <TravelerProduct locale="ja" slug={slug}/>;}

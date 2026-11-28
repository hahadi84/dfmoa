import { notFound } from "next/navigation";
import { locales, topics,type Locale } from "@/lib/japan-care";
import Guide,{careMetadata} from "../guide";

export const dynamicParams=false;
export function generateStaticParams(){
  return locales.flatMap(locale=>{
    const prefix=locale==="ko"?[]:[locale];
    return [...(prefix.length?[{parts:prefix}]:[]),...topics.map(topic=>({parts:[...prefix,topic.slug]}))];
  });
}
function resolve(parts:string[]){
  const localized=parts[0]==="en" || parts[0]==="zh";
  const locale:Locale=localized?parts[0] as Locale:"ko";
  const slug=parts[localized?1:0];
  const topic=topics.find(entry=>entry.slug===slug);
  if((slug && !topic) || parts.length>(localized?2:1))notFound();
  return {locale,topic};
}
type Props={params:Promise<{parts:string[]}>};
export async function generateMetadata({params}:Props){const {locale,topic}=resolve((await params).parts);return careMetadata(locale,topic);}
export default async function Page({params}:Props){return <Guide {...resolve((await params).parts)}/>;}


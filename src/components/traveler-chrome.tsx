import { AirportNavigation } from "@/components/airport-navigation";
import { BrandMark } from "@/components/brand-mark";
import Link from "@/components/app-link";
import { travelerCopy, languagePath, type TravelerLocale } from "@/lib/traveler-locales";
export function LanguageLinks({path}:{path:string}) {
 return <><Link href="/" lang="ko">한국어</Link><Link href={languagePath(path,"en")} lang="en">English</Link><Link href={languagePath(path,"ja")} lang="ja">日本語</Link><Link href={languagePath(path,"zh")} lang="zh-Hans">简体中文</Link></>;
}
export function TravelerHeader({locale,path}:{locale:TravelerLocale;path:string}) {
 const t=travelerCopy[locale];return <header className="topbar" lang={t.lang}><div className="container topbar-inner"><Link className="brand" href={`/${locale}`}><BrandMark/><span className="brand-copy"><strong>DFMOA</strong><span>{t.title}</span></span></Link><AirportNavigation label={t.title} menuLabel={locale === "ja" ? "メニュー" : "菜单"}><Link href={`/${locale}/guide/korea-duty-free-shopping-list`}>{locale==="ja"?"韓国で買うもの10選":"韩国购物清单10项"}</Link><Link href={`/${locale}`}>{locale==="ja"?"買い物ホーム":"购物首页"}</Link><Link href={`/${locale}/guide/incheon-duty-free-pickup`}>{t.pickup}</Link><Link href={`/${locale}/compare`}>{t.compare}</Link><LanguageLinks path={path}/></AirportNavigation></div></header>;
}
export function TravelerFooter({locale,path}:{locale:TravelerLocale;path:string}) {
 const t=travelerCopy[locale];return <footer className="site-footer" lang={t.lang}><div className="container intl-footer"><p className="footer-brand">DFMOA</p><p>{t.operator}</p><p>{t.contact}: <a href="mailto:dfmoa.contact@gmail.com">dfmoa.contact@gmail.com</a></p><nav aria-label={t.title}><Link href={`/${locale}/guide/korea-duty-free-shopping-list`}>{locale==="ja"?"韓国で買うもの10選":"韩国购物清单10项"}</Link><Link href={`/${locale}/compare`}>{t.compare}</Link><Link href={`/${locale}/privacy`}>{t.privacy}</Link><LanguageLinks path={path}/></nav></div></footer>;
}

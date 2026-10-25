import ja from "@/lib/translations/ja.json";
import zh from "@/lib/translations/zh.json";
export type TravelerLocale = "ja" | "zh";
export const travelerCopy = { ja, zh };
export function languagePath(path: string, locale: "en" | "ja" | "zh") {
 const suffix = path.replace(/^\/(en|ja|zh)(?=\/|$)/, "");
 const translated = suffix === "" || ["/compare", "/privacy", "/guide/incheon-duty-free-pickup"].includes(suffix) || suffix.startsWith("/product/");
 return `/${locale}${translated || locale === "en" ? suffix : ""}`;
}

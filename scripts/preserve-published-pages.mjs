// One-time recovery of published editorial pages missing from the Git repository.
// Run before the first Git deployment; subsequent builds use the committed content.
import { load } from "cheerio";
import { writeFile } from "node:fs/promises";

const paths = ["/price-compare", "/methodology",
  "/benefit-reports/2026-06-week-1-duty-free-benefits",
  "/benefit-reports/2026-05-week-4-duty-free-benefits",
  "/benefit-reports/2026-04-week-4-duty-free-benefits",
  "/benefit-reports/2026-04-week-3-duty-free-benefits",
  "/benefit-reports/2026-04-week-2-duty-free-benefits",
  "/benefit-reports/2026-04-week-1-duty-free-benefits",
  "/deals/2026-06", "/deals/2026-05"];
const pages = [];
for (const path of paths) {
  const response = await fetch(`https://www.dfmoa.com${path}`, { signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
  const $ = load(await response.text());
  const main = $("main");
  const title = $("title").text();
  if (!main.find("h1").length || !title) throw new Error(`Missing content: ${path}`);
  main.find("script, template, iframe").remove();
  main.find("form").each((_, form) => {
    if ($(form).attr("role") !== "search") $(form).remove();
  });
  main.find("button").each((_, button) => {
    if (!$(button).closest('form[role="search"]').length) $(button).remove();
  });
  main.find("*").each((_, element) => {
    for (const name of Object.keys(element.attribs ?? {})) {
      if (/^on/i.test(name) || /^(?:javascript|data):/i.test(element.attribs[name])) $(element).removeAttr(name);
    }
  });
  pages.push({ path, title, description: $('meta[name="description"]').attr("content") ?? "",
    capturedAt: new Date().toISOString(), html: main.html() });
  console.log(`Preserved ${path}`);
}
await writeFile("data/preserved-pages.json", JSON.stringify(pages, null, 2) + "\n");

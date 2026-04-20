import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const ROOT = process.cwd();
const OG_DIR = path.join(ROOT, "public", "og");
const WIDTH = 1200;
const HEIGHT = 630;

const { categories, formatKrw, getStoreById, guides, products } = await import("../src/lib/site-data.ts");

const brandLandings = [
  { slug: "creed", nameKo: "크리드", nameEn: "CREED" },
  { slug: "jo-malone", nameKo: "조말론", nameEn: "Jo Malone" },
  { slug: "sulwhasoo", nameKo: "설화수", nameEn: "Sulwhasoo" },
  { slug: "sk-ii", nameKo: "SK-II", nameEn: "SK-II" },
  { slug: "glenfiddich", nameKo: "글렌피딕", nameEn: "Glenfiddich" },
  { slug: "hibiki", nameKo: "히비키", nameEn: "Hibiki" },
  { slug: "gentle-monster", nameKo: "젠틀몬스터", nameEn: "Gentle Monster" },
  { slug: "ray-ban", nameKo: "레이밴", nameEn: "Ray-Ban" },
  { slug: "diptyque", nameKo: "딥티크", nameEn: "Diptyque" },
  { slug: "byredo", nameKo: "바이레도", nameEn: "Byredo" },
];

const categoryPalettes = {
  perfume: ["#0f5132", "#f6d365", "#f7fbf2"],
  beauty: ["#7c2d12", "#f9a8d4", "#fff7ed"],
  liquor: ["#111827", "#d4af37", "#f8fafc"],
  eyewear: ["#1f2937", "#67e8f9", "#f8fafc"],
  fashion: ["#374151", "#f59e0b", "#fff7ed"],
  watch: ["#0f172a", "#93c5fd", "#eff6ff"],
  jewelry: ["#4c1d95", "#f0abfc", "#fdf4ff"],
  health: ["#14532d", "#86efac", "#f0fdf4"],
  food: ["#7f1d1d", "#fbbf24", "#fffbeb"],
  electronics: ["#1e3a8a", "#38bdf8", "#eff6ff"],
};

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function readSnapshot(productId) {
  const filePath = path.join(ROOT, "data", "prices", `${productId}.json`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function getBestSnapshotItem(product) {
  const snapshot = readSnapshot(product.id);
  const entries = Object.entries(snapshot?.sources ?? {})
    .flatMap(([sourceId, source]) =>
      (source.items ?? [])
        .filter((item) => Number(item.priceKrw) > 0)
        .map((item) => ({ sourceId, source, item }))
    )
    .sort((left, right) => Number(left.item.priceKrw) - Number(right.item.priceKrw));

  return entries[0] ?? null;
}

function getProductCard(product) {
  const best = getBestSnapshotItem(product);
  const category = categories.find((item) => item.slug === product.categorySlug);
  const store = best ? getStoreById(best.sourceId) : null;
  const fetchedAt = best?.source.fetchedAt ?? best?.item.fetchedAt ?? "";
  const date = fetchedAt ? fetchedAt.replace("T", " ").slice(0, 10) : "공식 검색";

  return {
    eyebrow: category?.name ?? "Product",
    title: product.displayName,
    subtitle: product.query,
    metric: best ? formatKrw(Number(best.item.priceKrw)) : "4개 면세점 공식 검색",
    detail: best ? `${store?.shortName ?? best.sourceId} · ${date} 기준` : "원본 면세점 링크에서 현재 판매 여부 확인",
    palette: categoryPalettes[product.categorySlug] ?? categoryPalettes.perfume,
  };
}

function baseHtml({ eyebrow, title, subtitle, metric, detail, palette }) {
  const [primary, accent, bg] = palette;

  return `<!doctype html>
    <html lang="ko">
      <head>
        <meta charset="utf-8" />
        <style>
          * { box-sizing: border-box; }
          body {
            margin: 0;
            width: ${WIDTH}px;
            height: ${HEIGHT}px;
            font-family: "Malgun Gothic", "Apple SD Gothic Neo", "Noto Sans KR", Arial, sans-serif;
            background: ${bg};
          }
          .card {
            width: ${WIDTH}px;
            height: ${HEIGHT}px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding: 58px 70px;
            background:
              linear-gradient(135deg, ${primary} 0%, ${primary} 58%, transparent 58%),
              radial-gradient(circle at 85% 18%, ${accent} 0 0, transparent 34%),
              ${bg};
            color: #0f172a;
          }
          .eyebrow {
            display: inline-flex;
            width: fit-content;
            padding: 10px 18px;
            border-radius: 999px;
            background: rgba(255,255,255,.86);
            color: ${primary};
            font-size: 28px;
            font-weight: 800;
            letter-spacing: 0;
          }
          h1 {
            max-width: 560px;
            margin: 30px 0 0;
            color: #ffffff;
            font-size: 64px;
            line-height: 1.08;
            letter-spacing: 0;
            text-wrap: balance;
          }
          .subtitle {
            max-width: 620px;
            margin-top: 18px;
            color: rgba(255,255,255,.88);
            font-size: 32px;
            line-height: 1.3;
          }
          .metric {
            display: inline-flex;
            max-width: 760px;
            padding: 18px 26px;
            border-radius: 18px;
            background: rgba(255,255,255,.95);
            color: ${primary};
            font-size: 58px;
            font-weight: 900;
            line-height: 1.05;
          }
          .detail {
            margin-top: 14px;
            color: #334155;
            font-size: 28px;
            font-weight: 700;
          }
          .footer {
            display: flex;
            align-items: end;
            justify-content: space-between;
          }
          .brand {
            color: ${primary};
            font-size: 28px;
            font-weight: 900;
          }
        </style>
      </head>
      <body>
        <main class="card">
          <section>
            <div class="eyebrow">${escapeHtml(eyebrow)}</div>
            <h1>${escapeHtml(title)}</h1>
            <div class="subtitle">${escapeHtml(subtitle)}</div>
          </section>
          <section class="footer">
            <div>
              <div class="metric">${escapeHtml(metric)}</div>
              <div class="detail">${escapeHtml(detail)}</div>
            </div>
            <div class="brand">DFMOA 면세모아</div>
          </section>
        </main>
      </body>
    </html>`;
}

async function render(page, filePath, card) {
  ensureDir(path.dirname(filePath));
  await page.setContent(baseHtml(card), { waitUntil: "load" });
  await page.screenshot({ path: filePath, type: "png", clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT } });
}

ensureDir(OG_DIR);

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT }, deviceScaleFactor: 1 });

await render(page, path.join(OG_DIR, "default.png"), {
  eyebrow: "DFMOA",
  title: "면세가·국내가 비교",
  subtitle: "공개가, 원본 링크, 혜택 조건을 한 화면에서 확인",
  metric: "공항면세점 가격 비교",
  detail: "롯데 · 신라 · 신세계 · 현대 공식 확인 링크",
  palette: ["#0f172a", "#38bdf8", "#f8fafc"],
});

const homeTop = products
  .map(getProductCard)
  .filter((card) => card.metric.startsWith("₩"))
  .slice(0, 3)
  .map((card) => card.title.split(" ").slice(0, 3).join(" "))
  .join(" · ");

await render(page, path.join(OG_DIR, "home.png"), {
  eyebrow: "한국 면세점 최저가 비교",
  title: "롯데·신라·신세계 공개가 한눈에",
  subtitle: homeTop || "대표 면세 상품 공개가와 국내가 참고 비교",
  metric: "오늘의 면세가",
  detail: "실제 결제가는 원본 면세점에서 최종 확인",
  palette: ["#0f5132", "#f6d365", "#f7fbf2"],
});

await render(page, path.join(OG_DIR, "faq.png"), {
  eyebrow: "FAQ",
  title: "면세모아 이용 전 자주 묻는 질문",
  subtitle: "가격 기준, 광고 정책, 데이터 출처와 오류 신고",
  metric: "질문과 답변",
  detail: "DFMOA 면세 가격 비교 가이드",
  palette: ["#1e3a8a", "#93c5fd", "#eff6ff"],
});

for (const product of products) {
  await render(page, path.join(OG_DIR, "product", `${product.slug}.png`), getProductCard(product));
}

for (const category of categories) {
  const palette = categoryPalettes[category.slug] ?? categoryPalettes.perfume;
  await render(page, path.join(OG_DIR, "category", `${category.slug}.png`), {
    eyebrow: "Category",
    title: `${category.name} 면세 가격 비교`,
    subtitle: category.keywords.slice(0, 3).join(" · "),
    metric: `${products.filter((product) => product.categorySlug === category.slug).length}개 대표 상품`,
    detail: category.intro,
    palette,
  });
}

for (const brand of brandLandings) {
  await render(page, path.join(OG_DIR, "brand", `${brand.slug}.png`), {
    eyebrow: "Brand",
    title: `${brand.nameKo} 면세 가격 비교`,
    subtitle: brand.nameEn,
    metric: "대표 상품 공개가 확인",
    detail: "원본 면세점 링크와 예상 실결제가 계산",
    palette: ["#312e81", "#a5b4fc", "#eef2ff"],
  });
}

for (const guide of guides) {
  await render(page, path.join(OG_DIR, "guide", `${guide.slug}.png`), {
    eyebrow: "Guide",
    title: guide.title,
    subtitle: guide.excerpt,
    metric: "구매 전 가이드",
    detail: "수령 공항, 면세 한도, 가격 비교 체크리스트",
    palette: ["#14532d", "#86efac", "#f0fdf4"],
  });
}

await browser.close();

const generated = fs.readdirSync(OG_DIR, { recursive: true }).filter((file) => String(file).endsWith(".png"));
console.log(`Generated ${generated.length} OG images in ${path.relative(ROOT, OG_DIR)}`);

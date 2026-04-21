#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { chromium } from "playwright";
import { SITE_SERVICE_URL } from "./site-operator-url.mjs";

const DEFAULT_SYNC_URL = `${SITE_SERVICE_URL}/api/external-store-snapshot`;
const DEFAULT_USER_DATA_DIR = path.resolve(".collector", "shinsegae-profile");
const DEFAULT_OUTPUT_DIR = path.resolve(".collector");
const DEFAULT_WAIT_MS = Number(process.env.SHINSEGAE_WAIT_MS || "6000");

function cleanText(value) {
  return (value ?? "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
}

function formatTimestamp(date = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = formatter.formatToParts(date);
  const get = (type) => parts.find((part) => part.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")} ${get("hour")}:${get("minute")}`;
}

function parseArgs(argv) {
  const flags = new Set(argv.filter((arg) => arg.startsWith("--")));
  const positionals = argv.filter((arg) => !arg.startsWith("--"));
  const query = cleanText(positionals.join(" "));

  return {
    query,
    submit: flags.has("--submit"),
    headless: flags.has("--headless") || process.env.SHINSEGAE_HEADLESS === "1",
  };
}

function getSearchUrl(query) {
  return `https://www.ssgdfs.com/kr/search/resultsTotal?startCount=0&offShop=&suggestReSearchReq=true&orReSearchReq=true&query=${encodeURIComponent(
    query
  )}`;
}

async function waitForEnter(message) {
  if (!process.stdin.isTTY) {
    return;
  }

  process.stdout.write(`${message}\n`);
  process.stdin.resume();

  await new Promise((resolve) => {
    process.stdin.once("data", () => resolve());
  });
}

async function saveDebugHtml(outputDir, html) {
  await mkdir(outputDir, { recursive: true });
  const filePath = path.join(outputDir, "shinsegae-last.html");
  await writeFile(filePath, html, "utf8");
  return filePath;
}

async function scrapeOffers(page, fallbackBrand) {
  return page.evaluate(({ fallbackBrand: brandHint }) => {
    const clean = (value) => (value ?? "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
    const normalizeBadge = (value) => {
      const text = clean(value);
      const compact = text.replace(/\s+/g, "");

      if (!compact || compact.length > 12) {
        return null;
      }

      if (/^\d+(?:시간전|일전)$/u.test(compact)) {
        return null;
      }

      if (compact.includes("쿠폰")) {
        return "쿠폰";
      }

      if (compact.includes("사은품")) {
        return "사은품";
      }

      if (compact.includes("세일")) {
        return "세일";
      }

      if (compact.includes("특가")) {
        return "특가";
      }

      return text;
    };
    const collectBadges = (root) => {
      const selectors = [
        "[class*='badge']",
        "[class*='tag']",
        "[class*='label']",
        "[class*='benefit'] span",
        "[class*='coupon']",
        "[class*='gift']",
        "[class*='event']",
      ];

      return Array.from(
        new Set(
          selectors.flatMap((selector) =>
            Array.from(root.querySelectorAll(selector), (element) => normalizeBadge(element.textContent)).filter(
              Boolean
            )
          )
        )
      ).slice(0, 4);
    };
    const pickText = (root, selectors) => {
      for (const selector of selectors) {
        const match = root.querySelector(selector);
        const text = clean(match?.textContent);

        if (text) {
          return text;
        }
      }

      return "";
    };
    const parseUsdPrices = (text) =>
      Array.from(text.matchAll(/\$\s*([0-9][0-9,]*(?:\.[0-9]+)?)/g), (match) =>
        Number(match[1].replace(/,/g, ""))
      ).filter((value) => Number.isFinite(value));
    const parseKrwPrices = (text) =>
      Array.from(text.matchAll(/([0-9][0-9,]{2,})\s*원/g), (match) =>
        Number(match[1].replace(/,/g, ""))
      ).filter((value) => Number.isFinite(value));
    const resolveImageUrl = (value) => {
      const text = clean(value);
      const firstCandidate = clean(text.split(",")[0]).split(/\s+/)[0];

      if (!firstCandidate || firstCandidate.startsWith("data:")) {
        return "";
      }

      try {
        return new URL(firstCandidate, location.href).href;
      } catch {
        return "";
      }
    };
    const isPlaceholderImage = (url) => {
      const normalized = clean(url).toLowerCase();
      return (
        !normalized ||
        normalized.includes("noimg") ||
        normalized.includes("img_default") ||
        normalized.includes("img_blank") ||
        normalized.includes("/offer/gwp/")
      );
    };
    const pickImageUrl = (root) => {
      for (const image of Array.from(root.querySelectorAll("img"))) {
        const candidates = [
          image.currentSrc,
          image.getAttribute("data-srcset"),
          image.getAttribute("data-original"),
          image.getAttribute("data-src"),
          image.getAttribute("srcset"),
          image.getAttribute("src"),
        ];

        for (const candidate of candidates) {
          const imageUrl = resolveImageUrl(candidate);

          if (!isPlaceholderImage(imageUrl)) {
            return imageUrl;
          }
        }
      }

      return "";
    };

    const anchors = Array.from(document.querySelectorAll("a[href*='/kr/goos/view/']"));
    const roots = Array.from(
      new Set(anchors.map((anchor) => anchor.closest("li, article, section, div") ?? anchor))
    );

    return roots
      .map((root, index) => {
        const anchor = root.querySelector("a[href*='/kr/goos/view/']");
        const href = anchor?.href ?? "";
        const fullText = clean(root.textContent);
        const usdPrices = parseUsdPrices(fullText);
        const krwPrices = parseKrwPrices(fullText);
        const title =
          pickText(root, [
            "[class*='name']",
            "[class*='tit']",
            ".goosNm",
            ".productName",
            "strong",
          ]) || clean(anchor?.textContent);
        const brand =
          pickText(root, ["[class*='brand']", ".brand", ".brandNm", ".txtBrand"]) || brandHint;

        if (!href || !title || !brand || !usdPrices[0] || !krwPrices[0]) {
          return null;
        }

        return {
          id: `shinsegae-external-${index + 1}`,
          title,
          brand,
          usdPrice: usdPrices[0],
          regularUsdPrice: usdPrices[1],
          krwPrice: krwPrices[0],
          imageUrl: pickImageUrl(root) || undefined,
          sourceUrl: href,
          eventBadges: collectBadges(root),
          note: "외부 브라우저 수집 기준",
        };
      })
      .filter(Boolean)
      .slice(0, 30);
  }, { fallbackBrand });
}

async function submitSnapshot(payload) {
  const syncUrl = process.env.DFMOA_EXTERNAL_SYNC_URL || DEFAULT_SYNC_URL;
  const token = process.env.DFMOA_EXTERNAL_TOKEN || "";

  const response = await fetch(syncUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(token ? { "x-dfmoa-external-token": token } : {}),
    },
    body: JSON.stringify(payload),
  });

  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(`Submit failed: HTTP ${response.status} ${responseText}`);
  }

  return responseText;
}

async function launchContext(userDataDir, headless) {
  const launchOptions = [
    { channel: "msedge" },
    { channel: "chrome" },
    {},
  ];

  for (const option of launchOptions) {
    try {
      return await chromium.launchPersistentContext(userDataDir, {
        headless,
        locale: "ko-KR",
        ...option,
      });
    } catch {}
  }

  throw new Error("Could not launch a persistent Chromium context");
}

async function main() {
  const { query, submit, headless } = parseArgs(process.argv.slice(2));

  if (!query) {
    throw new Error("Usage: npm run collect:shinsegae -- \"brand product size\" [--submit]");
  }

  const outputDir = DEFAULT_OUTPUT_DIR;
  const context = await launchContext(DEFAULT_USER_DATA_DIR, headless);
  const page = context.pages()[0] ?? (await context.newPage());
  const fallbackBrand = query.split(" ")[0] || "신세계";

  try {
    await page.goto("https://www.ssgdfs.com/kr/main/initMain", {
      waitUntil: "domcontentloaded",
      timeout: 120000,
    });
    await page.waitForTimeout(DEFAULT_WAIT_MS);

    const searchUrl = getSearchUrl(query);
    await page.goto(searchUrl, {
      waitUntil: "domcontentloaded",
      timeout: 120000,
    });
    await page.waitForTimeout(DEFAULT_WAIT_MS);

    let bodyText = cleanText(await page.textContent("body"));

    if (bodyText.includes("잠시 연결에 문제가 발생했습니다")) {
      await waitForEnter(
        "신세계 탭에서 로그인 또는 인증을 완료한 뒤 Enter를 눌러 다시 시도합니다."
      );
      await page.goto(searchUrl, {
        waitUntil: "domcontentloaded",
        timeout: 120000,
      });
      await page.waitForTimeout(DEFAULT_WAIT_MS);
      bodyText = cleanText(await page.textContent("body"));
    }

    if (bodyText.includes("잠시 연결에 문제가 발생했습니다")) {
      const debugFile = await saveDebugHtml(outputDir, await page.content());
      throw new Error(`Search page is still blocked. Saved HTML to ${debugFile}`);
    }

    const offers = await scrapeOffers(page, fallbackBrand);

    if (!offers.length) {
      const debugFile = await saveDebugHtml(outputDir, await page.content());
      throw new Error(`No offers parsed from the page. Saved HTML to ${debugFile}`);
    }

    const payload = {
      storeId: "shinsegae",
      query,
      searchUrl: page.url(),
      collectedAt: formatTimestamp(),
      collector: "persistent-playwright",
      note: "외부 브라우저 수집 기준",
      offers,
    };

    if (submit) {
      const responseText = await submitSnapshot(payload);
      process.stdout.write(`${responseText}\n`);
    } else {
      process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
    }
  } finally {
    await context.close();
  }
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});

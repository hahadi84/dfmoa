import { Buffer } from "node:buffer";
import { searchDomesticPrices } from "../../src/lib/domestic-price-search";
import { getProductBySlug, type Product } from "../../src/lib/site-data";

function decodeSearchQueryPayload(value: string | null) {
  if (!value) {
    return "";
  }

  try {
    const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    return Buffer.from(padded, "base64").toString("utf8").trim();
  } catch {
    return "";
  }
}

function getSearchQuery(url: URL) {
  const decodedPayload = decodeSearchQueryPayload(url.searchParams.get("qe"));

  if (decodedPayload) {
    return decodedPayload;
  }

  return url.searchParams.get("q")?.trim() ?? "";
}

function getProductSlug(url: URL) {
  return url.searchParams.get("pid")?.trim() ?? "";
}

function cleanText(value: string | undefined | null) {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

function dedupe(values: string[]) {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    const cleaned = cleanText(value);
    const key = cleaned.normalize("NFKC").toLowerCase();

    if (!cleaned || seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(cleaned);
  }

  return result;
}

function buildLookupQueries(query: string, product?: Product) {
  if (!product) {
    return [query];
  }

  return dedupe([
    product.query,
    product.displayName,
    `${product.brand} ${product.name} ${product.volume}`,
    query,
  ]).slice(0, 3);
}

const handler = async (req: Request) => {
  const url = new URL(req.url);
  const query = getSearchQuery(url);
  const product = getProductBySlug(getProductSlug(url));
  const results = await Promise.all(buildLookupQueries(query, product).map((lookupQuery) => searchDomesticPrices(lookupQuery)));
  const bestResult = results
    .filter((result) => result.offers.length)
    .sort((left, right) => right.offers.length - left.offers.length)[0] ?? results[0] ?? (await searchDomesticPrices(query));

  return Response.json(
    {
      ...bestResult,
      query,
      lookupQuery: bestResult.query,
    },
    {
      headers: {
        "cache-control": "public, max-age=0, s-maxage=600, stale-while-revalidate=1800",
      },
    }
  );
};

export default handler;

export const config = {
  path: "/api/domestic-prices",
};

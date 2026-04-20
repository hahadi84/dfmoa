import { recordPriceHistory } from "../../src/lib/price-history";
import { searchDutyFreeOffersLite } from "../../src/lib/live-search-lite";
import { createEmptyHistorySummary } from "../../src/lib/search-types";
import { Buffer } from "node:buffer";

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

function getProductId(url: URL) {
  return url.searchParams.get("pid")?.trim() || undefined;
}

const handler = async (req: Request) => {
  const url = new URL(req.url);
  const query = getSearchQuery(url);
  const productId = getProductId(url);
  const result = await searchDutyFreeOffersLite(query);
  const history = await recordPriceHistory(result, {
    subject: productId
      ? {
          type: "product",
          key: productId,
          label: query,
        }
      : undefined,
  }).catch(() => createEmptyHistorySummary());

  return Response.json(
    {
      ...result,
      history,
    },
    {
    headers: {
      "cache-control": "public, max-age=0, s-maxage=300, stale-while-revalidate=300",
    },
    }
  );
};

export default handler;

export const config = {
  path: "/api/search",
};

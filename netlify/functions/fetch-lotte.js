import { fetchLottePrices } from "../../scripts/lotte-fetcher.mjs";
import { searchProducts } from "../../src/lib/site-data";

const handler = async (req) => {
  if (req.method !== "POST") {
    return Response.json(
      {
        store: "lotte",
        query: "",
        items: [],
        fetchedAt: new Date().toISOString(),
        status: "error",
        error: "POST 요청만 지원합니다.",
      },
      { status: 405 }
    );
  }

  const payload = await req.json().catch(() => null);
  const query = payload?.query?.trim() ?? "";
  const product = searchProducts(query)[0]?.product;
  const result = await fetchLottePrices(query, { product });

  return Response.json(result, {
    headers: {
      "cache-control": "public, max-age=0, s-maxage=300, stale-while-revalidate=300",
    },
  });
};

export default handler;

export const config = {
  path: "/api/fetch-lotte",
};

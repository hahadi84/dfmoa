import { parseHistoryQueriesInput, refreshPriceHistoryBatch } from "../../src/lib/history-refresh";
import { getNetlifyDeployContext, getNetlifyEnv } from "../../src/lib/netlify-runtime";

function getRefreshToken() {
  return getNetlifyEnv("HISTORY_REFRESH_TOKEN")?.trim() ?? "";
}

function getExtraQueries() {
  return parseHistoryQueriesInput(getNetlifyEnv("HISTORY_WATCHLIST_QUERIES"));
}

function isProductionDeploy() {
  return getNetlifyDeployContext() === "production";
}

function isAuthorized(req: Request) {
  const token = getRefreshToken();

  if (!token) {
    return !isProductionDeploy();
  }

  return req.headers.get("x-dfmoa-refresh-token")?.trim() === token;
}

function getRequestedQueries(url: URL) {
  const queryList = url.searchParams.getAll("query");
  const queriesParam = parseHistoryQueriesInput(url.searchParams.get("queries"));
  return [...queryList, ...queriesParam];
}

const handler = async (req: Request) => {
  if (req.method !== "GET" && req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  if (!isAuthorized(req)) {
    return Response.json(
      {
        ok: false,
        message: "Unauthorized",
      },
      {
        status: 401,
        headers: { "cache-control": "no-store" },
      }
    );
  }

  const url = new URL(req.url);
  const requestedQueries = getRequestedQueries(url);
  const summary = await refreshPriceHistoryBatch({
    queries: requestedQueries.length ? requestedQueries : undefined,
    extraQueries: getExtraQueries(),
  });

  return Response.json(
    {
      ok: true,
      source: requestedQueries.length ? "manual-selection" : "default-watchlist",
      ...summary,
    },
    {
      headers: { "cache-control": "no-store" },
    }
  );
};

export default handler;

export const config = {
  path: "/api/history/refresh",
};

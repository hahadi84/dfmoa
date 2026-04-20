import { parseHistoryQueriesInput, refreshPriceHistoryBatch } from "../../src/lib/history-refresh";
import { getNetlifyEnv } from "../../src/lib/netlify-runtime";

function getExtraQueries() {
  return parseHistoryQueriesInput(getNetlifyEnv("HISTORY_WATCHLIST_QUERIES"));
}

const handler = async (req: Request) => {
  const payload = await req.json().catch(() => null);
  const summary = await refreshPriceHistoryBatch({
    extraQueries: getExtraQueries(),
  });

  console.log(
    JSON.stringify({
      type: "history-refresh-scheduled",
      nextRun: payload?.next_run ?? null,
      ...summary,
    })
  );
};

export default handler;

export const config = {
  schedule: "15 * * * *",
};

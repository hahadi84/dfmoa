import { pruneSearchDemand } from "../../src/lib/search-demand";

const handler = async () => {
  // Netlify scheduled functions run on published production deploys only.
  await pruneSearchDemand(true);
  return new Response(null, { status: 204 });
};

export default handler;

export const config = { schedule: "45 21 * * *" };

import { readSearchDemand, recordSearchDemand } from "../../src/lib/search-demand";

const handler = async (req: Request, context: { deploy: { context: string } }) => {
  const headers = { "cache-control": "no-store" };
  const production = context.deploy.context === "production";
  try {
    if (req.method === "GET") {
      return Response.json(await readSearchDemand(production), { headers });
    }
    if (req.method !== "POST") return new Response(null, { status: 405, headers });
    if (req.headers.get("origin") !== new URL(req.url).origin) {
      return new Response(null, { status: 403, headers });
    }
    if (/bot|crawler|spider|headless/i.test(req.headers.get("user-agent") ?? "") || req.headers.get("dnt") === "1") {
      return new Response(null, { status: 204, headers });
    }
    const body = await req.text();
    if (body.length > 2048) return new Response(null, { status: 413, headers });
    let payload: { query?: unknown; sessionId?: unknown };
    try { payload = JSON.parse(body); } catch { return new Response(null, { status: 400, headers }); }
    if (!payload || typeof payload.query !== "string" || payload.query.length > 200 ||
        typeof payload.sessionId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(payload.sessionId)) {
      return new Response(null, { status: 400, headers });
    }
    await recordSearchDemand(payload.query, payload.sessionId, production);
    return new Response(null, { status: 204, headers });
  } catch (error) {
    console.error("Search demand storage failed", error instanceof Error ? error.message : "unknown error");
    return Response.json({ error: "search_demand_unavailable" }, { status: 503, headers });
  }
};

export default handler;

export const config = { path: "/api/search-demand", method: ["GET", "POST"] };

import { listBenefitReportDrafts } from "./_shared/benefit-report-store";

const handler = async (req: Request) => {
  const url = new URL(req.url);
  const limit = Number.parseInt(url.searchParams.get("limit") ?? "12", 10);
  const reports = await listBenefitReportDrafts(Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 24) : 12);

  return Response.json(
    {
      reports,
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
  path: "/api/benefit-report-drafts",
};

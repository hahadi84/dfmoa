import {
  isBenefitReportRequestAuthorized,
  saveBenefitReportDraft,
} from "./_shared/benefit-report-store";

const handler = async (req: Request) => {
  if (!isBenefitReportRequestAuthorized(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const report = await saveBenefitReportDraft(url.searchParams.get("date"));

  return Response.json(
    {
      ok: true,
      report,
    },
    {
      headers: {
        "cache-control": "no-store",
      },
    }
  );
};

export default handler;

export const config = {
  path: "/api/benefit-report-generate",
  method: ["GET", "POST"],
};

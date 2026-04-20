import { saveBenefitReportDraft } from "./_shared/benefit-report-store";

const handler = async (req: Request) => {
  const payload = await req.json().catch(() => null);
  const report = await saveBenefitReportDraft();

  console.log(
    JSON.stringify({
      type: "benefit-report-weekly",
      nextRun: payload?.next_run ?? null,
      slug: report.slug,
      publishedAt: report.publishedAt,
      sourceCount: report.sourceCount,
    })
  );

  return Response.json({ ok: true, slug: report.slug });
};

export default handler;

export const config = {
  schedule: "0 22 * * 0",
};

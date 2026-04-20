import { getStore } from "@netlify/blobs";
import {
  buildBenefitReport,
  getKoreaDateString,
  type BenefitReport,
} from "../../../src/lib/benefit-report-generator";
import { getNetlifyEnv } from "../../../src/lib/netlify-runtime";

const STORE_NAME = "benefit-reports";
const REPORT_PREFIX = "reports/";

function getBenefitReportStore() {
  return getStore({ name: STORE_NAME, consistency: "strong" });
}

function normalizeDateInput(value: string | null) {
  if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  return getKoreaDateString();
}

export function isBenefitReportRequestAuthorized(req: Request) {
  const expectedToken = getNetlifyEnv("BENEFIT_REPORT_TOKEN");

  if (!expectedToken) {
    return false;
  }

  const url = new URL(req.url);
  const providedToken = req.headers.get("x-benefit-report-token") ?? url.searchParams.get("token");

  return providedToken === expectedToken;
}

export async function saveBenefitReportDraft(dateInput?: string | null) {
  const publishedAt = normalizeDateInput(dateInput ?? null);
  const report = buildBenefitReport(publishedAt);
  const store = getBenefitReportStore();
  const key = `${REPORT_PREFIX}${report.slug}.json`;

  await store.setJSON(key, report, {
    metadata: {
      contentType: "application/json",
      publishedAt: report.publishedAt,
      title: report.title,
    },
  });
  await store.setJSON(`${REPORT_PREFIX}latest.json`, report, {
    metadata: {
      contentType: "application/json",
      publishedAt: report.publishedAt,
      title: report.title,
    },
  });

  return report;
}

export async function listBenefitReportDrafts(limit = 12) {
  const store = getBenefitReportStore();
  const { blobs } = await store.list({ prefix: REPORT_PREFIX });
  const reportKeys = blobs
    .map((blob) => blob.key)
    .filter((key) => key.endsWith(".json") && !key.endsWith("latest.json"))
    .sort()
    .reverse()
    .slice(0, limit);
  const reports = await Promise.all(
    reportKeys.map((key) => store.get(key, { type: "json" }) as Promise<BenefitReport | null>)
  );

  return reports.filter((report): report is BenefitReport => Boolean(report));
}

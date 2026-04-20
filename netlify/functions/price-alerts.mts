import { randomBytes } from "node:crypto";
import { CONSENT_VERSION, type NewsletterSubscriber, type PriceAlertRule } from "../../src/lib/notification-types";
import type { StoreId } from "../../src/lib/site-data";
import {
  createSecureToken,
  isValidEmail,
  normalizeEmail,
  saveNewsletterSubscriber,
  savePriceAlertRule,
} from "./_shared/retention-store";

const STORE_IDS: StoreId[] = ["lotte", "hyundai", "shilla", "shinsegae"];

function createId(prefix: string) {
  return `${prefix}_${randomBytes(12).toString("hex")}`;
}

function getNowIso() {
  return new Date().toISOString();
}

function normalizeSourceIds(value: unknown): StoreId[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const sourceIds = value.filter((item): item is StoreId => STORE_IDS.includes(item as StoreId));

  return sourceIds.length ? Array.from(new Set(sourceIds)) : undefined;
}

const handler = async (req: Request) => {
  if (req.method !== "POST") {
    return Response.json({ ok: false, message: "Method not allowed" }, { status: 405 });
  }

  const payload = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const email = normalizeEmail(payload?.email);
  const targetPrice = Number(payload?.targetPrice);
  const targetType = payload?.targetType === "effective_price" ? "effective_price" : "public_price";
  const currency = payload?.currency === "USD" ? "USD" : "KRW";
  const productId = typeof payload?.productId === "string" ? payload.productId.trim() : "";
  const productSlug = typeof payload?.productSlug === "string" ? payload.productSlug.trim() : "";
  const privacyConsent = payload?.privacyConsent === true;
  const marketingConsent = payload?.marketingConsent === true;
  const newsletterConsent = payload?.newsletterConsent === true;
  const source = typeof payload?.source === "string" ? payload.source : "other";

  if (!isValidEmail(email)) {
    return Response.json({ ok: false, message: "이메일 형식이 올바르지 않습니다." }, { status: 400 });
  }

  if (!productId || !productSlug) {
    return Response.json({ ok: false, message: "상품 정보가 누락되었습니다." }, { status: 400 });
  }

  if (!Number.isFinite(targetPrice) || targetPrice <= 0) {
    return Response.json({ ok: false, message: "알림 기준 금액을 확인해 주세요." }, { status: 400 });
  }

  if (!privacyConsent) {
    return Response.json({ ok: false, message: "개인정보 수집·이용 동의가 필요합니다." }, { status: 400 });
  }

  const now = getNowIso();
  const alertRule: PriceAlertRule = {
    id: createId("pa"),
    productId,
    productSlug,
    email,
    targetType,
    targetPrice,
    currency,
    sourceIds: normalizeSourceIds(payload?.sourceIds),
    userConditionSnapshot:
      targetType === "effective_price" && typeof payload?.userConditionSnapshot === "object"
        ? (payload.userConditionSnapshot as PriceAlertRule["userConditionSnapshot"])
        : undefined,
    status: "pending_verification",
    createdAt: now,
    verifiedAt: null,
    lastCheckedAt: null,
    lastTriggeredAt: null,
    unsubscribedAt: null,
    consentVersion: CONSENT_VERSION,
    privacyConsentAt: now,
    marketingConsent,
    marketingConsentAt: marketingConsent ? now : null,
    newsletterConsent,
    newsletterConsentAt: newsletterConsent ? now : null,
    source:
      source === "product_detail" || source === "favorite_page" || source === "benefit_report" || source === "footer"
        ? source
        : "other",
  };

  const unsubscribeToken = createSecureToken();
  await savePriceAlertRule(alertRule, unsubscribeToken);

  if (newsletterConsent) {
    const newsletterToken = createSecureToken();
    const subscriber: NewsletterSubscriber = {
      id: createId("ns"),
      email,
      status: "pending_verification",
      subscribedAt: now,
      verifiedAt: null,
      unsubscribedAt: null,
      consentVersion: CONSENT_VERSION,
      privacyConsentAt: now,
      marketingConsent,
      marketingConsentAt: marketingConsent ? now : null,
      source: "product_alert",
    };

    await saveNewsletterSubscriber(subscriber, newsletterToken);
  }

  const unsubscribeUrl = `${new URL(req.url).origin}/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}`;

  return Response.json(
    {
      ok: true,
      id: alertRule.id,
      status: alertRule.status,
      message:
        "가격 알림 등록 요청이 접수되었습니다. 이메일 발송 서비스 연결 후 확인 메일과 수신거부 링크가 발송됩니다.",
      unsubscribeUrl,
    },
    {
      headers: { "cache-control": "no-store" },
    }
  );
};

export default handler;

export const config = {
  path: "/api/price-alerts",
};

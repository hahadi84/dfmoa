import { randomBytes } from "node:crypto";
import { CONSENT_VERSION, type NewsletterSubscriber } from "../../src/lib/notification-types";
import {
  createSecureToken,
  isValidEmail,
  normalizeEmail,
  saveNewsletterSubscriber,
} from "./_shared/retention-store";

function createId() {
  return `ns_${randomBytes(12).toString("hex")}`;
}

const handler = async (req: Request) => {
  if (req.method !== "POST") {
    return Response.json({ ok: false, message: "Method not allowed" }, { status: 405 });
  }

  const payload = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const email = normalizeEmail(payload?.email);
  const privacyConsent = payload?.privacyConsent === true;
  const marketingConsent = payload?.marketingConsent === true;
  const source = typeof payload?.source === "string" ? payload.source : "other";

  if (!isValidEmail(email)) {
    return Response.json({ ok: false, message: "이메일 형식이 올바르지 않습니다." }, { status: 400 });
  }

  if (!privacyConsent) {
    return Response.json({ ok: false, message: "개인정보 수집·이용 동의가 필요합니다." }, { status: 400 });
  }

  const now = new Date().toISOString();
  const subscriber: NewsletterSubscriber = {
    id: createId(),
    email,
    status: "pending_verification",
    subscribedAt: now,
    verifiedAt: null,
    unsubscribedAt: null,
    consentVersion: CONSENT_VERSION,
    privacyConsentAt: now,
    marketingConsent,
    marketingConsentAt: marketingConsent ? now : null,
    source:
      source === "benefit_reports" || source === "product_alert" || source === "footer" || source === "favorite_page"
        ? source
        : "other",
  };

  const unsubscribeToken = createSecureToken();
  await saveNewsletterSubscriber(subscriber, unsubscribeToken);

  return Response.json(
    {
      ok: true,
      id: subscriber.id,
      status: subscriber.status,
      message:
        "주간 면세 리포트 구독 요청이 접수되었습니다. 이메일 발송 서비스 연결 후 확인 메일과 수신거부 링크가 발송됩니다.",
      unsubscribeUrl: `${new URL(req.url).origin}/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}`,
    },
    {
      headers: { "cache-control": "no-store" },
    }
  );
};

export default handler;

export const config = {
  path: "/api/newsletter",
};

import type { StoreId } from "@/lib/site-data";

export const CONSENT_VERSION = "dfmoa-retention-2026-04-19";

export type PriceAlertTargetType = "public_price" | "effective_price";

export type PriceAlertRule = {
  id: string;
  productId: string;
  productSlug: string;
  email: string;
  targetType: PriceAlertTargetType;
  targetPrice: number;
  currency: "KRW" | "USD";
  sourceIds?: StoreId[];
  userConditionSnapshot?: {
    membershipTier?: string;
    selectedBenefitRuleIds?: string[];
    cardDiscountAmount?: number;
    pointsAmount?: number;
    exchangeRate?: number;
  };
  status: "pending_verification" | "active" | "paused" | "triggered" | "unsubscribed" | "bounced";
  createdAt: string;
  verifiedAt?: string | null;
  lastCheckedAt?: string | null;
  lastTriggeredAt?: string | null;
  unsubscribedAt?: string | null;
  consentVersion: string;
  privacyConsentAt: string;
  marketingConsent: boolean;
  marketingConsentAt?: string | null;
  newsletterConsent?: boolean;
  newsletterConsentAt?: string | null;
  source: "product_detail" | "favorite_page" | "benefit_report" | "footer" | "other";
};

export type NewsletterSubscriber = {
  id: string;
  email: string;
  status: "pending_verification" | "subscribed" | "unsubscribed" | "bounced";
  subscribedAt?: string | null;
  verifiedAt?: string | null;
  unsubscribedAt?: string | null;
  consentVersion: string;
  privacyConsentAt: string;
  marketingConsent: boolean;
  marketingConsentAt?: string | null;
  source: "benefit_reports" | "product_alert" | "footer" | "favorite_page" | "other";
};

export type PushSubscriptionRecord = {
  id: string;
  endpointHash: string;
  endpointEncrypted?: string;
  productAlertRuleIds?: string[];
  status: "active" | "unsubscribed" | "expired";
  createdAt: string;
  unsubscribedAt?: string | null;
  consentVersion: string;
  marketingConsent: boolean;
};

export type AlertApiResponse = {
  ok: boolean;
  id?: string;
  status?: PriceAlertRule["status"] | NewsletterSubscriber["status"];
  message: string;
  unsubscribeUrl?: string;
};

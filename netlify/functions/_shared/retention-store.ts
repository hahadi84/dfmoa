import { getStore } from "@netlify/blobs";
import { createHash, randomBytes } from "node:crypto";
import type { NewsletterSubscriber, PriceAlertRule } from "../../../src/lib/notification-types";

const STORE_NAME = "retention";

export type UnsubscribeLookup = {
  type: "price_alert" | "newsletter";
  id: string;
  createdAt: string;
};

export function getRetentionStore() {
  return getStore({ name: STORE_NAME, consistency: "strong" });
}

export function createSecureToken() {
  return randomBytes(32).toString("base64url");
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function normalizeEmail(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function savePriceAlertRule(rule: PriceAlertRule, unsubscribeToken: string) {
  const store = getRetentionStore();
  const tokenHash = hashToken(unsubscribeToken);

  await store.setJSON(`price-alerts/${rule.id}.json`, rule, {
    metadata: {
      contentType: "application/json",
      status: rule.status,
      productSlug: rule.productSlug,
      consentVersion: rule.consentVersion,
    },
  });
  await store.setJSON(`unsubscribe/${tokenHash}.json`, {
    type: "price_alert",
    id: rule.id,
    createdAt: rule.createdAt,
  } satisfies UnsubscribeLookup);

  return tokenHash;
}

export async function saveNewsletterSubscriber(subscriber: NewsletterSubscriber, unsubscribeToken: string) {
  const store = getRetentionStore();
  const tokenHash = hashToken(unsubscribeToken);

  await store.setJSON(`newsletter/${subscriber.id}.json`, subscriber, {
    metadata: {
      contentType: "application/json",
      status: subscriber.status,
      consentVersion: subscriber.consentVersion,
    },
  });
  await store.setJSON(`unsubscribe/${tokenHash}.json`, {
    type: "newsletter",
    id: subscriber.id,
    createdAt: subscriber.subscribedAt ?? new Date().toISOString(),
  } satisfies UnsubscribeLookup);

  return tokenHash;
}

export async function markUnsubscribed(token: string) {
  const tokenHash = hashToken(token);
  const store = getRetentionStore();
  const lookup = (await store.get(`unsubscribe/${tokenHash}.json`, { type: "json" })) as UnsubscribeLookup | null;

  if (!lookup) {
    return null;
  }

  const unsubscribedAt = new Date().toISOString();

  if (lookup.type === "price_alert") {
    const key = `price-alerts/${lookup.id}.json`;
    const rule = (await store.get(key, { type: "json" })) as PriceAlertRule | null;

    if (!rule) {
      return null;
    }

    const nextRule: PriceAlertRule = {
      ...rule,
      status: "unsubscribed",
      unsubscribedAt,
    };

    await store.setJSON(key, nextRule, {
      metadata: {
        contentType: "application/json",
        status: nextRule.status,
        productSlug: nextRule.productSlug,
        consentVersion: nextRule.consentVersion,
      },
    });

    return { type: lookup.type, id: lookup.id };
  }

  const key = `newsletter/${lookup.id}.json`;
  const subscriber = (await store.get(key, { type: "json" })) as NewsletterSubscriber | null;

  if (!subscriber) {
    return null;
  }

  const nextSubscriber: NewsletterSubscriber = {
    ...subscriber,
    status: "unsubscribed",
    unsubscribedAt,
  };

  await store.setJSON(key, nextSubscriber, {
    metadata: {
      contentType: "application/json",
      status: nextSubscriber.status,
      consentVersion: nextSubscriber.consentVersion,
    },
  });

  return { type: lookup.type, id: lookup.id };
}

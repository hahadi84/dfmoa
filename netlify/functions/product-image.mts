import { Buffer } from "node:buffer";
import { searchDutyFreeImageCandidatesLite } from "../../src/lib/live-search-lite";
import { getProductBySlug, type Product } from "../../src/lib/site-data";
import type { LiveOffer } from "../../src/lib/search-types";

const CONFIDENT_IMAGE_SCORE = 16;
const VARIANT_TOKENS = ["absolu", "cologne", "맨", "men", "homme"];

function decodeSearchQueryPayload(value: string | null) {
  if (!value) {
    return "";
  }

  try {
    const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    return Buffer.from(padded, "base64").toString("utf8").trim();
  } catch {
    return "";
  }
}

function getSearchQuery(url: URL) {
  const decodedPayload = decodeSearchQueryPayload(url.searchParams.get("qe"));

  if (decodedPayload) {
    return decodedPayload;
  }

  return url.searchParams.get("q")?.trim() ?? "";
}

function getProductSlug(url: URL) {
  return url.searchParams.get("pid")?.trim() ?? "";
}

function cleanText(value: string | undefined | null) {
  return (value ?? "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
}

function normalizeText(value: string) {
  return cleanText(value)
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^0-9a-z가-힣ㄱ-ㅎㅏ-ㅣぁ-んァ-ン一-龥\s]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function compactText(value: string) {
  return normalizeText(value).replace(/\s+/g, "");
}

function getTokens(value: string) {
  return normalizeText(value)
    .split(" ")
    .filter((token) => token.length > 1);
}

function getVolumeTokens(value: string) {
  return cleanText(value).match(/\d+(?:\.\d+)?\s?(?:ml|g|kg|oz|cl|l)\b/gi) ?? [];
}

function dedupeTokens(values: string[]) {
  return Array.from(new Set(values.map((value) => normalizeText(value)).filter(Boolean)));
}

function dedupeText(values: string[]) {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    const normalized = normalizeText(value);

    if (!normalized || seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);
    result.push(value);
  }

  return result;
}

function buildLookupQueries(query: string, product?: Product) {
  if (!product) {
    return [query];
  }

  const queryTokens = getTokens(product.query);
  const shortQuery = `${queryTokens.slice(0, 2).join(" ")} ${product.volume}`;

  return dedupeText([
    product.query,
    shortQuery,
    product.displayName,
    `${product.brand} ${product.name} ${product.volume}`,
    ...product.searchTerms.map((term) => `${term} ${product.volume}`),
    query,
  ]).slice(0, 8);
}

function scoreImageOffer(offer: LiveOffer, query: string, product?: Product) {
  const haystack = normalizeText(`${offer.brand} ${offer.title}`);
  const compactHaystack = compactText(`${offer.brand} ${offer.title}`);
  const productText = normalizeText(
    product ? [product.brand, product.name, product.displayName, product.query, ...product.searchTerms].join(" ") : query
  );
  const brandCandidates = product ? dedupeTokens([product.brand, getTokens(product.query)[0] ?? ""]) : [];
  const productName = normalizeText(product?.name ?? "");
  const displayName = normalizeText(product?.displayName ?? "");
  const volumeTokens = getVolumeTokens(product?.volume ?? query).map((token) => normalizeText(token));
  const searchTokens = dedupeTokens(
    dedupeText(
      product ? [product.name, product.displayName, product.query, ...product.searchTerms] : [query]
    ).flatMap((value) => getTokens(value))
  ).filter((token) => token.length > 2 && !volumeTokens.includes(token));

  let score = 0;

  const hasBrandSignal = brandCandidates.some((brand) => {
    const compactBrand = brand.replace(/\s+/g, "");
    return haystack.includes(brand) || Boolean(compactBrand && compactHaystack.includes(compactBrand));
  });
  let matchedTokenCount = 0;

  if (hasBrandSignal) {
    score += 8;
  }

  if (productName && haystack.includes(productName)) {
    score += 18;
  }

  if (displayName && haystack.includes(displayName)) {
    score += 12;
  }

  for (const token of searchTokens) {
    if (haystack.includes(token)) {
      matchedTokenCount += 1;
      score += token.length >= 4 ? 5 : 3;
    }
  }

  if (volumeTokens.length && volumeTokens.every((token) => haystack.includes(token))) {
    score += 7;
  }

  if (offer.imageUrl) {
    score += 1;
  }

  if (hasBrandSignal || matchedTokenCount > 0) {
    score += Math.min(offer.matchScore, hasBrandSignal ? 14 : 8);
  }

  for (const variantToken of VARIANT_TOKENS) {
    if (haystack.includes(variantToken) && !productText.includes(variantToken)) {
      score -= 30;
    }
  }

  return score;
}

async function findBestImageOffer(query: string, product?: Product) {
  let bestOffer: (LiveOffer & { imageScore: number }) | null = null;

  for (const lookupQuery of buildLookupQueries(query, product)) {
    const result = await searchDutyFreeImageCandidatesLite(lookupQuery);
    const scoredOffers = result.offers
      .filter((offer) => offer.imageUrl)
      .map((offer) => ({
        ...offer,
        imageScore: scoreImageOffer(offer, query, product),
      }))
      .sort((left, right) => {
        if (right.imageScore !== left.imageScore) {
          return right.imageScore - left.imageScore;
        }

        return right.matchScore - left.matchScore;
      });

    const topOffer = scoredOffers[0];

    if (topOffer && (!bestOffer || topOffer.imageScore > bestOffer.imageScore)) {
      bestOffer = topOffer;
    }

    if (bestOffer && bestOffer.imageScore >= CONFIDENT_IMAGE_SCORE) {
      break;
    }
  }

  return bestOffer && bestOffer.imageScore >= CONFIDENT_IMAGE_SCORE ? bestOffer : null;
}

const handler = async (req: Request) => {
  const url = new URL(req.url);
  const query = getSearchQuery(url);
  const product = getProductBySlug(getProductSlug(url));
  const imageOffer = await findBestImageOffer(query, product);

  return Response.json(
    {
      query,
      imageUrl: imageOffer?.imageUrl ?? null,
      sourceUrl: imageOffer?.sourceUrl ?? null,
      storeId: imageOffer?.storeId ?? null,
      title: imageOffer?.title ?? null,
      brand: imageOffer?.brand ?? null,
      imageScore: imageOffer?.imageScore ?? null,
    },
    {
      headers: {
        "cache-control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
      },
    }
  );
};

export default handler;

export const config = {
  path: "/api/product-image",
};

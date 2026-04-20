export function encodeSearchQueryPayload(query: string) {
  const bytes = new TextEncoder().encode(query);
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export function buildSearchApiPath(
  query: string,
  options: {
    productId?: string;
  } = {}
) {
  const encodedQuery = encodeURIComponent(query);
  const encodedPayload = encodeSearchQueryPayload(query);
  const productParam = options.productId ? `&pid=${encodeURIComponent(options.productId)}` : "";

  return `/api/search?q=${encodedQuery}&qe=${encodedPayload}${productParam}`;
}

export function buildProductImageApiPath(
  query: string,
  options: {
    productId?: string;
  } = {}
) {
  const encodedQuery = encodeURIComponent(query);
  const encodedPayload = encodeSearchQueryPayload(query);
  const productParam = options.productId ? `&pid=${encodeURIComponent(options.productId)}` : "";

  return `/api/product-image?q=${encodedQuery}&qe=${encodedPayload}${productParam}`;
}

export function buildDomesticPriceApiPath(
  query: string,
  options: {
    productId?: string;
  } = {}
) {
  const encodedQuery = encodeURIComponent(query);
  const encodedPayload = encodeSearchQueryPayload(query);
  const productParam = options.productId ? `&pid=${encodeURIComponent(options.productId)}` : "";

  return `/api/domestic-prices?q=${encodedQuery}&qe=${encodedPayload}${productParam}`;
}

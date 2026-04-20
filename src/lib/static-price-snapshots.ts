import fs from "node:fs";
import path from "node:path";
import type { Product } from "@/lib/site-data";
import type { ProductPriceSnapshot } from "@/lib/price-snapshot-types";

const PRICE_DIR = path.join(process.cwd(), "data", "prices");

export function readProductPriceSnapshot(productId: string) {
  const filePath = path.join(PRICE_DIR, `${productId}.json`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8")) as ProductPriceSnapshot;
  } catch {
    return null;
  }
}

export function readPriceSnapshotsByProductId(products: Product[]) {
  return products.reduce<Record<string, ProductPriceSnapshot | null>>((acc, product) => {
    acc[product.id] = readProductPriceSnapshot(product.id);
    return acc;
  }, {});
}

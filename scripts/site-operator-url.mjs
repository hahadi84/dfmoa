import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const siteOperatorPath = path.join(repoRoot, "src", "lib", "site-operator.ts");
const siteOperatorSource = fs.readFileSync(siteOperatorPath, "utf8");
const serviceUrlMatch = siteOperatorSource.match(/serviceUrl:\s*"([^"]+)"/);

if (!serviceUrlMatch) {
  throw new Error("SITE_OPERATOR.serviceUrl was not found in src/lib/site-operator.ts");
}

export const SITE_SERVICE_URL = serviceUrlMatch[1];

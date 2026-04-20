#!/usr/bin/env node

import { copyFile, mkdir, readdir } from "node:fs/promises";
import path from "node:path";

const appDir = path.resolve(".next", "server", "app");
const outDir = path.resolve("out");

async function walkHtmlFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolutePath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await walkHtmlFiles(absolutePath)));
      continue;
    }

    if (entry.isFile() && (entry.name.endsWith(".html") || entry.name === "favicon.ico.body")) {
      files.push(absolutePath);
    }
  }

  return files;
}

function getTargetPath(sourcePath) {
  const relativePath = path.relative(appDir, sourcePath);
  const normalized = relativePath.split(path.sep).join("/");

  if (normalized === "index.html") {
    return path.join(outDir, "index.html");
  }

  if (normalized === "_not-found.html") {
    return path.join(outDir, "404.html");
  }

  if (normalized === "favicon.ico.body") {
    return path.join(outDir, "favicon.ico");
  }

  if (normalized.startsWith("_")) {
    return null;
  }

  const parsed = path.parse(relativePath);
  return path.join(outDir, parsed.dir, parsed.name, "index.html");
}

async function main() {
  const htmlFiles = await walkHtmlFiles(appDir);

  for (const sourcePath of htmlFiles) {
    const targetPath = getTargetPath(sourcePath);

    if (!targetPath) {
      continue;
    }

    await mkdir(path.dirname(targetPath), { recursive: true });
    await copyFile(sourcePath, targetPath);
  }
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});

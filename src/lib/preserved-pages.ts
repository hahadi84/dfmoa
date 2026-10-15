import type { Metadata } from "next";
import pages from "../../data/preserved-pages.json";

export const preservedPages = pages;

export function getPreservedPage(path: string) {
  return preservedPages.find((page) => page.path === path);
}

export function preservedMetadata(path: string): Metadata {
  const page = getPreservedPage(path);
  return page ? { title: { absolute: page.title }, description: page.description,
    alternates: { canonical: path } } : {};
}

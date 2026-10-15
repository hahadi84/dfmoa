import { notFound } from "next/navigation";
import { getPreservedPage } from "@/lib/preserved-pages";

export function PreservedPage({ path }: { path: string }) {
  const page = getPreservedPage(path);
  if (!page) notFound();
  // Own published content, captured and stripped of scripts, handlers and non-search forms.
  return <div dangerouslySetInnerHTML={{ __html: page.html }} />;
}

import fs from "node:fs";
import path from "node:path";

export type ContentContextSection = {
  heading: string;
  body: string[];
  bullets?: string[];
};

export type ContentContext = {
  title?: string;
  sections: ContentContextSection[];
};

const DATA_ROOT = path.join(process.cwd(), "data");

function flushParagraph(section: ContentContextSection | null, paragraph: string[]) {
  if (!section || !paragraph.length) {
    return;
  }

  section.body.push(paragraph.join(" "));
  paragraph.length = 0;
}

function parseMarkdownContext(markdown: string): ContentContext {
  const context: ContentContext = { sections: [] };
  let currentSection: ContentContextSection | null = null;
  const paragraph: string[] = [];

  for (const rawLine of markdown.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (line.startsWith("# ")) {
      context.title = line.replace(/^#\s+/, "").trim();
      continue;
    }

    if (line.startsWith("## ")) {
      flushParagraph(currentSection, paragraph);
      currentSection = {
        heading: line.replace(/^##\s+/, "").trim(),
        body: [],
      };
      context.sections.push(currentSection);
      continue;
    }

    if (!line) {
      flushParagraph(currentSection, paragraph);
      continue;
    }

    if (!currentSection) {
      currentSection = { heading: "안내", body: [] };
      context.sections.push(currentSection);
    }

    if (line.startsWith("- ")) {
      flushParagraph(currentSection, paragraph);
      currentSection.bullets = currentSection.bullets ?? [];
      currentSection.bullets.push(line.replace(/^-\s+/, "").trim());
      continue;
    }

    paragraph.push(line);
  }

  flushParagraph(currentSection, paragraph);

  return context;
}

function readContext(kind: "brand-context" | "product-context", slug: string) {
  const filePath = path.join(DATA_ROOT, kind, `${slug}.md`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const parsed = parseMarkdownContext(fs.readFileSync(filePath, "utf8"));
  return parsed.sections.length ? parsed : null;
}

export function readProductContext(slug: string) {
  return readContext("product-context", slug);
}

export function readBrandContext(slug: string) {
  return readContext("brand-context", slug);
}

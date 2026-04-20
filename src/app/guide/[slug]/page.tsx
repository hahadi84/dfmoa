import type { Metadata } from "next";
import Link from "@/components/app-link";
import { notFound } from "next/navigation";
import { buildBreadcrumbJsonLd, buildGuideArticleJsonLd, serializeJsonLd } from "@/lib/json-ld";
import { buildSeoMetadata } from "@/lib/seo-metadata";
import { guides, getGuideBySlug } from "@/lib/site-data";

type GuidePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return guides.map((guide) => ({
    slug: guide.slug,
  }));
}

export async function generateMetadata({ params }: GuidePageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);

  if (!guide) {
    return {
      title: "가이드를 찾을 수 없음",
    };
  }

  return buildSeoMetadata({
    title: guide.title,
    description: guide.excerpt,
    path: `/guide/${guide.slug}`,
    image: {
      path: `/og/guide/${guide.slug}.png`,
      alt: guide.title,
    },
    type: "article",
  });
}

export default async function GuidePage({ params }: GuidePageProps) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);

  if (!guide) {
    notFound();
  }
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "홈", path: "/" },
    { name: "가이드", path: "/guide/airport-duty-free-basics" },
    { name: guide.title, path: `/guide/${guide.slug}` },
  ]);
  const articleJsonLd = buildGuideArticleJsonLd(guide, `/guide/${guide.slug}`);

  return (
    <section className="page-section is-tight">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd([breadcrumbJsonLd, articleJsonLd]) }}
      />
      <div className="container">
        <div className="breadcrumb">
          <Link href="/">홈</Link>
          <span>/</span>
          <span>가이드</span>
          <span>/</span>
          <span>{guide.title}</span>
        </div>

        <span className="eyebrow" style={{ marginTop: 24 }}>
          Guide
        </span>
        <h1 className="page-title">{guide.title}</h1>
        <p className="page-description">{guide.excerpt}</p>

        <div className="split-grid" style={{ marginTop: 28 }}>
          <article className="surface-card">
            <div className="guide-stack">
              {guide.sections.map((section) => (
                <section key={section.heading} className="guide-section">
                  <h2 className="card-title" style={{ fontSize: "1.25rem" }}>
                    {section.heading}
                  </h2>
                  {section.body.map((paragraph) => (
                    <p key={paragraph} className="section-copy">
                      {paragraph}
                    </p>
                  ))}
                  {section.bullets ? (
                    <ul>
                      {section.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  ) : null}
                </section>
              ))}
            </div>
          </article>

          <aside className="feature-panel">
            <p className="panel-title">다른 가이드</p>
            <div className="subgrid" style={{ marginTop: 18 }}>
              {guides
                .filter((item) => item.slug !== guide.slug)
                .map((item) => (
                  <Link key={item.slug} href={`/guide/${item.slug}`} className="list-item">
                    <span className="list-number">G</span>
                    <p className="list-copy">
                      <strong>{item.title}</strong>
                      {item.excerpt}
                    </p>
                  </Link>
                ))}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

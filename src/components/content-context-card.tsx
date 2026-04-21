import type { ContentContext } from "@/lib/context-content";

type ContentContextCardProps = {
  context: ContentContext;
  eyebrow?: string;
  title: string;
};

export function ContentContextCard({ context, eyebrow = "Buying Notes", title }: ContentContextCardProps) {
  return (
    <article className="surface-card content-context-card">
      <span className="eyebrow">{eyebrow}</span>
      <h2 className="card-title" style={{ fontSize: "1.1rem" }}>
        {title}
      </h2>
      <div className="guide-body" style={{ marginTop: 10 }}>
        {context.sections.map((section) => (
          <section key={section.heading} className="guide-section">
            <h3 className="card-title" style={{ fontSize: "1rem" }}>
              {section.heading}
            </h3>
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
  );
}

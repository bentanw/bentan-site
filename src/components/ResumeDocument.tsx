import type { Resume, Rich as RichText } from "@/lib/types";
import { Rich } from "./Rich";

/** HTML rendering of the parsed LaTeX resume, laid out like Jake's template. */
export function ResumeDocument({ resume }: { resume: Resume }) {
  const { contact } = resume;
  const contactLinks: { label: string; href?: string }[] = [
    contact.phone && { label: contact.phone, href: `tel:${contact.phone.replace(/[^\d+]/g, "")}` },
    contact.email && { label: contact.email, href: `mailto:${contact.email}` },
    contact.linkedin && { label: contact.linkedin.replace(/^https?:\/\/(www\.)?/, ""), href: contact.linkedin },
    contact.github && { label: contact.github.replace(/^https?:\/\/(www\.)?/, ""), href: contact.github },
  ].filter((x): x is { label: string; href: string } => !!x);

  return (
    <article className="resume-doc select-text">
      <header className="text-center">
        <h1 className="text-resume-name leading-tight font-bold [font-variant:small-caps]">{resume.name}</h1>
        <p className="mt-0.5 text-xs">
          {contactLinks.map((l, k) => (
            <span key={l.label}>
              {k > 0 && " | "}
              <a href={l.href} target={l.href?.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">
                {l.label}
              </a>
            </span>
          ))}
        </p>
      </header>

      {resume.sections.map((section) => (
        <section key={section.title}>
          <h2>{section.title}</h2>

          {section.skills.length > 0 && (
            <div className="pl-resume-indent text-xs">
              {section.skills.map((s) => (
                <div key={s.label}>
                  <strong>{s.label}:</strong> {s.items.join(", ")}
                </div>
              ))}
            </div>
          )}

          {section.bullets.length > 0 && <Bullets items={section.bullets} />}

          <div className="space-y-1.5 pl-resume-indent">
            {section.entries.map((e, k) => (
              <div key={k}>
                {e.kind === "project" ? (
                  <Row left={<Rich value={e.title} />} right={<Rich value={e.date} />} small />
                ) : (
                  <>
                    {e.title.length > 0 && (
                      <Row
                        left={
                          <strong>
                            <Rich value={e.title} />
                          </strong>
                        }
                        right={<Rich value={e.date} />}
                      />
                    )}
                    {(e.subtitle.length > 0 || e.location.length > 0) && (
                      <Row
                        left={
                          <em>
                            <Rich value={e.subtitle} />
                          </em>
                        }
                        right={
                          <em>
                            <Rich value={e.location} />
                          </em>
                        }
                        small
                      />
                    )}
                  </>
                )}
                {e.bullets.length > 0 && <Bullets items={e.bullets} />}
              </div>
            ))}
          </div>
        </section>
      ))}
    </article>
  );
}

function Row({ left, right, small }: { left: React.ReactNode; right: React.ReactNode; small?: boolean }) {
  return (
    <div className={`flex flex-wrap items-baseline justify-between gap-x-4 ${small ? "text-xs" : ""}`}>
      <div className="min-w-0">{left}</div>
      <div className="shrink-0 text-right">{right}</div>
    </div>
  );
}

function Bullets({ items }: { items: RichText[] }) {
  return (
    <ul className="mt-0.5 list-disc space-y-px pl-6 text-xs">
      {items.map((b, k) => (
        <li key={k}>
          <Rich value={b} />
        </li>
      ))}
    </ul>
  );
}

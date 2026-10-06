/**
 * Static semantic CV (§2.1 fast path, §10 fallback). Server Component, zero client JS.
 * Rendered entirely from src/data so it never drifts from the desktop experience.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import {
  CV_PDF_PATH,
  certifications,
  education,
  experience,
  languages,
  person,
  projects,
  skills,
} from "@/data";
import { JsonLd } from "@/components/seo/JsonLd";
import { OG_DEFAULTS } from "@/lib/site";
import { cvGraph } from "@/lib/structuredData";
import styles from "./cv.module.css";

const companies = [...new Set(experience.map((e) => e.company))].join(", ");
const CV_TITLE = `CV — ${person.role}`;
// Built from data so it stays true: who, where, employers, and headline skills (~155 chars).
const CV_DESCRIPTION = `${person.name}'s CV: ${person.role} in ${person.location}. Experience at ${companies}. ${skills
  .slice(0, 2)
  .flatMap((g) => g.items.slice(0, 2))
  .join(", ")} and more.`;

export const metadata: Metadata = {
  title: CV_TITLE,
  description: CV_DESCRIPTION,
  alternates: { canonical: "/cv" },
  openGraph: {
    ...OG_DEFAULTS,
    type: "profile",
    url: "/cv",
    title: `${CV_TITLE} | ${person.name}`,
    description: CV_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${CV_TITLE} | ${person.name}`,
    description: CV_DESCRIPTION,
    images: ["/opengraph-image"],
  },
};

export default function CvPage() {
  return (
    <main className={styles.page}>
      <JsonLd data={cvGraph()} />
      <header className={styles.header}>
        <div className={styles.identity}>
          <Avatar size={72} />
          <div>
            <h1>{person.name}</h1>
            <p className={styles.role}>{person.role}</p>
          </div>
        </div>
        <p>{person.tagline}</p>
        <ul className={styles.inline}>
          <li>{person.location}</li>
          <li>
            <a href={person.github}>GitHub</a>
          </li>
          <li>
            <a href={CV_PDF_PATH} download>
              Download PDF
            </a>
          </li>
          <li>
            <Link href="/">Open the desktop experience</Link>
          </li>
        </ul>
      </header>

      <section aria-labelledby="summary">
        <h2 id="summary">Summary</h2>
        <p>{person.summary}</p>
        <p>{person.availability}</p>
      </section>

      <section aria-labelledby="experience">
        <h2 id="experience">Experience</h2>
        {experience.map((e) => (
          <article key={`${e.company}-${e.period}`} className={styles.item}>
            <h3>
              {e.role} — {e.company}
            </h3>
            <p className={styles.meta}>
              {e.location} · {e.period}
            </p>
            <p>{e.summary}</p>
            <p>
              <strong>Impact:</strong> {e.impact}
            </p>
            <ul>
              {e.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
            <p className={styles.meta}>{e.tools.join(" · ")}</p>
          </article>
        ))}
      </section>

      <section aria-labelledby="projects">
        <h2 id="projects">Projects</h2>
        {projects.map((p) => (
          <article key={p.slug} className={styles.item}>
            <h3>{p.title}</h3>
            <p>{p.description}</p>
            <p className={styles.meta}>{p.technologies.join(" · ")}</p>
            {(p.liveUrl || p.githubUrl) && (
              <ul className={styles.inline}>
                {p.liveUrl && (
                  <li>
                    <a href={p.liveUrl}>Live</a>
                  </li>
                )}
                {p.githubUrl && (
                  <li>
                    <a href={p.githubUrl}>Source</a>
                  </li>
                )}
              </ul>
            )}
          </article>
        ))}
      </section>

      <section aria-labelledby="skills">
        <h2 id="skills">Skills</h2>
        <dl className={styles.skills}>
          {skills.map((g) => (
            <div key={g.title}>
              <dt>{g.title}</dt>
              <dd>{g.items.join(", ")}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="education">
        <h2 id="education">Education</h2>
        {education.map((e) => (
          <article key={e.institution} className={styles.item}>
            <h3>{e.degree}</h3>
            <p className={styles.meta}>
              {e.institution}, {e.location} · {e.period}
            </p>
            <p>{e.description}</p>
          </article>
        ))}
        <h3>Certifications</h3>
        <ul>
          {certifications.map((c) => (
            <li key={c.name}>
              {c.link ? <a href={c.link}>{c.name}</a> : c.name} — {c.issuer}, {c.date}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="languages">
        <h2 id="languages">Languages</h2>
        <ul className={styles.inline}>
          {languages.map((l) => (
            <li key={l.name}>
              {l.name} ({l.level})
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

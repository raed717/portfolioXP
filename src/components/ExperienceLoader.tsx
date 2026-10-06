"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { CV_PDF_PATH, experience, person, projects, skills } from "@/data";
import styles from "./screens/screens.module.css";

/**
 * The desktop depends on viewport, storage and user preferences, so it renders on the client only.
 * The server sends a real, semantic introduction instead of an empty shell: it's what non-JS
 * crawlers (most AI search bots) index, and what people see for the instant before the desktop
 * loads and replaces it. Same facts as /cv, so this is progressive enhancement, not cloaking.
 */
const Experience = dynamic(() => import("./Experience"), {
  ssr: false,
  loading: () => <HomeIntro />,
});

export function ExperienceLoader() {
  return <Experience />;
}

const current = experience.find((e) => /present/i.test(e.period));

function HomeIntro() {
  return (
    <main className={styles.fallback} aria-busy="true">
      <h1 className={styles.fallbackName}>{person.name}</h1>
      <p className={styles.fallbackRole}>
        {person.role} · {person.location}
        {current && ` · ${current.role} at ${current.company}`}
      </p>
      <p className={styles.fallbackText}>{person.tagline}</p>
      <p className={styles.fallbackText}>{person.summary}</p>

      <div className={styles.fallbackColumns}>
        <section aria-labelledby="intro-work">
          <h2 id="intro-work" className={styles.fallbackHeading}>
            Selected work
          </h2>
          <ul className={styles.fallbackList}>
            {projects.map((p) => (
              <li key={p.slug}>
                <Link href={`/cv#${p.slug}`}>{p.title}</Link>:{" "}
                {p.technologies.slice(0, 3).join(", ")}
              </li>
            ))}
          </ul>
        </section>
        <section aria-labelledby="intro-experience">
          <h2 id="intro-experience" className={styles.fallbackHeading}>
            Experience
          </h2>
          <ul className={styles.fallbackList}>
            {experience.map((e) => (
              <li key={`${e.company}-${e.period}`}>
                {e.role}, {e.company} ({e.period})
              </li>
            ))}
          </ul>
          <p className={styles.fallbackSkills}>
            {skills.flatMap((g) => g.items.slice(0, 3)).join(" · ")}
          </p>
        </section>
      </div>

      <nav aria-label="Portfolio sections">
        <ul className={styles.fallbackLinks}>
          <li>
            <Link href="/cv">Quick View (plain CV)</Link>
          </li>
          <li>
            <a href={CV_PDF_PATH} download>
              Download CV (PDF)
            </a>
          </li>
          <li>
            <a href={person.github} rel="me">
              GitHub
            </a>
          </li>
          {person.linkedin && (
            <li>
              <a href={person.linkedin} rel="me">
                LinkedIn
              </a>
            </li>
          )}
        </ul>
      </nav>
      <p className={styles.fallbackStatus} role="status">
        Starting up the desktop…
      </p>
    </main>
  );
}

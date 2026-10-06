"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { experience, person, projects } from "@/data";
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
      <nav aria-label="Portfolio sections">
        <ul className={styles.fallbackLinks}>
          <li>
            <Link href="/cv">Quick View (plain CV)</Link>
          </li>
          <li>
            <Link href="/cv#experience">Experience</Link>
          </li>
          <li>
            <Link href="/cv#projects">Projects ({projects.length})</Link>
          </li>
          <li>
            <a href={person.github} rel="me">
              GitHub
            </a>
          </li>
        </ul>
      </nav>
      <p className={styles.fallbackStatus} role="status">
        Starting up the desktop…
      </p>
    </main>
  );
}

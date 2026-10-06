"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { Icon } from "@/components/ui/Icon";
import { person } from "@/data";
import { useSession } from "@/store/session";
import styles from "./screens.module.css";

/** Goodbye screen after Turn Off (§4.4). */
export function GoodbyeScreen() {
  const restart = useSession((s) => s.restart);
  const powerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    powerRef.current?.focus();
  }, []);

  return (
    <main className={styles.goodbye}>
      <Icon name="logo" size={48} />
      <h1 className={styles.goodbyeTitle}>Thanks for visiting!</h1>
      <p>It&apos;s now safe to close this tab, or to keep in touch:</p>
      <ul className={styles.goodbyeLinks}>
        <li>
          <a href={person.github} target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
        </li>
        {person.linkedin && (
          <li>
            <a href={person.linkedin} target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
          </li>
        )}
        <li>
          <Link href="/cv">Plain CV</Link>
        </li>
      </ul>
      <button ref={powerRef} type="button" className={styles.powerOn} onClick={restart}>
        <Icon name="restart" size={24} />
        Power on
      </button>
    </main>
  );
}

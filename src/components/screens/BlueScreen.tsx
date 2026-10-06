"use client";

import Link from "next/link";
import { useEffect } from "react";
import { person } from "@/data";
import { useSession } from "@/store/session";
import styles from "./screens.module.css";

/** Easter egg (§7.5): triggered by do_not_open.exe. Any key or click returns, except on the links. */
export function BlueScreen() {
  useEffect(() => {
    const dismiss = (e: Event) => {
      if (e.target instanceof Element && e.target.closest("a")) return;
      useSession.getState().setPhase("desktop");
    };
    window.addEventListener("keydown", dismiss);
    window.addEventListener("pointerdown", dismiss);
    return () => {
      window.removeEventListener("keydown", dismiss);
      window.removeEventListener("pointerdown", dismiss);
    };
  }, []);

  return (
    <div className={styles.bsod} role="alertdialog" aria-label="You found an easter egg">
      <div className={styles.bsodText}>
        <p>
          A problem has been detected and the portfolio has been paused to protect your curiosity.
        </p>
        <p>DO_NOT_OPEN_MEANT_DO_NOT_OPEN</p>
        <p>
          If this is the first time you&apos;ve seen this screen, congratulations: you found an
          easter egg. If you were looking for a developer whose software doesn&apos;t crash for
          real, let&apos;s talk.
        </p>
        <p>Technical information:</p>
        <p>*** STOP: 0x0000C0DE (0x0000CAFE, 0x0000BEEF, 0x0000FEED, 0x0000HIRE)</p>
        <p>
          Contact: <a href={person.github}>GitHub</a> · <Link href="/cv">Plain CV</Link>
        </p>
        <p className={styles.bsodBlink}>Press any key or click to return to the desktop_</p>
      </div>
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { Icon } from "@/components/ui/Icon";
import { person } from "@/data";
import { OS_NAME } from "@/data/accounts";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { readSession, writeSession } from "@/lib/storage";
import { useSession } from "@/store/session";
import styles from "./screens.module.css";

export const BOOT_DURATION_MS = 2500;

/** Boot screen (§4.1): ~2.5s, skippable by click / key / link, skipped if seen this session or reduced motion. */
export function BootScreen() {
  const reducedMotion = useReducedMotion();
  const replayIntro = useSession((s) => s.replayIntro);

  useEffect(() => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      writeSession("introSeen", "true");
      useSession.setState({ replayIntro: false, phase: "login" });
    };

    if (reducedMotion || (!replayIntro && readSession("introSeen") === "true")) {
      finish();
      return;
    }

    const timer = window.setTimeout(finish, BOOT_DURATION_MS);
    window.addEventListener("keydown", finish);
    window.addEventListener("pointerdown", finish);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", finish);
      window.removeEventListener("pointerdown", finish);
    };
  }, [reducedMotion, replayIntro]);

  return (
    <div className={styles.boot} role="status" aria-label="Starting up">
      <div className={styles.bootBrand}>
        <Icon name="logo" size={48} />
        <div>
          <p className={styles.bootName}>{person.name}</p>
          <p className={styles.bootEdition}>{OS_NAME}</p>
        </div>
      </div>
      <div className={styles.progress} aria-hidden>
        <span />
        <span />
        <span />
      </div>
      <p className={styles.bootHint}>Please wait while the system loads…</p>
      <button type="button" className={styles.skip}>
        Skip intro
      </button>
    </div>
  );
}

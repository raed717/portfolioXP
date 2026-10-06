"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { SIDEKICK_NAME, tipsFor, type TipAction } from "@/data/sidekick";
import type { LayoutMode } from "@/hooks/useBreakpoint";
import { openApp, openPath } from "@/lib/launcher";
import { playSound } from "@/lib/sound";
import { readSession, writeSession } from "@/lib/storage";
import { usePreferences } from "@/store/preferences";
import { useSession } from "@/store/session";
import { useWindows } from "@/store/windows";
import styles from "./Sidekick.module.css";

export const SIDEKICK_DELAY_MS = 15_000;
const SESSION_KEY = "sidekickHidden";

/**
 * Flop, the original assistant character (§7.3). Appears after a short delay with persona-aware
 * tips. × hides it for the session; "Don't show again" persists. Steps aside for menus and
 * full-screen windows so it never covers critical UI.
 */
export function Sidekick({ mode, blocked }: { mode: LayoutMode; blocked: boolean }) {
  const router = useRouter();
  const persona = useSession((s) => s.persona);
  const dismissed = usePreferences((s) => s.sidekickDismissed);
  const setPreference = usePreferences((s) => s.setPreference);
  const coveredByWindow = useWindows((s) =>
    s.windows.some((w) => !w.isMinimized && (mode === "mobile" || (w.isFocused && w.isMaximized))),
  );

  const [visible, setVisible] = useState(false);
  const [hiddenForSession, setHiddenForSession] = useState(() => readSession(SESSION_KEY) === "1");
  const [index, setIndex] = useState(0);
  const tips = tipsFor(persona);
  const tip = tips[index % tips.length];

  useEffect(() => {
    if (dismissed || hiddenForSession) return;
    const timer = window.setTimeout(() => {
      setVisible(true);
      playSound("notify");
    }, SIDEKICK_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [dismissed, hiddenForSession]);

  if (!visible || dismissed || hiddenForSession || blocked || coveredByWindow || !tip) return null;

  function run(action: TipAction) {
    if (action.type === "path") openPath(action.path);
    else if (action.type === "app") openApp(action.appId);
    else router.push(action.href);
  }

  function hide() {
    writeSession(SESSION_KEY, "1");
    setHiddenForSession(true);
  }

  return (
    <aside className={styles.sidekick} aria-label={`${SIDEKICK_NAME}, your assistant`}>
      <div className={styles.bubble}>
        <button
          type="button"
          className={styles.close}
          aria-label={`Hide ${SIDEKICK_NAME} for now`}
          onClick={hide}
        >
          ×
        </button>
        <p className={styles.text} aria-live="polite">
          {tip.text}
        </p>
        <div className={styles.actions}>
          {tip.action && (
            <Button onClick={() => run(tip.action!)} className={styles.primary}>
              {tip.action.label}
            </Button>
          )}
          {tips.length > 1 && <Button onClick={() => setIndex((i) => i + 1)}>Next tip</Button>}
        </div>
        <button
          type="button"
          className={styles.never}
          onClick={() => setPreference("sidekickDismissed", true)}
        >
          Don&apos;t show {SIDEKICK_NAME} again
        </button>
      </div>
      <Icon name="sidekick" size={48} className={styles.character} />
    </aside>
  );
}

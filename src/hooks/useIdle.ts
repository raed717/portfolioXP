"use client";

import { useEffect, useState } from "react";

const ACTIVITY = ["pointermove", "pointerdown", "keydown", "wheel", "touchstart"] as const;

/**
 * True after `ms` without input. Any input resets it. While focus is inside an iframe/object
 * (a live demo or the PDF), events don't reach us, so we assume the visitor is busy there.
 */
export function useIdle(ms: number, enabled: boolean): [idle: boolean, wake: () => void] {
  const [idle, setIdle] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    let timer = 0;
    const arm = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(function check() {
        const tag = document.activeElement?.tagName;
        if (tag === "IFRAME" || tag === "OBJECT") timer = window.setTimeout(check, ms);
        else setIdle(true);
      }, ms);
    };
    const onActivity = () => {
      setIdle(false);
      arm();
    };
    arm();
    ACTIVITY.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));
    return () => {
      window.clearTimeout(timer);
      ACTIVITY.forEach((e) => window.removeEventListener(e, onActivity));
    };
  }, [ms, enabled]);

  return [enabled && idle, () => setIdle(false)];
}

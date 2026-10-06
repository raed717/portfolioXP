"use client";

import { useSyncExternalStore } from "react";
import { usePreferences } from "@/store/preferences";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

/** True when the OS asks for reduced motion, unless the Control Panel toggle overrides it (§2.3). */
export function useReducedMotion(): boolean {
  const override = usePreferences((s) => s.reduceMotion);
  const system = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
  return override ?? system;
}

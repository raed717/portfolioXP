"use client";

import { useSyncExternalStore } from "react";

/** Layout modes from THEME_CONTEXT.md §9. Breakpoints mirror BREAKPOINTS in lib/layout.ts. */
export type LayoutMode = "mobile" | "tablet" | "desktop";

const TABLET_QUERY = "(min-width: 768px)";
const DESKTOP_QUERY = "(min-width: 1024px)";

function getMode(): LayoutMode {
  if (window.matchMedia(DESKTOP_QUERY).matches) return "desktop";
  if (window.matchMedia(TABLET_QUERY).matches) return "tablet";
  return "mobile";
}

function subscribe(onChange: () => void) {
  const queries = [window.matchMedia(TABLET_QUERY), window.matchMedia(DESKTOP_QUERY)];
  queries.forEach((q) => q.addEventListener("change", onChange));
  return () => queries.forEach((q) => q.removeEventListener("change", onChange));
}

/** Server render assumes desktop; the shell is client-only so this rarely matters. */
export function useLayoutMode(): LayoutMode {
  return useSyncExternalStore(subscribe, getMode, () => "desktop");
}

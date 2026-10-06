"use client";

import { useEffect } from "react";
import { usePreferences } from "@/store/preferences";

/** Mirrors theme and the reduce-motion override onto <html> so CSS tokens and rules apply (§3.2, §2.3). */
export function useApplyPreferences() {
  const theme = usePreferences((s) => s.theme);
  const reduceMotion = usePreferences((s) => s.reduceMotion);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "luna") delete root.dataset.theme;
    else root.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    if (reduceMotion) root.dataset.reduceMotion = "true";
    else delete root.dataset.reduceMotion;
  }, [reduceMotion]);
}

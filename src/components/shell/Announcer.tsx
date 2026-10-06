"use client";

import { useEffect, useRef } from "react";
import { useWindows } from "@/store/windows";

/** Polite screen-reader announcements for window open/close (§10). */
export function Announcer() {
  const regionRef = useRef<HTMLDivElement>(null);

  useEffect(
    () =>
      useWindows.subscribe((state, prev) => {
        if (state.windows === prev.windows || !regionRef.current) return;
        const opened = state.windows.filter((w) => !prev.windows.some((p) => p.id === w.id));
        const closed = prev.windows.filter((p) => !state.windows.some((w) => w.id === p.id));
        const parts = [
          ...opened.map((w) => `${w.title} opened`),
          ...closed.map((w) => `${w.title} closed`),
        ];
        if (parts.length > 0) regionRef.current.textContent = parts.join(". ");
      }),
    [],
  );

  return <div ref={regionRef} className="sr-only-live" aria-live="polite" role="status" />;
}

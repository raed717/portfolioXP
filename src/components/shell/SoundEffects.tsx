"use client";

import { useEffect } from "react";
import { playSound } from "@/lib/sound";
import { useWindows } from "@/store/windows";

/** Maps window events to system sounds (§7.1). Renders nothing. */
export function SoundEffects() {
  useEffect(
    () =>
      useWindows.subscribe((state, prev) => {
        if (state.windows === prev.windows) return;
        const opened = state.windows.filter((w) => !prev.windows.some((p) => p.id === w.id));
        const closed = prev.windows.some((p) => !state.windows.some((w) => w.id === p.id));
        const error = opened.find((w) => w.appId === "message" && w.params?.icon === "error");
        if (error) playSound("error");
        else if (opened.some((w) => w.appId === "message")) playSound("notify");
        else if (opened.length > 0) playSound("open");
        else if (closed) playSound("close");
      }),
    [],
  );
  return null;
}

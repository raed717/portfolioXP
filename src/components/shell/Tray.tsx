"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { playSound } from "@/lib/sound";
import { usePreferences } from "@/store/preferences";
import styles from "./Taskbar.module.css";

function useNow(intervalMs: number) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return now;
}

/** System tray (§5.2): mute toggle and live clock. Sound is muted by default (§2.4). */
export function Tray() {
  const soundEnabled = usePreferences((s) => s.soundEnabled);
  const setPreference = usePreferences((s) => s.setPreference);
  const now = useNow(15_000);

  const time = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const fullDate = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className={styles.tray}>
      <button
        type="button"
        className={styles.trayButton}
        aria-pressed={soundEnabled}
        aria-label={soundEnabled ? "Mute sounds" : "Unmute sounds"}
        title={soundEnabled ? "Sound on" : "Sound off"}
        onClick={() => {
          setPreference("soundEnabled", !soundEnabled);
          if (!soundEnabled) playSound("click", { force: true });
        }}
      >
        <Icon name={soundEnabled ? "sound-on" : "sound-off"} size={16} />
      </button>
      <time className={styles.clock} dateTime={now.toISOString()} title={fullDate}>
        {time}
      </time>
    </div>
  );
}

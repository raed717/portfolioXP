"use client";

import { useEffect } from "react";
import { useSession } from "@/store/session";
import styles from "./screens.module.css";

/** Stand By: a dark screen that wakes on any input. */
export function StandbyScreen() {
  useEffect(() => {
    const wake = () => useSession.getState().setPhase("desktop");
    window.addEventListener("keydown", wake);
    window.addEventListener("pointerdown", wake);
    return () => {
      window.removeEventListener("keydown", wake);
      window.removeEventListener("pointerdown", wake);
    };
  }, []);

  return (
    <div className={styles.standby} role="status">
      <p>Standing by. Press any key or tap to wake up.</p>
    </div>
  );
}

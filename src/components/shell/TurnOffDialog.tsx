"use client";

import { useEffect, useRef, type KeyboardEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { playSound } from "@/lib/sound";
import { useSession } from "@/store/session";
import { useWindows } from "@/store/windows";
import styles from "./TurnOffDialog.module.css";

/** Stand By / Turn Off / Restart (§4.4). Focus is trapped inside; Esc cancels. */
export function TurnOffDialog({ onCancel }: { onCancel: () => void }) {
  const setPhase = useSession((s) => s.setPhase);
  const restart = useSession((s) => s.restart);
  const closeAll = useWindows((s) => s.closeAll);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dialogRef.current?.querySelector("button")?.focus();
  }, []);

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
    } else if (e.key === "Tab") {
      const buttons = Array.from(dialogRef.current?.querySelectorAll("button") ?? []);
      const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
      const next = (index + (e.shiftKey ? -1 : 1) + buttons.length) % buttons.length;
      e.preventDefault();
      buttons[next]?.focus();
    }
  }

  const choices = [
    { label: "Stand By", icon: "standby", run: () => setPhase("standby") },
    {
      label: "Turn Off",
      icon: "power",
      run: () => {
        playSound("shutdown");
        closeAll();
        useSession.setState({ persona: null });
        setPhase("shutdown");
      },
    },
    {
      label: "Restart",
      icon: "restart",
      run: () => {
        closeAll();
        restart();
      },
    },
  ];

  return (
    <div className={styles.overlay}>
      <div
        ref={dialogRef}
        className={styles.dialog}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="turn-off-title"
        onKeyDown={onKeyDown}
      >
        <header className={styles.header}>
          <h2 id="turn-off-title" className={styles.title}>
            Turn off the portfolio
          </h2>
          <Icon name="logo" size={32} />
        </header>
        <div className={styles.choices}>
          {choices.map((c) => (
            <button
              key={c.label}
              type="button"
              className={styles.choice}
              onClick={() => {
                onCancel();
                c.run();
              }}
            >
              <Icon name={c.icon} size={32} />
              <span>{c.label}</span>
            </button>
          ))}
        </div>
        <footer className={styles.footer}>
          <Button onClick={onCancel}>Cancel</Button>
        </footer>
      </div>
    </div>
  );
}
